import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MdBadge, MdCheckCircle, MdPerson, MdReport, MdNotifications, MdEvent, MdPayments } from "react-icons/md";
import { Skeleton } from "../skeleton";
import { formatDistanceToNow } from "date-fns";
import type { ReactNode } from "react";

// Define interface for notifications from API
export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  type: string;
  createdAt: string;
}

interface RecentActivityProps {
  notifications?: ActivityItem[];
}

// Map activity types to icons
const getIconForType = (type: string): ReactNode => {
  switch (type?.toLowerCase()) {
    case "payment":
      return <MdPayments className="text-success" />;
    case "visitor":
      return <MdBadge className="text-accent" />;
    case "profile":
      return <MdPerson className="text-primary" />;
    case "maintenance":
      return <MdReport className="text-danger" />;
    case "event":
      return <MdEvent className="text-warning" />;
    case "notification":
      return <MdNotifications className="text-info" />;
    default:
      return <MdCheckCircle className="text-muted-foreground" />;
  }
};

// Fallback activities for development/testing
const defaultActivities = [
  {
    id: "1",
    type: "visitor",
    description: "Visitor pass created",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: "2",
    type: "payment",
    description: "Monthly fee payment",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "3",
    type: "profile",
    description: "Profile updated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: "4",
    type: "maintenance",
    description: "Maintenance request submitted",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
  },
];

export function RecentActivity({ notifications = [] }: RecentActivityProps) {
  // Process notifications from API or use fallback data
  const activities = notifications.length ? 
    notifications.map(item => ({
      id: item.id,
      icon: getIconForType(item.type),
      desc: item.description || item.title,
      time: formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }),
      type: item.type
    }))
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 4) : 
    defaultActivities.map(item => ({
      id: item.id,
      icon: getIconForType(item.type),
      desc: item.description,
      time: formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }),
      type: item.type
    }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="font-semibold text-lg">Recent Activity</h3>
        <a href="/activity" className="text-primary text-sm font-medium hover:underline">
          View All
        </a>
      </CardHeader>
      <div className="border-b border-muted -mt-2" />
      <CardContent className="flex flex-col gap-3">
        {activities.map((a, i) => (
          <div key={a.id || i}>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted p-3 flex items-center justify-center">
                {a.icon}
              </div>
              <div>
                <div className="text-sm">{a.desc}</div>
                <div className="text-xs text-muted-foreground">{a.time}</div>
              </div>
            </div>
            {i < activities.length - 1 && (
              <div className="border-b border-muted mt-3" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentActivitySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}