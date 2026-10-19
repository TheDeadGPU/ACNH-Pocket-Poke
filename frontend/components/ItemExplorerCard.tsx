import { memo, useMemo } from "react";
import { computeItemHex } from "@/lib/ItemHelper";
import { imageUrl, Item } from "@/lib/Item";
import ItemInjectButton from "./ItemInjectButton";

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
      className={`h-full rounded-xl bg-slate-600 p-2 ${
        selected ? "ring-2 ring-sky-400" : ""
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className="w-full text-left transition-transform hover:scale-105
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 hover:cursor-pointer"
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
        <p className="line-clamp-2 text-center text-[14px] font-bold uppercase leading-tight">
          {item.name}
        </p>
        <div className="mt-3">
          <p className="text-[12px] font-bold uppercase">{item.category.toUpperCase()}</p>
          <p className="text-[12px] font-bold uppercase">ID: {item.internalId}</p>
          <p className="font-mono text-[12px] font-bold normal-case">Hex: {hex}</p>
        </div>
      </button>
      <ItemInjectButton item={item} className="mt-2 w-full" />
    </div>
  );
}

export default memo(ItemExplorerCard);