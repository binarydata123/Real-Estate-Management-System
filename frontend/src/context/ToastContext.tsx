'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Toaster, toast, ToastOptions, Renderable, ValueOrFunction } from 'react-hot-toast';

interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
    /**
     * A wrapper around `toast.promise` that can also show a warning toast
     * if the promise resolves with a specific shape indicating a partial success.
     */
    showPromiseToast: <T>(
        promise: Promise<T>,
        messages: {
            loading: Renderable;
            success: ValueOrFunction<Renderable, T>;
            error: ValueOrFunction<Renderable, unknown>;
            warning?: ValueOrFunction<Renderable, T>;
        },
        options?: ToastOptions
    ) => Promise<T>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
        if (type === 'success') {
            toast.success(message);
        } else if (type === 'warning') {
            // react-hot-toast doesn't have a `warning` type, so we use a blank toast with an icon
            toast(message, { icon: '⚠️' });
        } else {
            toast.error(message);
        }
    };

    const showPromiseToast = <
        T extends { customerPushNotificationResult?: string } | unknown
    >(
        promise: Promise<T>,
        messages: {
            loading: Renderable;
            success: ValueOrFunction<Renderable, T>;
            error: ValueOrFunction<Renderable, unknown>;
            warning?: ValueOrFunction<Renderable, T>;
        },
        options?: ToastOptions
    ): Promise<T> => {
        const resolveValue = <TValue, TArg>(
            valOrFunction: ValueOrFunction<TValue, TArg>,
            arg: TArg
        ): TValue => {
            return typeof valOrFunction === "function"
                ? (valOrFunction as (arg: TArg) => TValue)(arg)
                : valOrFunction;
        };

        toast.promise(
            promise,
            {
                loading: messages.loading,
                success: (data: T) => {
                    const hasWarning =
                        messages.warning &&
                        typeof data === "object" &&
                        data &&
                        "customerPushNotificationResult" in data &&
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (data as any).customerPushNotificationResult;

                    if (hasWarning) {
                        // always return something
                        return resolveValue(messages.warning!, data) as Renderable;
                    }

                    // fallback to success
                    return resolveValue(messages.success, data) as Renderable;
                },
                error: (err) => resolveValue(messages.error, err) as Renderable,
            },
            options
        );

        return promise;
    };


    return (
        <ToastContext.Provider value={{ showToast, showPromiseToast }}>
            {children}
            <Toaster position="top-right" />
        </ToastContext.Provider>
    );
};
