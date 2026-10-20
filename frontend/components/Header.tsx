"use client";

import { IconShoppingCart } from "@tabler/icons-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import NintendoSwitchIPInput from "./NintendoSwitchIPInput";
import ItemExplorerSearchInput from "./ItemExplorerSearchInput";
import ShoppingCartButton from "./ShoppingCart/ShoppingCartButton";

export default function Header() {
    

    return (
        <div className="relative">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                    <div>
                        <span className="flex items-center gap-3 text-3xl font-black tracking-tighter">ACNH Pocket Poke</span>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400">An ACNH Inventory Editor</p>
                    </div>
                    <div>
                        <NintendoSwitchIPInput/>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <ItemExplorerSearchInput/>
                    <ShoppingCartButton/>
                    <ThemeToggle />
                </div>
            </div>

            
        </div>
    );
}