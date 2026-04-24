import { 
  Home, Calendar, CreditCard, User, Settings, LifeBuoy, Megaphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavLink {
  to: string;
  icon: LucideIcon;
  label: string;
}

export const navLinks: NavLink[] = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/announcements", icon: Megaphone, label: "Announcements" },
  { to: "/events", icon: Calendar, label: "Events" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
  { to: "/account", icon: User, label: "Account" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/support", icon: LifeBuoy, label: "Support" },
];