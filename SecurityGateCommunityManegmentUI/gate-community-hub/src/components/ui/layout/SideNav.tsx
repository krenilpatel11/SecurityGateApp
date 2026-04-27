import { useState } from "react";
import {
  MdDashboard,
  MdOutlineDashboard,
  MdCampaign,
  MdMailOutline,
  MdPayments,
  MdOutlinePayments,
  MdPerson,
  MdPersonOutline,
  MdChevronLeft,
  MdPeopleOutline,
  MdPeople,
  MdLocalShipping,
  MdOutlineLocalShipping,
} from "react-icons/md";
import { ShieldCheck, Users, MessageSquareWarning, AlertTriangle, Building2, CalendarDays, Bell } from "lucide-react";
import { SideNavItem } from "./SideNavItem";
import { Card } from "../card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";

// eslint-disable-next-line react-refresh/only-export-components
export const navLinks: { to: string; icon: React.ReactNode; iconActive: React.ReactNode; label: string }[] = [
  { to: "/dashboard", icon: <MdOutlineDashboard />, iconActive: <MdDashboard />, label: "Dashboard" },
  { to: "/visitor", icon: <MdPeopleOutline />, iconActive: <MdPeople />, label: "Visitors" },
  { to: "/delivery", icon: <MdOutlineLocalShipping />, iconActive: <MdLocalShipping />, label: "Deliveries" },
  { to: "/announcements", icon: <MdMailOutline />, iconActive: <MdCampaign />, label: "Announcements" },
  { to: "/community", icon: <CalendarDays className="w-5 h-5" />, iconActive: <CalendarDays className="w-5 h-5" />, label: "Community" },
  { to: "/payments", icon: <MdOutlinePayments />, iconActive: <MdPayments />, label: "Payments" },
  { to: "/amenities", icon: <Building2 className="w-5 h-5" />, iconActive: <Building2 className="w-5 h-5" />, label: "Amenities" },
  { to: "/complaints", icon: <MessageSquareWarning className="w-5 h-5" />, iconActive: <MessageSquareWarning className="w-5 h-5" />, label: "Complaints" },
  { to: "/sos", icon: <AlertTriangle className="w-5 h-5 text-red-500" />, iconActive: <AlertTriangle className="w-5 h-5 text-red-600" />, label: "SOS" },
  { to: "/staff", icon: <Users className="w-5 h-5" />, iconActive: <Users className="w-5 h-5" />, label: "Staff" },
  { to: "/admin", icon: <ShieldCheck className="w-5 h-5" />, iconActive: <ShieldCheck className="w-5 h-5" />, label: "Admin" },
  { to: "/notifications", icon: <Bell className="w-5 h-5" />, iconActive: <Bell className="w-5 h-5" />, label: "Notifications" },
  { to: "/profile", icon: <MdPersonOutline />, iconActive: <MdPerson />, label: "Profile" },
];

export function SideNav() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <Card 
      className={cn(
        "py-2 px-2 flex flex-col gap-2 my-6 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        "hidden md:flex" // Hide on mobile, show on md screens and up
      )}
    >
      <div className={cn(
        "flex items-center justify-between py-2",
        collapsed ? "mx-auto" : "px-4"
      )}>
        {!collapsed && (
          <div className="text-md font-semibold text-muted-foreground tracking-wide">
            Navigation
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "rounded-md hover:bg-muted transition-colors",
            collapsed && "flex items-center justify-center w-8 h-8"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <MdChevronLeft className="h-5 w-5 mx-auto rotate-180" />
          ) : (
            <MdChevronLeft className="h-5 w-5 mx-auto" />
          )}
        </button>
      </div>
      
      {!collapsed && (
        <div className="px-2 pb-2">
          <div className="border-b" />
        </div>
      )}
      
      <TooltipProvider>
        <div className="space-y-1">
          {navLinks.map((link) => (
            collapsed ? (
              <Tooltip key={link.to} delayDuration={300}>
                <TooltipTrigger asChild>
                  <div>
                  <SideNavItem 
                    to={link.to} 
                    icon={link.icon} 
                    iconActive={link.iconActive} 
                    label={link.label} 
                    collapsed={true} 
                  />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-card border-border shadow-md text-black">
                  {link.label}
                </TooltipContent>

              </Tooltip>
            ) : (
              <SideNavItem 
                key={link.to} 
                to={link.to} 
                icon={link.icon} 
                iconActive={link.iconActive} 
                label={link.label} 
                collapsed={false} 
              />
            )
          ))}
        </div>
      </TooltipProvider>
    </Card>
  );
}