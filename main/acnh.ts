import { ErrorCode } from "../shared/ipc";
import { SysBot } from "./sysbot";

export const ACNH_TITLE_ID = "01006F8002326000";

// ACNH 3.0.0, heap-relative: slots 0-19, then slots 20-39.
const INVENTORY_BASES = [0xb27bb758, 0xb27bb6a0] as const;
const PLAYER_SPACING = 0x131f70;
const SLOT_STRIDE = 8; // one item = 8 bytes
const BLOCK_SIZE = 20;

export const SLOT_COUNT = BLOCK_SIZE * INVENTORY_BASES.length;
export const MAX_PLAYERS = 8;
export const EMPTY_ITEM = 0xfffen;
export const MAX_ITEM = 0xffff_ffff_ffff_ffffn; // full 8-byte item value

export class ACNHError extends Error {
  constructor(
    readonly code: Extract<ErrorCode, "INVALID_INPUT" | "ACNH_NOT_RUNNING">,
    message: string,
  ) {
    super(message);
    this.name = "ACNHError";
  }
}

/** Parse '0x21FE', '21FE' or '0x00020000000A1234' into a 64-bit item value. */
export function parseItem(item: string): bigint {
  const match = /^(?:0x)?([0-9a-f]{1,16})$/i.exec(item.trim());
  if (!match) {
    throw new ACNHError(
      "INVALID_INPUT",
      `Invalid item hex code: ${JSON.stringify(item)} (up to 16 hex digits)`,
    );
  }
  return BigInt(`0x${match[1]}`);
}

export function formatItem(item: bigint): string {
  return `0x${item.toString(16).padStart(16, "0")}`;
}

function checkPlayer(player: number): void {
  if (!Number.isInteger(player) || player < 1 || player > MAX_PLAYERS) {
    throw new ACNHError("INVALID_INPUT", `player must be 1-${MAX_PLAYERS}`);
  }
}

export function slotAddress(player: number, slot: number): number {
  checkPlayer(player);
  if (!Number.isInteger(slot) || slot < 0 || slot >= SLOT_COUNT) {
    throw new ACNHError("INVALID_INPUT", `slot must be 0-${SLOT_COUNT - 1}`);
  }
  const block = Math.floor(slot / BLOCK_SIZE);
  const index = slot % BLOCK_SIZE;
  return INVENTORY_BASES[block] + PLAYER_SPACING * (player - 1) + SLOT_STRIDE * index;
}

export class ACNHInjector {
  private constructor(private readonly bot: SysBot) {}

  static async connect(host: string, port: number, timeoutMs: number): Promise<ACNHInjector> {
    const bot = new SysBot(host, port, timeoutMs);
    try {
      await bot.connect();
    } catch (err) {
      bot.close();
      throw err;
    }
    return new ACNHInjector(bot);
  }

  close(): void {
    this.bot.close();
  }

  async isAcnhRunning(): Promise<boolean> {
    const titleId = await this.bot.getTitleId();
    return titleId.toLowerCase().includes(ACNH_TITLE_ID.toLowerCase());
  }

  private async requireAcnh(): Promise<void> {
    if (!(await this.isAcnhRunning())) {
      throw new ACNHError("ACNH_NOT_RUNNING", "ACNH not detected");
    }
  }

  /** Read all 40 slots as raw 64-bit values (one peek per block). */
  private async readItems(player: number): Promise<bigint[]> {
    checkPlayer(player);
    await this.requireAcnh();

    const items: bigint[] = [];
    for (let block = 0; block < INVENTORY_BASES.length; block++) {
      const addr = slotAddress(player, block * BLOCK_SIZE);
      const raw = await this.bot.peek(addr, BLOCK_SIZE * SLOT_STRIDE);
      for (let i = 0; i < BLOCK_SIZE; i++) {
        items.push(raw.readBigUInt64LE(i * SLOT_STRIDE));
      }
    }
    return items;
  }

  /** One poke per 20-slot block instead of one per slot. */
  private async writeItems(player: number, items: bigint[]): Promise<void> {
    checkPlayer(player);
    if (items.length > SLOT_COUNT) {
      throw new ACNHError("INVALID_INPUT", `Too many items (max ${SLOT_COUNT})`);
    }
    if (items.some((i) => i < 0n || i > MAX_ITEM)) {
      throw new ACNHError("INVALID_INPUT", "Item codes must fit in 64 bits");
    }

    await this.requireAcnh();
    for (let start = 0; start < items.length; start += BLOCK_SIZE) {
      const chunk = items.slice(start, start + BLOCK_SIZE);
      const data = Buffer.alloc(chunk.length * SLOT_STRIDE);
      chunk.forEach((item, i) => data.writeBigUInt64LE(item, i * SLOT_STRIDE));
      this.bot.poke(slotAddress(player, start), data);
    }
    await this.bot.sync(); // pokes are fire-and-forget; wait until the Switch has caught up
  }

  // ---- public API ----

  injectItems(player: number, items: bigint[]): Promise<void> {
    return this.writeItems(player, items);
  }

  fillInventory(player: number, item: bigint): Promise<void> {
    return this.writeItems(player, Array<bigint>(SLOT_COUNT).fill(item));
  }

  wipeInventory(player: number): Promise<void> {
    return this.fillInventory(player, EMPTY_ITEM);
  }

  /** Returns the full 8-byte value of each slot as a 16-digit hex string. */
  async readInventory(
    player: number,
    includeEmpty = false,
  ): Promise<{ slot: number; value: string }[]> {
    const items = await this.readItems(player);
    return items
      .map((value, slot) => ({ slot, value }))
      .filter(({ value }) => includeEmpty || (value & 0xffffn) !== EMPTY_ITEM)
      .map(({ slot, value }) => ({ slot, value: formatItem(value) }));
  }
}

/** Connect, run `fn`, and always close the socket. */
export async function withInjector<T>(
  host: string,
  port: number,
  timeoutMs: number,
  fn: (injector: ACNHInjector) => Promise<T>,
): Promise<T> {
  const injector = await ACNHInjector.connect(host, port, timeoutMs);
  try {
    return await fn(injector);
  } finally {
    injector.close();
  }
}
