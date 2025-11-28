/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo,useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  preferenceSchema,
  UserPreferenceFormData,
} from "@/schemas/Agent/userPreferenceSchema"; // Make sure to add `userType: z.enum(['buyer', 'investor'])` to the schema
import {
  amenitiesOptions,
  bathroomsOptions,
  bedroomsOptions,
  commercialCategoryOptions,
  facingOptions,
  featuresOptions,
  furnishingOptions,
  propertyTypeOptions,
  reraStatusOptions,
  residentialCategoryOptions,
  userTypeOptions,
} from "@/schemas/Agent/propertySchema";
import { createPreference, getPreferenceDetail } from "@/lib/Common/Preference";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast } from "@/utils/toastHandler";
import { formatPrice } from "@/utils/helperFunction";

const lookingForOptions = [
  { value: "buy", label: "Buy" },
  { value: "rent", label: "Rent" },
] as const;

// These components are inspired by your AddPropertyForm.tsx
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

const FormSection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <div
    className={`bg-white p-3 md:p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}
  >
    <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">
      {title}
    </h3>
    {children}
  </div>
);

// This controlled component is inspired by AddPropertyForm's IconRadio
const IconRadio: React.FC<{
  name: keyof UserPreferenceFormData;
  options: Readonly<
    Array<{ value: string; label: string; icon?: React.ReactNode }>
  >;
  watch: UseFormWatch<UserPreferenceFormData>;
  setValue: UseFormSetValue<UserPreferenceFormData>;
  readOnly?: boolean;
}> = ({ name, options, watch, setValue, readOnly = false }) => {
  const watchedValue = watch(name);

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isChecked = watchedValue === option.value;
        return (
          <div key={option.value}>
            <input
              type="radio"
              id={`${name as string}-${option.value}`}
              value={option.value}
              name={name as string}
              checked={isChecked}
              disabled={readOnly}
              onChange={() =>
                setValue(name, option.value as any, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              className="hidden peer"
            />
            <label
              htmlFor={`${name as string}-${option.value}`}
              className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-700 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600"
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

// This component is inspired by AddPropertyForm's IconCheckbox
const IconCheckbox: React.FC<{
  name: keyof UserPreferenceFormData;
  option: { value: string; label: string; icon?: React.ReactNode };
  register: UseFormRegister<UserPreferenceFormData>;
  readOnly?: boolean;
}> = ({ name, option, register, readOnly = false }) => (
  <div>
    <input
      type="checkbox"
      id={`${name as string}-${option.value}`}
      value={option.value}
      {...register(name)}
      disabled={readOnly}
      className="hidden peer"
    />
    <label
      htmlFor={`${name as string}-${option.value}`}
      className="cursor-pointer shadow flex items-center gap-2 px-3 py-1.5 text-sm rounded-full border transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-700 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600"
    >
      {option.icon && <span>{option.icon}</span>}
      {option.label}
    </label>
  </div>
);

// A dual-thumb range slider component for selecting a min-max range.
const RangeSlider: React.FC<{
  min: number;
  max: number;
  step: number;
  minName: keyof UserPreferenceFormData;
  maxName: keyof UserPreferenceFormData;
  watch: UseFormWatch<UserPreferenceFormData>;
  setValue: UseFormSetValue<UserPreferenceFormData>;
  label: string;
  formatDisplay: (value: number) => string;
  readOnly?: boolean;
}> = ({
  min,
  max,
  step,
  minName,
  maxName,
  watch,
  setValue,
  label,
  formatDisplay,
  readOnly = false,
}) => {
  const minVal = (watch(minName) as number | undefined) ?? min;
  const maxVal = (watch(maxName) as number | undefined) ?? max;

  const trackRef = React.useRef<HTMLDivElement>(null);

  const getPercent = React.useCallback(
    (value: number) => {
      return Math.round(((value - min) / (max - min)) * 100);
    },
    [min, max]
  );

  const minPercent = getPercent(minVal);
  const maxPercent = getPercent(maxVal);

  const handleInteraction = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    thumb: "min" | "max"
  ) => {
    if (!trackRef.current || readOnly) return;
    e.preventDefault();

    const trackRect = trackRef.current.getBoundingClientRect();

    const moveHandler = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX =
        "touches" in moveEvent
          ? moveEvent.touches[0].clientX
          : moveEvent.clientX;
      const delta = clientX - trackRect.left;
      const percent = Math.min(Math.max(delta / trackRect.width, 0), 1);
      let newValue = min + percent * (max - min);

      // Apply step
      newValue = Math.round(newValue / step) * step;

      if (thumb === "min") {
        const newMinVal = Math.min(newValue, maxVal - step);
        setValue(minName, newMinVal as UserPreferenceFormData[typeof minName], {
          shouldDirty: true,
          shouldValidate: true,
        });
      } else {
        // thumb === 'max'
        const newMaxVal = Math.max(newValue, minVal + step);
        setValue(maxName, newMaxVal as UserPreferenceFormData[typeof maxName], {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    };

    const upHandler = () => {
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseup", upHandler);
      document.removeEventListener("touchmove", moveHandler);
      document.removeEventListener("touchend", upHandler);
    };

    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler);
    document.addEventListener("touchmove", moveHandler);
    document.addEventListener("touchend", upHandler);
  };

  return (
    <div className="col-span-2 md:col-span-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-semibold text-gray-800">
          {label}
        </label>
      </div>
      <div className="relative h-10 flex items-center mt-8">
        <div
          ref={trackRef}
          className="relative w-full h-1.5 bg-gray-200 rounded-full"
        >
          <div
            className="absolute h-full bg-blue-500 rounded-full"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />

          {/* Min Thumb with Indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${minPercent}%`, zIndex: 11 }}
          >
            <div className="absolute bottom-full mb-2 -translate-x-1/2">
              <div className="relative bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-md whitespace-nowrap">
                {formatDisplay(minVal)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
              </div>
            </div>
            {!readOnly && (
              <div
                onMouseDown={(e) => handleInteraction(e, "min")}
                onTouchStart={(e) => handleInteraction(e, "min")}
                className="w-5 h-5 bg-white border-2 border-blue-600 rounded-full cursor-pointer shadow-md -translate-x-1/2"
                tabIndex={0}
              />
            )}
            {readOnly && (
              <div className="w-5 h-5 bg-gray-300 border-2 border-gray-400 rounded-full shadow-md -translate-x-1/2 opacity-50" />
            )}
          </div>

          {/* Max Thumb with Indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: `${maxPercent}%`, zIndex: 10 }}
          >
            <div className="absolute bottom-full mb-2 -translate-x-1/2">
              <div className="relative bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-md whitespace-nowrap">
                {formatDisplay(maxVal)}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
              </div>
            </div>
            {!readOnly && (
              <div
                onMouseDown={(e) => handleInteraction(e, "max")}
                onTouchStart={(e) => handleInteraction(e, "max")}
                className="w-5 h-5 bg-white border-2 border-blue-600 rounded-full cursor-pointer shadow-md -translate-x-1/2"
                tabIndex={0}
              />
            )}
            {readOnly && (
              <div className="w-5 h-5 bg-gray-300 border-2 border-gray-400 rounded-full shadow-md -translate-x-1/2 opacity-50" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PreferenceForm() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const isReadOnly = user?.role === "admin";
  const [loading, setLoading] = React.useState(false);

  const [initialType, setInitialType] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const customerId = user?._id;
  console.log("This is my Customer ID      ::::: ",customerId)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<UserPreferenceFormData>({
    resolver: zodResolver(preferenceSchema as any),
    defaultValues: {
      userType: "buyer",
      lookingFor: "buy",
      type: "residential",
      category: [],
      furnishing: [],
      amenities: [],
      features: [],
      bedrooms: [],
      bathrooms: [],
      minPrice: 500000,
      maxPrice: 50000000,
      facing: [],
      reraStatus: [],
      customerId: customerId ?? undefined,
    },
  });

  const watchedType = watch("type");
  const watchedCategories = watch("category") || [];



  const showConfiguration = useMemo(() => {
    if (watchedType !== "residential") return false;
    return watchedCategories.some((cat) => ["flat", "villa"].includes(cat));
  }, [watchedType, watchedCategories]);

  const containsOnlyPlotOrLand = useMemo(
    () =>
      watchedCategories.length > 0 &&
      watchedCategories.every((cat) => ["plot", "land"].includes(cat)),
    [watchedCategories]
  );

  const filteredFeatures = useMemo(() => {
    if (containsOnlyPlotOrLand)
      return featuresOptions.filter((opt) => opt.value === "Vaastu Compliant");
    if (watchedCategories.length === 0)
      return featuresOptions.filter((opt) => !opt.categories);
    return featuresOptions.filter(
      (opt) =>
        !opt.categories ||
        watchedCategories.some((cat) =>
          opt.categories!.includes(
            cat as typeof opt.categories extends Array<infer U> ? U : never
          )
        )
    );
  }, [watchedCategories, containsOnlyPlotOrLand]);

  const filteredAmenities = useMemo(() => {
    if (containsOnlyPlotOrLand) return [];
    if (watchedCategories.length === 0)
      return amenitiesOptions.filter((opt) => !opt.categories);
    return amenitiesOptions.filter(
      (opt) =>
        !opt.categories ||
        watchedCategories.some((cat) =>
          opt.categories!.includes(
            cat as typeof opt.categories extends Array<infer U> ? U : never
          )
        )
    );
  }, [watchedCategories, containsOnlyPlotOrLand]);

  useEffect(() => {
    if (user) {
      const fetchDetail = async () => {
        try {
          const res = await getPreferenceDetail(user._id);
          if (res.success && res.data) {
            reset(res.data);
          
          }
        } catch (error) {
          // Don't show an error toast if it's just a 404, which is expected
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            // Preferences not found, do nothing, form will have default values.
            return;
          }
          showErrorToast("Failed to fetch preferences:", error);
        }
      };
      fetchDetail();
    }
  }, [customerId, reset, showToast, user]);

useEffect(() => {
  if (isInitialLoad) return;
  if (initialType && watchedType !== initialType) {
    setValue("category", []);
  }
}, [watchedType, initialType, isInitialLoad, setValue]);

  const onSubmit = async (data: UserPreferenceFormData) => {

    const finalData = {
      ...data,
      customerId: customerId,
    };
    if (isReadOnly) return;
    setLoading(true);
    try {
      const res = await createPreference(finalData);

      console.log("This is my response ::", res)
      if (res.success) {
        showToast(res.message, "success");
      }
    } catch (err) {
      showErrorToast("Error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold md:mb-2 text-gray-800">
            Set Your Property Preferences
          </h1>
          <p className="text-md text-gray-600 mb-2 md:mb-6">
            Tell us your needs, we’ll find the fit.
          </p>
        </div>
      </div>
      <form
        id="preference-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 md:space-y-6"
      >
        <FormSection title="About You" className="space-y-3">
          <Field label="I am a..." error={errors.userType} required>
            <IconRadio
              name="userType"
              options={userTypeOptions}
              watch={watch}
              setValue={setValue}
              readOnly={isReadOnly}
            />
          </Field>
          <hr className="border-gray-200" />
          <Field label="Looking for..." error={errors.lookingFor} required>
            <IconRadio
              name="lookingFor"
              options={lookingForOptions}
              watch={watch}
              setValue={setValue}
              readOnly={isReadOnly}
            />
          </Field>
        </FormSection>

        <FormSection title="Property Type">
          <div className="space-y-3 md:space-y-4  ">
            <Field label="Property Type" error={errors.type} required>
              <IconRadio
                name="type"
                options={propertyTypeOptions}
                watch={watch}
                setValue={setValue}
                readOnly={isReadOnly}
              />
            </Field>
            {watchedType && (
              <>
                <hr className="border-gray-200" />
                <Field label="Category" error={errors.category}>
                  <div className="flex flex-wrap gap-3 pt-2">
                    {(watchedType === "commercial"
                      ? commercialCategoryOptions
                      : residentialCategoryOptions
                    ).map((opt) => (
                      <IconCheckbox
                        key={opt.value}
                        name="category"
                        option={opt}
                        register={register}
                        readOnly={isReadOnly}
                      />
                    ))}
                  </div>
                </Field>
              </>
            )}
          </div>
        </FormSection>

        <FormSection title="Budget & Size">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-3 md:gap-6">
            <RangeSlider
              label="Price Range"
              min={0}
              max={100000000} // 10 Cr
              step={100000} // 1 Lakh
              minName="minPrice"
              maxName="maxPrice"
              watch={watch}
              setValue={setValue}
              formatDisplay={formatPrice}
              readOnly={isReadOnly}
            />
          </div>
        </FormSection>

        {showConfiguration && (
          <FormSection title="Configuration">
            <div className="space-y-3 md:space-y-6">
              <Field label="Bedrooms" error={errors.bedrooms}>
                <div className="flex flex-wrap gap-3">
                  {bedroomsOptions.map((opt) => (
                    <IconCheckbox
                      key={opt.value}
                      name="bedrooms"
                      option={opt}
                      register={register}
                      readOnly={isReadOnly}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Bathrooms" error={errors.bathrooms}>
                <div className="flex flex-wrap gap-3">
                  {bathroomsOptions.map((opt) => (
                    <IconCheckbox
                      key={opt.value}
                      name="bathrooms"
                      option={opt}
                      register={register}
                      readOnly={isReadOnly}
                    />
                  ))}
                </div>
              </Field>
            </div>
          </FormSection>
        )}

        <FormSection title="Features & Amenities">
          <div className="space-y-3 md:space-y-6">
            {!containsOnlyPlotOrLand && (
              <Field label="Furnishing Status" error={errors.furnishing}>
                <div className="flex flex-wrap gap-3">
                  {furnishingOptions.map((opt) => (
                    <IconCheckbox
                      key={opt.value}
                      name="furnishing"
                      option={opt}
                      register={register}
                      readOnly={isReadOnly}
                    />
                  ))}
                </div>
              </Field>
            )}
            <Field label="Facing" error={errors.facing}>
              <div className="flex flex-wrap gap-2">
                {facingOptions.map((opt) => (
                  <IconCheckbox
                    key={opt.value}
                    name="facing"
                    option={opt}
                    register={register}
                    readOnly={isReadOnly}
                  />
                ))}
              </div>
            </Field>
            <Field label="RERA Status" error={errors.reraStatus}>
              <div className="flex flex-wrap gap-2">
                {reraStatusOptions.map((opt) => (
                  <IconCheckbox
                    key={opt.value}
                    name="reraStatus"
                    option={opt}
                    register={register}
                    readOnly={isReadOnly}
                  />
                ))}
              </div>
            </Field>
            {filteredFeatures.length > 0 && (
              <Field label="Features" error={errors.features}>
                <div className="flex flex-wrap gap-3">
                  {filteredFeatures.map((opt) => (
                    <IconCheckbox
                      key={opt.value}
                      name="features"
                      option={opt}
                      register={register}
                      readOnly={isReadOnly}
                    />
                  ))}
                </div>
              </Field>
            )}
            {filteredAmenities.length > 0 && (
              <Field label="Amenities" error={errors.amenities}>
                <div className="flex flex-wrap gap-3">
                  {filteredAmenities.map((opt) => (
                    <IconCheckbox
                      key={opt.value}
                      name="amenities"
                      option={opt}
                      register={register}
                      readOnly={isReadOnly}
                    />
                  ))}
                </div>
              </Field>
            )}
          </div>
        </FormSection>

        <div className="flex justify-end pb-1">
          <button
            type="submit"
            disabled={loading || isReadOnly}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Update Preferences"}
          </button>
        </div>
      </form>
    </>
  );
}
