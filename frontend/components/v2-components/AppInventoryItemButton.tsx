"use client";

import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { Item } from "@/lib/Item";
import { IconPlus } from "@tabler/icons-react";

interface AppInventoryItemButtonProps {
    item?: Item;
    slot: number;
}

export default function AppInventoryItemButton(props: AppInventoryItemButtonProps) {

    const{selectedInventorySlot, setSelectedInventorySlot} = useACNHPocketPokeContext();
    const isSelected = (props.slot === selectedInventorySlot);

    function handleOnClick()
    {
        setSelectedInventorySlot(props.slot);
    }
    return (
        <div className={`rounded-xl ${isSelected ? "border-2 border-black": ""} hover:cursor-pointer p-1`} onClick={handleOnClick}>
            <div className="h-[100px] w-full rounded-lg border border-dashed border-indigo-500 p-2">
                {props.item ? 
                ( <div>Item</div>)
                :(<div className="flex h-full items-center justify-center">
                    <IconPlus />
                </div>)}
                
            </div>
        </div>
    )
}