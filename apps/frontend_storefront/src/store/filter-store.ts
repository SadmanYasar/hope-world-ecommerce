import { create } from "zustand";

export type FilterState = {
  search: string;
  category: string;
  priceRange: string;
  rating: string;
  sortByDate: "asc" | "desc";
  sortByPrice: "asc" | "desc";
  isFilterMenuOpen: boolean;
};

type FilterActions = {
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setPriceRange: (priceRange: string) => void;
  setRating: (rating: string) => void;
  setSortByDate: (sortBy: "asc" | "desc") => void;
  setSortByPrice: (sortBy: "asc" | "desc") => void;
  toggleFilterMenu: () => void;
  setFilterMenuOpen: (isOpen: boolean) => void;
  resetFilters: () => void;
};

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  // Initial state
  search: "",
  category: "all",
  priceRange: "all",
  rating: "any",
  sortByDate: "desc",
  isFilterMenuOpen: false,
  sortByPrice: "asc",
  // Actions
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setRating: (rating) => set({ rating }),
  setSortByDate: (sortBy) => set({ sortByDate: sortBy }),
  setSortByPrice: (sortBy) => set({ sortByPrice: sortBy }),
  toggleFilterMenu: () =>
    set((state) => ({ isFilterMenuOpen: !state.isFilterMenuOpen })),
  setFilterMenuOpen: (isOpen) => set({ isFilterMenuOpen: isOpen }),
  resetFilters: () =>
    set({
      search: "",
      category: "all",
      priceRange: "all",
      rating: "any",
      sortByDate: "desc",
      sortByPrice: "asc",
    }),
}));
