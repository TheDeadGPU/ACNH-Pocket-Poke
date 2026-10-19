// Client-side item data + search. Safe to import from "use client" components.

export interface Item {
  id: string; // unique_entry_id, use as React key
  name: string;
  category: string;
  internalId: number;
  hex: string; // item ID only, e.g. "0x08A5" (see note on variants)
  variantId: string | null; // e.g. "3_0"
  bodyVariation: number;
  patternVariation: number;
  variation: string | null; // e.g. "Silver"
  pattern: string | null;

  // Numbers: 0 when the source has no value. (0/1 flags are 0 = no, 1 = yes.)
  isDiy: number;
  isBuyable: number; // 1 if the item has a Buy price (0 = not for sale)
  stackSize: number;
  buyPrice: number;
  sellPrice: number;
  exchangePrice: number;
  hhaBasePoints: number;

  // Text: null when the source has no value
  exchangeCurrency: string | null;
  color1: string | null;
  color2: string | null;
  size: string | null;
  tag: string | null;
  catalog: string | null;
  versionAdded: string | null;
  source: string | null; // e.g. "Nook's Cranny; Able Sisters"
  seasonEvent: string | null; // e.g. "Halloween; Halloween (days before)"

  image: string | null; // CDN path like "FtrIcon/FtrMarioSquareA" (or a full URL); use imageUrl()
  filename: string | null; // game asset name, e.g. "FtrMarioSquareA"

  /**
   * Every remaining column, keyed by its snake_case name (kit_cost, food_power,
   * hha_concept_1, lighting_type, interact, villager_equippable, ...).
   * Numeric columns are always present (0 when missing); text columns are only
   * present when the item has a value, so use item.details.lighting_type ?? null.
   */
  details: Record<string, string | number | undefined>;
}

export const IMAGE_BASE = "https://nh-cdn.catalogue.ac";

/** Full image URL for an item, or null if the source data has no image for it. */
export function imageUrl(item: Pick<Item, "image">): string | null {
  if (!item.image) return null;
  return item.image.startsWith("http") ? item.image : `${IMAGE_BASE}/${item.image}.png`;
}

// ---- JSON layout, written by scripts/build-items.mjs ----------------------
// Each row is [...one value per name in `fields`, sparse], where `sparse` maps an index into
// `sparseFields` to a value, only for columns this row actually has.
type Cell = string | number | null;
type Sparse = Record<string, string | number>;
interface Payload {
  categories: string[];
  fields: string[];
  sparseFields: string[];
  items: (Cell | Sparse)[][];
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

function buildIndex(p: Payload): ItemIndex {
  const pos = new Map(p.fields.map((name, i) => [name, i]));
  const at = (name: string) => {
    const i = pos.get(name);
    if (i === undefined) throw new Error(`items.json is missing the "${name}" field; rebuild it`);
    return i;
  };

  // Columns that have a typed property on Item. Everything else goes into `details`.
  const I = {
    id: at("unique_entry_id"), name: at("name"), category: at("category"), internalId: at("internal_id"),
    variantId: at("variant_id"), bodyVariation: at("body_variation"), patternVariation: at("pattern_variation"),
    variation: at("variation"), pattern: at("pattern"),
    isDiy: at("is_diy"), isBuyable: at("is_buyable"), stackSize: at("stack_size"),
    buyPrice: at("buy_price"), sellPrice: at("sell_price"), exchangePrice: at("exchange_price"),
    hhaBasePoints: at("hha_base_points"),
    exchangeCurrency: at("exchange_currency"), color1: at("color_1"), color2: at("color_2"),
    size: at("size"), tag: at("tag"), catalog: at("catalog"), versionAdded: at("version_added"),
    source: at("source"), seasonEvent: at("season_event"), image: at("image"), filename: at("filename"),
  };
  const typed = new Set<number>(Object.values(I));
  const detailFields = p.fields.map((name, i) => [name, i] as const).filter(([, i]) => !typed.has(i));

  const out: Item[] = p.items.map((row) => {
    const s = (i: number) => row[i] as string | null;
    const n = (i: number) => row[i] as number;
    const internalId = n(I.internalId);
    const image = s(I.image);

    const details: Item["details"] = {};
    for (const [name, i] of detailFields) details[name] = row[i] as string | number;
    const sparse = row[row.length - 1] as Sparse;
    for (const k of Object.keys(sparse)) details[p.sparseFields[Number(k)]] = sparse[k];

    return {
      id: s(I.id) as string,
      name: s(I.name) as string,
      category: p.categories[n(I.category)],
      internalId,
      hex: toHex(internalId),
      variantId: s(I.variantId),
      bodyVariation: n(I.bodyVariation),
      patternVariation: n(I.patternVariation),
      variation: s(I.variation),
      pattern: s(I.pattern),
      isDiy: n(I.isDiy),
      isBuyable: n(I.isBuyable),
      stackSize: n(I.stackSize),
      buyPrice: n(I.buyPrice),
      sellPrice: n(I.sellPrice),
      exchangePrice: n(I.exchangePrice),
      hhaBasePoints: n(I.hhaBasePoints),
      exchangeCurrency: s(I.exchangeCurrency),
      color1: s(I.color1),
      color2: s(I.color2),
      size: s(I.size),
      tag: s(I.tag),
      catalog: s(I.catalog),
      versionAdded: s(I.versionAdded),
      source: s(I.source),
      seasonEvent: s(I.seasonEvent),
      image,
      filename: s(I.filename),
      details,
    };
  });

  return {
    categories: p.categories,
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
}

/**
 * An empty (or whitespace-only) query returns every item, in data order, narrowed by
 * `category` if one is given.
 * Otherwise every word in the query must appear in "name variation", so "blue jacket"
 * finds "acid-washed jacket (Blue)". A query like "0x08A5" looks up by item ID.
 * Results are ranked: name starts with the query, then a word starts with it, then the rest.
 */
export function searchItems(index: ItemIndex, query: string, opts: SearchOptions = {}): Item[] {
  const { category } = opts;
  const raw = query.trim();
  if (!raw) {
    return category ? index.items.filter((i) => i.category === category) : index.items.slice();
  }

  const hexMatch = /^0x([0-9a-f]{1,4})$/i.exec(raw);
  if (hexMatch) {
    const id = parseInt(hexMatch[1], 16);
    return index.items.filter((i) => i.internalId === id && (!category || i.category === category));
  }

  const q = normalize(raw);
  if (!q) return [];
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