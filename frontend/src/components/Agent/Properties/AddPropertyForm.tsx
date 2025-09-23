/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import type { SubmitHandler, FieldErrors } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import BackButton from '@/components/Common/BackButton';
import Image from 'next/image';
import { amenitiesOptions, featuresOptions, overlookingOptions, PropertyFormData, propertySchema, waterSourceOptions, powerBackupOptions, furnishingOptions, transactionTypeOptions, propertyTypeOptions, commercialCategoryOptions, residentialCategoryOptions, unitAreaTypeOptions, facingOptions, propertyAgeOptions, reraStatusOptions, plotDimensionUnitOptions } from '@/schemas/Agent/propertySchema';
import { createProperty, getSinglePropertyDetail, updateProperty } from '@/lib/Agent/PropertyAPI';
import { useToast } from '@/context/ToastContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import IconCheckbox from './IconCheckbox';
import IconRadio from './IconRadio';
import IconBooleanRadio from './IconBooleanRadio';
import StepIndicator from './StepIndicator';

const Field: React.FC<{
    label: string;
    children: React.ReactNode;
    error?: { message?: string };
    required?: boolean;
}> = ({ label, children, error, required = false }) => (
    <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-red-600 text-sm mt-1">{error.message}</p>}
    </div>
);

// New component for form sections
const FormSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white p-3 md:p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">{title}</h3>
        {children}
    </div>
);

interface Props {
    propertyId?: string;
}

export const AddPropertyForm: React.FC<Props> = ({ propertyId }) => {
    const { user } = useAuth();
    const router = useRouter();
    const isEditMode = !!propertyId;
    const searchParams = useSearchParams();

    // Safely get step from query string
    const stepFromUrl = useMemo(() => {
        return searchParams.get("step");
    }, [searchParams]);

    const [step, setStep] = useState(stepFromUrl ? parseInt(stepFromUrl) : 1);
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const { showToast, showPromiseToast } = useToast();
    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const { register, handleSubmit, formState: { errors }, watch, setValue, getValues, trigger, setFocus, clearErrors, reset } = useForm<PropertyFormData>({
        resolver: zodResolver(propertySchema) as any,
        defaultValues: {
            unit_area_type: 'sqft',
            built_up_area: 0,
            carpet_area: 0,
            plot_front_area: 0,
            plot_depth_area: 0,
            plot_dimension_unit: 'ft',
            is_corner_plot: false,
            bedrooms: 0,
            bathrooms: 0,
            balconies: 0,
            washrooms: 0,
            cabins: 0,
            price: 0,
            conference_rooms: 0,
            floor_number: 0,
            total_floors: 0,
            property_age: 'New',
            transaction_type: 'New',
            furnishing: 'Semi-Furnished', // Changed to auto-select Modular Kitchen
            power_backup: 'Partial', // Changed to auto-select Power Backup feature
            gated_community: true, // Changed to true to auto-select related amenities
            status: 'Available',
            rera_status: 'Not Approved',
            overlooking: [], // Pre-select a common option
            water_source: ['Municipal Supply'], // Pre-select to auto-check 24x7 supply
            features: [], // Pre-select common features
            amenities: ['Rain Water Harvesting'], // Pre-select a common amenity
        } satisfies Partial<PropertyFormData>
    });

    const { isFetching: isFetchingLocation, getCurrentLocation } = useGeolocation();

    useEffect(() => {
        if (isEditMode && propertyId) {

            const fetchPropertyData = async () => {
                setLoading(true);
                try {
                    const res = await getSinglePropertyDetail(propertyId);
                    if (res.success) {
                        const propertyData = res.data;

                        // The backend sends images as an array of objects, but the Zod schema
                        // expects an array of strings. The actual image data (new files and
                        // existing URLs) is managed by component state (`imageFiles` and `images`),
                        // not react-hook-form's state. We reset the form's `images` field to an
                        // empty array to prevent validation errors.
                        const dataForReset = { ...propertyData, images: [] };
                        reset(dataForReset);

                        if (propertyData.images && propertyData.images.length > 0) {
                            const imageUrls = propertyData.images.map(
                                (img: { url: string }) => `${process.env.NEXT_PUBLIC_IMAGE_URL}/Properties/original/${img.url}`
                            );
                            setImages(imageUrls);
                        }
                    } else {
                        showToast(res.message || 'Failed to fetch property details.', 'error');
                        router.push('/agent/properties');
                    }
                } catch (err) {
                    console.error('Error fetching property data:', err);
                    showToast('An error occurred while fetching property data.', 'error');
                    // router.push('/agent/properties');
                } finally {
                    setLoading(false);
                }
            };
            fetchPropertyData();
        }
    }, [isEditMode, propertyId, reset, showToast, router]);

    const [] = watch(['location', 'price', 'built_up_area']);


    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleNextStep = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent the click event from propagating

        let fieldsToValidate: (keyof PropertyFormData)[] = [];
        let isValid = false;

        if (step === 1) {
            fieldsToValidate = (Object.keys(fieldStepMapping) as (keyof PropertyFormData)[]).filter(
                key => fieldStepMapping[key] === 1
            );
        } else if (step === 2) {
            // Validate that at least one image has been uploaded or exists.
            setValue('images', images.length > 0 ? ['dummy_value_for_validation'] : []);
            fieldsToValidate = ['images'];
        }

        isValid = await trigger(fieldsToValidate, { shouldFocus: true });

        if (isValid) {
            if (step === 1 && !isEditMode) {
                // This is a new property. Create it and redirect.
                if (!user) {
                    showToast("You must be logged in to add a property.", 'error');
                    return;
                }
                setLoading(true);
                const data = getValues();
                const formData = new FormData();
                (Object.keys(data) as Array<keyof PropertyFormData>).forEach((key) => {
                    const value = data[key];
                    if (value !== null && value !== undefined) {
                        if (Array.isArray(value)) {
                            value.forEach((item) => formData.append(`${key}[]`, String(item)));
                        } else {
                            formData.append(key, String(value));
                        }
                    }
                });

                if (user.agency?._id) {
                    formData.append('agencyId', user.agency._id);
                }

                try {
                    const response = await createProperty(formData);
                    if (response.success && response.data?._id) {
                        showToast('Basic info saved. You can now add images and features.', 'success');
                        router.push(`/agent/edit-property/${response.data._id}?step=2`);
                    } else {
                        showToast(response.message || 'Failed to save property.', 'error');
                    }
                } catch (err) {
                    if (axios.isAxiosError(err) && err.response) {
                        showToast(err.response.data.message || 'Failed to save property.', 'error');
                    } else if (err instanceof Error) {
                        showToast(err.message || 'An unexpected error occurred.', 'error');
                    } else {
                        showToast('An unexpected error occurred.', 'error');
                    }
                } finally {
                    setLoading(false);
                }
            } else {
                // Already in edit mode, or not step 1. Just move to the next step.
                nextStep();
            }
        } else {
            const firstErrorField = fieldsToValidate.find(field => errors[field]);

            if (firstErrorField) {
                try {
                    // Use react-hook-form's setFocus for registered fields
                    setFocus(firstErrorField);
                } catch (e) {
                    console.error('Error setting focus:', e);
                    // Fallback for non-registered fields (like custom IconRadio)
                    const element = document.querySelector<HTMLElement>(`[name="${firstErrorField}"]`);
                    if (element) {
                        // Find the parent Field component to scroll to
                        const fieldContainer = element.closest('div[class*="col-span"]');
                        if (fieldContainer) {
                            fieldContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }
            }
        }
    };

    const steps = ['Basic Info', 'Images', 'Features'];

    const watchedType = watch('type');
    const watchedCategory = watch('category');

    const isPlotOrLand = ['plot', 'land'].includes(watchedCategory);
    const isResidentialBuilt = watchedType === 'residential' && ['flat', 'villa', 'farmHouse'].includes(watchedCategory);
    const isCommercialBuilt = watchedType === 'commercial' && ['showroom', 'office'].includes(watchedCategory);
    const isBuiltStructure = isResidentialBuilt || isCommercialBuilt;

    const generateDescription = useCallback(() => {
        const data = watch();
        let desc = '';

        if (data.category) {
            if (data.bedrooms && data.bedrooms > 0 && isResidentialBuilt) {
                desc += `A beautiful ${data.bedrooms} BHK ${data.category}`;
            } else {
                desc += `A prime ${data.category}`;
            }
        }

        if (data.location) desc += ` is available for sale in ${data.location}.`;

        if (data.built_up_area && data.built_up_area > 0) {
            desc += ` Spanning ${data.built_up_area} ${data.unit_area_type || 'sq.ft.'}, this property`;
        } else {
            desc += ` This property`;
        }

        if (isBuiltStructure) {
            if (data.furnishing) desc += ` is ${data.furnishing.toLowerCase()}`;
            if (data.facing) desc += ` and is ${data.facing.toLowerCase()}-facing.`;
            if (data.floor_number !== undefined && data.total_floors !== undefined && data.floor_number >= 0 && data.total_floors > 0) {
                if (data.floor_number === 0) {
                    desc += ` It is on the ground floor of a ${data.total_floors}-story building.`;
                } else {
                    desc += ` It is situated on floor ${data.floor_number} of ${data.total_floors}.`;
                }
            }

            // Furnishing and Facing
            if (data.property_age) desc += ` The building is ${data.property_age.toLowerCase()}.`;
            if (data.gated_community) desc += ` It is part of a secure gated community`;
            if (data.gated_community) {
                desc += `.`;
            }
        }

        // Transaction and ownership details
        if (data.price) {
            desc += ` Offered at a price of ₹${data.price.toLocaleString()}.`;
        }

        if (data.power_backup && data.power_backup !== 'None') {
            desc += ` It has ${data.power_backup.toLowerCase()} power backup.`;
        }

        setValue('description', desc.trim().replace(/\s\s+/g, ' ').replace(/\.\./g, '.'));

    }, [watch, isBuiltStructure, isResidentialBuilt, isCommercialBuilt, isPlotOrLand, setValue]);

    const [
        power_backup,
        balconies,
        gated_community,
        furnishing,
        facing,
        total_floors,
        water_source,
        category
    ] = watch([
        'power_backup', 'balconies', 'gated_community', 'furnishing', 'facing',
        'total_floors', 'water_source', 'category'
    ]);

    // When property type changes, clear any existing category error
    useEffect(() => {
        // This prevents a validation error from persisting when the category options change.
        clearErrors('category');
    }, [watchedType, clearErrors]);

    // Effect to auto-check/uncheck features/amenities based on other fields
    useEffect(() => {
        const features = getValues('features') || [];
        let newFeatures = [...features];
        const amenities = getValues('amenities') || [];
        const newAmenities = [...amenities];

        // Sync Power Backup
        const hasPowerBackupFeature = features.includes('Power Backup');
        if (power_backup && power_backup !== 'None') {
            if (!hasPowerBackupFeature) newFeatures.push('Power Backup');
        } else {
            if (hasPowerBackupFeature) newFeatures = newFeatures.filter(f => f !== 'Power Backup');
        }

        // Sync Balcony
        const hasBalconyFeature = features.includes('Balcony');
        if (balconies && balconies > 0) {
            if (!hasBalconyFeature) newFeatures.push('Balcony');
        } else {
            // Only uncheck if it's explicitly set to 0
            if (balconies === 0 && hasBalconyFeature) newFeatures = newFeatures.filter(f => f !== 'Balcony');
        }

        // --- One-way convenience checks from here ---

        // Sync Furnished -> Air Conditioned (one-way)
        const hasACFeature = features.includes('Air Conditioned');
        if (furnishing === 'Furnished' && !hasACFeature) {
            newFeatures.push('Air Conditioned');
        }

        // Sync Furnished -> Modular Kitchen
        const hasModularKitchenFeature = features.includes('Modular Kitchen');
        if ((furnishing === 'Furnished' || furnishing === 'Semi-Furnished') && !hasModularKitchenFeature) {
            newFeatures.push('Modular Kitchen');
        }

        // Sync Gated Community -> Security, CCTV, Park, Visitor Parking, Maintenance Staff
        if (gated_community) {
            const gatedAmenities = ['Security', 'CCTV', 'Park', 'Visitor Parking', 'Maintenance Staff'];
            gatedAmenities.forEach(amenity => {
                if (!amenities.includes(amenity)) {
                    newAmenities.push(amenity);
                }
            });
        }

        // Sync Facing -> Vaastu Compliant (one-way)
        const hasVaastuFeature = features.includes('Vaastu Compliant');
        const isVaastuFacing = facing && ['North', 'East', 'North-East'].includes(facing);
        if (isVaastuFacing && !hasVaastuFeature) {
            newFeatures.push('Vaastu Compliant');
        }

        // Sync total_floors -> Lift
        const hasLiftAmenity = amenities.includes('Lift');
        if (total_floors && total_floors > 3 && !hasLiftAmenity) {
            newAmenities.push('Lift');
        }

        // Sync water_source -> 24x7 Water Supply
        const hasWaterSupplyAmenity = amenities.includes('24x7 Water Supply');
        if (water_source && water_source.length > 0 && !hasWaterSupplyAmenity) {
            newAmenities.push('24x7 Water Supply');
        }

        // Update form state only if there are changes
        if (JSON.stringify(features.sort()) !== JSON.stringify(newFeatures.sort())) {
            setValue('features', newFeatures, { shouldDirty: true });
        }
        if (JSON.stringify(amenities.sort()) !== JSON.stringify(newAmenities.sort())) {
            setValue('amenities', newAmenities, { shouldDirty: true });
        }
    }, [power_backup, balconies, gated_community, furnishing, facing, total_floors, water_source, category, setValue, getValues]);


    // Dynamically filter options based on property type/category
    const filteredFeatures = useMemo(() => {
        if (!watchedCategory) return [];
        if (isPlotOrLand) {
            return featuresOptions.filter(opt => opt.value === 'Vaastu Compliant');
        }
        return featuresOptions.filter(opt =>
            !opt.categories || opt.categories.includes(watchedCategory)
        );
    }, [watchedCategory, isPlotOrLand]);

    const filteredAmenities = useMemo(() => {
        if (!watchedCategory) return [];
        return amenitiesOptions.filter(opt =>
            !opt.categories || opt.categories.includes(watchedCategory)
        );
    }, [watchedCategory]);

    const filteredOverlookingOptions = useMemo(() => {
        if (!watchedCategory) return [];
        return overlookingOptions.filter(opt =>
            !opt.categories || opt.categories.includes(watchedCategory)
        );
    }, [watchedCategory]);

    // Automatically generate title and description in add mode
    useEffect(() => {
        if (!isEditMode && watchedType && watchedCategory) {
            const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
            const generatedTitle = `${capitalize(watchedType)} ${capitalize(watchedCategory)}`;
            setValue('title', generatedTitle, { shouldValidate: true });
            generateDescription();
        }
    }, [watchedType, watchedCategory, isEditMode, setValue, generateDescription]);

    // When property category changes, check if the current area unit is still valid
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

        if (imageUrl.startsWith('blob:')) {
            const blobImages = images.filter(img => img.startsWith('blob:'));
            const blobIndex = blobImages.indexOf(imageUrl);
            if (blobIndex > -1) {
                setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== blobIndex));
            }
            URL.revokeObjectURL(imageUrl);
        }

        setImages(images.filter((_, i) => i !== index));
    };

    const handleGetCurrentLocation = async () => {
        const { locationUrl, error } = await getCurrentLocation();

        if (error) {
            showToast(error, "error");
        }
        if (locationUrl) {
            setValue("location", locationUrl, { shouldValidate: true, shouldDirty: true });
            showToast("Location fetched successfully!", "success");
        }
    };

    const fieldStepMapping: { [key in keyof PropertyFormData]?: number } = {
        // Step 1
        title: 1, type: 1, category: 1, location: 1, price: 1,
        built_up_area: 1, carpet_area: 1, unit_area_type: 1,
        plot_front_area: 1, plot_depth_area: 1, plot_dimension_unit: 1,
        is_corner_plot: 1, bedrooms: 1, bathrooms: 1, balconies: 1,
        washrooms: 1, cabins: 1, conference_rooms: 1,
        floor_number: 1, total_floors: 1, facing: 1, property_age: 1,
        transaction_type: 1, furnishing: 1, power_backup: 1,
        gated_community: 1, rera_status: 1, owner_name: 1, owner_contact: 1,
        description: 1,
        // Step 2
        images: 2,
        // Step 3
        overlooking: 3, water_source: 3, features: 3, amenities: 3,
    };

    const onValidationError = (errors: FieldErrors<PropertyFormData>) => {
        console.error("Form validation failed:", errors);
        const errorFields = Object.keys(errors) as (keyof PropertyFormData)[];

        if (errorFields.length > 0) {
            const firstErrorField = errorFields[0];
            const stepWithError = fieldStepMapping[firstErrorField];
            if (stepWithError) {
                setStep(stepWithError);
                showToast(`Please fix the errors on Step ${stepWithError} before submitting.`, 'error');
                setTimeout(() => {
                    setFocus(firstErrorField, { shouldSelect: true });
                }, 100);
            } else {
                showToast('An unknown validation error occurred. Please check all fields.', 'error');
            }
        }
    };

    const onSubmit: SubmitHandler<PropertyFormData> = async (data: PropertyFormData) => {
        if (!user) {
            showToast("You must be logged in to add a property.", 'error');
            return;
        }
        if (!isEditMode || !propertyId) {
            showToast("Cannot update property without an ID. Please start over.", 'error');
            router.push('/agent/add-property');
            return;
        }

        setLoading(true);

        const apiCall = (async () => {
            const formData = new FormData();
            (Object.keys(data) as Array<keyof PropertyFormData>).forEach((key) => {
                const value = data[key];
                if (value !== null && value !== undefined && key !== 'images') {
                    if (Array.isArray(value)) {
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
            const existingImages = images.filter(url => !url.startsWith('blob:'));
            existingImages.forEach(url => {
                // extract filename from full URL
                const filename = url.substring(url.lastIndexOf('/') + 1);
                formData.append('existingImages[]', filename);
            });
            return updateProperty(propertyId, formData);
        })();

        try {
            await showPromiseToast(
                apiCall,
                {
                    loading: 'Updating property...',
                    success: (response: { message?: string }) => response.message || 'Property updated successfully!',
                    error: (err: unknown) => {
                        if (axios.isAxiosError(err) && err.response) {
                            return err.response.data.message || 'Failed to update property.';
                        }
                        if (err instanceof Error) {
                            return err.message || `An unexpected error occurred.`;
                        }
                        return `An unexpected error occurred.`;
                    }
                }
            );
            router.push('/agent/properties');
        } catch (error) {
            // Error is handled by the promise toast. This catch block prevents unhandled promise rejection warnings.
            console.error('Property update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center md:mb-2">
                <div className='flex space-x-1'>
                    <BackButton />
                    <h2 className='text-2xl font-bold'>{isEditMode ? 'Edit Property' : 'Add New Property'}</h2>
                </div>
            </div>

            <div className="md:p-4 mb-2">
                <StepIndicator currentStep={step} steps={steps} />
            </div>

            <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="md:p-6 pt-0 md:space-y-6 space-y-2">
                {step === 1 && (
                    <div className="space-y-3 md:space-y-6">
                        <FormSection title="Basic Information">
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                                {isEditMode && (
                                    <div className="col-span-4">
                                        <Field label="Property Title" required error={errors.title}>
                                            <input
                                                {...register('title')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="e.g., Beautiful 3BHK Apartment"
                                            />
                                        </Field>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <Field label="Property Type" required error={errors.type}>
                                        <IconRadio name="type" options={propertyTypeOptions} watch={watch} setValue={setValue} />
                                    </Field>
                                </div>
                                <div className="col-span-2 lg:col-span-3">
                                    <Field label="Category" required error={errors.category}>
                                        <IconRadio
                                            name="category"
                                            options={watchedType === 'commercial' ? commercialCategoryOptions : residentialCategoryOptions}
                                            watch={watch}
                                            setValue={setValue}
                                        />
                                    </Field>
                                </div>
                                <div className="">
                                    <Field label="Location" error={errors.location}>
                                        <div className="relative">
                                            <input
                                                {...register('location')}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="e.g., Bandra West, Mumbai"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleGetCurrentLocation}
                                                disabled={isFetchingLocation}
                                                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                aria-label="Get current location"
                                            >
                                                {isFetchingLocation ? (
                                                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <MapPin className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </Field>
                                </div>
                                <div className="md:col-span-2">
                                    <Field label="Price (₹)" error={errors.price}>
                                        <input
                                            type="number"
                                            {...register('price', { valueAsNumber: true })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g., 5000000"
                                        />
                                    </Field>
                                </div>
                            </div>
                        </FormSection>

                        {watchedType && watchedCategory && (
                            <div className="md:space-y-6 space-y-3">
                                <FormSection title="Area & Configuration">
                                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                        <div className="md:col-span-2">
                                            <Field label={isPlotOrLand ? 'Plot Area' : 'Built-up Area'} error={errors.built_up_area}>
                                                <input
                                                    type="number"
                                                    {...register('built_up_area', { valueAsNumber: true })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                    placeholder="e.g., 1500"
                                                />
                                            </Field>
                                        </div>
                                        {isBuiltStructure && (
                                            <div className="md:col-span-2">
                                                <Field label="Carpet Area" error={errors.carpet_area}>
                                                    <input
                                                        type="number"
                                                        {...register('carpet_area', { valueAsNumber: true })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        placeholder="e.g., 1200"
                                                    />
                                                </Field>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4">
                                        <Field label="Area Unit" error={errors.unit_area_type}>
                                            <IconRadio name="unit_area_type" options={unitAreaTypeOptions} watch={watch} setValue={setValue} />
                                        </Field>
                                    </div>
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                            <div className="md:col-span-1">
                                                <Field label="Plot Frontage" error={errors.plot_front_area}>
                                                    <input
                                                        type="number"
                                                        {...register('plot_front_area', { valueAsNumber: true })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        placeholder="e.g., 40"
                                                    />
                                                </Field>
                                            </div>
                                            <div className="md:col-span-1">
                                                <Field label="Plot Depth" error={errors.plot_depth_area}>
                                                    <input
                                                        type="number"
                                                        {...register('plot_depth_area', { valueAsNumber: true })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        placeholder="e.g., 60"
                                                    />
                                                </Field>
                                            </div>
                                            <div className="md:col-span-2">
                                                <Field label="Dimension Unit" error={errors.plot_dimension_unit}>
                                                    <IconRadio name="plot_dimension_unit" options={plotDimensionUnitOptions} watch={watch} setValue={setValue} />
                                                </Field>
                                            </div>
                                            <div className="md:col-span-2">
                                                <Field label="Corner Plot?" error={errors.is_corner_plot}>
                                                    <IconBooleanRadio name="is_corner_plot" watch={watch} setValue={setValue} />
                                                </Field>
                                            </div>
                                        </div>
                                    </div>
                                </FormSection>

                                {/* Residential Specific Fields */}
                                {watchedType === 'residential' && !isPlotOrLand && (
                                    <FormSection title="Residential Details">
                                        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6">
                                            <Field label="Bedrooms" error={errors.bedrooms}>
                                                <input type="number" {...register('bedrooms', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="3" />
                                            </Field>
                                            <Field label="Bathrooms" error={errors.bathrooms}>
                                                <input type="number" {...register('bathrooms', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="2" />
                                            </Field>
                                            <Field label="Balconies" error={errors.balconies}>
                                                <input type="number" {...register('balconies', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="1" />
                                            </Field>
                                        </div>
                                    </FormSection>
                                )}

                                {/* Commercial Specific Fields */}
                                {watchedType === 'commercial' && !isPlotOrLand && (
                                    <FormSection title="Commercial Details">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                                            <Field label="Washrooms" error={errors.washrooms}>
                                                <input type="number" {...register('washrooms', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                            </Field>
                                            <Field label="Cabins" error={errors.cabins}>
                                                <input type="number" {...register('cabins', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                            </Field>
                                            <Field label="Conference Rooms" error={errors.conference_rooms}>
                                                <input type="number" {...register('conference_rooms', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                            </Field>
                                        </div>
                                    </FormSection>
                                )}

                                {/* Floor Information */}
                                {isBuiltStructure && (
                                    <FormSection title="Floor Information">
                                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                            <Field label="Floor Number" error={errors.floor_number}>
                                                <input type="number" {...register('floor_number', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 5" />
                                            </Field>
                                            <Field label="Total Floors" error={errors.total_floors}>
                                                <input type="number" {...register('total_floors', { valueAsNumber: true })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="e.g., 12" />
                                            </Field>
                                        </div>
                                    </FormSection>
                                )}

                                <FormSection title="Property Details">
                                    <div className="md:space-y-6 space-y-3">
                                        <Field label="Facing" error={errors.facing}>
                                            <IconRadio name="facing" options={facingOptions} watch={watch} setValue={setValue} />
                                        </Field>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            {isBuiltStructure && (
                                                <Field label="Property Age" error={errors.property_age}>
                                                    <IconRadio name="property_age" options={propertyAgeOptions} watch={watch} setValue={setValue} />
                                                </Field>
                                            )}
                                            <Field label="Transaction Type" error={errors.transaction_type}>
                                                <IconRadio name="transaction_type" options={transactionTypeOptions} watch={watch} setValue={setValue} />
                                            </Field>
                                            {isBuiltStructure && (
                                                <>
                                                    <Field label="Furnishing" error={errors.furnishing}>
                                                        <IconRadio name="furnishing" options={furnishingOptions} watch={watch} setValue={setValue} />
                                                    </Field>
                                                    <Field label="Power Backup" error={errors.power_backup}>
                                                        <IconRadio name="power_backup" options={powerBackupOptions} watch={watch} setValue={setValue} />
                                                    </Field>
                                                    <Field label="Gated Community" error={errors.gated_community}>
                                                        <IconBooleanRadio name="gated_community" watch={watch} setValue={setValue} />
                                                    </Field>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection title="RERA & Status">
                                    <Field label="RERA Status" error={errors.rera_status}>
                                        <IconRadio name="rera_status" options={reraStatusOptions} watch={watch} setValue={setValue} />
                                    </Field>
                                </FormSection>

                                <FormSection title="Owner Details (Private)">
                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-6">
                                        <Field label="Owner Name" error={errors.owner_name}>
                                            <input {...register('owner_name')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Property owner name" />
                                        </Field>
                                        <Field label="Owner Contact" error={errors.owner_contact}>
                                            <input {...register('owner_contact')} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Phone number" />
                                        </Field>
                                    </div>
                                </FormSection>

                                {isEditMode && (
                                    <FormSection title="Description">
                                        <div className="flex justify-between items-center mb-2">
                                            <span onClick={generateDescription} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                                                <SparklesIcon className="h-4 w-4 mr-1" />
                                                Auto-Generate Description
                                            </span>
                                        </div>
                                        <Field label="" error={errors.description}>
                                            <textarea
                                                {...register('description')}
                                                id="description"
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                placeholder="A detailed description of the property..."
                                                onChange={(e) => setValue('description', e.target.value)}
                                            />
                                        </Field>
                                    </FormSection>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <div className="md:space-y-6 space-y-3">
                        <FormSection title="Location, Features & Amenities">
                            <div className="space-y-4">
                                <Field label="Overlooking" error={errors.overlooking} >
                                    <div className="flex flex-wrap gap-3 border-b-2 border-gray-200 pb-2">
                                        {filteredOverlookingOptions.map((option) => (
                                            <IconCheckbox key={option.value} option={option} name="overlooking" register={register} />
                                        ))}
                                    </div>
                                </Field>

                                <Field label="Water Source" error={errors.water_source}>
                                    <div className="flex flex-wrap gap-3 border-b-2 border-gray-200 pb-2">
                                        {waterSourceOptions.map((option) => (
                                            <IconCheckbox key={option.value} option={option} name="water_source" register={register} />
                                        ))}
                                    </div>
                                </Field>

                                {filteredFeatures.length > 0 && (
                                    <Field label="Features" error={errors.features}>
                                        <div className="flex flex-wrap gap-3 border-b-2 border-gray-200 pb-2">
                                            {filteredFeatures.map((feature) => (
                                                <IconCheckbox key={feature.value} option={feature} name="features" register={register} />
                                            ))}
                                        </div>
                                    </Field>
                                )}

                                {!isPlotOrLand && (
                                    <Field label="Amenities" error={errors.amenities}>
                                        <div className="flex flex-wrap gap-3 border-b-2 border-gray-200 pb-2">
                                            {filteredAmenities.map((amenity) => (
                                                <IconCheckbox key={amenity.value} option={amenity} name="amenities" register={register} />
                                            ))}
                                        </div>
                                    </Field>
                                )}
                            </div>
                        </FormSection>
                    </div>
                )}
                {step === 2 && (
                    <FormSection title="Property Images">
                        <Field label="Upload Images" error={errors.images}>
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
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Images (JPG, PNG) or Videos (MP4, WEBM)</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleImageChange} accept="image/png, image/jpeg, image/jpg, video/mp4, video/webm" />
                                </label>
                            </div>
                        </Field>

                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {images.map((url, index) => (
                                    (() => {
                                        let isVideo = false;
                                        if (url.startsWith('blob:')) {
                                            const blobImages = images.filter(img => img.startsWith('blob:'));
                                            const blobIndex = blobImages.indexOf(url);
                                            if (blobIndex > -1 && imageFiles[blobIndex]) {
                                                isVideo = imageFiles[blobIndex].type.startsWith('video/');
                                            }
                                        } else {
                                            const videoExtensions = ['.mp4', '.webm', '.ogg'];
                                            isVideo = videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
                                        }

                                        return (
                                            <div key={index} className="relative group">
                                                {isVideo ? (
                                                    <video src={url} className="w-full h-32 object-cover rounded-lg bg-black" controls />
                                                ) : (
                                                    <Image width={200} height={200} src={url} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                                                )}
                                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 z-10 p-1 bg-red-600 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity">
                                                    <XMarkIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        );
                                    })()
                                ))}
                            </div>
                        )}
                    </FormSection>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                    <div>
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                        )}
                    </div>
                    <div>
                        {step < steps.length ? (
                            <button
                                type="button"
                                onClick={handleNextStep}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && step === 1 && !isEditMode ? 'Saving...' : (step === 1 && !isEditMode ? 'Save & Continue' : 'Next')}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Updating...' : 'Update Property'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div >
    );
};
