// Helper function to format currency values with K for thousands
export const formatCurrencyWithK = (value: number) => {
  if (value === undefined || value === null) return "$0.00";

  // Convert cents to dollars
  const dollars = value / 100;

  // Format with K suffix for values over 1000
  if (dollars >= 1000000) {
    return `$${(dollars / 1000000).toFixed(1)}M`;
  } else if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}K`;
  } else {
    return `$${dollars.toFixed(2)}`;
  }
};

// Format price/currency values consistently
export const formatPrice = (price: number | undefined) => {
  if (price === undefined || price === null) return 0;
  // If price is already in dollars (under 1000), convert to cents
  return price < 1000 ? price * 100 : price;
};
