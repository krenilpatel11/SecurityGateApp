import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSOSAlerts, triggerSOS, resolveSOS, type SOSAlert } from '@/api/sos';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sos-alerts'] });
      setShowConfirm(false);
      setMessage('');
      alert('🚨 SOS Alert sent! Help is on the way.');
    },
    onError: () => alert('Failed to send SOS alert.'),
  });

  const resolveMutation = useMutation({
    mutationFn: resolveSOS,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sos-alerts'] }),
    onError: () => alert('Failed to resolve SOS.'),
  });

  const activeAlerts = alerts.filter((a) => a.status === 'Active');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-7 h-7 text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SOS Emergency</h1>
        {activeAlerts.length > 0 && (
          <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {activeAlerts.length} Active
          </span>
        )}
      </div>

      {/* SOS Button — Resident only */}
      {isResident && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 flex flex-col items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm max-w-sm">
            Press the button below in case of an emergency. Security will be alerted immediately.
          </p>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-40 h-40 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-200 dark:shadow-red-900 flex flex-col items-center justify-center text-white font-bold text-lg gap-2"
          >
            <AlertTriangle className="w-10 h-10" />
            SOS
          </button>
        </div>
      )}

      {/* Active Alerts List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isResident ? 'My SOS History' : 'All SOS Alerts'}
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <CheckCircle className="w-10 h-10 mb-2 text-green-400" />
            <p>No SOS alerts — all clear!</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} className={`bg-white dark:bg-gray-800 rounded-xl shadow p-5 border-l-4 ${alert.status === 'Active' ? 'border-red-500' : 'border-green-500'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${alert.status === 'Active' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {alert.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Unit {alert.unit}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    By {alert.raisedBy?.name} · {new Date(alert.createdAt).toLocaleString()}
                    {alert.resolvedBy && ` · Resolved by ${alert.resolvedBy.name}`}
                  </p>
                </div>
                {!isResident && alert.status === 'Active' && (
                  <button
                    onClick={() => resolveMutation.mutate(alert._id)}
                    disabled={resolveMutation.isPending}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Confirm SOS Alert
              </h2>
              <button onClick={() => setShowConfirm(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to send an emergency alert? Security will be notified immediately.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message (optional)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Describe the emergency..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={() => triggerMutation.mutate()} disabled={triggerMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                {triggerMutation.isPending ? 'Sending...' : '🚨 Send SOS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
