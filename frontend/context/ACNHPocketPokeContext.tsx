'use client';

import { InvalidIPError, isValidIPv4 } from '@/lib/IPHelper';
import React, {
  createContext, useCallback, useContext, useDeferredValue, useEffect, useMemo, useRef, useState,
} from 'react';
import { loadItems, searchItems, type Item, type ItemIndex } from '@/lib/Item';

const RESULT_LIMIT = 60;
const DEFAULT_CATEGORIES = ['All']; // Default state before loading or fallback

interface ACNHPocketPokeContextType {
  switchIP: string;
  setSwitchIPAddress: (ip: string) => void;
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
}

const ACNHPocketPokeContext = createContext<ACNHPocketPokeContextType | undefined>(undefined);

export function ACNHPocketPokeProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState<ItemIndex | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [itemSearchValue, setItemSearchValue] = useState('');
  const [itemCategory, setItemCategory] = useState('All'); // Default to "All" category
  const [switchIP, setSwitchIP] = useState('');
  const [shoppingCartItems, setShoppingCartItems] = useState<Item[]>([]); // Optional: manage shopping cart items
  const shoppingCartItemsRef = useRef(shoppingCartItems);
  const [selectedInventorySlot, setSelectedInventorySlot] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>();

  useEffect(() => {
    const cachedIP = localStorage.getItem('ACNHPP-SwitchIP');
    if (cachedIP && isValidIPv4(cachedIP)) {
      setSwitchIP(cachedIP);
    }
  },[])

  const saveSwitchIPToLocalStorage = (ip: string) => {
    localStorage.setItem('ACNHPP-SwitchIP', ip);
  }

  const setSwitchIPAddress = useCallback((ip: string) => {
    const cleanIP = ip.trim();
    if (!isValidIPv4(cleanIP)) throw new InvalidIPError(cleanIP);
    setSwitchIP(cleanIP);
    saveSwitchIPToLocalStorage(cleanIP);
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

  const value = useMemo(
    () => ({
      switchIP,
      setSwitchIPAddress,
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
    }),
    [switchIP, setSwitchIPAddress, itemSearchValue, itemCategory, handleSetItemCategory, categories, items, itemsLoading, itemsError, shoppingCartItems, addItemToCart, removeItemFromCart, clearShoppingCart, selectedInventorySlot, setSelectedInventorySlot, selectedPlayer, setSelectedPlayer, selectedItem, setSelectedItem],
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