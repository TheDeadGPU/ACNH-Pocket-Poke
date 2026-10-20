import { IconShoppingCart } from "@tabler/icons-react";
import { useState } from "react";
import { Button } from "../ui/button";
import ShoppingCart from "./ShoppingCart";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";

export default function ShoppingCartButton() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const {shoppingCartItems} = useACNHPocketPokeContext();
    return (
        <div>
            <Button
                type="button"
                variant="outline"
                className="relative"
                onClick={() => setIsCartOpen((open) => !open)}
                aria-expanded={isCartOpen}
                aria-label={`Shopping cart, ${shoppingCartItems.length} item${shoppingCartItems.length === 1 ? "" : "s"}`}
            >
                <IconShoppingCart />
                {shoppingCartItems.length > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground"
                    >
                        {shoppingCartItems.length}
                    </span>
                )}
            </Button>
            {isCartOpen && (
                <div className="absolute right-0 top-full z-20 mt-3 w-[min(24rem,calc(100vw-2rem))]">
                    <ShoppingCart onClose={() => setIsCartOpen(false)} />
                </div>
            )}
        </div>
    )
}