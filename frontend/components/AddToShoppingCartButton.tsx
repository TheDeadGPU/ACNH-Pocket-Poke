import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "./ui/toast";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { Item } from "@/lib/Item";

export default function AddToShoppingCartButton({
  item,
  className,
}: {
  item: Item;
  className?: string;
}) {
  const { addItemToCart } = useACNHPocketPokeContext();
  const [pending, setPending] = useState(false);

  async function handleAddToCart() {
    if (pending) return;

    setPending(true);
    try {
      if (!addItemToCart(item)) {
        toast.add({
          type: "error",
          description: "Shopping cart is full.",
        });
        return;
      }

      toast.add({
        type: "success",
        description: `Added ${item.name.toUpperCase()} to shopping cart.`,
      });
    } catch (e) {
      toast.add({
        type: "error",
        description: "Couldn't add item to shopping cart. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleAddToCart}
      disabled={pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? "Adding..." : "Add to cart"}
    </Button>
  );
}