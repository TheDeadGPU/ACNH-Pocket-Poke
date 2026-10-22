"use client";

import { memo } from "react";
import { IconPlus } from "@tabler/icons-react";
import { imageUrl, Item } from "@/lib/Item";

interface Props {
  item?: Item | null;
  slot: number;
  selected: boolean;
  onSelect: (slot: number) => void;
}

function AppInventoryItemButton({ item, slot, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={item ? `Slot ${slot + 1}: ${item.name}` : `Slot ${slot + 1}: empty`}
      onClick={() => onSelect(slot)}
      className={`rounded-xl p-1 ${selected ? "border-2 border-black" : ""}`}
    >
      <div className="relative flex h-[100px] w-full items-center justify-center rounded-lg border border-dashed border-indigo-500 p-2">
        {item ? (
          <div>
            <img src={imageUrl(item) || "/unknown_item.png"} alt="" width={64} height={64} loading="lazy" />
            <p>{item.name}</p>
            <span className="absolute right-2 top-2 rounded-full bg-black/75 px-2 py-1 text-xs font-semibold leading-none text-white shadow-sm">
              x{item.stackAmount}
            </span>
          </div>
        ) : (
          <IconPlus />
        )}
      </div>
    </button>
  );
}

export default memo(AppInventoryItemButton);