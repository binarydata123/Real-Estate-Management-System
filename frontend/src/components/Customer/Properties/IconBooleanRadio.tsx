/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Check, X } from "lucide-react"; // ✅ import icons
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
        { value: true, label: "Yes", icon: <Check size={16} /> },
        { value: false, label: "No", icon: <X size={16} /> },
    ];

    return (
        <div className="flex flex-wrap gap-3">
            {options.map((option) => {
                const isChecked = watchedValue === option.value;
                return (
                    <div key={String(option.value)}>
                        <input
                            type="radio"
                            id={`${name}-${String(option.value)}`}
                            value={String(option.value)}
                            name={name as string} // ✅ ensure TS compatibility
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
                            htmlFor={`${name}-${String(option.value)}`}
                            className={`cursor-pointer flex items-center gap-1 px-2 py-1.5 text-sm rounded-full border transition-colors ${isChecked
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            {option.icon}
                            {option.label}
                        </label>
                    </div>
                );
            })}
        </div>
    );
};

export default IconBooleanRadio;
