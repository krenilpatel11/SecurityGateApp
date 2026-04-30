import { useQuery } from '@tanstack/react-query';
import { getGateDashboard, getGateLogs } from '@/api/gate';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ShieldCheck, Users, Clock, Package, AlertTriangle,
  LogIn, LogOut, XCircle, TrendingUp, Activity,
} from 'lucide-react';

const ACTION_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  visitor_checkin:        { label: 'Visitor In',     color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',  icon: <LogIn className="w-3.5 h-3.5" /> },
  visitor_checkout:       { label: 'Visitor Out',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',    icon: <LogOut className="w-3.5 h-3.5" /> },
  visitor_denied:         { label: 'Denied',         color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',        icon: <XCircle className="w-3.5 h-3.5" /> },
  delivery_approved:      { label: 'Delivery ✓',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: <Package className="w-3.5 h-3.5" /> },
  delivery_rejected:      { label: 'Delivery ✗',    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', icon: <Package className="w-3.5 h-3.5" /> },
  delivery_left_at_gate:  { label: 'Left at Gate',  color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300', icon: <Package className="w-3.5 h-3.5" /> },
  staff_checkin:          { label: 'Staff In',       color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: <LogIn className="w-3.5 h-3.5" /> },
  staff_checkout:         { label: 'Staff Out',      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300', icon: <LogOut className="w-3.5 h-3.5" /> },
  sos_triggered:          { label: 'SOS!',           color: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',            icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function GateDashboardPage() {
  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['gate-dashboard'],
    queryFn: getGateDashboard,
    refetchInterval: 30000, // auto-refresh every 30s
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['gate-logs'],
    queryFn: () => getGateLogs({ limit: 30 }),
    refetchInterval: 15000,
  });

  const stats = dashboard?.today;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-green-600" /> Gate Security Dashboard
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" />
          Live — refreshes every 30s
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Visitors Today', value: stats?.visitorsToday, icon: <Users className="w-5 h-5 text-blue-500" />, color: 'text-blue-600' },
          { label: 'Active Inside', value: stats?.activeVisitors, icon: <LogIn className="w-5 h-5 text-green-500" />, color: 'text-green-600' },
          { label: 'Pending Approval', value: stats?.pendingVisitors, icon: <Clock className="w-5 h-5 text-yellow-500" />, color: 'text-yellow-600' },
          { label: 'Pending Deliveries', value: stats?.pendingDeliveries, icon: <Package className="w-5 h-5 text-orange-500" />, color: 'text-orange-600' },
          { label: 'Deliveries Done', value: stats?.approvedDeliveries, icon: <TrendingUp className="w-5 h-5 text-purple-500" />, color: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              {dashLoading ? <Skeleton className="h-8 w-12" /> : (
                <>
                  {s.icon}
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value ?? 0}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" /> Live Activity Feed
          </h2>
          {logsLoading ? (
            <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
          ) : !logsData?.logs.length ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No gate activity today</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y max-h-[480px] overflow-y-auto">
                {logsData.logs.map(log => {
                  const meta = ACTION_LABELS[log.action] ?? { label: log.action, color: 'bg-gray-100 text-gray-700', icon: null };
                  return (
                    <div key={log._id} className="flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${meta.color}`}>
                        {meta.icon} {meta.label}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{log.description}</p>
                        <p className="text-xs text-muted-foreground">
                          by {log.performedBy?.name ?? 'Guard'}{log.unit ? ` · Unit ${log.unit}` : ''}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(log.createdAt)}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Breakdown + Peak Hours */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Today's Breakdown</h2>
          {dashLoading ? <Skeleton className="h-48 w-full rounded-xl" /> : (
            <Card>
              <CardContent className="p-4 space-y-2">
                {dashboard?.actionBreakdown && Object.entries(dashboard.actionBreakdown).map(([action, count]) => {
                  const meta = ACTION_LABELS[action];
                  return (
                    <div key={action} className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${meta?.color ?? 'bg-gray-100 text-gray-600'}`}>
                        {meta?.icon} {meta?.label ?? action}
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
                {(!dashboard?.actionBreakdown || Object.keys(dashboard.actionBreakdown).length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No events today</p>
                )}
              </CardContent>
            </Card>
          )}

          <h2 className="text-lg font-semibold">Peak Hours (7 days)</h2>
          {dashLoading ? <Skeleton className="h-32 w-full rounded-xl" /> : (
            <Card>
              <CardContent className="p-4">
                {dashboard?.peakHours && dashboard.peakHours.length > 0 ? (
                  <div className="space-y-1">
                    {dashboard.peakHours.slice(0, 8).map(h => (
                      <div key={h.hour} className="flex items-center gap-2">
                        <span className="text-xs w-14 text-muted-foreground">
                          {h.hour.toString().padStart(2, '0')}:00
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${Math.min(100, (h.count / Math.max(...dashboard.peakHours.map(x => x.count))) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-6 text-right">{h.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
