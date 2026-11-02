'use client';

import { isValidIPv4 } from '@/lib/IPHelper';
import React, {
  createContext, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState,
} from 'react';
import { loadItems, searchItems, type Item, type ItemIndex } from '@/lib/Item';

const DEFAULT_CATEGORIES = ['All']; // Default state before loading or fallback

interface ACNHPocketPokeContextType {
  switchIP: string;
  setSwitchIPAddress: (ip: string) => void;
  switchPort: number;
  setSwitchPort: (port: number) => void;
  itemSearchValue: string;
  setItemSearchValue: (value: string) => void;
  itemCategory: string; // "" or "All" = all categories
  setItemCategory: (category: string) => void;
  categories: string[]; // Contains ['All', ...loadedCategories]
  items: Item[]; // filtered results only, not the full index
  itemsLoading: boolean;
  itemsError: string | null;
  shoppingCartItems: Item[];
  addItemToCart: (item: Item) => boolean;
  removeItemFromCart: (item: Item) => void;
  clearShoppingCart: () => void;
  selectedInventorySlot: number;
  setSelectedInventorySlot(slot: number): void;
  selectedPlayer: number;
  setSelectedPlayer(player:number): void;
  selectedItem: Item | undefined;
  setSelectedItem(item: Item): void;
  selectedStackAmount: number;
  setSelectedStackAmount(amount: number): void;
  //Exprimental
  inventoryItems: (Item | null)[];
  addItemToInventory(item: Item, slot: number, stackAmount?: number): boolean;
  fillInventoryWithItem(item: Item, stackAmount?: number): void;
  clearInventory(): void;

}

const ACNHPocketPokeContext = createContext<ACNHPocketPokeContextType | undefined>(undefined);

export function ACNHPocketPokeProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState<ItemIndex | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [itemSearchValue, setItemSearchValue] = useState('');
  const [itemCategory, setItemCategory] = useState('All'); // Default to "All" category
  const [switchIP, setSwitchIP] = useState('');
  const [switchPort, setSwitchPort] = useState(6000);
  const [shoppingCartItems, setShoppingCartItems] = useState<Item[]>([]); // Optional: manage shopping cart items
  const shoppingCartItemsRef = useRef(shoppingCartItems);
  const [selectedInventorySlot, setSelectedInventorySlot] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>();
  const [selectedStackAmount, setSelectedStackAmount] = useState(1);
  const [inventoryItems, setInventoryItems] = useState<(Item | null)[]>(Array(40).fill(null));

  useEffect(() => {
    const cachedIP = localStorage.getItem('ACNHPP-SwitchIP');
    if (cachedIP && isValidIPv4(cachedIP)) {
      // Restore browser-only settings after hydration to avoid server/client markup mismatches.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSwitchIP(cachedIP);
    }
    const cachedPort = localStorage.getItem('ACNHPP-SwitchPort');
    if (cachedPort && Number.isInteger(Number(cachedPort)) && Number(cachedPort) >= 1 && Number(cachedPort) <= 65535) {
      setSwitchPort(Number.parseInt(cachedPort));
    }
  },[])

  const setSwitchIPAddress = useCallback((ip: string) => {
    const cleanIP = ip.trim();
    setSwitchIP(cleanIP);
    if (isValidIPv4(cleanIP)) localStorage.setItem('ACNHPP-SwitchIP', cleanIP);
  }, []);

  const setSwitchPortValue = useCallback((port: number) => {
    setSwitchPort(port);
    const numericPort = Number(port);
    if (Number.isInteger(numericPort) && numericPort >= 1 && numericPort <= 65535) {
      localStorage.setItem('ACNHPP-SwitchPort', String(numericPort));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadItems()
      .then((idx) => !cancelled && setIndex(idx))
      .catch((e: Error) => !cancelled && setItemsError(e.message));
    return () => {
      cancelled = true;
    };
  }, []);

  

  // Custom setter that normalizes "All" and resets search input when selected
  const handleSetItemCategory = useCallback((category: string) => {
    const isAll = !category || category.toLowerCase() === 'all';
    setItemCategory(isAll ? 'All' : category);
    if (isAll) {
      setItemSearchValue('');
    }
  }, []);

  // Treat both "All" and "" as no category filter for searchItems
  const effectiveCategory = useMemo(() => {
    if (!itemCategory || itemCategory.toLowerCase() === 'all') {
      return undefined;
    }
    return itemCategory;
  }, [itemCategory]);

  // Keep typing responsive: filter against a deferred copy of the query.
  const deferredQuery = useDeferredValue(itemSearchValue);
  const items = useMemo(
    () =>
      index
        ? searchItems(index, deferredQuery, { category: effectiveCategory })
        : [],
    [index, deferredQuery, effectiveCategory],
  );

  // Automatically prepend "All" to the loaded index categories safely
  const categories = useMemo(() => {
    if (!index?.categories) return DEFAULT_CATEGORIES;
    // Prevent duplicating "All" if it already exists in the backend data
    const hasAll = index.categories.some((cat) => cat.toLowerCase() === 'all');
    return hasAll ? index.categories : ['All', ...index.categories];
  }, [index]);

  const itemsLoading = index === null && itemsError === null;

  // Shopping Cart Logic

  const addItemToCart = useCallback((item: Item): boolean => {
    const currentItems = shoppingCartItemsRef.current;
    if (currentItems.length >= 40) return false;

    const updatedItems = [...currentItems, { ...item }];
    shoppingCartItemsRef.current = updatedItems;
    setShoppingCartItems(updatedItems);
    return true;
  }, []);

  const removeItemFromCart = useCallback((item: Item) => {
    const updatedItems = shoppingCartItemsRef.current.filter((i) => i !== item);
    shoppingCartItemsRef.current = updatedItems;
    setShoppingCartItems(updatedItems);
  }, []);

  const clearShoppingCart = useCallback(() => {
    shoppingCartItemsRef.current = [];
    setShoppingCartItems([]);
  }, []);

  // Inventory Logic
  const INVENTORY_SLOT_COUNT = 40; // module level, matches SLOT_COUNT on the API

  // inside the provider

  const addItemToInventory = useCallback((item: Item, slot: number, stackAmount = 1): boolean => {
    if (!Number.isInteger(slot) || slot < 0 || slot >= INVENTORY_SLOT_COUNT) return false;
    if (!Number.isInteger(stackAmount) || stackAmount < 1 || stackAmount > Math.max(1, item.stackSize)) return false;
    setInventoryItems((prev) => prev.map((cur, i) => (
      i === slot ? { ...item, stackAmount } : cur
    )));
    return true;
  }, []);

  const fillInventoryWithItem = useCallback((item: Item, stackAmount = 1) => {
    if (!Number.isInteger(stackAmount) || stackAmount < 1 || stackAmount > Math.max(1, item.stackSize)) return;
    setInventoryItems(Array.from({ length: INVENTORY_SLOT_COUNT }, () => ({
      ...item,
      stackAmount,
    })));
  }, []);

  const clearInventory = useCallback(
    () => setInventoryItems(Array<Item | null>(INVENTORY_SLOT_COUNT).fill(null)),
    [],
  );

  const value = useMemo(
    () => ({
      switchIP,
      setSwitchIPAddress,
      switchPort,
      setSwitchPort: setSwitchPortValue,
      itemSearchValue,
      setItemSearchValue,
      itemCategory,
      setItemCategory: handleSetItemCategory,
      categories,
      items,
      itemsLoading,
      itemsError,
      shoppingCartItems,
      addItemToCart,
      removeItemFromCart,
      clearShoppingCart,
      selectedInventorySlot,
      setSelectedInventorySlot,
      selectedPlayer,
      setSelectedPlayer,
      selectedItem,
      setSelectedItem,
      selectedStackAmount,
      setSelectedStackAmount,
      inventoryItems,
      addItemToInventory,
      fillInventoryWithItem,
      clearInventory,
    }),
    [switchIP, setSwitchIPAddress, switchPort, setSwitchPortValue, itemSearchValue, itemCategory, handleSetItemCategory, categories, items, itemsLoading, itemsError, shoppingCartItems, addItemToCart, removeItemFromCart, clearShoppingCart, selectedInventorySlot, setSelectedInventorySlot, selectedPlayer, setSelectedPlayer, selectedItem, setSelectedItem, selectedStackAmount, setSelectedStackAmount, inventoryItems, addItemToInventory, fillInventoryWithItem, clearInventory],
  );

  return <ACNHPocketPokeContext.Provider value={value}>{children}</ACNHPocketPokeContext.Provider>;
}

export function useACNHPocketPokeContext() {
  const context = useContext(ACNHPocketPokeContext);
  if (!context) {
    throw new Error('useACNHPocketPokeContext must be used within a ACNHPocketPokeProvider');
  }
  return context;
}