import { memo, useMemo, useState } from "react";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { computeItemHex } from "@/lib/ItemHelper";
import { ApiError, injectItems } from "@/lib/pocketPoke";
import { toast } from "@/components/ui/toast";
import { imageUrl, Item } from "@/lib/Item";
import { Button } from "./ui/button";

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
  const { switchIP } = useACNHPocketPokeContext();
  const [pending, setPending] = useState(false);

  const hex = useMemo(() => computeItemHex(item), [item]);
  const imageURL = imageUrl(item);

  async function handleInject() {
    if (pending) return;

    if (!switchIP.trim()) {
      toast.add({
        type: "error",
        description: "Please enter your Switch IP in the IP field at the top of the page.",
      });
      return;
    }

    setPending(true);
    try {
      await injectItems({ ip: switchIP.trim() }, [hex]);
      toast.add({
        type: "success",
        description: `Added ${item.name.toUpperCase()} to inventory slot one.`,
      });
    } catch (e) {
      let description =
        "Couldn't reach the server. Check your connection and try again.";
      if (e instanceof ApiError) {
        description =
          e.status === 409
            ? "ACNH doesn't appear to be running on your Switch."
            : e.status === 502 || e.status === 504
              ? "Couldn't connect to your Switch. Is it on, on WiFi, and running sys-botbase?"
              : e.message;
      }
      toast.add({ type: "error", description });
    } finally {
      setPending(false);
    }
  }

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
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
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
          <p>Stack: {item.stackSize}</p>
        </div>
      </button>
      <Button
        type="button"
        onClick={handleInject}
        disabled={pending}
        aria-busy={pending}
        className="mt-2 w-full"
      >
        {pending ? "Adding..." : "Add to inventory"}
      </Button>
    </div>
  );
}

export default memo(ItemExplorerCard);