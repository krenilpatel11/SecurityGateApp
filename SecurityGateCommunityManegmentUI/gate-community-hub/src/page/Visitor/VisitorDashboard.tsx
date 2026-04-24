import { getAllVisitors } from "@/api/visitor";
import { VisitorInviteForm } from "@/components/ui/visitor/VisitorInviteForm";
import { VisitorPreApprovedList } from "@/components/ui/visitor/VisitorPreApprovedList";
import { VisitorRecentList } from "@/components/ui/visitor/VisitorRecentList";
import { VisitorStatsCards } from "@/components/ui/visitor/VisitorStatsCards";
import { useQuery } from "@tanstack/react-query";

export default function VisitorDashboard() {
  // For stats, you can fetch all visitors and compute counts
  const { data: allVisitors } = useQuery({
    queryKey: ["allVisitors"],
    queryFn: () => getAllVisitors(),
  });

  const stats = {
    today: allVisitors?.length || 0,
    pending: allVisitors?.filter(v => v.status === "Pending").length || 0,
    active: allVisitors?.filter(v => v.status === "Active").length || 0,
  };

  return (
    <div className="max-w-md mx-auto p-2 space-y-4 md:max-w-lg">
      <div className="sticky top-0 z-10 bg-background pb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold">Visitor Dashboard</h1>
          <div className="flex items-center gap-2">
            {/* Notification and user avatar here */}
            <span className="relative">
              <span className="absolute -top-1 -right-1 bg-danger text-xs rounded-full px-1">2</span>
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </span>
            <img src="/avatar.jpg" alt="User" className="w-8 h-8 rounded-full" />
          </div>
        </div>
        <VisitorStatsCards stats={stats} />
      </div>
      <VisitorInviteForm />
      <VisitorPreApprovedList />
      <VisitorRecentList />
    </div>
  );
}
