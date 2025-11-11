import { z } from 'zod';
import React from 'react';
import {
    Sprout, CookingPot, Compass, AirVent, Siren, Flame, Wifi, BatteryCharging, BookOpen, Video, User, Repeat, Sparkles, Sofa, ZapOff, BatteryMedium,
    ArrowUpDown, Dumbbell, Waves, Trees, Home, Car, Shield, Wrench, CloudRain, Phone, ToyBrick, Footprints, Circle as TennisBallIcon, Volleyball, Gamepad2, Coffee, Library as LibraryIcon, Ban,
    Building, LandPlot, Building2, Ruler,
    Shrub, Route, Building as ResidentialIcon, FileText, CheckCircle, Handshake, HardHat, Users,
    HandHelping, Landmark, Droplet, Clock, DropletsIcon,
    Square,
} from 'lucide-react';


const residentialCategories = ['plot', 'flat', 'villa', 'land', 'farmhouse'] as const;
const commercialCategories = ['showroom', 'office', 'land'] as const;

// Preprocessing for optional number fields from a form. Handles empty strings and NaN.
// The .optional() is moved outside the preprocess to make the input property optional.
const optionalNumber = z.preprocess(
    (val) =>
        (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)))
            ? undefined
            : Number(val),
    // The inner schema validates the preprocessed value. It should not be optional here.
    z.number({ message: "Invalid number" }).min(0),
).optional();

// For required numeric fields that should reject zero values
const requiredPositiveNumber = z.preprocess(
    (val) =>
        (val === "" || val === null || val === undefined || (typeof val === "number" && isNaN(val)))
            ? undefined
            : Number(val),
    //z.number({ message: "Invalid number" }).min(1, "Value must be greater than 0")
    z.number({ message: "Invalid number" }),
).optional();

export const propertySchema = z.object({
    title: z.string().min(1, 'Title required'),
    description: z.string().trim().optional(),
    type: z.enum(['residential', 'commercial'], { error: "Please select a property type." })
        .refine((val) => !!val, { message: "Please select a property type." }),

    category: z.enum(['plot', 'flat', 'showroom', 'office', 'villa', 'land', 'farmhouse'], {
        error: "Please select a property category.",
    }).refine((val) => !!val, { message: "Please select a property category." }),

    location: z.string().optional(),
    price: requiredPositiveNumber,

    // Area & Configuration
    built_up_area: optionalNumber,
    carpet_area: optionalNumber,
    unit_area_type: z.enum(["square feet", "square meter", "acre", "marla", "kanal", "bigha", "square yard", "hectare", "gaj"]).optional(),

    // Plot specific
    plot_front_area: optionalNumber,
    plot_depth_area: optionalNumber,
    plot_dimension_unit: z.enum(["feet", "meter"]).optional(),
    is_corner_plot: z.enum(["yes", "no"]).optional(),

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
        "north", "south", "east", "west",
        "north east", "north west",
        "south east", "south west",
    ]).or(z.literal('')).optional(),
    overlooking: z.array(z.string()).optional(),

    // Age / Transaction Details
    property_age: z.enum(["new", "1 - 5 years", "5 - 10 years", "10 + years"]).or(z.literal('')).optional(),
    transaction_type: z.enum(['new', 'resale']).optional(),
    gated_community: z.enum(["yes", "no"]).optional(),

    // Parking & Utilities
    water_source: z.array(z.string()).optional(),
    power_backup: z.enum(['none', 'partial', 'full']).optional(),

    // Features & Amenities
    flooring_type: z.enum(['marble', 'vitrified', 'wooden', 'ceramic', 'mosaic', 'granite', 'other']).or(z.literal('')).optional(),
    furnishing: z.enum(['unfurnished', 'semi furnished', 'furnished']).optional(),
    features: z.array(z.string()).optional(),
    amenities: z.array(z.string()).optional(),

    // Images
    images: z.array(z.string()).optional(),

    // Codes & Identifiers
    property_code: z.string().optional(),
    rera_status: z.enum(['approved', 'not approved', 'applied']).optional(),

    // Owner Details
    owner_name: z.string().trim().optional(),
    owner_contact: z.string().optional(),

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
    categories?: ('plot' | 'flat' | 'showroom' | 'office' | 'villa' | 'land' | 'farmhouse')[];
};

export const propertyTypeOptions: IconCheckboxOption[] = [
    { value: 'residential', label: 'Residential', icon: React.createElement(ResidentialIcon, { size: 16 }) },
    { value: 'commercial', label: 'Commercial', icon: React.createElement(Building, { size: 16 }) },
];

export const transactionTypeOptions: IconCheckboxOption[] = [
    { value: 'new', label: 'New Property', icon: React.createElement(Sparkles, { size: 16 }) },
    { value: 'resale', label: 'Resale', icon: React.createElement(Repeat, { size: 16 }) },
];

export const furnishingOptions: IconCheckboxOption[] = [
    { value: 'furnished', label: 'Furnished', icon: React.createElement(Sofa, { size: 16 }) },
    { value: 'semi furnished', label: 'Semi-Furnished', icon: React.createElement(Sofa, { size: 16, strokeWidth: 1.5 }) },
    { value: 'unfurnished', label: 'Unfurnished', icon: React.createElement(Sofa, { size: 16, strokeWidth: 1 }) },
];

export const powerBackupOptions: IconCheckboxOption[] = [
    { value: 'none', label: 'None', icon: React.createElement(ZapOff, { size: 16 }) },
    { value: 'partial', label: 'Partial', icon: React.createElement(BatteryMedium, { size: 16 }) },
    { value: 'full', label: 'Full', icon: React.createElement(BatteryCharging, { size: 16 }) },
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
    { value: 'farmhouse', label: 'Farm House', icon: React.createElement(Sprout, { size: 16 }) },
];

export const unitAreaTypeOptions: IconCheckboxOption[] = [
    { value: 'square feet', label: 'Sq.ft.', icon: React.createElement(Square, { size: 16 }) },
    { value: 'square meter', label: 'Sq.m.', icon: React.createElement(Square, { size: 16 }) },
    { value: 'square yard', label: 'Sq.yd.', icon: React.createElement(Square, { size: 16 }) },
    { value: 'gaj', label: 'Gaj', icon: React.createElement(Square, { size: 16 }) },
    { value: 'acre', label: 'Acre', icon: React.createElement(LandPlot, { size: 16 }) },
    { value: 'hectare', label: 'Hectare', icon: React.createElement(LandPlot, { size: 16 }) },
    { value: 'bigha', label: 'Bigha', icon: React.createElement(LandPlot, { size: 16 }) },
    { value: 'kanal', label: 'Kanal', icon: React.createElement(LandPlot, { size: 16 }) },
    { value: 'marla', label: 'Marla', icon: React.createElement(LandPlot, { size: 16 }) },
];

export const facingOptions: IconCheckboxOption[] = [
    { value: 'north', label: 'North', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'south', label: 'South', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'east', label: 'East', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'west', label: 'West', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'north east', label: 'N-E', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'north west', label: 'N-W', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'south east', label: 'S-E', icon: React.createElement(Compass, { size: 16 }) },
    { value: 'south west', label: 'S-W', icon: React.createElement(Compass, { size: 16 }) },
];
export const featuresOptions: IconCheckboxOption[] = [
    { value: "vaastu compliant", label: "Vaastu Compliant", icon: React.createElement(Compass, { size: 16 }) },
    { value: "air conditioned", label: "Air Conditioned", icon: React.createElement(AirVent, { size: 16 }) },
    { value: "modular kitchen", label: "Modular Kitchen", icon: React.createElement(CookingPot, { size: 16 }), categories: ['flat', 'villa', 'farmhouse'] },
    { value: "piped gas", label: "Piped Gas", icon: React.createElement(Flame, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "power backup", label: "Power Backup", icon: React.createElement(BatteryCharging, { size: 16 }) },
    { value: "balcony", label: "Balcony", icon: React.createElement(Building, { size: 16 }) },
    { value: "wifi", label: "Wi-Fi", icon: React.createElement(Wifi, { size: 16 }) },
    { value: "terrace garden", label: "Terrace/Garden", icon: React.createElement(Shrub, { size: 16 }), categories: ['villa', 'farmhouse', 'flat'] },
    { value: "intercom", label: "Intercom", icon: React.createElement(Phone, { size: 16 }), categories: ['flat', 'office', 'showroom', 'villa'] },
    { value: "fire alarm", label: "Fire Alarm", icon: React.createElement(Siren, { size: 16 }) },
    { value: "study room", label: "Study Room", icon: React.createElement(BookOpen, { size: 16 }), categories: ['flat', 'villa', 'farmhouse'] },
    { value: "servant room", label: "Servant Room", icon: React.createElement(User, { size: 16 }), categories: ['flat', 'villa', 'farmhouse'] },
];

export const amenitiesOptions: IconCheckboxOption[] = [
    { value: "lift", label: "Lift", icon: React.createElement(ArrowUpDown, { size: 16 }), categories: ['flat', 'office', 'showroom'] },
    { value: "security", label: "Security", icon: React.createElement(Shield, { size: 16 }) },
    { value: "cctv", label: "CCTV", icon: React.createElement(Video, { size: 16 }) },
    { value: "gym", label: "Gym", icon: React.createElement(Dumbbell, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "swimming pool", label: "Swimming Pool", icon: React.createElement(Waves, { size: 16 }), categories: ['flat', 'villa', 'farmhouse'] },
    { value: "park", label: "Park", icon: React.createElement(Trees, { size: 16 }) },
    { value: "clubhouse", label: "Clubhouse", icon: React.createElement(Home, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "community all", label: "Community Hall", icon: React.createElement(Users, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "visitor parking", label: "Visitor Parking", icon: React.createElement(Car, { size: 16 }) },
    { value: "maintenance staff", label: "Maintenance Staff", icon: React.createElement(Wrench, { size: 16 }) },
    { value: "kids play area", label: "Kids Play Area", icon: React.createElement(ToyBrick, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "jogging track", label: "Jogging Track", icon: React.createElement(Footprints, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "badminton court", label: "Badminton Court", icon: React.createElement(Volleyball, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "tennis court", label: "Tennis Court", icon: React.createElement(TennisBallIcon, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "indoor games", label: "Indoor Games", icon: React.createElement(Gamepad2, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "library", label: "Library", icon: React.createElement(LibraryIcon, { size: 16 }), categories: ['flat', 'villa'] },
    { value: "cafeteria", label: "Cafeteria", icon: React.createElement(Coffee, { size: 16 }), categories: ['office'] },
    { value: "rain water harvesting", label: "Rain Water Harvesting", icon: React.createElement(CloudRain, { size: 16 }) },
    { value: "24x7 water supply", label: "24x7 Water Supply", icon: React.createElement(Droplet, { size: 16 }) },
];

export const overlookingOptions: IconCheckboxOption[] = [
    { value: "garden view", label: "Garden View", icon: React.createElement(Trees, { size: 16 }) },
    { value: "park view", label: "Park View", icon: React.createElement(Trees, { size: 16 }) },
    { value: "main road", label: "Main Road", icon: React.createElement(Route, { size: 16 }) },
    { value: "pool view", label: "Pool View", icon: React.createElement(Waves, { size: 16 }), categories: ['flat', 'villa', 'farmhouse'] },
];

export const propertyAgeOptions: IconCheckboxOption[] = [
    { value: 'new', label: 'New', icon: React.createElement(Sparkles, { size: 16 }) },
    { value: '1 - 5 years', label: '1-5yr', icon: React.createElement(Clock, { size: 16 }) },
    { value: '5 - 10 years', label: '5-10yr', icon: React.createElement(Clock, { size: 16 }) },
    { value: '10 + years', label: '10+yr', icon: React.createElement(Clock, { size: 16 }) },
];

export const ownershipTypeOptions: IconCheckboxOption[] = [
    { value: 'freehold', label: 'Freehold', icon: React.createElement(Landmark, { size: 16 }) },
    { value: 'leasehold', label: 'Leasehold', icon: React.createElement(FileText, { size: 16 }) },
    { value: 'cooperative society', label: 'Co-Operative Society', icon: React.createElement(Users, { size: 16 }) },
    { value: 'power of attorney', label: 'POA (Power Of Attorney)', icon: React.createElement(HandHelping, { size: 16 }) },
];

export const plotDimensionUnitOptions: IconCheckboxOption[] = [
    { value: 'feet', label: 'Feet', icon: React.createElement(Ruler, { size: 16 }) },
    { value: 'meter', label: 'Meter', icon: React.createElement(Ruler, { size: 16 }) },
];

export const waterSourceOptions: IconCheckboxOption[] = [
    { value: "municipal supply", label: "Municipal Supply", icon: React.createElement(Building2, { size: 16 }) },
    { value: "borewell", label: "Borewell", icon: React.createElement(DropletsIcon, { size: 16 }) },
    { value: "tanker supply", label: "Tanker Supply", icon: React.createElement(Droplet, { size: 16 }) },
];

export const reraStatusOptions: IconCheckboxOption[] = [
    { value: 'approved', label: 'Approved', icon: React.createElement(CheckCircle, { size: 16 }) },
    { value: 'not approved', label: 'Not Approved', icon: React.createElement(Ban, { size: 16 }) },
    { value: 'applied', label: 'Applied', icon: React.createElement(Clock, { size: 16 }) },
];

export const ownerTypeOptions: IconCheckboxOption[] = [
    { value: 'individual', label: 'Individual', icon: React.createElement(User, { size: 16 }) },
    { value: 'dealer', label: 'Dealer', icon: React.createElement(Handshake, { size: 16 }) },
    { value: 'builder', label: 'Builder', icon: React.createElement(HardHat, { size: 16 }) },
    { value: 'agency', label: 'Agency', icon: React.createElement(Building, { size: 16 }) },
];

export const bedroomsOptions = [
    { value: '1', label: '1 BHK' },
    { value: '2', label: '2 BHK' },
    { value: '3', label: '3 BHK' },
    { value: '4', label: '4 BHK' },
    { value: '5', label: '5+ BHK' },
];

export const bathroomsOptions = [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4+' },
];

export const userTypeOptions = [
    { value: 'buyer', label: 'Buyer', icon: React.createElement(User, { size: 16 }) },
    { value: 'investor', label: 'Investor', icon: React.createElement(Handshake, { size: 16 }) },
];
