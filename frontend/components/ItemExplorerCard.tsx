import { memo, useMemo } from "react";
import { computeItemHex } from "@/lib/ItemHelper";
import { imageUrl, Item } from "@/lib/Item";
import ItemInjectButton from "./ItemInjectButton";
import AddToShoppingCartButton from "./AddToShoppingCartButton";

const FALLBACK_IMAGE = "/unknown_item.png";

function ItemExplorerCard({
  item,
  selected,
  onSelect,
}: {
  item: Item;
  selected: boolean;
  onSelect: () => void;
}) {
  const hex = useMemo(() => computeItemHex(item), [item]);
  const imageURL = imageUrl(item);

  return (
    <div
      className={`h-full rounded-xl border border-border bg-card p-2 text-card-foreground shadow-sm transition-colors ${
        selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="w-full text-left text-card-foreground transition-transform hover:scale-105
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring hover:cursor-pointer"
      >
        <img
          src={imageURL || FALLBACK_IMAGE}
          alt={item.name}
          width={100}
          height={100}
          loading="lazy"
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(FALLBACK_IMAGE)) e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="mx-auto"
        />
        <p className="line-clamp-2 text-center text-[14px] font-bold uppercase leading-tight text-foreground">
          {item.name}
        </p>
        <div className="mt-3 space-y-1 text-muted-foreground">
          <p className="text-[12px] font-bold uppercase">{item.category.toUpperCase()}</p>
          <p className="text-[12px] font-bold uppercase">ID: {item.internalId}</p>
          <p className="font-mono text-[12px] font-bold normal-case text-foreground">
            Hex: {hex}
          </p>
        </div>
      </button>
      <AddToShoppingCartButton item={item} className="mt-2 w-full" />
    </div>
  );
}

export default memo(ItemExplorerCard);