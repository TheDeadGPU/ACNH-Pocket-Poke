import { type Item } from "@/lib/Item";
import { Button } from "@/components/ui/button";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import ShoppingCartItemCard from "@/components/ShoppingCart/ShoppingCartItemCard";
import { injectItems } from "@/lib/pocketPoke";
import { convertItemArrayToHex } from "@/lib/ItemHelper";
import ShoppingCartClearButton from "./ShoppingCartClearButton";

export interface ShoppingCartProps {
  items?: Item[];
  title?: string;
  onClose?: () => void;
  open?: boolean;
}

export default function ShoppingCart({
  title = "Shopping Cart",
  onClose,
  open = true,
}: ShoppingCartProps) {
  const {switchIP, shoppingCartItems} = useACNHPocketPokeContext();
  if (!open) return null;
  const totalItems = shoppingCartItems.length;

  async function injectCart()
  {
    await injectItems({ ip: switchIP, player: 1}, convertItemArrayToHex(shoppingCartItems));
  }

  return (
    <aside className="w-full max-w-sm rounded-xl border bg-card p-4 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {totalItems} item{totalItems === 1 ? "" : "s"}
          </p>
        </div>
        {onClose && (
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Close shopping cart">
            Close
          </Button>
        )}
      </div>

      {shoppingCartItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Your cart is empty. Select an item and add it to your inventory list.
        </div>
      ) : (
        <ul className="space-y-3 h-[300px] overflow-y-auto rounded-lg border border-dashed p-2">
          {shoppingCartItems.map((item, idx) => (
            <ShoppingCartItemCard
              key={`${item.id}-${item.variantId ?? "default"}-${idx}`}
              item={item}
            />
          ))}
        </ul>
      )}

      <div className="mt-4 flex justify-center gap-4">
        <Button disabled={shoppingCartItems.length === 0} onClick={injectCart}>
          Inject Shopping Cart
        </Button>
        <ShoppingCartClearButton/>
      </div>
    </aside>
  );
}