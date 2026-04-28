import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSOSAlerts, triggerSOS, resolveSOS, type SOSAlert } from '@/api/sos';
import { AlertTriangle, CheckCircle, X, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function timeElapsed(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SOSPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isResident = user?.role === 'resident';
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');

  const { data: alerts = [], isLoading } = useQuery<SOSAlert[]>({
    queryKey: ['sos-alerts'],
    queryFn: getSOSAlerts,
    refetchInterval: 15000,
  });

  const triggerMutation = useMutation({
    mutationFn: () => triggerSOS(message || undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['sos-alerts'] }); setShowConfirm(false); setMessage(''); },
  });

  const resolveMutation = useMutation({
    mutationFn: resolveSOS,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sos-alerts'] }),
  });

  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const resolvedAlerts = alerts.filter(a => a.status === 'Resolved');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-red-500" /> Emergency SOS
      </h1>

      {/* Resident: SOS Trigger Button */}
      {isResident && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">Press the button below in case of an emergency. Security will be notified immediately.</p>
            <button
              onClick={() => setShowConfirm(true)}
              className="relative w-40 h-40 mx-auto rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-lg shadow-lg transition-all flex flex-col items-center justify-center gap-2 animate-pulse hover:animate-none"
            >
              <AlertTriangle className="w-10 h-10" />
              <span>SOS</span>
              <span className="text-xs font-normal">EMERGENCY</span>
            </button>
            <p className="text-xs text-muted-foreground">Only use in genuine emergencies.</p>
          </CardContent>
        </Card>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-sm mx-4 border-red-300">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-red-600 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Confirm SOS</h2>
                <button onClick={() => setShowConfirm(false)}><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground">Are you sure you want to trigger an emergency alert? Security will be notified immediately.</p>
              <textarea
                className="w-full border rounded-lg px-3 py-2 bg-background text-sm resize-none"
                rows={2}
                placeholder="Describe the emergency (optional)"
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>Cancel</Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={() => triggerMutation.mutate()} disabled={triggerMutation.isPending}>
                  {triggerMutation.isPending ? 'Sending...' : '🚨 Trigger SOS'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Active Alerts ({activeAlerts.length})
          </h2>
          <div className="space-y-3">
            {activeAlerts.map(a => (
              <Card key={a._id} className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-800 dark:text-red-200">{a.raisedBy?.name ?? 'Unknown'} — Unit {a.unit}</p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{a.message}</p>
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" />{timeElapsed(a.createdAt)}</p>
                      </div>
                    </div>
                    {!isResident && (
                      <Button className="bg-green-500 hover:bg-green-600 text-white text-xs flex-shrink-0 flex items-center gap-1" onClick={() => resolveMutation.mutate(a._id)} disabled={resolveMutation.isPending}>
                        <CheckCircle className="w-3 h-3" /> Resolve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>}

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Resolved Alerts</h2>
          <div className="space-y-2">
            {resolvedAlerts.map(a => (
              <Card key={a._id} className="opacity-60">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{a.raisedBy?.name ?? 'Unknown'} — Unit {a.unit}</p>
                      <p className="text-xs text-muted-foreground">{a.message}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge className="bg-green-100 text-green-700 text-xs">Resolved</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{timeElapsed(a.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isLoading && alerts.length === 0 && (
        <Card><CardContent className="p-12 text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" /><p className="font-medium">All Clear</p><p className="text-sm text-muted-foreground mt-1">No emergency alerts at this time.</p></CardContent></Card>
      )}
    </div>
  );
}
