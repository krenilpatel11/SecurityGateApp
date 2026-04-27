import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@radix-ui/react-menubar";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [, setOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-2 cursor-pointer select-none">
      <img
        src={user?.avatar || "/avatar-placeholder.png"}
        alt={user?.email || "User"}
        className="w-8 h-8 rounded-full border"
      />
      {/* Only show name on larger screens */}
      <span className="font-medium hidden md:block">{user?.name}</span>
      
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
            {/* Show user details in dropdown for mobile */}
            <div className="px-4 py-2 border-b mb-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{user?.email}</p>
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