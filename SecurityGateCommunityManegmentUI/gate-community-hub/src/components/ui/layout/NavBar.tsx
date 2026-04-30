import { Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToggle";
import { RoleSwitcher } from "./RoleSwitcher";
import { LiveNotificationBell } from "./LiveNotificationBell";
import logoSvg from "@/assets/logo/neighborlyHub-Logo.png";
import { Sheet, SheetContent, SheetTrigger } from "../sheet";
import { navLinks } from "./SideNav";
import { useState } from "react";
import { SideNavItem } from "./SideNavItem";
import { GoogleLoginButton } from "../GoogleLoginButton";
import { useAuth } from "@/context/AuthContext";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();



  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        {/* Mobile menu button - only visible on small screens */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 md:hidden rounded-md hover:bg-muted">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-0">
            <div className="pt-12">
              {navLinks.map((link: { to: string; icon: React.ReactNode; iconActive: React.ReactNode; label: string }) => (
                <div key={link.to} onClick={() => setOpen(false)}>
                  <SideNavItem
                    to={link.to}
                    icon={link.icon}
                    iconActive={link.iconActive}
                    label={link.label}
                    collapsed={false}
                  />
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo - smaller on mobile */}
        <img 
          src={logoSvg} 
          alt="NeighborlyHub Logo" 
          className="h-6 md:h-9" 
        />
      </div>
      <div className="flex items-center gap-4">
        {isAuthenticated && <LiveNotificationBell />}
        <RoleSwitcher />
        <ThemeToggle />
        {/* Show Login button if logged out, else UserMenu */}
        {isAuthenticated ? (
          <UserMenu />
        ) : (
          <GoogleLoginButton />
        )}
      </div>
    </header>
  );
}