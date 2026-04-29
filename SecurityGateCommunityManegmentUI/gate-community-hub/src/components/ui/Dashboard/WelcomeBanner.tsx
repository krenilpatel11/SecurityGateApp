import { useAuth } from "@/context/AuthContext";
import { Badge } from "../badge";
import { Crown, ShieldCheck } from "lucide-react";

const ROLE_GREETING: Record<string, string> = {
  superuser: "Full platform access enabled",
  admin:     "Managing your community",
  security:  "On duty — gate monitoring active",
  resident:  "Here's what's happening in your community today",
  staff:     "Ready to assist residents today",
};

export function WelcomeBanner() {
  const { user, isSuperuser, effectiveRole } = useAuth();
  const displayRole = effectiveRole ?? user?.role ?? "resident";
  const greeting = ROLE_GREETING[displayRole] ?? ROLE_GREETING["resident"];

  return (
    <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Welcome back, {user?.name || "User"}!
          {isSuperuser && <Crown className="w-5 h-5 text-purple-500" />}
        </h2>
        <p className="text-muted-foreground">{greeting}</p>
        {isSuperuser && effectiveRole && effectiveRole !== "superuser" && (
          <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Acting as <strong className="capitalize">{effectiveRole}</strong> — use the role switcher in the navbar to change
          </p>
        )}
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs text-muted-foreground">
          Last login: Today
        </span>
        {isSuperuser ? (
          <Badge className="mt-1 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            👑 Superuser
          </Badge>
        ) : (
          <Badge variant="secondary" className="mt-1 capitalize">
            {user?.role ?? "resident"}
          </Badge>
        )}
      </div>
    </section>
  );
}
