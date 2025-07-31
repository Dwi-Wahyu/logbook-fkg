// src/components/breadcrumb-context.tsx
"use client"; // This component will be used by Client Components

import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context value
interface BreadcrumbContextType {
  dynamicSegmentMap: Record<string, string>; // Maps a path segment (like an ID) to its display name
  setDynamicSegment: (pathSegment: string, displayName: string) => void;
  clearDynamicSegments: () => void; // Optional: to clear old entries if needed
}

// Create the context with a default (empty) value
const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
  undefined
);

// Provider component that will wrap your layout or part of your app
export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [dynamicSegmentMap, setDynamicSegmentMap] = useState<
    Record<string, string>
  >({});

  const setDynamicSegment = (pathSegment: string, displayName: string) => {
    setDynamicSegmentMap((prev) => ({
      ...prev,
      [pathSegment]: displayName,
    }));
  };

  const clearDynamicSegments = () => {
    setDynamicSegmentMap({});
  };

  const contextValue = {
    dynamicSegmentMap,
    setDynamicSegment,
    clearDynamicSegments,
  };

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

// Custom hook to consume the context
export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
  }
  return context;
}
