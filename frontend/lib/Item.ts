// Client-side item data + search. Safe to import from "use client" components.

export interface Item {
  id: string; // unique_entry_id, use as React key
  name: string;
  category: string;
  internalId: number;
  hex: string; // item ID only, e.g. "0x08A5" (see note on variants)
  variation: string | null; // e.g. "Silver"
  variantId: string | null; // e.g. "3_0"
  tag: string | null;
  buyPrice: number | null;
  sellPrice: number | null;
  image: string | null; // CDN path like "FtrIcon/FtrMarioSquareA" (or a full URL); use imageUrl()
}

export const IMAGE_BASE = "https://nh-cdn.catalogue.ac";

export function imageUrl(item: Pick<Item, "image">): string | null {
  if (!item.image) return null;

  const rawImage = String(item.image).trim();
  console.log("Evaluating image:", rawImage); // Check your console/terminal

  if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
    return rawImage;
  }

  const cleanBase = IMAGE_BASE ? IMAGE_BASE.replace(/\/$/, "") : "";
  const cleanImage = rawImage.replace(/^\/+/, "");
  
  return `${cleanBase}/${cleanImage}.png`;
}

// Must match the row layout written by scripts/build-items.mjs
type Row = [
  id: string,
  name: string,
  categoryIndex: number,
  internalId: number,
  variation: string | null,
  variantId: string | null,
  tag: string | null,
  buyPrice: number | null,
  sellPrice: number | null,
  image: string | null,
];

interface Payload {
  categories: string[];
  items: Row[];
}

export interface ItemIndex {
  categories: string[];
  items: Item[];
  haystacks: string[]; // normalized "name variation" per item, same order as items
}

/** Lowercase, strip accents, turn punctuation into spaces: "Blathers's" -> "blathers s". */
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export const toHex = (id: number) => `0x${id.toString(16).toUpperCase().padStart(4, "0")}`;

function buildIndex({ categories, items }: Payload): ItemIndex {
  const out: Item[] = items.map(
    ([id, name, cat, internalId, variation, variantId, tag, buyPrice, sellPrice, image]) => ({
      id,
      name,
      category: categories[cat],
      internalId,
      hex: toHex(internalId),
      variation,
      variantId,
      tag,
      buyPrice,
      sellPrice,
      image,
    }),
  );
  return {
    categories,
    items: out,
    haystacks: out.map((i) => normalize(i.variation ? `${i.name} ${i.variation}` : i.name)),
  };
}

// Fetch and index once per page load; share the promise between components.
let pending: Promise<ItemIndex> | null = null;

export function loadItems(): Promise<ItemIndex> {
  if (!pending) {
    pending = fetch("/data/items.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load items (HTTP ${res.status})`);
        return res.json() as Promise<Payload>;
      })
      .then(buildIndex)
      .catch((err) => {
        pending = null; // allow a retry
        throw err;
      });
  }
  return pending;
}

export interface SearchOptions {
  category?: string;
  limit?: number;
}

/**
 * Every word in the query must appear in "name variation", so "blue jacket"
 * finds "acid-washed jacket (Blue)". A query like "0x08A5" looks up by item ID.
 * Results are ranked: name starts with the query, then a word starts with it, then the rest.
 */
export function searchItems(index: ItemIndex, query: string, opts: SearchOptions = {}): Item[] {
  const { category } = opts;
  const raw = query.trim();

  // If query is empty, return all items matching the category
  if (!raw) {
    return index.items.filter((i) => !category || i.category === category);
  }

  const hexMatch = /^0x([0-9a-f]{1,4})$/i.exec(raw);
  if (hexMatch) {
    const id = parseInt(hexMatch[1], 16);
    return index.items.filter((i) => i.internalId === id && (!category || i.category === category));
  }

  const q = normalize(raw);
  if (!q) {
    return index.items.filter((i) => !category || i.category === category);
  }
  const tokens = q.split(" ");

  const scored: { item: Item; score: number }[] = [];
  for (let n = 0; n < index.items.length; n++) {
    const item = index.items[n];
    if (category && item.category !== category) continue;
    const hay = index.haystacks[n];
    if (!tokens.every((t) => hay.includes(t))) continue;
    const score = hay.startsWith(q) ? 0 : ` ${hay}`.includes(` ${tokens[0]}`) ? 1 : 2;
    scored.push({ item, score });
  }
  scored.sort(
    (a, b) =>
      a.score - b.score ||
      a.item.name.length - b.item.name.length ||
      a.item.name.localeCompare(b.item.name),
  );
  
  return scored.map((s) => s.item);
}