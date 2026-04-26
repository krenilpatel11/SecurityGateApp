import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markRead, markAllRead, type AppNotification } from '@/api/notifications';
import { Bell, CheckCheck, Info, AlertTriangle, Package, Megaphone } from 'lucide-react';

const typeIcon: Record<string, React.ReactNode> = {
  sos: <AlertTriangle className="w-5 h-5 text-red-500" />,
  delivery: <Package className="w-5 h-5 text-blue-500" />,
  announcement: <Megaphone className="w-5 h-5 text-purple-500" />,
  default: <Info className="w-5 h-5 text-gray-400" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Bell className="w-10 h-10 mb-2" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => { if (!n.read) markReadMutation.mutate(n._id); }}
              className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                n.read
                  ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {typeIcon[n.type] ?? typeIcon.default}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
