// // components/FormattedNumberInput.tsx
// import React from "react";
// import { useIndianNumberFormat } from "@/hooks/useIndianNumberFormat";

// interface FormattedNumberInputProps {
//   value: string;
//   onChange: (value: string) => void;
//   placeholder?: string;
//   className?: string;
//   onBlur?: () => void;
//   disabled?: boolean;
// }

// export const FormattedNumberInput: React.FC<FormattedNumberInputProps> = ({
//   value,
//   onChange,
//   placeholder,
//   className = "",
//   onBlur,
//   disabled = false,
// }) => {
//   const { formatIndianNumber, parseFormattedNumber } = useIndianNumberFormat();

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {


//      const inputValue = e.target.value;

//      // ✅ VERY IMPORTANT: allow empty state
//      if (inputValue === "") {
//        onChange("");
//        return;
//      }

//     const rawValue = parseFormattedNumber(e.target.value);
//     onChange(rawValue);
//   };

//   const handleBlur = () => {
//     if (onBlur) onBlur();
//   };

//   const displayValue = value ? formatIndianNumber(value) : "";

//   return (
//     <input
//       type="text"
//       inputMode="numeric"
//       value={displayValue}
//       onChange={handleChange}
//       onBlur={handleBlur}
//       placeholder={placeholder}
//       className={className}
//       disabled={disabled}
//     />
//   );
// };


// components/FormattedNumberInput.tsx

import React, { useEffect, useState } from "react";
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
  const { formatIndianNumber, parseFormattedNumber } =
    useIndianNumberFormat();

  // ✅ LOCAL STATE — this is the missing piece
  const [inputValue, setInputValue] = useState("");

  /**
   * Sync parent value → local value
   * (important for preference updates & reset)
   */
  useEffect(() => {
    if (value === "" || value === undefined) {
      setInputValue("");
    } else {
      setInputValue(formatIndianNumber(value));
    }
  }, [value, formatIndianNumber]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawText = e.target.value;

    // allow free typing & deletion
    setInputValue(rawText);

    if (rawText === "") {
      onChange("");
      return;
    }

    const parsed = parseFormattedNumber(rawText);
    onChange(parsed);
  };

  const handleBlur = () => {
    // format ONLY when user leaves the field
    if (inputValue !== "") {
      setInputValue(formatIndianNumber(parseFormattedNumber(inputValue)));
    }
    onBlur?.();
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
};
