"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Tipe data state global
type GlobalStateType = {
  count: number;
  setCount: (value: number) => void;
};

// Inisialisasi context (bukan namespace)
const GlobalStateContext = createContext<GlobalStateType | undefined>(
  undefined
);

// Provider
export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  return (
    <GlobalStateContext.Provider value={{ count, setCount }}>
      {children}
    </GlobalStateContext.Provider>
  );
}

// Custom hook untuk menggunakan context
export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
}
