'use client';
import { AddPropertyForm } from '@/components/Agent/Properties/AddPropertyForm';
import { useParams } from 'next/navigation';
import React from 'react'

export default function Page() {
    // get id from url edit-property/48973242    
    const { slug } = useParams();

    return (
        <AddPropertyForm
            propertyId={slug as string}
        />
    )
}
