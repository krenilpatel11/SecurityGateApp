import { useState } from "react";
import { ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@radix-ui/react-menubar";

const ROLE_BADGE: Record<string, { label: string; className: string }> = {
  superuser: { label: "Superuser", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
  admin:     { label: "Admin",     className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  security:  { label: "Security",  className: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  resident:  { label: "Resident",  className: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" },
  staff:     { label: "Staff",     className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
};

export function UserMenu() {
  const { user, logout, isSuperuser, effectiveRole } = useAuth();
  const [, setOpen] = useState(false);

  const displayRole = isSuperuser && effectiveRole && effectiveRole !== "superuser"
    ? effectiveRole
    : (user?.role ?? "");
  const badge = ROLE_BADGE[displayRole] ?? ROLE_BADGE[user?.role ?? ""] ?? { label: user?.role ?? "", className: "" };

  return (
    <div className="relative flex items-center gap-2 cursor-pointer select-none">
      <div className="relative">
        <img
          src={user?.avatar || "/avatar-placeholder.png"}
          alt={user?.email || "User"}
          className="w-8 h-8 rounded-full border"
        />
        {isSuperuser && (
          <span className="absolute -bottom-1 -right-1 bg-purple-500 rounded-full p-0.5">
            <ShieldCheck className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>
      {/* Only show name on larger screens */}
      <div className="hidden md:flex flex-col items-start leading-tight">
        <span className="font-medium text-sm">{user?.name}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${badge.className}`}>
          {isSuperuser && effectiveRole && effectiveRole !== "superuser"
            ? `Acting as ${badge.label}`
            : badge.label}
        </span>
      </div>

      <Menubar>
        <MenubarMenu>
          <MenubarTrigger className="flex items-center gap-1">
            <ChevronDown className="w-4 h-4" />
          </MenubarTrigger>
          <MenubarContent
            align="end"
            sideOffset={16}
            className="w-56 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-lg"
          >
            {/* User details */}
            <div className="px-4 py-2 border-b mb-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
              <span className={`inline-block mt-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${badge.className}`}>
                {badge.label}
              </span>
              {isSuperuser && effectiveRole && effectiveRole !== "superuser" && (
                <p className="text-xs text-purple-500 mt-1">Acting as: {effectiveRole}</p>
              )}
            </div>

            <MenubarItem
              className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
}
