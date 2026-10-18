'use client';

import { InvalidIPError, isValidIPv4 } from '@/lib/IPHelper';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';


interface ACNHPocketPokeContextType {
  switchIP: string;
  setSwitchIPAddress: (ip: string) => void;
  items: string[];
  
}

const ACNHPocketPokeContext = createContext<ACNHPocketPokeContextType | undefined>(undefined);

export function ACNHPocketPokeProvider({ children }: { children: React.ReactNode }) {
    const [snippets, setSnippets] = useState([])
    const [switchIP, setSwitchIP] = useState("");

    const setSwitchIPAddress = (ip: string) => {
      // Check to see if the entered address is a valid IPv4 address.
      const cleanIP = ip.trim();
      const result = isValidIPv4(cleanIP);

      //Check to see if this is a private IP address.
      if(!result) throw new InvalidIPError(cleanIP);
      setSwitchIP(cleanIP);
    };

  return (
    <ACNHPocketPokeContext.Provider
      value={{
        switchIP: "",
        setSwitchIPAddress,
        items: [""],
      }}
    >
      {children}
    </ACNHPocketPokeContext.Provider>
  );
}

export function useACNHPocketPokeContext() {
  const context = useContext(ACNHPocketPokeContext);
  if (!context) {
    throw new Error('useACNHPocketPokeContext must be used within a ACNHPocketPokeProvider');
  }
  return context;
}