import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/api/admin';
import type { UserProfile } from '@/api/profile';
import { Users, Phone, Mail } from 'lucide-react';

const roleBadgeColor: Record<string, string> = {
  security: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  staff: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function StaffPage() {
  const { data: staffList = [], isLoading } = useQuery<UserProfile[]>({
    queryKey: ['staff-users'],
    queryFn: async () => {
      const [staff, security] = await Promise.all([
        getAllUsers('staff'),
        getAllUsers('security'),
      ]);
      return [...staff, ...security];
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-7 h-7 text-yellow-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff & Security</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
        </div>
      ) : staffList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
          <Users className="w-10 h-10 mb-2" />
          <p>No staff members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((member) => {
            const initials = member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
            return (
              <div key={member._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                    ) : initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor[member.role] ?? 'bg-gray-100 text-gray-700'}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
