import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "@/api/resident";
import { getAnnouncements } from "@/api/announcements";
import type { DashboardData } from "@/types/resident";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WelcomeBanner } from "@/components/ui/Dashboard/WelcomeBanner";
import { AccountDetails } from "@/components/ui/Dashboard/AccountDetails";
import { useNavigate } from "react-router-dom";
import {
  Users, CreditCard, CalendarDays, MessageSquareWarning,
  Bell, Building2, ChevronRight, Megaphone, MapPin, Clock
} from "lucide-react";

function QuickActionBtn({ icon, label, to, color }: { icon: React.ReactNode; label: string; to: string; color: string }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:shadow-md transition-all group ${color}`}
    >
      <div className="p-2 rounded-lg bg-background group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
    </button>
  );
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["dashboardData"],
    queryFn: fetchDashboardData,
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  });

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-3"><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /><Skeleton className="h-28 rounded-xl" /></div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-48 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>
    </div>
  );

  if (error || !data) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Error loading dashboard. Please refresh.</p>
    </div>
  );

  const paymentPending = data.quickActions.paymentStatus === "Pending";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Visitor Passes</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{data.quickActions.visitorPasses}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active / Upcoming</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl"><Users className="w-6 h-6 text-blue-600 dark:text-blue-300" /></div>
          </CardContent>
        </Card>

        <Card className={`border-none ${paymentPending ? "bg-red-50 dark:bg-red-950/30" : "bg-green-50 dark:bg-green-950/30"}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${paymentPending ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>Payment Status</p>
              <p className={`text-3xl font-bold ${paymentPending ? "text-red-900 dark:text-red-100" : "text-green-900 dark:text-green-100"}`}>{data.quickActions.paymentStatus}</p>
              <p className={`text-xs mt-1 ${paymentPending ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>{paymentPending ? "Payment due" : "All clear"}</p>
            </div>
            <div className={`p-3 rounded-xl ${paymentPending ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"}`}>
              <CreditCard className={`w-6 h-6 ${paymentPending ? "text-red-600 dark:text-red-300" : "text-green-600 dark:text-green-300"}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950/30 border-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Upcoming Events</p>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{data.quickActions.upcomingEvents}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">In the community</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl"><CalendarDays className="w-6 h-6 text-purple-600 dark:text-purple-300" /></div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="font-semibold text-base">Quick Actions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <QuickActionBtn icon={<Users className="w-5 h-5 text-blue-600" />} label="Visitors" to="/visitor" color="hover:border-blue-200" />
            <QuickActionBtn icon={<CreditCard className="w-5 h-5 text-green-600" />} label="Payments" to="/payments" color="hover:border-green-200" />
            <QuickActionBtn icon={<MessageSquareWarning className="w-5 h-5 text-orange-600" />} label="Complaints" to="/complaints" color="hover:border-orange-200" />
            <QuickActionBtn icon={<CalendarDays className="w-5 h-5 text-purple-600" />} label="Community" to="/community" color="hover:border-purple-200" />
            <QuickActionBtn icon={<Building2 className="w-5 h-5 text-teal-600" />} label="Amenities" to="/amenities" color="hover:border-teal-200" />
            <QuickActionBtn icon={<Bell className="w-5 h-5 text-red-600" />} label="Notifications" to="/notifications" color="hover:border-red-200" />
          </div>
        </CardContent>
      </Card>

      {/* Announcements + Events Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h2 className="font-semibold text-base flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> Announcements</h2>
            <a href="/announcements" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></a>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No announcements yet.</p>
            ) : announcements.slice(0, 3).map((a: { _id: string; title: string; content: string; createdAt: string; isPinned?: boolean }) => (
              <div key={a._id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium leading-tight">{a.title}{a.isPinned && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Pinned</span>}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.content}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <h2 className="font-semibold text-base flex items-center gap-2"><CalendarDays className="w-4 h-4 text-purple-600" /> Upcoming Events</h2>
            <a href="/community" className="text-xs text-primary hover:underline flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></a>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.events.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming events.</p>
            ) : data.events.map(e => (
              <div key={e.id} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300">{new Date(e.date).toLocaleDateString("en", { month: "short" })}</span>
                  <span className="text-sm font-bold text-purple-900 dark:text-purple-100">{new Date(e.date).getDate()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{e.location}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(e.date).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <AccountDetails />
    </div>
  );
}
