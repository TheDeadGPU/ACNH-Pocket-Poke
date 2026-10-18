"use client";

import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";

export default function ItemExplorerSearchInput()
{
    const {itemSearchValue, setItemSearchValue} = useACNHPocketPokeContext();
    return(
        <InputGroup className="max-w-xs">
            <InputGroupInput placeholder="Search..." value={itemSearchValue} onChange={(e) => setItemSearchValue(e.target.value)}/>
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
        </InputGroup>
    )
}