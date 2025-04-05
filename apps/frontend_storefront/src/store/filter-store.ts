import { create } from 'zustand';

export type FilterState = {
  category: string;
  priceRange: string;
  rating: string;
  sortBy: string;
  isFilterMenuOpen: boolean;
};

type FilterActions = {
  setCategory: (category: string) => void;
  setPriceRange: (priceRange: string) => void;
  setRating: (rating: string) => void;
  setSortBy: (sortBy: string) => void;
  toggleFilterMenu: () => void;
  setFilterMenuOpen: (isOpen: boolean) => void;
  resetFilters: () => void;
};

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  // Initial state
  category: 'all',
  priceRange: 'all',
  rating: 'any',
  sortBy: 'relevance',
  isFilterMenuOpen: false,

  // Actions
  setCategory: (category) => set({ category }),
  setPriceRange: (priceRange) => set({ priceRange }),
  setRating: (rating) => set({ rating }),
  setSortBy: (sortBy) => set({ sortBy }),
  toggleFilterMenu: () => set((state) => ({ isFilterMenuOpen: !state.isFilterMenuOpen })),
  setFilterMenuOpen: (isOpen) => set({ isFilterMenuOpen: isOpen }),
  resetFilters: () => set({ 
    category: 'all', 
    priceRange: 'all', 
    rating: 'any', 
    sortBy: 'relevance' 
  }),
}));