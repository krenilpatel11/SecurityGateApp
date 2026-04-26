import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayments, recordPayment, markPaid, type Payment } from '@/api/payments';
import { CreditCard, Plus, X, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers } from '@/api/admin';
import type { UserProfile } from '@/api/profile';

const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ residentId: '', amount: '', description: '', month: '' });

  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['payments'],
    queryFn: () => getPayments(),
  });

  const { data: residents = [] } = useQuery<UserProfile[]>({
    queryKey: ['residents'],
    queryFn: () => getAllUsers('resident'),
    enabled: isAdmin,
  });

  const recordMutation = useMutation({
    mutationFn: () => recordPayment({ residentId: form.residentId, amount: Number(form.amount), description: form.description, month: form.month }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowModal(false);
      setForm({ residentId: '', amount: '', description: '', month: '' });
    },
    onError: () => alert('Failed to record payment.'),
  });

  const paidMutation = useMutation({
    mutationFn: markPaid,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payments'] }),
    onError: () => alert('Failed to mark as paid.'),
  });

  const pendingTotal = payments.filter((p) => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Record Payment
          </button>
        )}
      </div>

      {/* Summary */}
      {!isAdmin && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-4">
          <CreditCard className="w-8 h-8 text-yellow-600" />
          <div>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">Total Pending</p>
            <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">₹{pendingTotal.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <CreditCard className="w-10 h-10 mb-2" />
            <p>No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                <tr>
                  {isAdmin && <th className="px-4 py-3 text-left">Resident</th>}
                  <th className="px-4 py-3 text-left">Month</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-left">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {isAdmin && <td className="px-4 py-3 text-gray-900 dark:text-white">{p.resident?.name} <span className="text-gray-400 text-xs">{p.resident?.unit}</span></td>}
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.month}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.description}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">₹{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[p.status]}`}>{p.status}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {p.status === 'Pending' && (
                          <button onClick={() => paidMutation.mutate(p._id)} disabled={paidMutation.isPending}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium disabled:opacity-50">
                            <CheckCircle className="w-4 h-4" /> Mark Paid
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Record Payment</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resident</label>
                <select value={form.residentId} onChange={(e) => setForm({ ...form, residentId: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select resident...</option>
                  {residents.map((r) => <option key={r._id} value={r._id}>{r.name} {r.unit ? `(Unit ${r.unit})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month (e.g. 2026-04)</label>
                <input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Maintenance fee"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={() => recordMutation.mutate()} disabled={recordMutation.isPending || !form.residentId || !form.amount || !form.month || !form.description}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {recordMutation.isPending ? 'Recording...' : 'Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
