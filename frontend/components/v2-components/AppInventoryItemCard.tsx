import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { imageUrl, Item } from "@/lib/Item";

interface AppInventoryItemCardProps {
    item: Item;
    className?: string;
}

export default function AppInventoryItemCard(props: AppInventoryItemCardProps) {
    const {selectedItem, setSelectedItem} = useACNHPocketPokeContext();
    const FALLBACK_IMAGE = "/unknown_item.png";
    const imageURL = imageUrl(props.item);
    const isSelected = props.item === selectedItem;

    function handleOnClick()
    {
        setSelectedItem(props.item);
    }
    return (
        <div className={props.className} onClick={handleOnClick}>
            <div className={`flex justify-between ${isSelected ? "border-2 border-[var(--primary)] ":"border-2 border-[var(--border)]"}  hover:cursor-pointer mb-2 rounded-lg`}>
                <div className="flex items-center">
                    <img
                        src={imageURL || FALLBACK_IMAGE}
                        alt={props.item.name}
                        width={50}
                        height={50}
                        loading="lazy"
                        onError={(e) => {
                            if (!e.currentTarget.src.endsWith(FALLBACK_IMAGE)) e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                        className="mx-auto"
                    />
                    <div>
                        <p className="font-bold">{props.item.name}</p>
                        <p className="text-xs">{props.item.category}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}