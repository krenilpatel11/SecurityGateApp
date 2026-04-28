import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayments, recordPayment, markPaid, type Payment } from '@/api/payments';
import { CreditCard, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAllUsers } from '@/api/admin';
import type { UserProfile } from '@/api/profile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  Paid: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ residentId: '', amount: '', description: 'Monthly Maintenance Fee', month: '' });
  const [confirmPay, setConfirmPay] = useState<Payment | null>(null);

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); setShowModal(false); setForm({ residentId: '', amount: '', description: 'Monthly Maintenance Fee', month: '' }); },
  });

  const markPaidMutation = useMutation({
    mutationFn: markPaid,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['payments'] }); setConfirmPay(null); },
  });

  const filtered = payments.filter(p => {
    const monthOk = !monthFilter || p.month === monthFilter;
    const statOk = !statusFilter || p.status === statusFilter;
    return monthOk && statOk;
  });

  const totalDue = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const months = [...new Set(payments.map(p => p.month))].sort().reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><CreditCard className="w-6 h-6 text-green-600" /> Payments</h1>
        {isAdmin && <Button onClick={() => setShowModal(true)} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Record Payment</Button>}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">Amount Due</p><p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">${totalDue.toLocaleString()}</p></div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950/30 border-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-green-700 dark:text-green-300 font-medium">Paid This Period</p><p className="text-2xl font-bold text-green-900 dark:text-green-100">${totalPaid.toLocaleString()}</p></div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Records</p><p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{payments.length}</p></div>
            <CreditCard className="w-8 h-8 text-blue-500" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
          <option value="">All Months</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-2 bg-background text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Record Payment</h2><button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button></div>
              <select className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={form.residentId} onChange={e => setForm(f => ({ ...f, residentId: e.target.value }))}>
                <option value="">Select Resident *</option>
                {residents.map(r => <option key={r._id} value={r._id}>{r.name} — {r.unit ?? 'No unit'}</option>)}
              </select>
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" type="number" placeholder="Amount ($) *" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" type="month" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))} />
              <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button><Button className="flex-1" onClick={() => recordMutation.mutate()} disabled={!form.residentId || !form.amount || !form.month || recordMutation.isPending}>{recordMutation.isPending ? 'Recording...' : 'Record'}</Button></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Pay Modal */}
      {confirmPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold">Confirm Payment</h2>
              <p className="text-sm text-muted-foreground">Mark <strong>${confirmPay.amount}</strong> for <strong>{confirmPay.month}</strong> as paid?</p>
              <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setConfirmPay(null)}>Cancel</Button><Button className="flex-1 bg-green-500 hover:bg-green-600 text-white" onClick={() => markPaidMutation.mutate(confirmPay._id)} disabled={markPaidMutation.isPending}>{markPaidMutation.isPending ? 'Processing...' : 'Confirm Paid'}</Button></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment List */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" /><p className="font-medium">All Paid ✓</p><p className="text-sm text-muted-foreground mt-1">No payments matching the filter.</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <Card key={p._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${p.status === 'Paid' ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                    {p.status === 'Paid' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.description}</p>
                    <p className="text-xs text-muted-foreground">{p.month} · {isAdmin ? `${p.resident?.name} (${p.resident?.unit ?? 'No unit'})` : ''}</p>
                    {p.paidAt && <p className="text-xs text-green-600">Paid on {new Date(p.paidAt).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-bold">${p.amount.toLocaleString()}</p>
                    <Badge className={`text-xs ${statusColor[p.status]}`}>{p.status}</Badge>
                  </div>
                  {p.status === 'Pending' && !isAdmin && (
                    <Button className="text-xs bg-green-500 hover:bg-green-600 text-white" onClick={() => setConfirmPay(p)}>Pay Now</Button>
                  )}
                  {p.status === 'Pending' && isAdmin && (
                    <Button variant="outline" className="text-xs" onClick={() => markPaidMutation.mutate(p._id)} disabled={markPaidMutation.isPending}>Mark Paid</Button>
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
