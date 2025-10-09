/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { PropertyFormData } from '@/schemas/Agent/propertySchema';

interface IconRadioProps {
    name: keyof PropertyFormData;
    options: { value: string; label: string; icon: React.ReactNode }[];
    watch: (name: keyof PropertyFormData) => any;
    setValue: (
        name: keyof PropertyFormData,
        value: any,
        options?: { shouldValidate?: boolean; shouldDirty?: boolean }
    ) => void;
}

const IconRadio: React.FC<IconRadioProps> = ({ name, options, watch, setValue }) => {
    const watchedValue = watch(name);

    return (
        <div className="flex flex-wrap gap-3">
            {options.map((option) => {
                const isChecked = watchedValue === option.value;
                return (
                    <div key={option.value}>
                        <input
                            type="radio"
                            id={`${name}-${option.value}`}
                            value={option.value}
                            name={name as string}
                            checked={isChecked}
                            onChange={() =>
                                setValue(name, option.value, { shouldValidate: true, shouldDirty: true })
                            }
                            className="hidden peer"
                        />
                        <label
                            htmlFor={`${name}-${option.value}`}
                            className="cursor-pointer flex items-center gap-1 px-2 py-1.5 text-sm rounded-full border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600"
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

export default IconRadio;
