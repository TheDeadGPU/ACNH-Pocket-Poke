import { Item } from "./Item";

function itemBytesLE(item: Item, stackCount?: number): Uint8Array {
  const [bodyStr, patternStr] = (item.variantId ?? "0_0").split("_");
  const pattern = Number(patternStr) || 0;

  // Offset 4 is shared: stack count for stackables, body variant otherwise.
  // Stackables store (amount - 1), so 1 item = 0, 10 items = 9.
  const body =
    stackCount !== undefined
      ? Math.max(1, Math.floor(stackCount)) - 1
      : Number(bodyStr) || 0;

  const view = new DataView(new ArrayBuffer(8));
  view.setUint16(0, item.internalId, true);
  view.setUint16(2, 0, true);
  view.setUint16(4, body, true);
  view.setUint16(6, pattern << 5, true);
  return new Uint8Array(view.buffer);
}

const toHexLE = (b: Uint8Array) =>
  Array.from(b, (x) => x.toString(16).toUpperCase().padStart(2, "0")).join("");

// Memory order (little-endian bytes), e.g. "A508090000000000"
const hexLE = (item: Item, stackCount?: number) =>
  toHexLE(itemBytesLE(item, stackCount));

// Same value read as a u64 number, e.g. "00000000000908A5"
const hexAsU64 = (item: Item, stackCount?: number) =>
  toHexLE(itemBytesLE(item, stackCount).reverse());

export function computeItemHex(item: Item, stackCount?: number) {
  return hexAsU64(item, stackCount);
}