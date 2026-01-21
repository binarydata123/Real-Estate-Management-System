import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  value,
  onChange,  
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <div
        className={`
    absolute left-3 top-1/2 -translate-y-1/2
    ${value ? "" : "animate-search-float"}
  `}
      >
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          border border-gray-300
          rounded-lg
          pl-10 pr-3 py-2 
          text-white
          placeholder:text-gray-400
          placeholder:text-[12px]
          focus:outline-none
          focus:ring-2 focus:ring-[#C9A24D]
          focus:border-transparent
        "
      />
    </div>
  );
};

export default SearchInput;
