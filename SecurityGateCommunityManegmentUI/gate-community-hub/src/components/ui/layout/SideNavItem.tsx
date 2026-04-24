import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils"; // ShadCN utility for classnames
import type { ReactNode } from "react";

interface SideNavItemProps {
  to: string;
  icon: ReactNode;
  iconActive: ReactNode;
  label: string;
  collapsed?: boolean;
}

export function SideNavItem({ to, icon, iconActive, label, collapsed = false }: SideNavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-3 rounded-lg transition-colors font-medium",
        collapsed ? "justify-center px-2 py-3" : "px-4 py-2",
        isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-primary/5 hover:text-primary text-muted-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={cn(
          "text-xl transition-colors",
          isActive
            ? "text-primary"
            : "group-hover:text-primary text-muted-foreground"
        )}
      >
        {isActive ? iconActive : icon}
      </span>
      
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}