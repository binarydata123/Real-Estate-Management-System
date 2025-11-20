// components/FormattedNumberInput.tsx
import React from "react";
import { useIndianNumberFormat } from "@/hooks/useIndianNumberFormat";

interface FormattedNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onBlur?: () => void;
  disabled?: boolean;
}

export const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
  value,
  onChange,
  placeholder,
  className = "",
  onBlur,
  disabled = false,
}) => {
  const { formatIndianNumber, parseFormattedNumber } = useIndianNumberFormat();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseFormattedNumber(e.target.value);
    onChange(rawValue);
  };

  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  const displayValue = value ? formatIndianNumber(value) : "";

  return (
    <input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
};
