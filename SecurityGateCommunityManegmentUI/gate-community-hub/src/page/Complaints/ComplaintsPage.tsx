import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComplaints, createComplaint, updateComplaintStatus, type Complaint } from '@/api/complaints';
import { MessageSquareWarning, Plus, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = ['All', 'Maintenance', 'Noise', 'Security', 'Cleanliness', 'Parking', 'Other'];
const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

const statusColor: Record<string, string> = {
  Open: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function ComplaintsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin' || user?.role === 'security';

  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [form, setForm] = useState({ title: '', description: '', category: 'Maintenance' });
  const [resolveModal, setResolveModal] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [resolveStatus, setResolveStatus] = useState('Resolved');

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ['complaints'],
    queryFn: getComplaints,
  });

  const createMutation = useMutation({
    mutationFn: () => createComplaint({ title: form.title, description: form.description, category: form.category }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['complaints'] }); setShowModal(false); setForm({ title: '', description: '', category: 'Maintenance' }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, res }: { id: string; status: string; res?: string }) => updateComplaintStatus(id, status, res),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['complaints'] }); setResolveModal(null); setResolution(''); },
  });

  const filtered = complaints.filter(c => {
    const catOk = categoryFilter === 'All' || c.category === categoryFilter;
    const statOk = statusFilter === 'All' || c.status === statusFilter;
    return catOk && statOk;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquareWarning className="w-6 h-6 text-orange-500" /> Complaints</h1>
        {!isAdmin && (
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Raise Complaint
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
          <Card key={s} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(s)}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{complaints.filter(c => c.status === s).length}</p>
              <Badge className={`mt-1 text-xs ${statusColor[s]}`}>{s}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${categoryFilter === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{c}</button>
          ))}
        </div>
        <div className="relative">
          <select className="border rounded-lg px-3 py-1.5 bg-background text-sm appearance-none pr-8" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-2 w-4 h-4 pointer-events-none text-muted-foreground" />
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Raise a Complaint</h2>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="w-full border rounded-lg px-3 py-2 bg-background text-sm resize-none" rows={3} placeholder="Describe the issue *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <select className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => createMutation.mutate()} disabled={!form.title || !form.description || createMutation.isPending}>
                  {createMutation.isPending ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Update Complaint</h2>
                <button onClick={() => setResolveModal(null)}><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground">{resolveModal.title}</p>
              <select className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={resolveStatus} onChange={e => setResolveStatus(e.target.value)}>
                {['In Progress', 'Resolved', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea className="w-full border rounded-lg px-3 py-2 bg-background text-sm resize-none" rows={3} placeholder="Resolution notes (optional)" value={resolution} onChange={e => setResolution(e.target.value)} />
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setResolveModal(null)}>Cancel</Button>
                <Button className="flex-1" onClick={() => updateMutation.mutate({ id: resolveModal._id, status: resolveStatus, res: resolution })} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><MessageSquareWarning className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No complaints found.</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{c.title}</p>
                      <Badge className={`text-xs ${statusColor[c.status]}`}>{c.status}</Badge>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{c.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>By: {c.raisedBy?.name ?? 'Unknown'}</span>
                      {c.raisedBy?.unit && <span>· Unit {c.raisedBy.unit}</span>}
                      <span>· {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    {c.resolution && <p className="text-xs text-green-700 dark:text-green-400 mt-1 bg-green-50 dark:bg-green-950 px-2 py-1 rounded">✓ {c.resolution}</p>}
                  </div>
                  {isAdmin && (c.status === 'Open' || c.status === 'In Progress') && (
                    <Button variant="outline" className="text-xs flex-shrink-0" onClick={() => { setResolveModal(c); setResolveStatus('In Progress'); }}>
                      Update
                    </Button>
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
