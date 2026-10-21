import { Button } from "../ui/button";
import AppInventoryItemButton from "./AppInventoryItemButton";

interface AppInventoryProps
{
    className?: string;
}

export default function AppInventory(props: AppInventoryProps)
{
    const itemArray = Array.from(Array(20).keys()).map(x => x + 1);
    return (
        <div className={props.className}>
            <div id="inventory-object" className="bg-white rounded-xl p-4">
                <div id="inventory-header" className="flex justify-between">
                    <div className="flex w-full items-center gap-4">
                        <p className="font-bold text-xl text-lime-700">Pockets</p>
                        <p className="text-xs">14 of 20 used</p>
                    </div>
                    <div className="flex">
                        <Button variant="ghost">
                            <p className="font-bold">Fill with item</p>
                        </Button>
                        <Button variant="ghost">
                            <p className="font-bold text-red-400">Clear all</p>
                        </Button>
                    </div>
                    
                </div>
                <div className="grid grid-cols-10 p-4 gap-2">
                    {itemArray.map((item,idx) => (
                        <AppInventoryItemButton key={`inv-${idx}`} slot={idx}/>
                    ))}
                </div>
            </div>
        </div>
    )
}