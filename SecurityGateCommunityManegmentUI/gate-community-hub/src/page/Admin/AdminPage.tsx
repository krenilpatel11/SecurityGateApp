import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, updateUserRole } from '@/api/admin';
import type { UserProfile } from '@/api/profile';
import { Users, ShieldCheck } from 'lucide-react';

const ROLES = ['resident', 'security', 'admin', 'staff'];

const roleBadgeColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  resident: 'bg-blue-100 text-blue-700',
  security: 'bg-green-100 text-green-700',
  staff: 'bg-yellow-100 text-yellow-700',
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'users' | 'staff'>('users');

  const { data: users = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: ['admin-users'],
    queryFn: () => getAllUsers(),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => updateUserRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    onError: () => alert('Failed to update role.'),
  });

  const displayUsers = activeTab === 'staff'
    ? users.filter((u) => u.role === 'staff' || u.role === 'security')
    : users;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['users', 'staff'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            {tab === 'users' ? 'All Users' : 'Staff & Security'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : displayUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Users className="w-10 h-10 mb-2" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Unit</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {displayUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.unit ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeColor[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => roleMutation.mutate({ id: user._id, role: e.target.value })}
                        className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
