// hooks/useIndianNumberFormat.ts
import { useCallback } from "react";

export const useIndianNumberFormat = () => {
  const formatIndianNumber = useCallback((value: string): string => {
    // Remove all non-digit characters except decimal point
    const cleaned = value.replace(/[^\d.]/g, "");

    if (!cleaned) return "";

    // Split into whole and decimal parts
    const parts = cleaned.split(".");
    const wholePart = parts[0];
    const decimalPart = parts[1] ? `.${parts[1]}` : "";

    // Format the whole number part with Indian numbering system
    let lastThree = wholePart.substring(wholePart.length - 3);
    const otherNumbers = wholePart.substring(0, wholePart.length - 3);

    if (otherNumbers !== "") {
      lastThree = `,${lastThree}`;
    }

    const formatted =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

    return formatted + decimalPart;
  }, []);

  const parseFormattedNumber = useCallback((value: string): string => {
    return value.replace(/,/g, "");
  }, []);

  return { formatIndianNumber, parseFormattedNumber };
};
