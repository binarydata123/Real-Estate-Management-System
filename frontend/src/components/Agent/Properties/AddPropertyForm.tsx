'use client';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import type { SubmitHandler } from 'react-hook-form';
import BackButton from '@/components/Common/BackButton';
import Image from 'next/image';
import { amenitiesOptions, featuresOptions, overlookingOptions, PropertyFormData, propertySchema, waterSourceOptions, IconCheckboxOption } from '@/schemas/Agent/propertySchema';
import { createProperty } from '@/lib/Agent/PropertyAPI';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const IconCheckbox: React.FC<{ option: IconCheckboxOption; name: keyof PropertyFormData; register: any }> = ({ option, name, register }) => (
    <div>
        <input type="checkbox" id={`${name}-${option.value}`} value={option.value} {...register(name)} className="hidden peer" />
        <label htmlFor={`${name}-${option.value}`} className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600">
            <span className="">{option.icon}</span>
            {option.label}
        </label>
    </div>
);

export const AddPropertyForm: React.FC = () => {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const isEditMode = mode === 'edit';

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    // State for image previews (blob URLs or existing URLs in edit mode)
    const [images, setImages] = useState<string[]>([]);
    // State for new image files to be uploaded
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<PropertyFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(propertySchema) as any,
        defaultValues: {
            type: 'residential',
            category: 'flat',
            unit_area_type: 'sqft',
            built_up_area: 0,
            carpet_area: 0,
            bedrooms: 0,
            bathrooms: 0,
            balconies: 0,
            washrooms: 0,
            cabins: 0,
            conference_rooms: 0,
            floor_number: 0,
            total_floors: 0,
            property_age: 'New',
            transaction_type: 'New',
            ownership_type: 'Freehold',
            furnishing: 'Unfurnished',
            power_backup: 'None',
            gated_community: false,
            status: 'Available',
            rera_status: 'Not Available',
            overlooking: [], // Initialize as empty array
            water_source: [], // Initialize as empty array
            features: [], // Initialize as empty array
            amenities: [], // Initialize as empty array
        } satisfies Partial<PropertyFormData>
    });


    const watchedType = watch('type');
    const watchedCategory = watch('category');

    // Automatically generate title in add mode
    useEffect(() => {
        if (!isEditMode && watchedType && watchedCategory) {
            const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
            const generatedTitle = `${capitalize(watchedType)} ${capitalize(watchedCategory)}`;
            setValue('title', generatedTitle, { shouldValidate: true });
        }
    }, [watchedType, watchedCategory, isEditMode, setValue]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);

            const newImagePreviews = files.map(file => URL.createObjectURL(file));
            setImages(prev => [...prev, ...newImagePreviews]);
        }
    };

    const removeImage = (index: number) => {
        const imageUrl = images[index];

        // If it's a blob URL, it's a new file preview that needs to be removed from imageFiles state as well
        if (imageUrl.startsWith('blob:')) {
            // This logic assumes new files are appended and their order is preserved.
            // A more robust solution might involve using objects with unique IDs for each image.
            const blobImages = images.filter(img => img.startsWith('blob:'));
            const blobIndex = blobImages.indexOf(imageUrl);
            if (blobIndex > -1) {
                setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== blobIndex));
            }
            URL.revokeObjectURL(imageUrl);
        }

        setImages(images.filter((_, i) => i !== index));
    };
    console.log(user)
    const onSubmit: SubmitHandler<PropertyFormData> = async (data: PropertyFormData) => {
        if (!user) {
            setError("You must be logged in to add a property.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            (Object.keys(data) as Array<keyof PropertyFormData>).forEach((key) => {
                const value = data[key];
                if (value !== null && value !== undefined) {
                    if (Array.isArray(value)) {
                        // For array fields like amenities, features, etc.
                        value.forEach((item) => {
                            formData.append(`${key}[]`, String(item));
                        });
                    } else {
                        formData.append(key, String(value));
                    }
                }
            });

            // Append agency ID
            if (user.agency?._id) {
                formData.append('agencyId', user.agency._id);
            }

            // Append new image files
            imageFiles.forEach((file) => {
                formData.append('images', file);
            });

            // For edit mode, send back existing image URLs so the backend knows which ones to keep
            if (isEditMode) {
                const existingImages = images.filter(url => !url.startsWith('blob:'));
                existingImages.forEach(url => formData.append('existingImages[]', url));
            }

            if (isEditMode) {
                // TODO: Implement update logic using an `updateProperty` API call
                console.log("Update functionality not implemented yet. Data:", Array.from(formData.entries()));
                await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
                alert('Property updated successfully! (Demo)');
            } else {
                const response = await createProperty(formData);
                alert(response.message || 'Property created successfully!');
                // Consider redirecting or resetting the form here
                // e.g., router.push('/agent/properties');
            }
        } catch (err: unknown) {
            let errorMessage = `An error occurred during property ${isEditMode ? 'update' : 'creation'}.`;
            if (axios.isAxiosError(err) && err.response) {
                errorMessage = err.response.data.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center md:mb-2">
                <div className='flex space-x-1'>
                    <BackButton />
                    <h2 className='text-2xl font-bold'>{isEditMode ? 'Edit Property' : 'Add Property'}</h2>
                </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="md:p-6  md:space-y-4 space-y-2">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {/* Basic Information */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                    {isEditMode && (
                        <div className='col-span-2'>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                                Property Title *
                            </label>
                            <input
                                {...register('title')}
                                className="w-full  px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Beautiful 3BHK Apartment"
                            />
                            {errors.title && (
                                <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                            Property Type
                        </label>
                        <select
                            {...register('type')}
                            className="w-full  px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full  px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {watchedType === 'residential' ? (
                                <>
                                    <option value="plot">Plot</option>
                                    <option value="flat">Flat</option>
                                    <option value="villa">Villa</option>
                                    <option value="land">Land</option>
                                    <option value="farmHouse">Farm House</option>
                                </>
                            ) : (
                                <>
                                    <option value="showroom">Showroom</option>
                                    <option value="office">Office</option>
                                    <option value="land">Commercial Land</option>
                                </>
                            )}
                        </select>
                        {errors.category && (
                            <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">
                            Location *
                        </label>
                        <input
                            {...register('location')}
                            className="w-full  px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full  px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="5000000"
                        />
                        {errors.price && (
                            <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                        )}
                    </div>
                </div>
                <div className="space-y-2 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 md:mb-3">Specifications</h3>

                    {/* Property Details */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mt-1">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Built-up Area</label>
                            <input type="number" {...register('built_up_area', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 1500" />
                            {errors.built_up_area && (
                                <p className="text-red-600 text-sm mt-1">{errors.built_up_area.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Carpet Area</label>
                            <input type="number" {...register('carpet_area', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 1200" />
                            {errors.carpet_area && (
                                <p className="text-red-600 text-sm mt-1">{errors.carpet_area.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Area Unit</label>
                            <select {...register('unit_area_type')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg">
                                <option value="sqft">sq.ft.</option>
                                <option value="sqm">sq.m.</option>
                                <option value="acre">acre</option>
                                <option value="marla">marla</option>
                                <option value="kanal">kanal</option>
                                <option value="bigha">bigha</option>
                                <option value="sqyd">sq.yd.</option>
                                <option value="hectare">hectare</option>
                                <option value="gaj">gaj</option>
                            </select>
                        </div>

                        {watchedType === 'residential' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Bedrooms</label>
                                    <input type="number" {...register('bedrooms', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" placeholder="3" />
                                    {errors.bedrooms && (
                                        <p className="text-red-600 text-sm mt-1">{errors.bedrooms.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Bathrooms</label>
                                    <input type="number" {...register('bathrooms', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" placeholder="2" />
                                    {errors.bathrooms && (
                                        <p className="text-red-600 text-sm mt-1">{errors.bathrooms.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Balconies</label>
                                    <input type="number" {...register('balconies', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" placeholder="1" />
                                    {errors.balconies && (
                                        <p className="text-red-600 text-sm mt-1">{errors.balconies.message}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {watchedType === 'commercial' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Washrooms</label>
                                    <input type="number" {...register('washrooms', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" />
                                    {errors.washrooms && (
                                        <p className="text-red-600 text-sm mt-1">{errors.washrooms.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Cabins</label>
                                    <input type="number" {...register('cabins', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" />
                                    {errors.cabins && (
                                        <p className="text-red-600 text-sm mt-1">{errors.cabins.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Conference Rooms</label>
                                    <input type="number" {...register('conference_rooms', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" />
                                    {errors.conference_rooms && (
                                        <p className="text-red-600 text-sm mt-1">{errors.conference_rooms.message}</p>
                                    )}
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Floor Number</label>
                            <input type="number" {...register('floor_number', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 5" />
                            {errors.floor_number && (
                                <p className="text-red-600 text-sm mt-1">{errors.floor_number.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Total Floors</label>
                            <input type="number" {...register('total_floors', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 12" />
                            {errors.total_floors && (
                                <p className="text-red-600 text-sm mt-1">{errors.total_floors.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Facing</label>
                            <select {...register('facing')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg">
                                <option value="">Select Facing</option>
                                <option>North</option>
                                <option>South</option>
                                <option>East</option>
                                <option>West</option>
                                <option>North-East</option>
                                <option>North-West</option>
                                <option>South-East</option>
                                <option>South-West</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Property Age</label>
                            <select {...register('property_age')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg">
                                <option value="">Select Age</option>
                                <option>New</option>
                                <option>1-5 years</option>
                                <option>5-10 years</option>
                                <option>10+ years</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Transaction Type</label>
                            <select {...register('transaction_type')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg">
                                <option value="New">New</option>
                                <option value="Resale">Resale</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Ownership Type</label>
                            <select {...register('ownership_type')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg">
                                <option value="">Select Ownership</option>
                                <option>Freehold</option>
                                <option>Leasehold</option>
                                <option>Co-operative Society</option>
                                <option>Power of Attorney</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Furnishing</label>
                            <select {...register('furnishing')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg">
                                <option>Unfurnished</option>
                                <option>Semi-Furnished</option>
                                <option>Furnished</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Power Backup</label>
                            <select {...register('power_backup')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg">
                                <option>None</option>
                                <option>Partial</option>
                                <option>Full</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Parking Count</label>
                            <input type="number" {...register('parking_count', { valueAsNumber: true })} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 1" />
                            {errors.parking_count && (
                                <p className="text-red-600 text-sm mt-1">{errors.parking_count.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Flooring Type</label>
                            <select {...register('flooring_type')} className="w-full px-2 py-2 border border-gray-300 rounded-lg">
                                <option value="">Select Flooring</option>
                                <option>Marble</option>
                                <option>Vitrified</option>
                                <option>Wooden</option>
                                <option>Ceramic</option>
                                <option>Mosaic</option>
                                <option>Granite</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="flex items-center pt-1">
                            <input id="gated_community" type="checkbox" {...register('gated_community')} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="gated_community" className="ml-2 block text-sm text-gray-900">Gated Community</label>
                        </div>
                    </div>



                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mt-2 md:mb-2 mb-1">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full  px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe the property features and amenities..."
                        />
                        {errors.description && (
                            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Features & Amenities */}
                    <div className="border-t border-gray-200 pt-2 md:pt-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Location, Features & Amenities</h3>

                        {/* Overlooking */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Overlooking
                            </label>
                            <div className="max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                                <div className="flex flex-wrap gap-2">
                                    {overlookingOptions.map((option) => (
                                        <IconCheckbox key={option.value} option={option} name="overlooking" register={register} />
                                    ))}
                                </div>
                            </div>
                            {errors.overlooking && (
                                <p className="text-red-600 text-sm mt-1">{errors.overlooking.message}</p>
                            )}
                        </div>

                        {/* Water Source */}
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Water Source
                            </label>
                            <div className="max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                                <div className="flex flex-wrap gap-2">
                                    {waterSourceOptions.map((option) => (
                                        <IconCheckbox key={option.value} option={option} name="water_source" register={register} />
                                    ))}
                                </div>
                            </div>
                            {errors.water_source && (
                                <p className="text-red-600 text-sm mt-1">{errors.water_source.message}</p>
                            )}
                        </div>

                        {/* Features */}
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Features
                            </label>
                            <div className="max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                                <div className="flex flex-wrap gap-2">
                                    {featuresOptions.map((feature) => (
                                        <IconCheckbox key={feature.value} option={feature} name="features" register={register} />
                                    ))}
                                </div>
                            </div>
                            {errors.features && (
                                <p className="text-red-600 text-sm mt-1">{errors.features.message}</p>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Amenities
                            </label>
                            <div className="max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                                <div className="flex flex-wrap gap-2">
                                    {amenitiesOptions.map((amenity) => (
                                        <IconCheckbox key={amenity.value} option={amenity} name="amenities" register={register} />
                                    ))}
                                </div>
                            </div>
                            {errors.amenities && (
                                <p className="text-red-600 text-sm mt-1">{errors.amenities.message}</p>
                            )}
                        </div>

                    </div>

                    {/* RERA & Status */}
                    <div className="border-t border-gray-200 pt-2 md:pt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2  ">RERA & Status</h4>
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">RERA Status</label>
                                <select {...register('rera_status')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg">
                                    <option>Not Available</option>
                                    <option>Available</option>
                                    <option>Applied</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">RERA ID</label>
                                <input {...register('rera_id')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg" placeholder="RERA ID" />
                                {errors.rera_id && (
                                    <p className="text-red-600 text-sm mt-1">{errors.rera_id.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Owner Details (Private) */}
                    <div className="border-t border-gray-200 pt-2 md:pt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2  ">Owner Details (Private)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Owner Name</label>
                                <input
                                    {...register('owner_name')}
                                    className="w-full  px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Property owner name"
                                />
                                {errors.owner_name && (
                                    <p className="text-red-600 text-sm mt-1">{errors.owner_name.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Owner Contact</label>
                                <input
                                    {...register('owner_contact')}
                                    className="w-full  px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Phone or email"
                                />
                                {errors.owner_contact && (
                                    <p className="text-red-600 text-sm mt-1">{errors.owner_contact.message}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Owner Type</label>
                                <select {...register('owner_type')} className="w-full  px-2 py-2 border border-gray-300 rounded-lg">
                                    <option>Individual</option>
                                    <option>Dealer</option>
                                    <option>Builder</option>
                                    <option>Agency</option>
                                </select>

                            </div>
                        </div>
                        <div className="mt-2 md:mt-4">
                            <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Owner Notes</label>
                            <textarea
                                {...register('owner_notes')}
                                rows={2}
                                className="w-full  px-2 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Private notes about the owner..."
                            />
                            {errors.owner_notes && (
                                <p className="text-red-600 text-sm mt-1">{errors.owner_notes.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 md:mb-2 mb-1">Property Images</label>

                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full  border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 ">
                                <div className="flex flex-col items-center justify-center pt-2 md:pt-5 pb-2 md:pb-6">
                                    <svg
                                        className="w-8 h-8  text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 16"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                        />
                                    </svg>

                                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or JPEG</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg" />
                            </label>
                        </div>

                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 md:grid-cols-4 gap-4">
                                {images.map((url, index) => (
                                    <div key={index} className="relative group">


                                        <Image width={200} height={200} src={url} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                {/* Form Actions */}
                <div className="flex justify-end space-x-2 md:space-x-4 md:pt-4 pt-2 border-t border-gray-200">
                    <button
                        type="button"
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Property' : 'Create Property')}
                    </button>
                </div>
            </form >
        </div >
    );
};
