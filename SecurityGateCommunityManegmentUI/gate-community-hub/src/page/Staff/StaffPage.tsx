import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/api/admin';
import type { UserProfile } from '@/api/profile';
import { Users, Phone, Mail, Shield, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

const roleBadgeColor: Record<string, string> = {
  security: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  staff: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function StaffPage() {
  const [search, setSearch] = useState('');

  const { data: staffList = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: ['staff-users'],
    queryFn: async () => {
      const [staff, security] = await Promise.all([getAllUsers('staff'), getAllUsers('security')]);
      return [...security, ...staff];
    },
  });

  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const guards = filtered.filter(s => s.role === 'security');
  const staff = filtered.filter(s => s.role === 'staff');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-green-600" /> Staff Directory</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-green-50 dark:bg-green-950/30 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-green-600" />
            <div><p className="text-2xl font-bold text-green-900 dark:text-green-100">{staffList.filter(s => s.role === 'security').length}</p><p className="text-sm text-green-700 dark:text-green-300">Security Guards</p></div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-none">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-yellow-600" />
            <div><p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{staffList.filter(s => s.role === 'staff').length}</p><p className="text-sm text-yellow-700 dark:text-yellow-300">Staff Members</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input className="w-full border rounded-lg pl-9 pr-3 py-2 bg-background text-sm" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : (
        <>
          {guards.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-green-600" /> Security Guards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guards.map(s => <StaffCard key={s._id} staff={s} />)}
              </div>
            </div>
          )}
          {staff.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-yellow-600" /> Staff Members</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {staff.map(s => <StaffCard key={s._id} staff={s} />)}
              </div>
            </div>
          )}
          {filtered.length === 0 && (
            <Card><CardContent className="p-12 text-center"><Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No staff found.</p></CardContent></Card>
          )}
        </>
      )}
    </div>
  );
}

function StaffCard({ staff: s }: { staff: UserProfile }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg flex-shrink-0">
          {s.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{s.name}</p>
            <Badge className={`text-xs ${roleBadgeColor[s.role] ?? ''}`}>{s.role}</Badge>
            <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="On duty" />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" />{s.email}</p>
          {s.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
