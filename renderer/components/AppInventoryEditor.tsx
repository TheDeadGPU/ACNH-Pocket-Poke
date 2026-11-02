import AppInventory from "./AppInventory";
import AppInventoryItemSelector from "./AppInventoryItemSelector";

export default function AppInventoryEditor()
{
    return (
        <div className="flex w-full flex-col gap-4 p-2 lg:flex-row">
            <AppInventory className="min-w-0 flex-1"/>
            <AppInventoryItemSelector className="w-full lg:w-96"/>
        </div>
    )
}