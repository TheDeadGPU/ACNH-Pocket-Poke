'use client';

import { InvalidIPError, isValidIPv4 } from '@/lib/IPHelper';
import React, {
  createContext, useCallback, useContext, useDeferredValue, useEffect, useMemo, useState,
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
}

const ACNHPocketPokeContext = createContext<ACNHPocketPokeContextType | undefined>(undefined);

export function ACNHPocketPokeProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState<ItemIndex | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [itemSearchValue, setItemSearchValue] = useState('');
  const [itemCategory, setItemCategory] = useState('All'); // Default to "All" category
  const [switchIP, setSwitchIP] = useState('');

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
        ? searchItems(index, deferredQuery, { category: effectiveCategory, limit: RESULT_LIMIT })
        : [],
    [index, deferredQuery, effectiveCategory],
  );

  const setSwitchIPAddress = useCallback((ip: string) => {
    const cleanIP = ip.trim();
    if (!isValidIPv4(cleanIP)) throw new InvalidIPError(cleanIP);
    setSwitchIP(cleanIP);
  }, []);

  // Automatically prepend "All" to the loaded index categories safely
  const categories = useMemo(() => {
    if (!index?.categories) return DEFAULT_CATEGORIES;
    // Prevent duplicating "All" if it already exists in the backend data
    const hasAll = index.categories.some((cat) => cat.toLowerCase() === 'all');
    return hasAll ? index.categories : ['All', ...index.categories];
  }, [index]);

  const itemsLoading = index === null && itemsError === null;

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
    }),
    [switchIP, setSwitchIPAddress, itemSearchValue, itemCategory, handleSetItemCategory, categories, items, itemsLoading, itemsError],
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