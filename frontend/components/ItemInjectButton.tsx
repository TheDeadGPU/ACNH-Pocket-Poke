import { useState } from "react";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { computeItemHex } from "@/lib/ItemHelper";
import { ApiError, injectItems } from "@/lib/pocketPoke";
import { toast } from "@/components/ui/toast";
import { Item } from "@/lib/Item";
import { Button } from "./ui/button";

export default function ItemInjectButton({
  item,
  className,
}: {
  item: Item;
  className?: string;
}) {
  const { switchIP } = useACNHPocketPokeContext();
  const [pending, setPending] = useState(false);

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
      console.log(`Injecting item ${item.name} with stack count ${item.stackAmount} to Switch at ${switchIP.trim()} Hex: ${computeItemHex(item, item.stackAmount)}`);
      await injectItems({ ip: switchIP.trim() }, [computeItemHex(item, item.stackAmount)]);
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
              ? "Couldn't connect to your Switch. Is it on, on WiFi, and running sys-botbase? Also, is the backend API running?"
              : e.message;
      }
      toast.add({ type: "error", description });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleInject}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? "Adding..." : "Add to inventory"}
    </Button>
  );
}
