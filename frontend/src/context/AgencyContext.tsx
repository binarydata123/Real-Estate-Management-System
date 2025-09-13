"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext"; // ✅ alias import

// Types
interface Agency {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color: string;
    created_at: string;
    updated_at: string;
}

interface UserAgency {
    id: string;
    user_id: string;
    agency_id: string;
    role: "super_admin" | "agency_admin" | "agent" | "customer";
    status: "pending" | "accepted" | "rejected" | "expired";
    agency: Agency;
}

interface AgencyContextType {
    agencies: UserAgency[];
    currentAgency: Agency | null;
    currentRole: string | null;
    switchAgency: (agencyId: string) => void;
    loading: boolean;
}

// Default context
const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

export const useAgency = () => {
    const context = useContext(AgencyContext);
    if (!context) {
        throw new Error("useAgency must be used within AgencyProvider");
    }
    return context;
};

interface AgencyProviderProps {
    children: React.ReactNode;
}

export const AgencyProvider: React.FC<AgencyProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [agencies, setAgencies] = useState<UserAgency[]>([]);
    const [currentAgency, setCurrentAgency] = useState<Agency | null>(null);
    const [currentRole, setCurrentRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            // ✅ Mock agency for demo mode
            const mockAgency: Agency = {
                id: "demo-agency-123",
                name: "Real Estate Agency",
                slug: "demo-agency",
                logo_url: null,
                primary_color: "#2563eb",
                secondary_color: "#64748b",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const mockUserAgency: UserAgency = {
                id: "demo-user-agency-123",
                user_id: user.id,
                agency_id: mockAgency.id,
                role: "agency_admin",
                status: "accepted",
                agency: mockAgency,
            };

            setAgencies([mockUserAgency]);
            setCurrentAgency(mockAgency);
            setCurrentRole("agency_admin");
        } else {
            setAgencies([]);
            setCurrentAgency(null);
            setCurrentRole(null);
        }
        setLoading(false);
    }, [user]);

    const switchAgency = (agencyId: string) => {
        const agency = agencies.find((ua) => ua.agency.id === agencyId);
        if (agency) {
            setCurrentAgency(agency.agency);
            setCurrentRole(agency.role);
        }
    };

    return (
        <AgencyContext.Provider
            value={{
                agencies,
                currentAgency,
                currentRole,
                switchAgency,
                loading,
            }}
        >
            {children}
        </AgencyContext.Provider>
    );
};
