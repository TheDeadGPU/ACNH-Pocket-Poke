import { memo } from "react";
import { imageUrl, Item } from "@/lib/Item";
import { IconAlertTriangle } from '@tabler/icons-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const FALLBACK_IMAGE = "/unknown_item.png";

interface Props {
  item: Item;
  selected: boolean;
  onSelect: (item: Item) => void;
}

function AppInventoryItemCard({ item, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(item)}
      className={`flex w-full items-center gap-2 rounded-lg border-2 text-left ${selected ? "border-[var(--primary)]" : "border-[var(--border)]"
        }`}
    >
      <img
        src={imageUrl(item) || FALLBACK_IMAGE}
        alt=""
        width={50}
        height={50}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          if (!e.currentTarget.src.endsWith(FALLBACK_IMAGE)) e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />
      <div>
        <p className="font-bold">{item.name}</p>
        <p className="text-xs">{item.category}</p>
      </div>
      {item.itemType != "Normal" && (
        <div className="ml-auto mr-5">
          <Tooltip>
            <TooltipTrigger render={<IconAlertTriangle className="relative text-orange-400" />} />
            <TooltipContent>
              {item.itemType === "Permadrop" && <p>This item once dropped cannot be picked up.</p>}
              {item.itemType === "Nonfunctional" && <p>This item is nonfunctional.</p>}
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </button>
  );
}

export default memo(AppInventoryItemCard);