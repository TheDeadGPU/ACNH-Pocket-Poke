import { Item } from "./Item";

function itemBytesLE(item: Item): Uint8Array {
  const [bodyStr, patternStr] = (item.variantId ?? "0_0").split("_");
  const body = Number(bodyStr) || 0;
  const pattern = Number(patternStr) || 0;

  const view = new DataView(new ArrayBuffer(8));
  view.setUint16(0, item.internalId, true);
  view.setUint16(2, 0, true);
  view.setUint16(4, body, true);
  view.setUint16(6, pattern << 5, true);
  return new Uint8Array(view.buffer);
}

const toHexLE = (b: Uint8Array) =>
  Array.from(b, (x) => x.toString(16).toUpperCase().padStart(2, "0")).join("");

// Memory order (little-endian bytes), e.g. "D713000000000000"
const hexLE = (item: Item) => toHexLE(itemBytesLE(item));

// Same value read as a u64 number, e.g. "00000000000013D7" (only if you need it)
const hexAsU64 = (item: Item) => toHexLE(itemBytesLE(item).reverse());

export function computeItemHex(item: Item) {
    return hexAsU64(item);
}