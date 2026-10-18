// app/items/page.tsx
"use client";

import { useMemo, useState } from "react";
import rawData from "@/data/itemdata.json";
import type { ACNHItem } from "@/types/ACNHItem";
import { Button } from "./ui/button";
import ItemExplorerCard from "./ItemExplorerCard";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";

const data = rawData as unknown as Record<string, ACNHItem[]>;
const ALL = "All";
const categories = [ALL, ...Object.keys(data)];
const PAGE_SIZE = 50;

// Flatten once at module load; keep the category so keys stay unique.
const allItemsFlat = Object.entries(data).flatMap(([category, items]) =>
  items.map((item) => ({ category, item }))
);

export default function ItemExplorer() {
  const { itemSearchValue } = useACNHPocketPokeContext();
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [page, setPage] = useState(1);

  const normalizedSearch = itemSearchValue.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    const source =
      activeCategory === ALL
        ? allItemsFlat
        : (data[activeCategory] ?? []).map((item) => ({
            category: activeCategory,
            item,
          }));
    return source.filter(({ item }) =>
      item.Name.toLowerCase().includes(normalizedSearch)
    );
  }, [activeCategory, normalizedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  // Clamp so a shrinking search result never leaves you on a nonexistent page.
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const items = filteredItems.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    setPage(1);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={category === activeCategory ? "default" : "outline"}
            onClick={() => selectCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,--spacing(34)),0fr))] gap-4">
        {items.map(({ category, item }) => (
          <ItemExplorerCard
            key={`${category}-${item["Unique Entry ID"]}`}
            item={item}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
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
  );
}