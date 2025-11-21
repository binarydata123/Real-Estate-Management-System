"use client";
import React from "react";
import {
  IconCheckboxOption,
  PropertyFormData,
} from "@/schemas/Agent/propertySchema";

interface IconCheckboxProps {
  option: IconCheckboxOption;
  name: keyof PropertyFormData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
}

const IconCheckbox: React.FC<IconCheckboxProps> = ({
  option,
  name,
  register,
}) => {
  return (
    <div>
      <input
        type="checkbox"
        id={`${name}-${option.value}`}
        value={option.value}
        {...register(name)}
        className="hidden peer"
      />
      <label
        htmlFor={`${name}-${option.value}`}
        className="cursor-pointer shadow flex items-center gap-3 px-3 py-1.5 text-sm rounded-full border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600"
      >
        <span>{option.icon}</span>
        {option.label}
      </label>
    </div>
  );
};

export default IconCheckbox;
