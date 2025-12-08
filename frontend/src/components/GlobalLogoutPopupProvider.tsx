"use client";
import { useEffect, useState } from "react";
import InfoPopup from "./Common/PopMessage";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from "axios";
import api from "@/lib/api";

export default function PopupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [logoutPopup, setLogoutPopup] = useState<string | null>(null);
  const router = useRouter();
  const { signOut } = useAuth();

  // Listen for FORCE_LOGOUT event
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      setLogoutPopup(customEvent.detail.message);
    };

    window.addEventListener("FORCE_LOGOUT", handler);
    return () => window.removeEventListener("FORCE_LOGOUT", handler);
  }, []);

  useEffect(() => {
    const validateSession = async () => {
      try {
        await api.get("/auth/check-session",);
      } catch (error:unknown) {
       const axiosError = error as AxiosError<{
         forceLogout?: boolean;
         message?: string;
       }>;

       const data = axiosError.response?.data;
       
        console.log("data from error is : ",data);
        if (data?.forceLogout) {
          // User deleted → show popup
          window.dispatchEvent(
            new CustomEvent("FORCE_LOGOUT", {
              detail: { message: data.message },
            })
          );
        }
      }
    };

    validateSession();
  }, []);


  const closePopup = () => {
    setLogoutPopup(null);
    // sign out
    signOut();
    router.push("/auth/login");
  };

  return (
    <>
      {children}
      {logoutPopup && <InfoPopup message={logoutPopup} onClose={closePopup} />}
    </>
  );
}
