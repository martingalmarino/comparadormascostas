"use client";

import { createContext, useContext, useState } from "react";

const HomeZonaContext = createContext<{ zona: string; setZona: (zona: string) => void } | null>(null);

export function HomeZonaProvider({ children }: { children: React.ReactNode }) {
  const [zona, setZona] = useState("");
  return <HomeZonaContext.Provider value={{ zona, setZona }}>{children}</HomeZonaContext.Provider>;
}

export function useHomeZona() {
  const value = useContext(HomeZonaContext);
  if (!value) throw new Error("useHomeZona tiene que usarse dentro de HomeZonaProvider");
  return value;
}
