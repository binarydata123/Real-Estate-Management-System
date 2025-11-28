"use client";
import { CustomerHeader } from "@/components/Customer/Common/CustomerHeader";
import { CustomerSidebar } from "@/components/Customer/Common/CustomerSidebar";
import { useAuth } from "@/context/AuthContext";
import { BuildingOfficeIcon, CalendarIcon } from "@heroicons/react/24/outline";
import {
  LayoutDashboard,
  Loader,
  MessageCircle,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function CustomerLayout({ children }: LayoutProps) {
  const { loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedMore, setSelectedMore] = useState(false);
  const pathname = usePathname();
  const sideBarRef = useRef<HTMLDivElement>(null);

  const isMessagesPage = pathname.includes("/messages");
  const footerLinks = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/customer/dashboard",
    },

    {
      id: "properties",
      label: "Properties",
      icon: BuildingOfficeIcon,
      path: "/customer/properties",
    },
    {
      id: "meetings",
      label: "Meetings",
      icon: CalendarIcon,
      path: "/customer/meetings",
    },
    {
      id: "message",
      label: "Messages",
      icon: MessageCircle,
      path: "/customer/messages",
    },
    {
      id: "more-sidebar",
      label: "More",
      icon: MoreVertical,
      path: "",
    },
  ];

  const handleMoreClick = () => {
    setSelectedMore(true);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if(sideBarRef.current && !sideBarRef.current.contains(e.target as Node)){
      setIsSidebarOpen(false);
      setSelectedMore(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown",handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-30 max-w-72 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar (Desktop always visible, Mobile toggled) */}
      <CustomerSidebar
        isOpen={isSidebarOpen}
        onClose={() => {setIsSidebarOpen(false); setSelectedMore(false)}}
        ref={sideBarRef}
      />

      <div className="flex-1 flex flex-col">
        {!isMessagesPage && (
          <CustomerHeader onMenuButtonClick={() => setIsSidebarOpen(true)} />
        )}
        <main className={`flex-1 md:p-6 ${!isMessagesPage && "mb-12 p-2"}`}>
          {children}
        </main>
        {/* Footer Links */}
        <div
          className="fixed bottom-0 left-0 w-full h-[50px] md:hidden"
          style={{ backgroundColor: "#2563eb" }}
        >
          <div className="grid grid-cols-5 h-[100%] gap-2 text-white">
            {footerLinks.map((link) => {
              if (link.id === "more-sidebar") {
                return (
                  <div
                    key={link.id}
                    onClick={() => handleMoreClick()} // 👈 your custom function
                    className={`height-[100%] justify-center cursor-pointer flex flex-col items-center text-xs transition-colors w-full ${selectedMore === true ? "text-primary bg-gray-50" : ""}`}
                  >
                    <link.icon className="w-5 h-5 mb-1" />
                    <span>{link.label}</span>
                  </div>
                );
              }
              return (
                <Link
                  key={link.id}
                  href={link.path}
                  className={`height-[100%] justify-center flex flex-col items-center text-xs transition-colors ${pathname.startsWith(link.path) && selectedMore === false ? "text-primary bg-white" : ""}`}
                >
                  <link.icon className="w-5 h-5 mb-1" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
