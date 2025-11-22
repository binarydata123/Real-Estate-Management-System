export const formatPrice = (price: number | null | undefined) => {
  // Handle null, undefined, empty string, NaN, invalid numbers
  if (price === null || price === undefined || isNaN(Number(price))) {
    return "N/A";
  }

  const value = Number(price);

  // Handle zero
  if (value === 0) {
    return "₹0";
  }

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)}L`;
  }
  return `₹${value.toLocaleString()}`;
};
