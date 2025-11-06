/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Check, X } from "lucide-react";
import { PropertyFormData } from "@/schemas/Agent/propertySchema";

interface IconBooleanRadioProps {
  name: keyof PropertyFormData;
  watch: (name: keyof PropertyFormData) => any;
  setValue: (
    name: keyof PropertyFormData,
    value: any,
    options?: { shouldValidate?: boolean; shouldDirty?: boolean }
  ) => void;
}

const IconBooleanRadio: React.FC<IconBooleanRadioProps> = ({
  name,
  watch,
  setValue,
}) => {
  const watchedValue = watch(name);

  const options = [
    { value: "yes", label: "Yes", icon: <Check size={16} /> },
    { value: "no", label: "No", icon: <X size={16} /> },
  ];

  return (
    <div className="flex flex-wrap gap-3" role="radiogroup">
      {options.map((option) => {
        const isChecked = watchedValue === option.value;
        const id = `${String(name)}-${option.value}`;

        return (
          <div key={id} className="flex items-center">
            <input
              type="radio"
              id={id}
              name={String(name)}
              value={option.value}
              checked={isChecked}
              onChange={() =>
                setValue(name, option.value, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              className="hidden peer"
            />

            <label
              htmlFor={id}
              role="radio"
              aria-checked={isChecked}
              className={`cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border transition-colors duration-150
                ${isChecked
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default IconBooleanRadio;

