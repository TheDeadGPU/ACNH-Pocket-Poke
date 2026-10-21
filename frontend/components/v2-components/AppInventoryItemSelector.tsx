"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "../ui/combobox";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group";
import { Search } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import AppInventoryItemCard from "./AppInventoryItemCard";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { Item } from "@/lib/Item";
interface AppInventoryItemSelectorProps {
    className?: string;
}

export default function AppInventoryItemSelector(props: AppInventoryItemSelectorProps) {

    const { items, itemSearchValue, setItemSearchValue, itemCategory, setItemCategory, categories, selectedInventorySlot, selectedPlayer, selectedItem, setSelectedItem } = useACNHPocketPokeContext();
    const [stack, setStack] = useState(1);

    function incrementStack() {
        if(selectedItem)
        {
            setStack((prev) => Math.min(prev + 1, selectedItem.stackSize));
        }
    }

    function decrementStack() {
        setStack((prev) => Math.max(prev - 1, 1));
    }

    useEffect(() => {
        setStack(1);
    }, [selectedItem])

    useEffect(() => {
        if (selectedItem) {
            selectedItem.stackAmount = stack; // Update the stackAmount in the item object whenever stack changes
        }
    }, [stack, selectedItem]);

    return (
        <div className={props.className}>
            <div className="bg-white rounded-xl h-screen p-2">
                <Tabs defaultValue="account" className="w-full">
                    <TabsList>
                        <TabsTrigger value="items">Items</TabsTrigger>
                        <TabsTrigger value="loadouts" disabled>Loadouts</TabsTrigger>
                    </TabsList>
                    <TabsContent value="items">
                        <div className="space-y-2">
                            <div id="items-header" className="flex justify-between">
                                <p className="text-lg text-lime-700 font-bold">Slot {selectedInventorySlot + 1}</p>
                                <p className="text-xs">Player {selectedPlayer} · Pockets</p>
                            </div>
                            <div>
                                <InputGroup className="max-w-xs">
                                    <InputGroupInput placeholder="Search items" onChange={(e) => setItemSearchValue(e.target.value)} />
                                    <InputGroupAddon>
                                        <Search />
                                    </InputGroupAddon>
                                    <InputGroupAddon align="inline-end">{items.length}</InputGroupAddon>
                                </InputGroup>
                            </div>
                            <div id="item-cetagories">
                                <Field className="w-full max-w-xs">
                                    <FieldLabel>Item Category</FieldLabel>
                                    <Combobox items={categories} defaultValue="All">
                                        <ComboboxInput placeholder="Select a category" />
                                        <ComboboxContent>
                                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                                            <ComboboxList>
                                                {(item) => (
                                                    <ComboboxItem key={item} value={item} onClick={() => setItemCategory(item)}>
                                                        {item}
                                                    </ComboboxItem>
                                                )}
                                            </ComboboxList>
                                        </ComboboxContent>
                                    </Combobox>
                                </Field>
                            </div>
                            <div id="item-list">
                                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                    {items.map((item, idx) => (
                                        <AppInventoryItemCard key={`item-${idx}-${item.variantId}`} item={item} />
                                    ))}
                                </ScrollArea>
                            </div>
                            <div id="item-quantity">
                                <div className="flex justify-between rounded-lg border-2 border-[var(--border)] p-2 items-center">
                                    <p className="font-bold">Quantity</p>
                                    <div className="flex gap-4">
                                        <Button disabled={stack <= 1} onClick={decrementStack}>
                                            -
                                        </Button>
                                        <Label>{stack}</Label>
                                        <Button disabled={!selectedItem || stack >= selectedItem.stackSize} onClick={incrementStack}>
                                            +
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div id="hex-value-display">
                                <div className="flex justify-between rounded-lg border-2 border-[var(--border)] p-2 items-center">
                                    <div>
                                        <p className="font-bold text-xs">Advanced raw 8-byte value</p>
                                        <p>{selectedItem?.hex}</p>
                                        <p className="font-bold text-xs">Count, variation and flags live in the upper bytes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="loadouts">Change your loadout here.</TabsContent>
                </Tabs>
            </div>
        </div>
    )
}