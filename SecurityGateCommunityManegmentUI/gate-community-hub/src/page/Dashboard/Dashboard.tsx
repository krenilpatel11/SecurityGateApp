
import { fetchDashboardData } from "@/api/resident";
import { Card, CardContent } from "@/components/ui/card";
import { AccountDetails, AccountDetailsSkeleton } from "@/components/ui/Dashboard/AccountDetails";
import { Announcements, AnnouncementsSkeleton } from "@/components/ui/Dashboard/Announcements";
import { RecentActivity, RecentActivitySkeleton } from "@/components/ui/Dashboard/RecentActivity";
import { StatsCards, StatsCardsSkeleton } from "@/components/ui/Dashboard/StatsCards";
import { WelcomeBanner } from "@/components/ui/Dashboard/WelcomeBanner";
import type { DashboardData } from "@/types/resident";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
  });

  if (isLoading)
    return (
      <>
       <Card className="mb-4 md:mb-6 space-y-6">
        <CardContent className="p-6">
        <StatsCardsSkeleton />
          </CardContent>
        </Card> 
          <AnnouncementsSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <AccountDetailsSkeleton />
          <RecentActivitySkeleton />
        </div>
      </>
    );
    
      if (error || !data) return <div>Error loading dashboard.</div>;

  return (
  <>
  <Card className="mb-4 md:mb-6 space-y-6">
    <CardContent className="p-6">
      <WelcomeBanner />
      <StatsCards
        stats={[
          { label: "Visitor Passes", value: String(data.quickActions.visitorPasses), type: "visitor" },
          { label: "Payment Status", value: String(data.quickActions.paymentStatus), type: "payment" },
          { label: "Upcoming Events", value: String(data.quickActions.upcomingEvents), type: "event" },
        ]}
      />
    </CardContent>
  </Card>
      <Announcements notifications={data.notifications} events={data.events}/>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <AccountDetails/>
        <RecentActivity notifications={data.notifications}/>
      </div>
    </>
  );
}
