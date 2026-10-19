// app/items/page.tsx
"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import ItemExplorerCard from "./ItemExplorerCard";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";

export default function ItemExplorer() {
  const PAGE_SIZE = 50;
  const { items, itemSearchValue, itemCategory, setItemCategory, categories } = useACNHPocketPokeContext();
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  // Clamp so a shrinking search result never leaves you on a nonexistent page.
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const itemsResult = items.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setCategory = (category: string) => {
    setItemCategory(category);
    setPage(1);
  }

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

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,--spacing(34)),0fr))] gap-4">
        {itemsResult.map((item) => (
          <ItemExplorerCard
            key={`${item.internalId}-${item.variantId ?? "0_0"}`}
            item={item}
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
  );
}