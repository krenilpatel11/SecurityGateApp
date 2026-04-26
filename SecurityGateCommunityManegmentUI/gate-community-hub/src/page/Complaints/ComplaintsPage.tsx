import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComplaints, createComplaint, updateComplaintStatus, type Complaint } from '@/api/complaints';
import { MessageSquareWarning, Plus, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['Maintenance', 'Noise', 'Security', 'Cleanliness', 'Parking', 'Other'];
const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const statusColor: Record<string, string> = {
  Open: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-100 text-gray-600',
};

export default function ComplaintsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin' || user?.role === 'security';
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: CATEGORIES[0] });

  const { data: complaints = [], isLoading } = useQuery<Complaint[]>({
    queryKey: ['complaints'],
    queryFn: getComplaints,
  });

  const createMutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      setShowModal(false);
      setForm({ title: '', description: '', category: CATEGORIES[0] });
    },
    onError: () => alert('Failed to raise complaint.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateComplaintStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['complaints'] }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquareWarning className="w-7 h-7 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Complaints</h1>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Raise Complaint
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <MessageSquareWarning className="w-10 h-10 mb-2" />
          <p>No complaints found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{c.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[c.status] ?? 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{c.description}</p>
                  <p className="text-xs text-gray-400 mt-1">By {c.raisedBy?.name} {c.raisedBy?.unit ? `· Unit ${c.raisedBy.unit}` : ''} · {new Date(c.createdAt).toLocaleDateString()}</p>
                  {c.resolution && <p className="text-sm text-green-600 dark:text-green-400 mt-1">Resolution: {c.resolution}</p>}
                </div>
                {isAdmin && (
                  <select
                    value={c.status}
                    onChange={(e) => statusMutation.mutate({ id: c._id, status: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Raise a Complaint</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800">Cancel</button>
              <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.title || !form.description}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {createMutation.isPending ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
