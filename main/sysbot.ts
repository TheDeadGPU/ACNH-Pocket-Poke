import * as net from "node:net";
import type { ErrorCode } from "../shared/ipc";

type SysBotErrorCode = Extract<ErrorCode, "TIMEOUT" | "REFUSED" | "NETWORK">;

export class SysBotError extends Error {
  constructor(
    readonly code: SysBotErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SysBotError";
  }
}

function fromSocketError(err: NodeJS.ErrnoException): SysBotError {
  switch (err.code) {
    case "ECONNREFUSED":
      return new SysBotError("REFUSED", "Connection refused (is sys-botbase running?)");
    case "ETIMEDOUT":
      return new SysBotError("TIMEOUT", "Connection timed out");
    default:
      return new SysBotError("NETWORK", `Network error: ${err.message}`);
  }
}

const hexAddress = (addr: number) => `0x${addr.toString(16).toUpperCase()}`;

interface Waiter {
  resolve: (line: string) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
}

/**
 * Minimal sys-botbase client. The protocol is line-based text over TCP:
 * commands end in "\r\n", replies (when there are any) end in "\n".
 *
 * After any failure, including a timeout, the connection is dead. A late reply
 * would otherwise be read as the answer to the next command.
 */
export class SysBot {
  private readonly socket = new net.Socket();
  private buffer = "";
  private waiter: Waiter | null = null;
  private failure: SysBotError | null = null;

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly timeoutMs: number,
  ) {
    this.socket.setNoDelay(true);
    this.socket.on("data", (chunk: Buffer | string) => {
      this.buffer += chunk.toString();
      this.flush();
    });
    this.socket.on("error", (err) => this.fail(fromSocketError(err)));
    this.socket.on("close", () =>
      this.fail(new SysBotError("NETWORK", "Connection closed by the Switch")),
    );
  }

  connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        const err = new SysBotError("TIMEOUT", "Connection timed out");
        this.fail(err);
        reject(err);
      }, this.timeoutMs);

      this.socket.once("connect", () => {
        clearTimeout(timer);
        resolve();
      });
      this.socket.once("error", (err) => {
        clearTimeout(timer);
        reject(fromSocketError(err));
      });
      this.socket.connect(this.port, this.host);
    });
  }

  close(): void {
    this.socket.destroy();
  }

  // ---- commands ----

  async getTitleId(): Promise<string> {
    this.send("getTitleID");
    return this.readLine();
  }

  /** Read `length` bytes from heap-relative `addr`. */
  async peek(addr: number, length: number): Promise<Buffer> {
    this.send(`peek ${hexAddress(addr)} ${length}`);
    const hex = await this.readLine();
    if (hex.length !== length * 2 || !/^[0-9a-f]*$/i.test(hex)) {
      throw new SysBotError("NETWORK", "Unexpected response to peek");
    }
    return Buffer.from(hex, "hex");
  }

  /** Write bytes at heap-relative `addr`. sys-botbase sends no reply to poke. */
  poke(addr: number, data: Buffer): void {
    this.send(`poke ${hexAddress(addr)} 0x${data.toString("hex").toUpperCase()}`);
  }

  /**
   * Round-trip barrier. Since poke has no reply, this is the only way to know the
   * Switch has processed earlier writes before we close the socket.
   */
  async sync(): Promise<void> {
    await this.getTitleId();
  }

  // ---- plumbing ----

  private send(command: string): void {
    if (this.failure) throw this.failure;
    this.socket.write(`${command}\r\n`);
  }

  private readLine(): Promise<string> {
    if (this.failure) return Promise.reject(this.failure);
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(
        () => this.fail(new SysBotError("TIMEOUT", "Switch did not respond in time")),
        this.timeoutMs,
      );
      this.waiter = { resolve, reject, timer };
      this.flush();
    });
  }

  private flush(): void {
    if (!this.waiter) return;
    const end = this.buffer.indexOf("\n");
    if (end === -1) return;

    const line = this.buffer.slice(0, end).trim();
    this.buffer = this.buffer.slice(end + 1);

    const { resolve, timer } = this.waiter;
    this.waiter = null;
    clearTimeout(timer);
    resolve(line);
  }

  private fail(err: SysBotError): void {
    this.failure ??= err; // keep the first (root-cause) error
    if (this.waiter) {
      const { reject, timer } = this.waiter;
      this.waiter = null;
      clearTimeout(timer);
      reject(this.failure);
    }
    this.socket.destroy();
  }
}
