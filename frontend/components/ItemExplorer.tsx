// app/items/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import ItemExplorerCard from "./ItemExplorerCard";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { imageUrl, Item } from "@/lib/Item";
import { computeItemHex } from "@/lib/ItemHelper";
import ItemInjectButton from "./ItemInjectButton";
import { Label } from "./ui/label";
import AddToShoppingCartButton from "./AddToShoppingCartButton";

export default function ItemExplorer() {
  const PAGE_SIZE = 50;
  const { items, itemCategory, setItemCategory, categories } = useACNHPocketPokeContext();
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  // Clamp so a shrinking search result never leaves you on a nonexistent page.
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const itemsResult = items.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectItem = useCallback((item: Item) => {
    setSelectedItem(item);
  }, []);

  const setCategory = (category: string) => {
    setItemCategory(category);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={itemCategory === category ? "default" : "outline"}
            onClick={() => setCategory(category === 'All' ? "All" : category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,--spacing(34)),0fr))] gap-4">
            {itemsResult.map((item) => (
              <ItemExplorerCard
                key={`${item.internalId}-${item.variantId ?? "0_0"}`}
                item={item}
                selected={selectedItem?.id === item.id}
                onSelect={() => selectItem(item)}
              />
            ))}
          </div>

          {itemsResult.length === 0 && (
            <p className="text-center text-slate-400">No items match that name.</p>
          )}
          <nav className="mt-6 flex items-center justify-center gap-4">
            <Button variant="outline" onClick={() => goTo(1)} disabled={currentPage === 1}>
              «
            </Button>
            <Button variant="outline" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </Button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <Button variant="outline" onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </Button>
            <Button variant="outline" onClick={() => goTo(totalPages)} disabled={currentPage === totalPages}>
              »
            </Button>
          </nav>
        </div>

        <aside
          aria-labelledby="item-details-title"
          aria-live="polite"
          className="h-fit rounded-xl border bg-card p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 id="item-details-title" className="text-lg font-bold">Item details</h2>
            {selectedItem && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>
                Close
              </Button>
            )}
          </div>
          {selectedItem ? (
            <ItemDetails item={selectedItem} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an item to see its details.
            </p>
          )}
        </aside>
      </div>

    </div>
  );
}

function ItemDetails({ item }: { item: Item }) {
  const image = imageUrl(item);
  const attributes: [string, string | number | null][] = [
    ["Item ID", item.internalId],
    ["Hex", computeItemHex(item)],
    ["Variation", item.variation],
    ["Pattern", item.pattern],
    ["Color 1", item.color1],
    ["Color 2", item.color2],
    ["Size", item.size],
    ["Stack size", item.stackSize],
    ["Buy price", item.buyPrice || null],
    ["Sell price", item.sellPrice || null],
    ["Exchange price", item.exchangePrice || null],
    ["Exchange currency", item.exchangeCurrency],
    ["Source", item.source],
    ["Season / event", item.seasonEvent],
    ["DIY", item.isDiy ? "Yes" : "No"],
  ];
  const extraDetails = Object.entries(item.details).filter(
    (entry): entry is [string, string | number] =>
      entry[1] !== undefined && entry[1] !== "" && entry[1] !== 0,
  );

  const [stack, setStack] = useState(1);

  function incrementStack() {
    setStack((prev) => Math.min(prev + 1, item.stackSize));
  }

  function decrementStack() {
    setStack((prev) => Math.max(prev - 1, 1));
  }

  useEffect(() => {
    setStack(1);
  },[item])

  useEffect(() => {
    item.stackAmount = stack; // Update the stackAmount in the item object whenever stack changes
  }, [stack, item]);

  return (
    <div>
      {image && (
        <img
          src={image}
          alt=""
          width={160}
          height={160}
          className="mx-auto mb-3"
        />
      )}
      <h3 className="mb-1 text-xl font-bold">{item.name.toLocaleUpperCase()}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{item.category.toLocaleUpperCase()}</p>
      <div className="flex items-center justify-between gap-2 mb-4">
        <AddToShoppingCartButton item={item} />
        {item.stackSize > 1 && (
          <div className="flex items-center justify-between gap-2">
            <Button disabled={stack <= 1} onClick={decrementStack}>
              -
            </Button>
            <Label>{stack}</Label>
            <Button disabled={stack >= item.stackSize} onClick={incrementStack}>
              +
            </Button>
          </div>
        )}
      </div>
      <dl className="space-y-2 text-sm">
        {attributes.map(([label, value]) =>
          value !== null ? <ItemAttribute key={label} label={label} value={value} /> : null,
        )}
        {extraDetails.map(([key, value]) => (
          <ItemAttribute
            key={key}
            label={key.replaceAll("_", " ")}
            value={value}
          />
        ))}
      </dl>
    </div>
  );
}

function ItemAttribute({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b pb-2 last:border-0">
      <dt className="capitalize text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}