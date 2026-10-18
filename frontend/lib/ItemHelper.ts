import { ACNHItem } from "@/types/ACNHItem";

function itemBytesLE(item: ACNHItem): Uint8Array {
  const [bodyStr, patternStr] = (item["Variant ID"] ?? "0_0").split("_");
  const body = Number(bodyStr) || 0;
  const pattern = Number(patternStr) || 0;

  const view = new DataView(new ArrayBuffer(8));
  view.setUint16(0, item["Internal ID"], true);
  view.setUint16(2, 0, true);
  view.setUint16(4, body, true);
  view.setUint16(6, pattern << 5, true);
  return new Uint8Array(view.buffer);
}

const toHexLE = (b: Uint8Array) =>
  Array.from(b, (x) => x.toString(16).toUpperCase().padStart(2, "0")).join("");

// Memory order (little-endian bytes), e.g. "D713000000000000"
const hexLE = (item: ACNHItem) => toHexLE(itemBytesLE(item));

// Same value read as a u64 number, e.g. "00000000000013D7" (only if you need it)
const hexAsU64 = (item: ACNHItem) => toHexLE(itemBytesLE(item).reverse());

export function computeItemHex(item: ACNHItem) {
    return hexAsU64(item);
}