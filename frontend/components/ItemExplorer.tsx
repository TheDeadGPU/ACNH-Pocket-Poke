// app/items/page.tsx
"use client";

import { useState } from "react";
import rawData from "@/data/itemdata.json";
import Image from "next/image";
import type { ACNHItem } from "@/types/ACNHItem";
import { Button } from "./ui/button";
import { computeItemHex } from "@/lib/ItemHelper";
import ItemExplorerCard from "./ItemExplorerCard";

const data = rawData as unknown as Record<string, ACNHItem[]>;
const categories = Object.keys(data);
const PAGE_SIZE = 50;

export default function ItemExplorer() {
  const [activeCategory, setActiveCategory] = useState(categories[0])
  const [page, setPage] = useState(1);

  const allItems = data[activeCategory] ?? []
  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const items = allItems.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const btn =
    "px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed";

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,--spacing(30)),0fr))] gap-4">
        {items.map((item) => (
          <ItemExplorerCard key={item["Unique Entry ID"]} item={item} />
        ))}
      </div>

      <nav className="mt-6 flex items-center justify-center gap-4">
        <Button variant="outline" onClick={() => goTo(1)} disabled={page === 1}>
          «
        </Button>
        <Button variant="outline" onClick={() => goTo(page - 1)} disabled={page === 1}>
          Previous
        </Button>

        <span>
          Page {page} of {totalPages}
        </span>

        <Button variant="outline" onClick={() => goTo(page + 1)} disabled={page === totalPages}>
          Next
        </Button>
        <Button variant="outline" onClick={() => goTo(totalPages)} disabled={page === totalPages}>
          »
        </Button>
      </nav>
    </div>
  );
}