import { imageUrl, Item } from "@/lib/Item";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";

export default function ShoppingCartItemCard({ item }: { item: Item; }) {

    const { removeItemFromCart } = useACNHPocketPokeContext();
    const image = imageUrl(item);
    const quantity = Math.max(item.stackAmount ?? 1, 1);

    return (
        <li className="flex gap-3 rounded-lg border p-2">
            {image && (
                <img
                    src={image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-md object-cover"
                />
            )}

            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
            </div>

            <div className="flex items-center justify-end text-sm font-medium">
                <p>{quantity}x</p>
                <Button variant="ghost" size="lg" className="ml-2 p-1 hover:text-red-500" aria-label={`Remove ${item.name} from cart`} onClick={() => removeItemFromCart(item)} >
                    <IconTrash />
                </Button>
            </div>
            
        </li>
    );
}