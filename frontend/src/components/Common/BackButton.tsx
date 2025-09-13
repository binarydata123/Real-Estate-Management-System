'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'; // ✅ correct import in App Router
import React from 'react';

export default function BackButton() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <span
            onClick={handleBack}
            className="w-5 h-5 cursor-pointer hover:text-blue-600"
        >
            <ArrowLeft />
        </span>
    );
}
