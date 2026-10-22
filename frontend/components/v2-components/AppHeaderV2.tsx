import { IconLeaf } from "@tabler/icons-react";
import AppHeaderIPInput from "./AppHeaderIPInput";
import AppPlayerSelectButtons from "./AppPlayerSelectButtons";
import AppACNHStatusIndicator from "./AppACNHStatusIndicator";

export default function AppHeaderV2()
{
    return(
    <div className="relative bg-white p-2 shadow-xs">
        <div className="flex items-center justify-between gap-4">
            <div id="header-logo" className="items-center text-lime-700 gap-2">
                <div className="flex items-center gap-2">
                    <IconLeaf/>
                    <span className="flex items-center gap-3 text-3xl font-black tracking-tighter">Pocket Poke</span>
                </div>
            </div>
            <div className="flex gap-4">
                <AppHeaderIPInput/>
                <AppACNHStatusIndicator/>
            </div>
            <AppPlayerSelectButtons/>
        </div>
    </div>
    )
}