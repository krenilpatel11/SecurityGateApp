import { useState, useCallback } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { useSocket, GateEvent, BroadcastNotification, LockdownState } from '../../../hooks/useSocket';
import { cn } from '../../../lib/utils';

interface NotificationItem {
  id: string;
  type: 'gate' | 'lockdown' | 'info' | 'broadcast';
  message: string;
  timestamp: Date;
  read: boolean;
}

interface LiveNotificationBellProps {
  onLockdownChange?: (state: LockdownState) => void;
}

export function LiveNotificationBell({ onLockdownChange }: LiveNotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'read'>) => {
    setNotifications((prev) => [
      { ...item, id: `${Date.now()}-${Math.random()}`, read: false },
      ...prev.slice(0, 49), // keep max 50
    ]);
  }, []);

  useSocket({
    onGateEvent: useCallback((e: GateEvent) => {
      addNotification({ type: 'gate', message: e.message, timestamp: new Date(e.timestamp) });
    }, [addNotification]),
    onLockdownActivated: useCallback((s: LockdownState & { message: string }) => {
      addNotification({ type: 'lockdown', message: s.message, timestamp: new Date() });
      onLockdownChange?.({ active: true, activatedBy: s.activatedBy, activatedAt: s.activatedAt });
    }, [addNotification, onLockdownChange]),
    onLockdownDeactivated: useCallback((s: LockdownState & { message: string }) => {
      addNotification({ type: 'info', message: s.message, timestamp: new Date() });
      onLockdownChange?.({ active: false, activatedBy: null, activatedAt: null });
    }, [addNotification, onLockdownChange]),
    onNotification: useCallback((n: BroadcastNotification) => {
      addNotification({ type: 'broadcast', message: n.message, timestamp: new Date(n.timestamp) });
    }, [addNotification]),
  });

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const iconFor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'lockdown': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'gate': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open) markAllRead(); }}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 max-h-[420px] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">Live Notifications</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-4 h-4" />
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</div>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0',
                    !n.read && 'bg-blue-50 dark:bg-blue-950/30',
                    n.type === 'lockdown' && 'bg-red-50 dark:bg-red-950/30',
                  )}
                >
                  <div className="mt-0.5 shrink-0">{iconFor(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 dark:text-gray-200 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {n.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <button onClick={() => dismiss(n.id)} className="text-gray-300 hover:text-gray-500 shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
