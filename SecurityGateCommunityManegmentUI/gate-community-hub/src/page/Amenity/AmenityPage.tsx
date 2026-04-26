import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAmenities, bookAmenity, getBookings, updateBookingStatus, createAmenity, type Amenity, type AmenityBooking } from '@/api/amenities';
import { Building2, Plus, X, CalendarCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const TIME_SLOTS = ['06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00'];

const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function AmenityPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'amenities' | 'bookings'>('amenities');
  const [bookingModal, setBookingModal] = useState<Amenity | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [bookForm, setBookForm] = useState({ date: '', timeSlot: TIME_SLOTS[0] });
  const [addForm, setAddForm] = useState({ name: '', description: '', capacity: '' });

  const { data: amenities = [], isLoading: loadingAmenities } = useQuery<Amenity[]>({
    queryKey: ['amenities'],
    queryFn: getAmenities,
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery<AmenityBooking[]>({
    queryKey: ['amenity-bookings'],
    queryFn: getBookings,
  });

  const bookMutation = useMutation({
    mutationFn: () => bookAmenity({ amenityId: bookingModal!._id, date: bookForm.date, timeSlot: bookForm.timeSlot }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenity-bookings'] });
      setBookingModal(null);
      setBookForm({ date: '', timeSlot: TIME_SLOTS[0] });
      alert('Booking request submitted!');
    },
    onError: () => alert('Failed to book amenity.'),
  });

  const addMutation = useMutation({
    mutationFn: () => createAmenity({ name: addForm.name, description: addForm.description, capacity: Number(addForm.capacity) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['amenities'] });
      setAddModal(false);
      setAddForm({ name: '', description: '', capacity: '' });
    },
    onError: () => alert('Failed to add amenity.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBookingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['amenity-bookings'] }),
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-7 h-7 text-teal-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Amenities</h1>
        </div>
        {isAdmin && activeTab === 'amenities' && (
          <button onClick={() => setAddModal(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Amenity
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['amenities', 'bookings'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            {tab === 'amenities' ? 'Available Amenities' : 'My Bookings'}
          </button>
        ))}
      </div>

      {/* Amenities Grid */}
      {activeTab === 'amenities' && (
        loadingAmenities ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" /></div>
        ) : amenities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Building2 className="w-10 h-10 mb-2" />
            <p>No amenities available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenities.map((a) => (
              <div key={a._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{a.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{a.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Capacity: {a.capacity} people</p>
                </div>
                <button onClick={() => setBookingModal(a)}
                  className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  <CalendarCheck className="w-4 h-4" /> Book Now
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Bookings List */}
      {activeTab === 'bookings' && (
        loadingBookings ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" /></div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <CalendarCheck className="w-10 h-10 mb-2" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{b.amenity?.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(b.date).toLocaleDateString()} · {b.timeSlot}</p>
                    {isAdmin && <p className="text-xs text-gray-400">{b.bookedBy?.name} · Unit {b.bookedBy?.unit}</p>}
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[b.status]}`}>{b.status}</span>
                  </div>
                  {isAdmin && b.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Approved' })}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg">Approve</button>
                      <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Rejected' })}
                        className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg">Reject</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Book {bookingModal.name}</h2>
              <button onClick={() => setBookingModal(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" value={bookForm.date} onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })} min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Slot</label>
                <select value={bookForm.timeSlot} onChange={(e) => setBookForm({ ...bookForm, timeSlot: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBookingModal(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending || !bookForm.date}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Amenity Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Amenity</h2>
              <button onClick={() => setAddModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input type="text" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input type="text" value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
                <input type="number" value={addForm.capacity} onChange={(e) => setAddForm({ ...addForm, capacity: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAddModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={() => addMutation.mutate()} disabled={addMutation.isPending || !addForm.name || !addForm.description || !addForm.capacity}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {addMutation.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
