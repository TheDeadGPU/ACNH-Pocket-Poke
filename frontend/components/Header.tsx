import { IconDeviceNintendo, IconShoppingCart } from "@tabler/icons-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { Search, SearchIcon } from "lucide-react";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from "./ui/input-group";
import NintendoSwitchStatus from "./NitendoSwitchStatus";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import NintendoSwitchIPInput from "./NintendoSwitchIPInput";
import ItemExplorerSearchInput from "./ItemExplorerSearchInput";

export default function Header()
{
    return(
        <div>
            <div className="flex justify-between items-center">
                <div className="flex gap-8 items-center">
                    <div>
                        <span className="text-3xl font-black tracking-tighter flex items-center gap-3">ACNH Pocket Poke</span>
                        <p className="text-[10px] font-bold text-purple-400 tracking-[0.3em] uppercase mt-2">An ACNH Inventory Editor</p>
                    </div>
                    <div>
                        <NintendoSwitchIPInput/>
                    </div>
                </div>
                <div className="flex gap-2">
                    <ItemExplorerSearchInput/>
                    <Button variant="outline"><IconShoppingCart/></Button>
                    <ThemeToggle/> 
                </div>
                
            </div>
        </div>
    )
}