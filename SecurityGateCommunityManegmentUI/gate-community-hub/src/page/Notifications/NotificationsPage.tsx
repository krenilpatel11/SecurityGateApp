import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markRead, markAllRead, type AppNotification } from '@/api/notifications';
import { Bell, CheckCheck, AlertTriangle, Package, Megaphone, Info, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  sos: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-500 bg-red-50 dark:bg-red-950' },
  delivery: { icon: <Package className="w-4 h-4" />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
  announcement: { icon: <Megaphone className="w-4 h-4" />, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
  visitor: { icon: <Users className="w-4 h-4" />, color: 'text-green-500 bg-green-50 dark:bg-green-950' },
  payment: { icon: <Package className="w-4 h-4" />, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950' },
  complaint: { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950' },
  default: { icon: <Info className="w-4 h-4" />, color: 'text-gray-500 bg-gray-50 dark:bg-gray-900' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function groupByDate(notifications: AppNotification[]) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);
  const groups: Record<string, AppNotification[]> = { Today: [], Yesterday: [], Earlier: [] };
  for (const n of notifications) {
    const d = new Date(n.createdAt); d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups.Today.push(n);
    else if (d.getTime() === yesterday.getTime()) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  }
  return groups;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const groups = groupByDate(notifications);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" /> Notifications
          {unreadCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>}
        </h1>
        {unreadCount > 0 && (
          <Button variant="outline" className="flex items-center gap-2 text-sm" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium">You're all caught up! 🎉</p>
            <p className="text-sm text-muted-foreground mt-1">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(groups).map(([group, items]) => items.length === 0 ? null : (
          <div key={group}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{group}</h2>
            <Card>
              <CardContent className="p-0 divide-y">
                {items.map(n => {
                  const cfg = typeConfig[n.type] ?? typeConfig.default;
                  return (
                    <div
                      key={n._id}
                      className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                      onClick={() => !n.read && markReadMutation.mutate(n._id)}
                    >
                      <div className={`p-2 rounded-full flex-shrink-0 ${cfg.color}`}>{cfg.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!n.read ? 'font-medium' : 'text-muted-foreground'}`}>{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}
