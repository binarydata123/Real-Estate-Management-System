// types/global.d.ts
declare global {

    // Auth related types
    interface RegistrationData {
        fullName: string;
        email: string;
        phone: string;
        password: string;
        agencyName: string;
        agencySlug: string;
    }

    interface LoginData {
        email: string;
        password: string;
    }

    type AgencyStatus = "approved" | "pending" | "rejected";

    interface Agency {
        id: string;
        name: string;
        logo_url?: string;
        members: number;
        properties: number;
        status: AgencyStatus;
        joined: string;
    }

    interface Property {
        id: string;
        title: string;
        type: string;
        description: string;
        category: string;
        location: string;
        price: number;
        size?: number;
        size_unit: string;
        bedrooms?: number;
        bathrooms?: number;
        status: string;
        images: string[];
        created_at: string;
    }
}

export {
    RegistrationData,
    LoginData,
    AgencyStatus,
    Agency,
    Property
};
