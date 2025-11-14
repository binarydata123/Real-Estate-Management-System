'use client';
import React from "react";
import { Check as CheckIcon } from "lucide-react";

interface StepIndicatorProps {
    currentStep: number;
    steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <nav aria-label="Progress" className="py-2 md:py-6">
            <ol role="list" className="grid grid-cols-3">
                {steps.map((name, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;

                    return (
                        <li key={name} className="relative">
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div
                                    className="absolute left-1/2 top-4 h-0.5 w-full"
                                    aria-hidden="true"
                                >
                                    <div
                                        className={`h-full w-full transition-colors duration-500 ${isCompleted ? "bg-blue-600" : "bg-gray-200"
                                            }`}
                                    />
                                </div>
                            )}

                            <div className="relative flex flex-col items-center text-center">
                                {/* Step circle */}
                                <div
                                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${isCompleted
                                        ? "bg-blue-600 shadow-md"
                                        : isCurrent
                                            ? "border-2 border-blue-600 bg-white shadow-lg scale-110"
                                            : "border-2 border-gray-300 bg-white"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                    ) : (
                                        <span
                                            className={`text-base font-medium transition-colors duration-300 ${isCurrent
                                                ? "text-blue-600 font-bold"
                                                : "text-gray-500"
                                                }`}
                                        >
                                            {stepNumber}
                                        </span>
                                    )}
                                </div>

                                {/* Step label */}
                                <p
                                    className={`mt-2 text-sm font-medium transition-colors duration-300 ${isCurrent ? "text-blue-600" : "text-gray-500"
                                        }`}
                                >
                                    {name}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default StepIndicator;
