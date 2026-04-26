import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, type UserProfile } from '@/api/profile';
import { UserCircle, Mail, Phone, Home, Shield, Save, Pencil } from 'lucide-react';

const roleBadgeColor: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  resident: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  security: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  staff: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', unit: '' });

  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  useEffect(() => {
    if (profile) setForm({ name: profile.name, phone: profile.phone ?? '', unit: profile.unit ?? '' });
  }, [profile]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditing(false);
      alert('Profile updated successfully!');
    },
    onError: () => alert('Failed to update profile.'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!profile) return <div className="p-6 text-red-500">Failed to load profile.</div>;

  const initials = profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      {/* Avatar + Role */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{profile.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{profile.email}</p>
          <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${roleBadgeColor[profile.role] ?? 'bg-gray-100 text-gray-700'}`}>
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </span>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Details</h3>
          <button
            onClick={() => {
              if (editing) {
                setForm({ name: profile.name, phone: profile.phone ?? '', unit: profile.unit ?? '' });
              }
              setEditing(!editing);
            }}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <Pencil className="w-4 h-4" />
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit / Flat</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <UserCircle className="w-5 h-5 text-gray-400" />
              <span>{profile.name}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>{profile.phone ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Home className="w-5 h-5 text-gray-400" />
              <span>{profile.unit ?? '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="capitalize">{profile.role}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
