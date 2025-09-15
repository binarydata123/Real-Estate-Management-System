'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useAgency } from '@/context/AgencyContext';
import { useAuth } from '@/context/AuthContext';
import BackButton from '@/components/Common/BackButton';
import Image from 'next/image';
import { propertySchema } from '@/schemas/Agent/propertySchema';

type PropertyFormData = z.infer<typeof propertySchema>;

export const AddPropertyForm: React.FC = () => {
    const { currentAgency } = useAgency();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>(['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg']);

    const { register, formState: { errors }, watch } = useForm<PropertyFormData>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            type: 'residential',
            category: 'flat',
            size_unit: 'sq ft',
        }
    });

    const watchedType = watch('type');

    const onSubmit = async () => {
        if (!currentAgency || !user) return;

        setLoading(true);
        try {
            // Demo mode - simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Demo mode: Property creation simulated', error);
        } finally {
            setLoading(false);
        }
    };

    const addImageUrl = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            setImages([...images, url]);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center md:mb-2">
                <div className='flex space-x-1'>
                    <BackButton />
                    <h2 className='text-2xl font-bold'>Add Property</h2>
                </div>
            </div>
            <form className="md:p-6  md:space-y-6 space-y-2">
                {/* Basic Information */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
                    <div className='col-span-2'>
                        <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                            Property Title *
                        </label>
                        <input
                            {...register('title')}
                            className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Beautiful 3BHK Apartment"
                        />
                        {errors.title && (
                            <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                            Location *
                        </label>
                        <input
                            {...register('location')}
                            className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Bandra West, Mumbai"
                        />
                        {errors.location && (
                            <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                            Price (₹) *
                        </label>
                        <input
                            type="number"
                            {...register('price', { valueAsNumber: true })}
                            className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="5000000"
                        />
                        {errors.price && (
                            <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-2 border-t border-gray-200">
                    {/* Property Details */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mt-1">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Property Type
                            </label>
                            <select
                                {...register('type')}
                                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="residential">Residential</option>
                                <option value="commercial">Commercial</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Category
                            </label>
                            <select
                                {...register('category')}
                                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {watchedType === 'residential' ? (
                                    <>
                                        <option value="plot">Plot</option>
                                        <option value="flat">Flat</option>
                                        <option value="villa">Villa</option>
                                        <option value="land">Land</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="showroom">Showroom</option>
                                        <option value="office">Office</option>
                                        <option value="land">Commercial Land</option>
                                    </>
                                )}
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-2 col-span-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Size</label>
                                <input
                                    type="number"
                                    {...register('size', { valueAsNumber: true })}
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="1200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Unit</label>
                                <select
                                    {...register('size_unit')}
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="sq ft">Sq Ft</option>
                                    <option value="sq m">Sq M</option>
                                    <option value="acres">Acres</option>
                                </select>
                            </div>
                            {watchedType === 'residential' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Bedrooms</label>
                                        <input
                                            type="number"
                                            {...register('bedrooms', { valueAsNumber: true })}
                                            className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="3"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe the property features and amenities..."
                        />
                    </div>

                    {/* Owner Details (Private) */}
                    <div className="border-t border-gray-200 pt-2 md:pt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-2 md:mb-4">Owner Details (Private)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Owner Name</label>
                                <input
                                    {...register('owner_name')}
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Property owner name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Owner Contact</label>
                                <input
                                    {...register('owner_contact')}
                                    className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Phone or email"
                                />
                            </div>
                        </div>
                        <div className="mt-2 md:mt-4">
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Owner Notes</label>
                            <textarea
                                {...register('owner_notes')}
                                rows={2}
                                className="w-full md:px-4 px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Private notes about the owner..."
                            />
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Property Images</label>
                        <button
                            type="button"
                            onClick={addImageUrl}
                            className="flex items-center mb-4 justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                        >
                            <div className="text-center">
                                <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Add Image URL</p>
                            </div>
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {images.map((url, index) => (
                                <div key={index} className="relative group">
                                    <Image width={300} height={300} src={url} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                {/* Form Actions */}
                <div className="flex justify-end space-x-2 md:space-x-4 md:pt-6 pt-2 border-t border-gray-200">
                    <button
                        type="button"
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Create Property'}
                    </button>
                </div>
            </form>
        </div>
    );
};