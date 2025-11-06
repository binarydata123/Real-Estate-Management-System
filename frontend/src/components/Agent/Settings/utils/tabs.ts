import {
  BuildingOfficeIcon,
  BellIcon,
  PaintBrushIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Shield } from "lucide-react";
export const tabs = [
  { id: "agency", name: "Agency Settings", icon: BuildingOfficeIcon },
  { id: "team", name: "Team Management", icon: UsersIcon },
  { id: "branding", name: "Branding", icon: PaintBrushIcon },
  { id: "notifications", name: "Notifications", icon: BellIcon },
  { id: "security", name: "Security", icon: Shield },
];
