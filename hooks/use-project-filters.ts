"use client";

import { useState } from "react";

type ProjectFilterState = {
  status: string;
  query: string;
};

export function useProjectFilters(initialState?: Partial<ProjectFilterState>) {
  const [filters, setFilters] = useState<ProjectFilterState>({
    status: initialState?.status ?? "all",
    query: initialState?.query ?? "",
  });

  return {
    filters,
    setStatus(status: string) {
      setFilters((current) => ({ ...current, status }));
    },
    setQuery(query: string) {
      setFilters((current) => ({ ...current, query }));
    },
  };
}
