import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStaff, registerStaff, staffCheckIn, staffCheckOut, getAttendanceLogs } from '@/api/staff';
import type { StaffMember } from '@/api/staff';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Plus, LogIn, LogOut, QrCode, X, Thermometer, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const STAFF_TYPES = ['Maid', 'Driver', 'Gardener', 'Cook', 'Security', 'Plumber', 'Electrician', 'Other'];

const STATUS_COLOR: Record<string, string> = {
  Active:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Inactive:  'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Suspended: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const HEALTH_COLOR: Record<string, string> = {
  Healthy:      'text-green-600',
  Sick:         'text-red-600',
  'Not Checked': 'text-muted-foreground',
};

export default function StaffAttendancePage() {
  const { effectiveRole } = useAuth();
  const queryClient = useQueryClient();
  const isGuard = effectiveRole === 'security' || effectiveRole === 'admin' || effectiveRole === 'superuser';

  const [showRegister, setShowRegister] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [checkInForm] = useState({ healthStatus: 'Healthy', temperature: '', notes: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', phone: '', type: 'Maid', unit: '' });
  const [showQR, setShowQR] = useState<StaffMember | null>(null);

  const { data: staff = [], isLoading } = useQuery({ queryKey: ['staff'], queryFn: getStaff });

  const { data: attendanceLogs = [] } = useQuery({
    queryKey: ['attendance', selectedStaff?._id],
    queryFn: () => getAttendanceLogs(selectedStaff!._id),
    enabled: !!selectedStaff,
  });

  const registerMutation = useMutation({
    mutationFn: registerStaff,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['staff'] }); setShowRegister(false); setRegisterForm({ name: '', phone: '', type: 'Maid', unit: '' }); },
  });

  const checkInMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { healthStatus?: string; temperature?: number; notes?: string } }) => staffCheckIn(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['staff'] }); queryClient.invalidateQueries({ queryKey: ['attendance'] }); },
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: string) => staffCheckOut(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['staff'] }); queryClient.invalidateQueries({ queryKey: ['attendance'] }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-600" /> Staff & Domestic Help
        </h1>
        {!isGuard && (
          <Button onClick={() => setShowRegister(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Register Staff
          </Button>
        )}
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Register Staff Member</h2>
                <button onClick={() => setShowRegister(false)}><X className="w-5 h-5" /></button>
              </div>
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Priya Sharma' },
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
                { label: 'Unit / Flat', key: 'unit', type: 'text', placeholder: 'e.g. A-101' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-sm font-medium">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={registerForm[f.key as keyof typeof registerForm]}
                    onChange={e => setRegisterForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 mt-1 bg-background text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={registerForm.type}
                  onChange={e => setRegisterForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 mt-1 bg-background text-sm"
                >
                  {STAFF_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowRegister(false)}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={registerMutation.isPending}
                  onClick={() => registerMutation.mutate(registerForm)}
                >
                  {registerMutation.isPending ? 'Registering...' : 'Register'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Vendor Pass Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="p-6 text-center space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Vendor Pass</h2>
                <button onClick={() => setShowQR(null)}><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground">{showQR.name} · {showQR.type} · Unit {showQR.unit}</p>
              {showQR.vendorPassUrl ? (
                <img src={showQR.vendorPassUrl} alt="Vendor Pass QR" className="mx-auto w-48 h-48 rounded-lg border" />
              ) : (
                <p className="text-muted-foreground">No vendor pass generated</p>
              )}
              <p className="text-xs text-muted-foreground">Show this QR at the gate for entry</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
          ) : staff.length === 0 ? (
            <Card><CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No staff registered yet.</p>
            </CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0 divide-y">
                {staff.map(s => (
                  <div
                    key={s._id}
                    className={`flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors cursor-pointer ${selectedStaff?._id === s._id ? 'bg-muted/60' : ''}`}
                    onClick={() => setSelectedStaff(selectedStaff?._id === s._id ? null : s)}
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center font-bold text-purple-700 dark:text-purple-300 flex-shrink-0">
                      {s.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.type} · Unit {s.unit} · {s.phone}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`text-xs ${STATUS_COLOR[s.status]}`}>{s.status}</Badge>
                      <button
                        onClick={e => { e.stopPropagation(); setShowQR(s); }}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors"
                        title="View Vendor Pass"
                      >
                        <QrCode className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {isGuard && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950/30 text-xs"
                            onClick={e => { e.stopPropagation(); checkInMutation.mutate({ id: s._id, data: { healthStatus: checkInForm.healthStatus } }); }}
                            disabled={checkInMutation.isPending}
                          >
                            <LogIn className="w-3.5 h-3.5 mr-1" /> In
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-xs"
                            onClick={e => { e.stopPropagation(); checkOutMutation.mutate(s._id); }}
                            disabled={checkOutMutation.isPending}
                          >
                            <LogOut className="w-3.5 h-3.5 mr-1" /> Out
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Attendance Log Panel */}
        <div>
          {selectedStaff ? (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Attendance — {selectedStaff.name}</h2>
              {attendanceLogs.length === 0 ? (
                <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No attendance records</CardContent></Card>
              ) : (
                <Card>
                  <CardContent className="p-0 divide-y max-h-[400px] overflow-y-auto">
                    {attendanceLogs.map(log => (
                      <div key={log._id} className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{new Date(log.date).toLocaleDateString()}</p>
                          <span className={`text-xs font-medium ${HEALTH_COLOR[log.healthStatus]}`}>
                            {log.healthStatus === 'Healthy' ? <Heart className="w-3.5 h-3.5 inline mr-0.5" /> : <Thermometer className="w-3.5 h-3.5 inline mr-0.5" />}
                            {log.healthStatus}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>In: {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                          <span>Out: {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                          {log.workedHours && <span className="text-green-600 font-medium">{log.workedHours}h</span>}
                        </div>
                        {log.temperature && <p className="text-xs text-muted-foreground">Temp: {log.temperature}°C</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground text-sm">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Click a staff member to view attendance
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
