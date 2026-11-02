"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useACNHPocketPokeContext } from "@/context/ACNHPocketPokeContext";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import AppInventoryItemCard from "./AppInventoryItemCard";
import StackStepper from "@/components/StackStepper";
import { computeItemHex } from "@/lib/ItemHelper";
import { Item } from "@/lib/Item";
import { Button } from "@/components/ui/button";

const ROW_HEIGHT = 66;

function useDebounced<T>(value: T, ms = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function AppInventoryItemSelector({ className }: { className?: string }) {
  const {
    items, setItemSearchValue, itemCategory, setItemCategory, categories,
    selectedInventorySlot, selectedPlayer, selectedItem, setSelectedItem,
    selectedStackAmount: stack, setSelectedStackAmount: setStack,
    addItemToInventory, itemsLoading, itemsError,
  } = useACNHPocketPokeContext();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query);

  useEffect(() => {
    setItemSearchValue(debouncedQuery);
  }, [debouncedQuery, setItemSearchValue]);

  // Reset the stack in the handler instead of an effect: no extra render pass.
  const handleSelect = useCallback((item: Item) => {
    setSelectedItem(item);
    setStack(1);
  }, [setSelectedItem, setStack]);

  // Derived, never stored, and no mutation of the shared item object.
  const hex = selectedItem ? computeItemHex(selectedItem, stack) : "";

  const listRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const handleAddToInventory = useCallback(() => {
    if (selectedItem) addItemToInventory(selectedItem, selectedInventorySlot, stack);
  }, [addItemToInventory, selectedInventorySlot, selectedItem, stack]);

  return (
    <div className={className}>
      <div className="min-h-[32rem] rounded-xl bg-white p-3">
        <Tabs defaultValue="items" className="w-full">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="loadouts" disabled>Loadouts</TabsTrigger>
          </TabsList>

          <TabsContent value="items">
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-lg font-bold text-lime-700">Slot {selectedInventorySlot + 1}</p>
                <p className="text-xs">Player {selectedPlayer} · Pockets</p>
              </div>

              <InputGroup className="w-full">
                <InputGroupInput
                  placeholder="Search items"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <InputGroupAddon><Search /></InputGroupAddon>
                <InputGroupAddon align="inline-end">{items.length}</InputGroupAddon>
              </InputGroup>

              <Field className="w-full">
                <FieldLabel>Item Category</FieldLabel>
                <Combobox
                  items={categories}
                  value={itemCategory}
                  onValueChange={(v) => v && setItemCategory(v)}
                >
                  <ComboboxInput placeholder="Select a category" />
                  <ComboboxContent>
                    <ComboboxEmpty>No categories found.</ComboboxEmpty>
                    <ComboboxList>
                      {(category) => (
                        <ComboboxItem key={category} value={category}>{category}</ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>

              {/* Only the visible rows (~4 + overscan) are ever mounted. */}
              <div ref={listRef} className="h-[200px] w-full overflow-auto rounded-md border">
                <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                  {virtualizer.getVirtualItems().map((row) => {
                    const item = items[row.index];
                    return (
                      <div
                        key={item.id}
                        className="absolute left-0 top-0 w-full px-2 py-1"
                        style={{ height: row.size, transform: `translateY(${row.start}px)` }}
                      >
                        <AppInventoryItemCard
                          item={item}
                          selected={item.id === selectedItem?.id}
                          onSelect={handleSelect}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              {itemsLoading && <p className="text-sm text-muted-foreground">Loading item catalog...</p>}
              {itemsError && <p role="alert" className="text-sm text-destructive">{itemsError}</p>}
              {!itemsLoading && !itemsError && items.length === 0 && (
                <p className="text-sm text-muted-foreground">No items match your search.</p>
              )}

              <div className="flex items-center justify-between rounded-lg border-2 border-[var(--border)] p-2">
                <p className="font-bold">Quantity</p>
                <StackStepper value={stack} max={Math.max(1, selectedItem?.stackSize ?? 1)} onChange={setStack} />
              </div>

              <div className="rounded-lg border-2 border-[var(--border)] p-2">
                <p className="text-xs font-bold">Advanced raw 8-byte value</p>
                <p className="font-mono">{hex}</p>
                <p className="text-xs font-bold">Count, variation and flags live in the upper bytes.</p>
                <p>{selectedItem?.internalId}</p>
              </div>

              <div className="flex w-full">
                <Button
                  variant="default"
                  className="w-full font-bold"
                  disabled={!selectedItem}
                  onClick={handleAddToInventory}
                >
                  {selectedItem
                    ? `Set slot ${selectedInventorySlot + 1} to ${selectedItem.name} x${stack}`
                    : "Select an item first"}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="loadouts">Change your loadout here.</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}