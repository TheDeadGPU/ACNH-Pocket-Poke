import { ipcMain, type IpcMainInvokeEvent } from "electron";
import * as net from "node:net";
import {
  type ErrorCode,
  type InjectResult,
  type IpcResult,
  type SwitchStatus,
} from "../shared/ipc"
import { ACNHError, MAX_PLAYERS, SLOT_COUNT, formatItem, parseItem, withInjector } from "./acnh";
import { SysBotError } from "./sysbot";

const CHANNELS = {
  status: "pocketPoke:status",
  inject: "pocketPoke:inject",
} as const;

const DEFAULT_PORT = 6000;
const DEFAULT_TIMEOUT_S = 3;

// ---- validation (the renderer is untrusted input) ----

const privateRanges = new net.BlockList();
privateRanges.addSubnet("10.0.0.0", 8, "ipv4");
privateRanges.addSubnet("172.16.0.0", 12, "ipv4");
privateRanges.addSubnet("192.168.0.0", 16, "ipv4");
privateRanges.addSubnet("169.254.0.0", 16, "ipv4");
privateRanges.addSubnet("127.0.0.0", 8, "ipv4");
privateRanges.addSubnet("fc00::", 7, "ipv6");
privateRanges.addSubnet("fe80::", 10, "ipv6");
privateRanges.addAddress("::1", "ipv6");

function isPrivateAddress(ip: string): boolean {
  return privateRanges.check(ip, net.isIPv4(ip) ? "ipv4" : "ipv6");
}

function invalid(message: string): never {
  throw new ACNHError("INVALID_INPUT", message);
}

function asRecord(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) invalid("Malformed request");
  return raw as Record<string, unknown>;
}

function intField(value: unknown, name: string, fallback: number, min: number, max: number): number {
  const v = value ?? fallback;
  if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max) {
    invalid(`${name} must be an integer between ${min} and ${max}`);
  }
  return v;
}

interface Conn {
  ip: string;
  port: number;
  timeoutMs: number;
}

function parseConn(req: Record<string, unknown>): Conn {
  const ip = req.ip;
  if (typeof ip !== "string" || net.isIP(ip) === 0) invalid("ip must be a valid IP address");
  if (!isPrivateAddress(ip)) invalid("Only private/LAN addresses are allowed");

  const port = intField(req.port, "port", DEFAULT_PORT, 1, 65535);

  const timeout = req.timeout ?? DEFAULT_TIMEOUT_S;
  if (typeof timeout !== "number" || !(timeout > 0 && timeout <= 10)) {
    invalid("timeout must be a number of seconds, greater than 0 and at most 10");
  }
  return { ip, port, timeoutMs: timeout * 1000 };
}

// ---- per-Switch serialization ----
// sys-botbase serves one client at a time and each call opens its own
// connection, so overlapping calls to the same console must run in order.

const queues = new Map<string, Promise<unknown>>();

function enqueue<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();
  const run = previous.then(task);
  const tail = run.catch(() => undefined);
  queues.set(key, tail);
  void tail.then(() => {
    if (queues.get(key) === tail) queues.delete(key);
  });
  return run;
}

// ---- error mapping ----

function failure(code: ErrorCode, message: string): IpcResult<never> {
  return { ok: false, error: { code, message } };
}

function toFailure(err: unknown): IpcResult<never> {
  if (err instanceof ACNHError || err instanceof SysBotError) {
    return failure(err.code, err.message);
  }
  console.error("[pocketPoke] unexpected error:", err);
  return failure("INTERNAL", "Unexpected error");
}

function handle<T>(
  channel: string,
  isTrustedSender: (event: IpcMainInvokeEvent) => boolean,
  fn: (payload: unknown) => Promise<T>,
): void {
  ipcMain.handle(channel, async (event, payload: unknown): Promise<IpcResult<T>> => {
    if (!isTrustedSender(event)) return failure("INVALID_INPUT", "Request rejected: untrusted sender");
    try {
      return { ok: true, data: await fn(payload) };
    } catch (err) {
      return toFailure(err);
    }
  });
}

// ---- handlers ----

/**
 * Call once after app.whenReady(). `isTrustedSender` should accept only your own
 * pages, e.g. `(e) => e.senderFrame?.url.startsWith("file://") ?? false`
 * (plus your dev server origin in development).
 */
export function registerPocketPokeIpc(isTrustedSender: (event: IpcMainInvokeEvent) => boolean): void {
  // Check that the Switch is reachable and that ACNH is the running title.
  // Connection problems are reported in the result, not as an IPC error.
  handle<SwitchStatus>(CHANNELS.status, isTrustedSender, async (raw) => {
    const conn = parseConn(asRecord(raw));
    try {
      const acnhRunning = await enqueue(`${conn.ip}:${conn.port}`, () =>
        withInjector(conn.ip, conn.port, conn.timeoutMs, (inj) => inj.isAcnhRunning()),
      );
      return { reachable: true, acnh_running: acnhRunning, error: null };
    } catch (err) {
      if (err instanceof SysBotError) {
        console.warn(`[pocketPoke] status check failed for ${conn.ip}:${conn.port}: ${err.message}`);
        return { reachable: false, acnh_running: false, error: err.message };
      }
      throw err;
    }
  });

  // Inject 8-byte item values into a player's inventory slots.
  handle<InjectResult>(CHANNELS.inject, isTrustedSender, async (raw) => {
    const req = asRecord(raw);
    const conn = parseConn(req);
    const player = intField(req.player, "player", 1, 1, MAX_PLAYERS);

    const items = req.items;
    if (!Array.isArray(items) || items.length < 1 || items.length > SLOT_COUNT) {
      invalid(`items must be an array of 1-${SLOT_COUNT} hex strings`);
    }
    // Parse everything before touching the network.
    const codes = items.map((item: unknown) => {
      if (typeof item !== "string") invalid("Each item must be a hex string");
      return parseItem(item);
    });

    await enqueue(`${conn.ip}:${conn.port}`, () =>
      withInjector(conn.ip, conn.port, conn.timeoutMs, (inj) => inj.injectItems(player, codes)),
    );

    console.info(`[pocketPoke] injected ${codes.length} items into player ${player} on ${conn.ip}:${conn.port}`);
    return { status: "success", injected_items: codes.map(formatItem) };
  });
}
