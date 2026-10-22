"use client";

import { useCallback } from "react";
import { Button } from "../ui/button";
import AppInventoryItemButton from "./AppInventoryItemButton";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";

const SLOT_COUNT = 20;
const SLOTS = Array.from({ length: SLOT_COUNT }, (_, i) => i); // built once, not per render

export default function AppInventory({ className }: { className?: string }) {
  const { inventoryItems, selectedInventorySlot, setSelectedInventorySlot } = useACNHPocketPokeContext();
  const usedCount = inventoryItems ? inventoryItems.slice(0, SLOT_COUNT).filter(Boolean).length : 0;

  const handleSelect = useCallback(
    (slot: number) => setSelectedInventorySlot(slot),
    [setSelectedInventorySlot],
  );

  return (
    <div className={className}>
      <div id="inventory-object" className="rounded-xl bg-white p-4">
        <div id="inventory-header" className="flex justify-between">
          <div className="flex w-full items-center gap-4">
            <p className="text-xl font-bold text-lime-700">Pockets</p>
            <p className="text-xs">{usedCount} of {SLOT_COUNT} used</p>
          </div>
          <div className="flex">
            <Button variant="ghost"><span className="font-bold">Fill with item</span></Button>
            <Button variant="ghost"><span className="font-bold text-red-400">Clear all</span></Button>
          </div>
        </div>
        <div className="grid grid-cols-10 gap-2 p-4">
          {SLOTS.map((slot) => (
            <AppInventoryItemButton
              key={slot}
              slot={slot}
              item={inventoryItems[slot] ?? null}
              selected={slot === selectedInventorySlot}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}