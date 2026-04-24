import { useAuth } from "@/context/AuthContext";
import { Badge } from "../badge";

export function WelcomeBanner() {
  const { user } = useAuth();
  return (
    <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {user?.name || "John"}!</h2>
        <p className="text-muted-foreground">Here's what's happening in your community today</p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-xs text-muted-foreground">
          Last login: Today, 9:45 AM
        </span>
        <Badge variant="secondary" className="mt-1">
          Resident ID: #{user?.residentId || "12345"}
        </Badge>
      </div>
    </section>
  );
}
