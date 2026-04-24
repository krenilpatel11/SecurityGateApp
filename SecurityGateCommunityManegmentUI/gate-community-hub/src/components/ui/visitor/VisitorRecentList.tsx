import { useQuery } from "@tanstack/react-query";
import { getVisitorHistory } from "@/api/visitor";

export function VisitorRecentList() {
  const { data: visitors, isLoading } = useQuery({
    queryKey: ["visitorHistory"],
    queryFn: getVisitorHistory,
  });

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold">Recent Visitors</span>
        <span className="ml-auto text-xs text-muted-foreground">View All</span>
      </div>
      <div className="space-y-2">
        {isLoading
          ? <div className="text-muted-foreground">Loading...</div>
          : visitors?.slice(0, 3).map((v) => (
            <div key={v._id} className="flex items-center gap-2">
              <img src={v.photoUrl} alt={v.name} className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="font-medium">{v.name}</div>
                <div className="text-xs text-muted-foreground">
                  Checked out • {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="text-success text-xs font-medium">Completed</div>
            </div>
          ))}
      </div>
    </div>
  );
}
