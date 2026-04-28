import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllVisitors, getMyVisitors, updateVisitorStatus, logWalkIn, inviteVisitor } from "@/api/visitor";
import type { Visitor } from "@/types/visitor";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users, UserCheck, UserX, Clock, Plus, X, LogIn, LogOut, Ban,
  QrCode, Phone, MapPin, Calendar
} from "lucide-react";

const statusColor: Record<string, string> = {
  Approved: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  "Checked Out": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  Completed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const CATEGORIES = ["Guest", "Delivery", "Service", "Resident"] as const;

function StatsCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Resident View ─────────────────────────────────────────────────────────────
function ResidentView() {
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: "", purpose: "", visitDate: "", visitTime: "", category: "Guest" as string, unit: "" });

  const { data: myVisitors = [], isLoading } = useQuery<Visitor[]>({
    queryKey: ["myVisitors"],
    queryFn: getMyVisitors,
  });

  const inviteMutation = useMutation({
    mutationFn: () => inviteVisitor({ name: form.name, purpose: form.purpose, visitDate: form.visitDate, visitTime: form.visitTime, category: form.category as Visitor["category"], unit: form.unit }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myVisitors"] }); setShowInvite(false); setForm({ name: "", purpose: "", visitDate: "", visitTime: "", category: "Guest", unit: "" }); },
  });

  const upcoming = myVisitors.filter(v => v.status === "Approved" || v.status === "Pending");
  const recent = myVisitors.filter(v => v.status === "Active" || v.status === "Checked Out" || v.status === "Completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Visitors</h1>
        <Button onClick={() => setShowInvite(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Invite Visitor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard icon={<Users className="w-4 h-4 text-blue-600" />} label="Total" value={myVisitors.length} color="bg-blue-50 dark:bg-blue-950" />
        <StatsCard icon={<Clock className="w-4 h-4 text-yellow-600" />} label="Upcoming" value={upcoming.length} color="bg-yellow-50 dark:bg-yellow-950" />
        <StatsCard icon={<UserCheck className="w-4 h-4 text-green-600" />} label="Active" value={myVisitors.filter(v => v.status === "Active").length} color="bg-green-50 dark:bg-green-950" />
        <StatsCard icon={<UserX className="w-4 h-4 text-gray-500" />} label="Completed" value={myVisitors.filter(v => v.status === "Completed" || v.status === "Checked Out").length} color="bg-gray-50 dark:bg-gray-900" />
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2"><QrCode className="w-5 h-5 text-primary" /> Invite Visitor</h2>
                <button onClick={() => setShowInvite(false)}><X className="w-5 h-5" /></button>
              </div>
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Visitor name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Purpose of visit *" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" className="border rounded-lg px-3 py-2 bg-background text-sm" value={form.visitDate} onChange={e => setForm(f => ({ ...f, visitDate: e.target.value }))} />
                <input type="time" className="border rounded-lg px-3 py-2 bg-background text-sm" value={form.visitTime} onChange={e => setForm(f => ({ ...f, visitTime: e.target.value }))} />
              </div>
              <select className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowInvite(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => inviteMutation.mutate()} disabled={!form.name || !form.purpose || inviteMutation.isPending}>
                  {inviteMutation.isPending ? "Sending..." : "Generate QR Pass"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming Visitors</h2>
        {isLoading ? <Skeleton className="h-24 w-full rounded-xl" /> : upcoming.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No upcoming visitors scheduled.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {upcoming.map(v => (
              <Card key={v._id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{v.name[0]}</div>
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{v.purpose}</p>
                      {v.checkInTime && <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(v.checkInTime).toLocaleString()}</p>}
                    </div>
                  </div>
                  <Badge className={statusColor[v.status]}>{v.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Visits</h2>
        {isLoading ? <Skeleton className="h-24 w-full rounded-xl" /> : recent.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No recent visits.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {recent.map(v => (
              <Card key={v._id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">{v.name[0]}</div>
                    <div>
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.purpose} · {v.category}</p>
                    </div>
                  </div>
                  <Badge className={statusColor[v.status]}>{v.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Guard / Admin View ────────────────────────────────────────────────────────
function GuardView() {
  const queryClient = useQueryClient();
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInForm, setWalkInForm] = useState({ name: "", purpose: "", unit: "", phone: "", category: "Guest" });
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: visitors = [], isLoading } = useQuery<Visitor[]>({
    queryKey: ["allVisitors", statusFilter, categoryFilter],
    queryFn: () => getAllVisitors({ status: statusFilter || undefined, category: categoryFilter || undefined }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateVisitorStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allVisitors"] }),
  });

  const walkInMutation = useMutation({
    mutationFn: () => logWalkIn({ name: walkInForm.name, purpose: walkInForm.purpose, unit: walkInForm.unit, phone: walkInForm.phone, category: walkInForm.category }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["allVisitors"] }); setShowWalkIn(false); setWalkInForm({ name: "", purpose: "", unit: "", phone: "", category: "Guest" }); },
  });

  const active = visitors.filter(v => v.status === "Active").length;
  const pending = visitors.filter(v => v.status === "Pending" || v.status === "Approved").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Visitor Management</h1>
        <Button onClick={() => setShowWalkIn(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Log Walk-In
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard icon={<Users className="w-4 h-4 text-blue-600" />} label="Total Today" value={visitors.length} color="bg-blue-50 dark:bg-blue-950" />
        <StatsCard icon={<UserCheck className="w-4 h-4 text-green-600" />} label="Active" value={active} color="bg-green-50 dark:bg-green-950" />
        <StatsCard icon={<Clock className="w-4 h-4 text-yellow-600" />} label="Awaiting" value={pending} color="bg-yellow-50 dark:bg-yellow-950" />
        <StatsCard icon={<UserX className="w-4 h-4 text-gray-500" />} label="Checked Out" value={visitors.filter(v => v.status === "Checked Out" || v.status === "Completed").length} color="bg-gray-50 dark:bg-gray-900" />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {["Pending", "Approved", "Active", "Checked Out", "Completed"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Walk-In Modal */}
      {showWalkIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Log Walk-In Visitor</h2>
                <button onClick={() => setShowWalkIn(false)}><X className="w-5 h-5" /></button>
              </div>
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Visitor name *" value={walkInForm.name} onChange={e => setWalkInForm(f => ({ ...f, name: e.target.value }))} />
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Purpose *" value={walkInForm.purpose} onChange={e => setWalkInForm(f => ({ ...f, purpose: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Unit (e.g. A-101)" value={walkInForm.unit} onChange={e => setWalkInForm(f => ({ ...f, unit: e.target.value }))} />
                <input className="border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Phone" value={walkInForm.phone} onChange={e => setWalkInForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <select className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={walkInForm.category} onChange={e => setWalkInForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowWalkIn(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => walkInMutation.mutate()} disabled={!walkInForm.name || !walkInForm.purpose || walkInMutation.isPending}>
                  {walkInMutation.isPending ? "Logging..." : "Check In"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visitor Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : visitors.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No visitors found.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {visitors.map(v => (
            <Card key={v._id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">{v.name[0]}</div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{v.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.purpose} · {v.category}{v.unit ? ` · ${v.unit}` : ""}</p>
                    {v.checkInTime && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{new Date(v.checkInTime).toLocaleString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={statusColor[v.status]}>{v.status}</Badge>
                  {(v.status === "Approved" || v.status === "Pending") && (
                    <button title="Check In" onClick={() => statusMutation.mutate({ id: v._id, status: "Active" })} className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                      <LogIn className="w-4 h-4" />
                    </button>
                  )}
                  {v.status === "Active" && (
                    <button title="Check Out" onClick={() => statusMutation.mutate({ id: v._id, status: "Checked Out" })} className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                  {(v.status === "Approved" || v.status === "Pending") && (
                    <button title="Deny" onClick={() => statusMutation.mutate({ id: v._id, status: "Completed" })} className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function VisitorDashboard() {
  const { user } = useAuth();
  const isGuard = user?.role === "security" || user?.role === "admin";
  return isGuard ? <GuardView /> : <ResidentView />;
}
