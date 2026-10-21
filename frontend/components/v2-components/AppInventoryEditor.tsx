import AppInventory from "./AppInventory";
import AppInventoryItemSelector from "./AppInventoryItemSelector";

export default function AppInventoryEditor()
{
    return (
        <div className="flex w-full p-4 gap-4">
            <AppInventory className="w-3/4"/>
            <AppInventoryItemSelector className="w-1/4"/>
        </div>
    )
}