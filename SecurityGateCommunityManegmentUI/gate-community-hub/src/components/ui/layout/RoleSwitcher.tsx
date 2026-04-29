import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ChevronDown, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const ALL_ROLES = [
  { value: null, label: "👑 Superuser View", color: "text-purple-600 dark:text-purple-400" },
  { value: "admin", label: "🛡️ Admin", color: "text-blue-600 dark:text-blue-400" },
  { value: "security", label: "🔒 Security", color: "text-green-600 dark:text-green-400" },
  { value: "resident", label: "🏠 Resident", color: "text-orange-600 dark:text-orange-400" },
  { value: "staff", label: "👷 Staff", color: "text-yellow-600 dark:text-yellow-400" },
] as const;

export function RoleSwitcher() {
  const { isSuperuser, effectiveRole, switchRole, isSwitchingRole } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isSuperuser) return null;

  const current = ALL_ROLES.find(r => r.value === (effectiveRole === "superuser" ? null : effectiveRole));
  const currentLabel = current?.label ?? "👑 Superuser View";
  const currentColor = current?.color ?? "text-purple-600 dark:text-purple-400";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={isSwitchingRole}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-400 dark:border-purple-600 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium"
        title="Switch active role (Superuser only)"
      >
        {isSwitchingRole ? (
          <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-purple-500" />
        )}
        <span className={currentColor}>{currentLabel}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Act as role</p>
          </div>
          {ALL_ROLES.map(role => (
            <button
              key={String(role.value)}
              onClick={async () => {
                setOpen(false);
                await switchRole(role.value);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2 ${
                (effectiveRole === "superuser" ? null : effectiveRole) === role.value
                  ? "bg-muted font-semibold"
                  : ""
              }`}
            >
              <span className={role.color}>{role.label}</span>
              {(effectiveRole === "superuser" ? null : effectiveRole) === role.value && (
                <span className="ml-auto text-xs text-muted-foreground">active</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
