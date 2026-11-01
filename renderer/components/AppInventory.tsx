"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import AppInventoryItemButton from "./AppInventoryItemButton";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { computeItemHex } from "@/lib/ItemHelper";
import { toast } from "@/components/ui/toast";
import { isValidIPv4 } from "@/lib/IPHelper";
import { injectItems } from "@/pocketPoke";

const SLOT_COUNT = 40;
const SLOTS = Array.from({ length: SLOT_COUNT }, (_, i) => i); // built once, not per render
const EMPTY_ITEM_HEX = "0x000000000000FFFE";

export default function AppInventory({ className }: { className?: string }) {
  const {
    inventoryItems, selectedInventorySlot, setSelectedInventorySlot,
    clearInventory, fillInventoryWithItem, selectedItem, selectedStackAmount,
    selectedPlayer, switchIP, switchPort,
  } = useACNHPocketPokeContext();
  const [isInjecting, setIsInjecting] = useState(false);
  const usedCount = inventoryItems.slice(0, SLOT_COUNT).filter(Boolean).length;

  const handleSelect = useCallback(
    (slot: number) => setSelectedInventorySlot(slot),
    [setSelectedInventorySlot],
  );

  const handleInject = async () => {
    if (!isValidIPv4(switchIP)) {
      toast.add({ type: "error", description: "Enter a valid Switch IP address first." });
      return;
    }
    const port = Number(switchPort);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      toast.add({ type: "error", description: "Enter a valid port between 1 and 65535." });
      return;
    }
    if (!window.confirm("This replaces all 40 pocket slots on the selected player. Empty slots in this editor will be cleared. Continue?")) {
      return;
    }

    setIsInjecting(true);
    try {
      const items = Array.from({ length: SLOT_COUNT }, (_, slot) => {
        const item = inventoryItems[slot];
        return item ? `0x${computeItemHex(item, item.stackAmount)}` : EMPTY_ITEM_HEX;
      });
      await injectItems({ip: switchIP}, items);
      //await injectItems({ ip: switchIP, port, player: selectedPlayer }, items);
      toast.add({ type: "success", description: `Updated all 40 slots for player ${selectedPlayer}.` });
    } catch (error) {
      toast.add({ type: "error", description: "There was an error injecting items into ACNH. Is your switch online and connected to the same network as your computer?" });
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className={className}>
      <div id="inventory-object" className="rounded-xl bg-white p-4">
        <div id="inventory-header" className="flex justify-between">
          <div className="flex w-full items-center gap-4">
            <p className="text-xl font-bold text-lime-700">Pockets</p>
            <p className="text-xs">{usedCount} of {SLOT_COUNT} used</p>
          </div>
          <div className="flex">
            <Button
              variant="ghost"
              disabled={!selectedItem}
              onClick={() => selectedItem && fillInventoryWithItem(selectedItem, selectedStackAmount)}
            >
              <span className="font-bold">Fill with item</span>
            </Button>
            <Button variant="ghost" onClick={clearInventory}>
              <span className="font-bold text-red-400">Clear all</span>
            </Button>
            <Button disabled={isInjecting} onClick={handleInject}>
              {isInjecting ? "Applying..." : "Replace Switch inventory"}
            </Button>
          </div>
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          Applying replaces all 40 pocket slots for the selected player; empty slots here are cleared.
        </p>
        <div className="grid grid-cols-5 gap-2 p-2 sm:grid-cols-8 lg:grid-cols-10">
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