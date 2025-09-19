'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Toaster, toast, ToastOptions } from 'react-hot-toast';

interface ToastContextType {
    showToast: (message: string, type: 'success' | 'error') => void;
    showPromiseToast: <T>(
        promise: Promise<T>,
        messages: {
            loading: ReactNode;
            success: ReactNode | ((data: T) => ReactNode);
            error: ReactNode | ((err: unknown) => ReactNode);
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
    const showToast = (message: string, type: 'success' | 'error') => {
        if (type === 'success') {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    const showPromiseToast = <T,>(
        promise: Promise<T>,
        messages: {
            loading: ReactNode;
            success: ReactNode | ((data: T) => ReactNode);
            error: ReactNode | ((err: unknown) => ReactNode);
        },
        options?: ToastOptions
    ): Promise<T> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toast.promise(promise, messages as any, options);
        return promise;
    };

    return (
        <ToastContext.Provider value={{ showToast, showPromiseToast }}>
            {children}
            <Toaster position="top-right" />
        </ToastContext.Provider>
    );
};
