"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface SelectedEntity {
  type: "remitente" | "consignatario";
  id: string;
  name: string;
}

interface SelectedEntityContextValue {
  selected: SelectedEntity | null;
  setSelected: (entity: SelectedEntity | null) => void;
}

const SelectedEntityContext = createContext<SelectedEntityContextValue>({
  selected: null,
  setSelected: () => {},
});

export function SelectedEntityProvider({ children }: { children: ReactNode }) {
  const [selected, setSelectedState] = useState<SelectedEntity | null>(null);
  const setSelected = useCallback((entity: SelectedEntity | null) => {
    setSelectedState(entity);
  }, []);
  return (
    <SelectedEntityContext.Provider value={{ selected, setSelected }}>
      {children}
    </SelectedEntityContext.Provider>
  );
}

export function useSelectedEntity() {
  return useContext(SelectedEntityContext);
}
