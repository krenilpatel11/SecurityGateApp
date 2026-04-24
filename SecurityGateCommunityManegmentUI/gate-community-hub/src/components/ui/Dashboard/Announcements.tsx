import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MdCampaign, MdGrass, MdEventAvailable, MdNotifications, MdEvent, MdInfo } from "react-icons/md";
import { Skeleton } from "../skeleton";
import { formatDistanceToNow } from "date-fns";
import type { ReactNode } from "react";
import type { Event, Notification } from "@/types/resident";


interface AnnouncementsProps {
  notifications?: Notification[];
  events?: Event[];
}

// Map for icon types
const getIconForType = (type: string): ReactNode => {
  switch (type?.toLowerCase()) {
    case "maintenance":
      return <MdCampaign className="text-primary" size={28} />;
    case "landscaping":
      return <MdGrass className="text-accent" size={28} />;
    case "event":
      return <MdEvent className="text-success" size={28} />;
    case "notification":
      return <MdNotifications className="text-primary" size={28} />;
    default:
      return <MdInfo className="text-secondary" size={28} />;
  }
};

// Map for background colors
const getColorForType = (type: string): string => {
  switch (type?.toLowerCase()) {
    case "maintenance":
      return "#E0F2FE"; // light blue
    case "landscaping":
      return "#F0F4FF"; // light indigo
    case "event":
      return "#ECFDF5"; // light green
    case "notification":
      return "#E0F2FE"; // light blue
    default:
      return "#F3F4F6"; // light gray
  }
};

// Process and combine notifications and events
const processAnnouncements = (notifications: Notification[] = [], events: Event[] = []) => {
  // Convert notifications
  const processedNotifications = notifications.map(n => ({
    id: n.id,
    title: n.title,
    desc: n.description,
    time: formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }),
    type: n.type,
    icon: getIconForType(n.type),
    color: n.type,
  }));

  // Convert events
  const processedEvents = events.map(e => ({
    id: e.id,
    title: e.title,
    desc: e.description,
    time: formatDistanceToNow(new Date(e.createdAt), { addSuffix: true }),
    type: "event",
    icon: getIconForType("event"),
    color: "event",
  }));

  // Combine, sort by date (newest first), and limit to 3
  return [...processedNotifications, ...processedEvents]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 3);
};

export function Announcements({ notifications = [], events = [] }: AnnouncementsProps) {
  // Use fallback data if props are empty (for development)
  const announcements = notifications.length || events.length
    ? processAnnouncements(notifications, events)
    : [
        {
          id: "1",
          icon: <MdCampaign className="text-primary" size={28} />,
          title: "Pool Maintenance Schedule",
          desc: "The community pool will be closed for maintenance on July 15th from 8am to 12pm.",
          time: "2 days ago",
          color: "primary",
        },
        {
          id: "2",
          icon: <MdGrass className="text-accent" size={28} />,
          title: "Landscaping Updates",
          desc: "New landscaping will be installed in the central garden area starting next Monday.",
          time: "1 week ago",
          color: "accent",
        },
        {
          id: "3",
          icon: <MdEventAvailable className="text-success" size={28} />,
          title: "Summer BBQ Event",
          desc: "Join us for the annual community BBQ on July 20th at the main pavilion.",
          time: "2 weeks ago",
          color: "success",
        },
      ];

  return (
    <Card className="mb-4 md:mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="font-semibold text-lg">Community Announcements</h3>
        <a href="/announcements" className="text-primary text-sm font-medium hover:underline">
          View All
        </a>
      </CardHeader>
      <hr className="border-t border-muted mx-4" />
      <CardContent className="flex flex-col gap-4">
        {announcements.map((a, i) => (
          <div key={a.id || i} className="flex flex-col">
            <div className="flex items-start gap-4">
              <div
                className="rounded-full flex items-center justify-center w-12 h-12 mt-1"
                style={{
                  backgroundColor: getColorForType(a.color),
                }}
              >
                {a.icon}
              </div>
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-muted-foreground text-sm">{a.desc}</div>
                <div className="text-xs text-muted-foreground mt-1">{a.time}</div>
              </div>
            </div>
            {i < announcements.length - 1 && (
              <hr className="border-t border-muted my-4 mx-2" />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AnnouncementsSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-12 h-12 rounded-full mt-1" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-64 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}