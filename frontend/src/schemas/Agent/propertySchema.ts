import { z } from 'zod';
import React from 'react';
import {
    Wind, Sun, LampCeiling, ArrowUpNarrowWide, Sprout, Paintbrush, CookingPot, Compass, AirVent, Siren, Flame, Wifi, BatteryCharging, Layers, BookOpen, Clapperboard, PersonStanding, Fingerprint, Video, User, Maximize,
    ArrowUpDown, Dumbbell, Waves, Trees, Home, ShoppingCart, Car, ParkingCircle, Shield, Wrench, Trash2, CloudRain, Container, Droplets, Phone, ToyBrick, Footprints, Circle as TennisBallIcon, Volleyball, Gamepad2, Coffee, Library as LibraryIcon, GlassWater, Church, Dog, Ban,
    Building, LandPlot, Building2,
    Shrub, Route, Waves as SeaViewIcon, Mountain, Building as CityViewIcon, Trees as ForestIcon,
    Square as CourtyardIcon, School2, HandHelping, Landmark, Droplet, Clock, DropletsIcon, Filter, SproutIcon, Users, ShoppingBasket,
    Square
} from 'lucide-react';

const phoneRegex = /^\+?[0-9]{7,15}$/;

const residentialCategories = ['plot', 'flat', 'villa', 'land', 'farmHouse'] as const;
const commercialCategories = ['showroom', 'office', 'land'] as const;

// Preprocessing for optional number fields from a form. Handles empty strings and NaN.
// The .optional() is moved outside the preprocess to make the input property optional.
const optionalNumber = z.preprocess(
    (val) =>
        (val === "" || val === null || (typeof val === "number" && isNaN(val)))
            ? undefined
            : Number(val),
    // The inner schema validates the preprocessed value. It should not be optional here.
    z.number({ message: "Must be a number" }).min(0)
).optional();


// Preprocessing for required number fields from a form.
const requiredNumber = z.preprocess(
    (val) => val === "" ? NaN : Number(val), // Let zod handle NaN for required fields
    z.number({ message: "Price must be a number" }).refine(val => !isNaN(val), { message: "This field is required" })
);

export const propertySchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().trim().optional(),
    type: z.enum(['residential', 'commercial']),
    category: z.enum(['plot', 'flat', 'showroom', 'office', 'villa', 'land', 'farmHouse']),
    location: z.string().min(1, 'Location is required'),
    price: requiredNumber.refine((val) => val >= 0, { message: 'Price must be a positive number' }),

    // Area & Configuration
    built_up_area: optionalNumber,
    carpet_area: optionalNumber,
    unit_area_type: z.enum(["sqft", "sqm", "acre", "marla", "kanal", "bigha", "sqyd", "hectare", "gaj"]).optional(),

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
    ownership_type: z.enum(['Freehold', 'Leasehold', 'Co-operative Society', 'Power of Attorney']).or(z.literal('')).optional(),
    gated_community: z.boolean().optional(),

    // Parking & Utilities
    parking_count: optionalNumber,
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
    rera_status: z.enum(['Available', 'Not Available', 'Applied']).optional(),
    rera_id: z.string().optional(),

    // Owner Details
    owner_name: z.string().trim().optional(),
    owner_contact: z.string().regex(phoneRegex, "Invalid phone number format").or(z.literal('')).optional(),
    owner_type: z.enum(["Individual", "Dealer", "Builder", "Agency"]).optional(),
    owner_notes: z.string().trim().optional(),

    // Relational
    agencyId: z.string().optional(),
    status: z.enum(['Available', 'Pending', 'Sold', 'Rented']).optional(),

    created_at: z.union([z.date(), z.string()]).optional(),
    updated_at: z.union([z.date(), z.string()]).optional(),

}).superRefine((data, ctx) => {
    // Refinement for category based on type
    if (data.type === 'residential') {
        if (!residentialCategories.includes(data.category as typeof residentialCategories[number])) {
            ctx.addIssue({
                code: 'custom',
                path: ['category'],
                message: `For residential properties, category must be one of: ${residentialCategories.join(', ')}`,
            });
        }
    } else if (data.type === 'commercial') {
        if (!commercialCategories.includes(data.category as typeof commercialCategories[number])) {
            ctx.addIssue({ // Changed from invalid_enum_value to custom as invalid_enum_value is not directly available on ZodIssueCode
                code: 'custom',
                path: ['category'],
                message: `For commercial properties, category must be one of: ${commercialCategories.join(', ')}`,
                received: data.category,
                options: [...commercialCategories],
            });
        }
    }

    // Refinement for carpet area vs built-up area
    if (data.built_up_area !== undefined && data.carpet_area !== undefined && data.carpet_area > data.built_up_area) {
        ctx.addIssue({
            code: 'custom',
            path: ['carpet_area'],
            message: 'Carpet area cannot be greater than built-up area',
        });
    }

    // Refinement for floor number vs total floors
    if (data.total_floors !== undefined && data.floor_number !== undefined && data.floor_number > data.total_floors) {
        ctx.addIssue({
            code: 'custom',
            path: ['floor_number'],
            message: 'Floor number cannot be greater than total floors',
        });
    }

    // Refinement for RERA ID
    if ((data.rera_status === 'Available' || data.rera_status === 'Applied') && (!data.rera_id || data.rera_id.trim() === '')) {
        ctx.addIssue({
            code: 'custom',
            path: ['rera_id'],
            message: 'RERA ID is required when RERA status is Available or Applied',
        });
    }
});;

export type PropertyFormData = z.infer<typeof propertySchema>;

export type IconCheckboxOption = {
    value: string;
    label: string;
    icon: React.ReactNode;
};

export const featuresOptions: IconCheckboxOption[] = [
    { value: "Spacious Interiors", label: "Spacious Interiors", icon: React.createElement(Maximize, { size: 16 }) },
    { value: "Airy Rooms", label: "Airy Rooms", icon: React.createElement(Wind, { size: 16 }) },
    { value: "Natural Light", label: "Natural Light", icon: React.createElement(Sun, { size: 16 }) },
    { value: "False Ceiling Lighting", label: "False Ceiling Lighting", icon: React.createElement(LampCeiling, { size: 16 }) },
    { value: "High Ceiling Height", label: "High Ceiling Height", icon: React.createElement(ArrowUpNarrowWide, { size: 16 }) },
    { value: "Private Garden", label: "Private Garden", icon: React.createElement(Sprout, { size: 16 }) },
    { value: "Recently Renovated", label: "Recently Renovated", icon: React.createElement(Paintbrush, { size: 16 }) },
    { value: "Modular Kitchen", label: "Modular Kitchen", icon: React.createElement(CookingPot, { size: 16 }) },
    { value: "Vaastu Compliant", label: "Vaastu Compliant", icon: React.createElement(Compass, { size: 16 }) },
    { value: "Air Conditioned", label: "Air Conditioned", icon: React.createElement(AirVent, { size: 16 }) },
    { value: "Security / Fire Alarm", label: "Security / Fire Alarm", icon: React.createElement(Siren, { size: 16 }) },
    { value: "Piped Gas", label: "Piped Gas", icon: React.createElement(Flame, { size: 16 }) },
    { value: "Wi-Fi Connectivity", label: "Wi-Fi Connectivity", icon: React.createElement(Wifi, { size: 16 }) },
    { value: "Power Backup Inside Flat", label: "Power Backup Inside Flat", icon: React.createElement(BatteryCharging, { size: 16 }) },
    { value: "Wooden Flooring", label: "Wooden Flooring", icon: React.createElement(Layers, { size: 16 }) },
    { value: "Double Glazed Windows", label: "Double Glazed Windows", icon: React.createElement(Square, { size: 16 }) },
    { value: "Balcony", label: "Balcony", icon: React.createElement(Building, { size: 16 }) },
    { value: "Study Room", label: "Study Room", icon: React.createElement(BookOpen, { size: 16 }) },
    { value: "Home Theatre", label: "Home Theatre", icon: React.createElement(Clapperboard, { size: 16 }) },
    { value: "Walk-in Closet", label: "Walk-in Closet", icon: React.createElement(PersonStanding, { size: 16 }) },
    { value: "Digital Door Lock", label: "Digital Door Lock", icon: React.createElement(Fingerprint, { size: 16 }) },
    { value: "Video Door Phone", label: "Video Door Phone", icon: React.createElement(Video, { size: 16 }) },
    { value: "Servant Room", label: "Servant Room", icon: React.createElement(User, { size: 16 }) },
];

export const amenitiesOptions: IconCheckboxOption[] = [
    { value: "Lift(s)", label: "Lift(s)", icon: React.createElement(ArrowUpDown, { size: 16 }) },
    { value: "Fitness Centre", label: "Fitness Centre", icon: React.createElement(Dumbbell, { size: 16 }) },
    { value: "Swimming Pool", label: "Swimming Pool", icon: React.createElement(Waves, { size: 16 }) },
    { value: "Park", label: "Park", icon: React.createElement(Trees, { size: 16 }) },
    { value: "Clubhouse", label: "Clubhouse", icon: React.createElement(Home, { size: 16 }) },
    { value: "Shopping Centre", label: "Shopping Centre", icon: React.createElement(ShoppingCart, { size: 16 }) },
    { value: "Visitor Parking", label: "Visitor Parking", icon: React.createElement(Car, { size: 16 }) },
    { value: "Reserved Parking", label: "Reserved Parking", icon: React.createElement(ParkingCircle, { size: 16 }) },
    { value: "Security Personnel", label: "Security Personnel", icon: React.createElement(Shield, { size: 16 }) },
    { value: "Maintenance Staff", label: "Maintenance Staff", icon: React.createElement(Wrench, { size: 16 }) },
    { value: "Waste Disposal", label: "Waste Disposal", icon: React.createElement(Trash2, { size: 16 }) },
    { value: "Rain Water Harvesting", label: "Rain Water Harvesting", icon: React.createElement(CloudRain, { size: 16 }) },
    { value: "Water Storage", label: "Water Storage", icon: React.createElement(Container, { size: 16 }) },
    { value: "Water Softening Plant", label: "Water Softening Plant", icon: React.createElement(Droplets, { size: 16 }) },
    { value: "Intercom Facility", label: "Intercom Facility", icon: React.createElement(Phone, { size: 16 }) },
    { value: "Kids Play Area", label: "Kids Play Area", icon: React.createElement(ToyBrick, { size: 16 }) },
    { value: "Jogging Track", label: "Jogging Track", icon: React.createElement(Footprints, { size: 16 }) },
    { value: "Tennis Court", label: "Tennis Court", icon: React.createElement(TennisBallIcon, { size: 16 }) },
    { value: "Basketball Court", label: "Basketball Court", icon: React.createElement(Volleyball, { size: 16 }) },
    { value: "Indoor Games Room", label: "Indoor Games Room", icon: React.createElement(Gamepad2, { size: 16 }) },
    { value: "Cafeteria Food Court", label: "Cafeteria Food Court", icon: React.createElement(Coffee, { size: 16 }) },
    { value: "Library", label: "Library", icon: React.createElement(LibraryIcon, { size: 16 }) },
    { value: "Banquet Hall", label: "Banquet Hall", icon: React.createElement(GlassWater, { size: 16 }) },
    { value: "Prayer Hall", label: "Prayer Hall", icon: React.createElement(Church, { size: 16 }) },
    { value: "Pet Friendly Area", label: "Pet Friendly Area", icon: React.createElement(Dog, { size: 16 }) },
    { value: "No Open Drainage Around", label: "No Open Drainage Around", icon: React.createElement(Ban, { size: 16 }) },
];

export const overlookingOptions: IconCheckboxOption[] = [
    { value: "Park", label: "Park", icon: React.createElement(Shrub, { size: 16 }) },
    { value: "Main Road", label: "Main Road", icon: React.createElement(Route, { size: 16 }) },
    { value: "Garden", label: "Garden", icon: React.createElement(Trees, { size: 16 }) },
    { value: "Pool", label: "Pool", icon: React.createElement(Waves, { size: 16 }) },
    { value: "Sea View", label: "Sea View", icon: React.createElement(SeaViewIcon, { size: 16 }) },
    { value: "Lake View", label: "Lake View", icon: React.createElement(Waves, { size: 16 }) },
    { value: "Mountain View", label: "Mountain View", icon: React.createElement(Mountain, { size: 16 }) },
    { value: "City View", label: "City View", icon: React.createElement(CityViewIcon, { size: 16 }) },
    { value: "Highway", label: "Highway", icon: React.createElement(Route, { size: 16 }) },
    { value: "Forest", label: "Forest", icon: React.createElement(ForestIcon, { size: 16 }) },
    { value: "River", label: "River", icon: React.createElement(Waves, { size: 16 }) },
    { value: "Open Land", label: "Open Land", icon: React.createElement(LandPlot, { size: 16 }) },
    { value: "Courtyard", label: "Courtyard", icon: React.createElement(CourtyardIcon, { size: 16 }) },
    { value: "Clubhouse", label: "Clubhouse", icon: React.createElement(Home, { size: 16 }) },
    { value: "Playground", label: "Playground", icon: React.createElement(ToyBrick, { size: 16 }) },
    { value: "Market", label: "Market", icon: React.createElement(ShoppingBasket, { size: 16 }) },
    { value: "School", label: "School", icon: React.createElement(School2, { size: 16 }) },
    { value: "Temple", label: "Temple", icon: React.createElement(Landmark, { size: 16 }) },
    { value: "Green Belt", label: "Green Belt", icon: React.createElement(Trees, { size: 16 }) },
    { value: "Community Center", label: "Community Center", icon: React.createElement(Users, { size: 16 }) },
];

export const waterSourceOptions: IconCheckboxOption[] = [
    { value: "Municipal Corporation", label: "Municipal Corporation", icon: React.createElement(Building2, { size: 16 }) },
    { value: "Borewell / Tank", label: "Borewell / Tank", icon: React.createElement(DropletsIcon, { size: 16 }) },
    { value: "24x7 Water", label: "24x7 Water", icon: React.createElement(Clock, { size: 16 }) },
    { value: "Ground Water", label: "Ground Water", icon: React.createElement(Droplet, { size: 16 }) },
    { value: "Overhead Tank", label: "Overhead Tank", icon: React.createElement(DropletsIcon, { size: 16 }) },
    { value: "Underground Tank", label: "Underground Tank", icon: React.createElement(DropletsIcon, { size: 16 }) },
    { value: "Society Supply", label: "Society Supply", icon: React.createElement(Users, { size: 16 }) },
    { value: "Handpump", label: "Handpump", icon: React.createElement(HandHelping, { size: 16 }) },
    { value: "Rainwater Harvesting", label: "Rainwater Harvesting", icon: React.createElement(CloudRain, { size: 16 }) },
    { value: "Private Supplier", label: "Private Supplier", icon: React.createElement(User, { size: 16 }) },
    { value: "Shared Borewell", label: "Shared Borewell", icon: React.createElement(Users, { size: 16 }) },
    { value: "Filtered Water Plant", label: "Filtered Water Plant", icon: React.createElement(Filter, { size: 16 }) },
    { value: "Natural Spring", label: "Natural Spring", icon: React.createElement(SproutIcon, { size: 16 }) },
    { value: "Well Water", label: "Well Water", icon: React.createElement(Droplet, { size: 16 }) },
    { value: "Panchayat Supply", label: "Panchayat Supply", icon: React.createElement(Users, { size: 16 }) },
];
