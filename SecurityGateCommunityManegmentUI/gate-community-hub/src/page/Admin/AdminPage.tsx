import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, updateUserRole } from '@/api/admin';
import type { UserProfile } from '@/api/profile';
import { Users, ShieldCheck, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ROLES = ['resident', 'security', 'admin', 'staff'];

const roleBadgeColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  resident: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  security: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  staff: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmChange, setConfirmChange] = useState<{ user: UserProfile; newRole: string } | null>(null);

  const { data: users = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers(),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateUserRole(id, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmChange(null); },
  });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const counts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-purple-600" /> Admin Panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLES.map(r => (
          <Card key={r} className={`border-none ${roleBadgeColor[r].replace('text-', 'bg-').split(' ')[0].replace('bg-', 'bg-').replace('100', '50').replace('900', '950/30')}`}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{counts[r] ?? 0}</p>
              <p className="text-xs capitalize text-muted-foreground mt-1">{r}s</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input className="w-full border rounded-lg pl-9 pr-3 py-2 bg-background text-sm" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Confirm Role Change Modal */}
      {confirmChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Confirm Role Change</h2><button onClick={() => setConfirmChange(null)}><X className="w-5 h-5" /></button></div>
              <p className="text-sm text-muted-foreground">Change <strong>{confirmChange.user.name}</strong>'s role to <strong className="capitalize">{confirmChange.newRole}</strong>?</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmChange(null)}>Cancel</Button>
                <Button className="flex-1" onClick={() => roleMutation.mutate({ id: confirmChange.user._id, role: confirmChange.newRole })} disabled={roleMutation.isPending}>
                  {roleMutation.isPending ? 'Updating...' : 'Confirm'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No users found.</p></CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {filtered.map(u => (
              <div key={u._id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">{u.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}{u.unit ? ` · Unit ${u.unit}` : ''}</p>
                  {u.residentSince && <p className="text-xs text-muted-foreground">Since {new Date(u.residentSince).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge className={`text-xs ${roleBadgeColor[u.role] ?? ''}`}>{u.role}</Badge>
                  <select
                    className="border rounded-lg px-2 py-1 bg-background text-xs"
                    value={u.role}
                    onChange={e => setConfirmChange({ user: u, newRole: e.target.value })}
                  >
                    {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
