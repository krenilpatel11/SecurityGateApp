import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getUpcomingVisitors } from "@/api/visitor";
import { UserPlus } from "lucide-react";

export function VisitorPreApprovedList() {
  const { data: visitors, isLoading } = useQuery({
    queryKey: ["upcomingVisitors"],
    queryFn: getUpcomingVisitors,
  });

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <UserPlus className="text-primary" />
        <span className="font-semibold">Pre-Approved Visitors</span>
        <span className="ml-auto text-xs text-muted-foreground">Today</span>
      </div>
      <div className="space-y-2">
        {isLoading
          ? <div className="text-muted-foreground">Loading...</div>
          : visitors?.map((v) => (
            <div key={v._id} className="flex items-center gap-2">
              <img src={v.photoUrl} alt={v.name} className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="font-medium">{v.name}</div>
                <div className="text-xs text-muted-foreground">{v.purpose} • {new Date(v.checkInTime ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <Badge variant={v.status === "Approved" ? "default" : "destructive"}>
                {v.status}
              </Badge>
            </div>
          ))}
      </div>
    </div>
  );
}
