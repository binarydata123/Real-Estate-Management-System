import { z } from 'zod';
import React from 'react';
import {
    Sprout, CookingPot, Compass, AirVent, Siren, Flame, Wifi, BatteryCharging, BookOpen, Video, User, Repeat, Sparkles, Sofa, ZapOff, BatteryMedium,
    ArrowUpDown, Dumbbell, Waves, Trees, Home, Car, Shield, Wrench, CloudRain, Phone, ToyBrick, Footprints, Circle as TennisBallIcon, Volleyball, Gamepad2, Coffee, Library as LibraryIcon, Ban,
    Building, LandPlot, Building2, Ruler,
    Shrub, Route, Building as ResidentialIcon, FileText, CheckCircle, Handshake, HardHat, Users,
    HandHelping, Landmark, Droplet, Clock, DropletsIcon,
    Square
} from 'lucide-react';

const phoneRegex = /^\+?[0-9]{7,15}$/;

const residentialCategories = ['plot', 'flat', 'villa', 'land', 'farmHouse'] as const;
const commercialCategories = ['showroom', 'office', 'land'] as const;

// Preprocessing for optional number fields from a form. Handles empty strings and NaN.
// The .optional() is moved outside the preprocess to make the input property optional.
const optionalNumber = z.preprocess(
    (val) =>
        (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)))
            ? undefined
            : Number(val),
    // The inner schema validates the preprocessed value. It should not be optional here.
    z.number({ message: "Invalid number" }).min(0)
).optional();

export const propertySchema = z.object({
    title: z.string().min(1, 'Title required'),
    description: z.string().trim().optional(),
    type: z.enum(['residential', 'commercial'], { error: "Please select a property type." })
        .refine((val) => !!val, { message: "Please select a property type." }),

    category: z.enum(['plot', 'flat', 'showroom', 'office', 'villa', 'land', 'farmHouse'], {
        error: "Please select a property category."
    }).refine((val) => !!val, { message: "Please select a property category." }),

    location: z.string().optional(),
    price: optionalNumber,

    // Area & Configuration
    built_up_area: optionalNumber,
    carpet_area: optionalNumber,
    unit_area_type: z.enum(["sqft", "sqm", "acre", "marla", "kanal", "bigha", "sqyd", "hectare", "gaj"]).optional(),

    // Plot specific
    plot_front_area: optionalNumber,
    plot_depth_area: optionalNumber,
    plot_dimension_unit: z.enum(["ft", "m"]).optional(),
    is_corner_plot: z.boolean().optional(),

    // Residential specific
    bedrooms: optionalNumber,
    bathrooms: optionalNumber,
    balconies: optionalNumber,

    // Commercial specific
    washrooms: optionalNumber,
    cabins: optionalNumber,
    conference_rooms: optionalNumber,

    // Common
    floor_number: optionalNumber,
    total_floors: optionalNumber,

    // Facing / Overlooking
    facing: z.enum([
        "North", "South", "East", "West",
        "North-East", "North-West",
        "South-East", "South-West",
    ]).or(z.literal('')).optional(),
    overlooking: z.array(z.string()).optional(),

    // Age / Transaction Details
    property_age: z.enum(["New", "1-5 years", "5-10 years", "10+ years"]).or(z.literal('')).optional(),
    transaction_type: z.enum(['New', 'Resale']).optional(),
    gated_community: z.boolean().optional(),

    // Parking & Utilities
    water_source: z.array(z.string()).optional(),
    power_backup: z.enum(['None', 'Partial', 'Full']).optional(),

    // Features & Amenities
    flooring_type: z.enum(['Marble', 'Vitrified', 'Wooden', 'Ceramic', 'Mosaic', 'Granite', 'Other']).or(z.literal('')).optional(),
    furnishing: z.enum(['Unfurnished', 'Semi-Furnished', 'Furnished']).optional(),
    features: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),

    // Images
    images: z.array(z.string()).optional(),

    // Codes & Identifiers
    property_code: z.string().optional(),
    rera_status: z.enum(['Approved', 'Not Approved', 'Applied']).optional(),

    // Owner Details
    owner_name: z.string().trim().optional(),
    owner_contact: z.string().regex(phoneRegex, "Invalid phone number").or(z.literal('')).optional(),

    // Relational
    agencyId: z.string().optional(),
    status: z.enum(['Available', 'Pending', 'Sold', 'Rented']).optional(),

    created_at: z.union([z.date(), z.string()]).optional(),
    updated_at: z.union([z.date(), z.string()]).optional(),

}).superRefine((data, ctx) => {
    // Refinement for category based on type
    if (data.type && data.category) {
        if (data.type === 'residential') { // Check if category is valid for the selected type
            if (!residentialCategories.includes(data.category as typeof residentialCategories[number])) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['category'],
                    message: `Please select a valid residential category`,
                });
            }
        } else if (data.type === 'commercial') { // Check if category is valid for the selected type
            if (!commercialCategories.includes(data.category as typeof commercialCategories[number])) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['category'],
                    message: `Please select a valid commercial category`,
                });
            }
        }
    }

    // Refinement for carpet area vs built-up area
    if (data.built_up_area !== undefined && data.carpet_area !== undefined && data.carpet_area > data.built_up_area) {
        ctx.addIssue({
            code: 'custom',
            path: ['carpet_area'],
            message: "Carpet area can't exceed built-up area",
        });
    }

    // Refinement for floor number vs total floors
    if (data.total_floors !== undefined && data.floor_number !== undefined && data.floor_number > data.total_floors) {
        ctx.addIssue({
            code: 'custom',
            path: ['floor_number'],
            message: "Floor no. can't exceed total floors",
        });
    }
});

export type PropertyFormData = z.infer<typeof propertySchema>;

export type IconCheckboxOption = {
    value: string;
    label: string;
    icon: React.ReactNode;
};

export const propertyTypeOptions: IconCheckboxOption[] = [
    { value: 'residential', label: 'Residential', icon: React.createElement(ResidentialIcon, { size: 16 }) },
    { value: 'commercial', label: 'Commercial', icon: React.createElement(Building, { size: 16 }) },
];

export const transactionTypeOptions: IconCheckboxOption[] = [
    { value: 'New', label: 'New Property', icon: React.createElement(Sparkles, { size: 16 }) },
    { value: 'Resale', label: 'Resale', icon: React.createElement(Repeat, { size: 16 }) },
];

export const furnishingOptions: IconCheckboxOption[] = [
    { value: 'Furnished', label: 'Furnished', icon: React.createElement(Sofa, { size: 16 }) },
    { value: 'Semi-Furnished', label: 'Semi-Furnished', icon: React.createElement(Sofa, { size: 16, strokeWidth: 1.5 }) },
    { value: 'Unfurnished', label: 'Unfurnished', icon: React.createElement(Sofa, { size: 16, strokeWidth: 1 }) },
];

export const powerBackupOptions: IconCheckboxOption[] = [
    { value: 'None', label: 'None', icon: React.createElement(ZapOff, { size: 16 }) },
    { value: 'Partial', label: 'Partial', icon: React.createElement(BatteryMedium, { size: 16 }) },
    { value: 'Full', label: 'Full', icon: React.createElement(BatteryCharging, { size: 16 }) },
];

export const commercialCategoryOptions: IconCheckboxOption[] = [
    { value: 'showroom', label: 'Showroom', icon: React.createElement(Building, { size: 16 }) },
    { value: 'office', label: 'Office', icon: React.createElement(Building2, { size: 16 }) },
    { value: 'land', label: 'Commercial Land', icon: React.createElement(LandPlot, { size: 16 }) },
];

export const residentialCategoryOptions: IconCheckboxOption[] = [
    { value: 'plot', label: 'Plot', icon: React.createElement(LandPlot, { size: 16 }) },
    { value: 'flat', label: 'Flat', icon: React.createElement(Building, { size: 16 }) },
    { value: 'villa', label: 'Villa', icon: React.createElement(Home, { size: 16 }) },
    { value: 'land', label: 'Land', icon: React.createElement(Square, { size: 16 }) },
    { value: 'farmHouse', label: 'Farm House', icon: React.createElement(Sprout, { size: 16 }) },
];

export const unitAreaTypeOptions: IconCheckboxOption[] = [
    { value: 'sqft', label: 'Sq.ft.', icon: React.createElement(Square, { size: 16 }) },
    { value: 'sqm', label: 'Sq.m.', icon: React.createElement(Square, { size: 16 }) },
    { value: 'sqyd', label: 'Sq.yd.', icon: React.createElement(Square, { size: 16 }) },
    { value: 'gaj', label: 'Gaj', icon: React.createElement(Square, { size: 16 }) },
    { value: 'acre', label: 'Acre', icon: React.createElement(LandPlot, { size: 16 }) },
    { value: 'hectare', label: 'Hectare', icon: React.createElement(LandPlot, { size: 16 }) },
    { value: 'bigha', label: 'Bigha', icon: React.createElement(LandPlot, { size: 16 }) },
    { value: 'kanal', label: 'Kanal', icon: React.createElement(LandPlot, { size: 16 }) },
    { value: 'marla', label: 'Marla', icon: React.createElement(LandPlot, { size: 16 }) },
];

export const facingOptions: IconCheckboxOption[] = [
    { value: 'North', label: 'North', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'South', label: 'South', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'East', label: 'East', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'West', label: 'West', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'North-East', label: 'N-E', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'North-West', label: 'N-W', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'South-East', label: 'S-E', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'South-West', label: 'S-W', icon: React.createElement(Compass, { size: 16 }) },
];
export const featuresOptions: IconCheckboxOption[] = [
    { value: "Vaastu Compliant", label: "Vaastu Compliant", icon: React.createElement(Compass, { size: 16 }) },
    { value: "Air Conditioned", label: "Air Conditioned", icon: React.createElement(AirVent, { size: 16 }) },
    { value: "Modular Kitchen", label: "Modular Kitchen", icon: React.createElement(CookingPot, { size: 16 }) },
    { value: "Piped Gas", label: "Piped Gas", icon: React.createElement(Flame, { size: 16 }) },
    { value: "Power Backup", label: "Power Backup", icon: React.createElement(BatteryCharging, { size: 16 }) },
    { value: "Balcony", label: "Balcony", icon: React.createElement(Building, { size: 16 }) },
    { value: "Internet/Wi-Fi Connectivity", label: "Wi-Fi", icon: React.createElement(Wifi, { size: 16 }) },
    { value: "Private Terrace/Garden", label: "Terrace/Garden", icon: React.createElement(Shrub, { size: 16 }) },
    { value: "Intercom Facility", label: "Intercom", icon: React.createElement(Phone, { size: 16 }) },
    { value: "Security/Fire Alarm", label: "Fire Alarm", icon: React.createElement(Siren, { size: 16 }) },
    { value: "Study Room", label: "Study Room", icon: React.createElement(BookOpen, { size: 16 }) },
    { value: "Servant Room", label: "Servant Room", icon: React.createElement(User, { size: 16 }) },
];

export const amenitiesOptions: IconCheckboxOption[] = [
    { value: "Lift", label: "Lift", icon: React.createElement(ArrowUpDown, { size: 16 }) },
    { value: "Security", label: "Security", icon: React.createElement(Shield, { size: 16 }) },
    { value: "CCTV", label: "CCTV", icon: React.createElement(Video, { size: 16 }) },
    { value: "Gym", label: "Gym", icon: React.createElement(Dumbbell, { size: 16 }) },
    { value: "Swimming Pool", label: "Swimming Pool", icon: React.createElement(Waves, { size: 16 }) },
    { value: "Park", label: "Park", icon: React.createElement(Trees, { size: 16 }) },
    { value: "Clubhouse", label: "Clubhouse", icon: React.createElement(Home, { size: 16 }) },
    { value: "Community Hall", label: "Community Hall", icon: React.createElement(Users, { size: 16 }) },
    { value: "Visitor Parking", label: "Visitor Parking", icon: React.createElement(Car, { size: 16 }) },
    { value: "Maintenance Staff", label: "Maintenance Staff", icon: React.createElement(Wrench, { size: 16 }) },
    { value: "Kids Play Area", label: "Kids Play Area", icon: React.createElement(ToyBrick, { size: 16 }) },
    { value: "Jogging Track", label: "Jogging Track", icon: React.createElement(Footprints, { size: 16 }) },
    { value: "Badminton Court", label: "Badminton Court", icon: React.createElement(Volleyball, { size: 16 }) },
    { value: "Tennis Court", label: "Tennis Court", icon: React.createElement(TennisBallIcon, { size: 16 }) },
    { value: "Indoor Games", label: "Indoor Games", icon: React.createElement(Gamepad2, { size: 16 }) },
    { value: "Library", label: "Library", icon: React.createElement(LibraryIcon, { size: 16 }) },
    { value: "Cafeteria/Food Court", label: "Cafeteria", icon: React.createElement(Coffee, { size: 16 }) },
    { value: "Rain Water Harvesting", label: "Rain Water Harvesting", icon: React.createElement(CloudRain, { size: 16 }) },
    { value: "24x7 Water Supply", label: "24x7 Water Supply", icon: React.createElement(Droplet, { size: 16 }) },
];

export const overlookingOptions: IconCheckboxOption[] = [
    { value: "Garden View", label: "Garden View", icon: React.createElement(Trees, { size: 16 }) },
    { value: "Park View", label: "Park View", icon: React.createElement(Trees, { size: 16 }) },
    { value: "Main Road", label: "Main Road", icon: React.createElement(Route, { size: 16 }) },
    { value: "Pool View", label: "Pool View", icon: React.createElement(Waves, { size: 16 }) },
];

export const propertyAgeOptions: IconCheckboxOption[] = [
    { value: 'New', label: 'New', icon: React.createElement(Sparkles, { size: 16 }) },
    { value: '1-5 years', label: '1-5yr', icon: React.createElement(Clock, { size: 16 }) },
    { value: '5-10 years', label: '5-10yr', icon: React.createElement(Clock, { size: 16 }) },
    { value: '10+ years', label: '10+yr', icon: React.createElement(Clock, { size: 16 }) },
];

export const ownershipTypeOptions: IconCheckboxOption[] = [
    { value: 'Freehold', label: 'Freehold', icon: React.createElement(Landmark, { size: 16 }) },
    { value: 'Leasehold', label: 'Leasehold', icon: React.createElement(FileText, { size: 16 }) },
    { value: 'Co-operative Society', label: 'Co-op', icon: React.createElement(Users, { size: 16 }) },
    { value: 'Power of Attorney', label: 'POA', icon: React.createElement(HandHelping, { size: 16 }) },
];

export const plotDimensionUnitOptions: IconCheckboxOption[] = [
    { value: 'ft', label: 'Feet', icon: React.createElement(Ruler, { size: 16 }) },
    { value: 'm', label: 'Meter', icon: React.createElement(Ruler, { size: 16 }) },
];

export const waterSourceOptions: IconCheckboxOption[] = [
    { value: "Municipal Supply", label: "Municipal Supply", icon: React.createElement(Building2, { size: 16 }) },
    { value: "Borewell", label: "Borewell", icon: React.createElement(DropletsIcon, { size: 16 }) },
    { value: "Tanker Supply", label: "Tanker Supply", icon: React.createElement(Droplet, { size: 16 }) },
];

export const reraStatusOptions: IconCheckboxOption[] = [
    { value: 'Approved', label: 'Approved', icon: React.createElement(CheckCircle, { size: 16 }) },
    { value: 'Not Approved', label: 'Not Approved', icon: React.createElement(Ban, { size: 16 }) },
    { value: 'Applied', label: 'Applied', icon: React.createElement(Clock, { size: 16 }) },
];

export const ownerTypeOptions: IconCheckboxOption[] = [
    { value: 'Individual', label: 'Individual', icon: React.createElement(User, { size: 16 }) },
    { value: 'Dealer', label: 'Dealer', icon: React.createElement(Handshake, { size: 16 }) },
    { value: 'Builder', label: 'Builder', icon: React.createElement(HardHat, { size: 16 }) },
    { value: 'Agency', label: 'Agency', icon: React.createElement(Building, { size: 16 }) },
];
