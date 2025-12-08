"use client";
import { AgentHeader } from "@/components/Agent/Common/AgentHeader";
import { AgentSidebar } from "@/components/Agent/Common/AgentSidebar";
import { useAuth } from "@/context/AuthContext";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import {
  Calendar,
  CalendarIcon,
  LayoutDashboard,
  Loader,
  MoreVertical,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AgentLayout({ children }: LayoutProps) {
  const { loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const sideBarRef = useRef<HTMLDivElement>(null);

  const footerLinks = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/agent/dashboard",
    },

    {
      id: "properties",
      label: "Properties",
      icon: BuildingOfficeIcon,
      path: "/agent/properties",
    },
    {
      id: "customers",
      label: "Customers",
      icon: Calendar,
      path: "/agent/customers",
    },
    {
      id: "meetings",
      label: "Meetings",
      icon: CalendarIcon,
      path: "/agent/meetings",
    },
    {
      id: "more",
      label: "More",
      icon: MoreVertical,
      path: "",
    },
  ];

  const handleMoreClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMouseDownEvent = (e: MouseEvent) => {
    if (sideBarRef.current && !sideBarRef.current.contains(e.target as Node)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDownEvent);
    return () => {
      document.removeEventListener("mousedown", handleMouseDownEvent);
    };
  }, []);

  const isPropertyDetailPage =
    pathname.startsWith("/agent/properties/") && pathname.split("/").length > 3;

  const isMessagesPage = pathname.includes("/messages");

  const isConditionalPage = isPropertyDetailPage || isMessagesPage;

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
      <AgentSidebar
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false);
        }}
        ref={sideBarRef}
      />

      <div className="flex-1 flex flex-col">
        {!isMessagesPage && (
          <AgentHeader onMenuButtonClick={() => setIsSidebarOpen(true)} />
        )}
        <main
          className={`flex-1 ${!isConditionalPage ? "p-2" : ""} md:p-6 ${
            !isMessagesPage && "mb-12"
          }`}
        >
          {children}
        </main>

        {/* Footer Links */}
        <div className="fixed bottom-0 left-0 w-full h-[50px] md:hidden bg-primary">
          <div className="grid grid-cols-5 h-[100%] gap-2 text-white">
            {footerLinks.map((link) =>
              link.id === "more" ? (
                <div
                  key={link.id}
                  onClick={() => handleMoreClick()}
                  className={`h-[100%] justify-center flex flex-col items-center text-xs transition-colors cursor-pointer ${
                    !pathname.startsWith("/agent/dashboard") &&
                    !pathname.startsWith("/agent/properties") &&
                    !pathname.startsWith("/agent/customers") &&
                    !pathname.startsWith("/agent/meetings")
                      ? "bg-white text-primary"
                      : ""
                  }`}
                >
                  <link.icon className="w-5 h-5 mb-1" />
                  <span>{link.label}</span>
                </div>
              ) : (
                <Link
                  key={link.id}
                  href={link.path}
                  className={`h-[100%] justify-center flex flex-col items-center text-xs transition-colors
                   ${
                     pathname.startsWith(link.path)
                       ? "bg-white text-primary"
                       : ""
                   }`}
                >
                  <link.icon className="w-5 h-5 mb-1" />
                  <span>{link.label}</span>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
