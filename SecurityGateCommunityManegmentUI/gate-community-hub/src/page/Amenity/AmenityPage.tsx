import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAmenities, bookAmenity, getBookings, updateBookingStatus, createAmenity, type Amenity, type AmenityBooking } from '@/api/amenities';
import { Building2, Plus, X, CalendarCheck, Users, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const TIME_SLOTS = ['06:00-07:00', '07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00'];

const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function AmenityPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'amenities' | 'bookings'>('amenities');
  const [bookingModal, setBookingModal] = useState<Amenity | null>(null);
  const [bookForm, setBookForm] = useState({ date: '', timeSlot: '' });
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', capacity: '' });

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
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['amenity-bookings'] }); setBookingModal(null); setBookForm({ date: '', timeSlot: '' }); },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateBookingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['amenity-bookings'] }),
  });

  const createMutation = useMutation({
    mutationFn: () => createAmenity({ name: createForm.name, description: createForm.description, capacity: Number(createForm.capacity) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['amenities'] }); setCreateModal(false); setCreateForm({ name: '', description: '', capacity: '' }); },
  });

  const myBookings = bookings.filter(b => typeof b.bookedBy === 'object' ? b.bookedBy._id === user?.id : b.bookedBy === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Building2 className="w-6 h-6 text-teal-600" /> Amenities</h1>
        {isAdmin && activeTab === 'amenities' && (
          <Button onClick={() => setCreateModal(true)} className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Amenity</Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('amenities')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'amenities' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Amenities</button>
        <button onClick={() => setActiveTab('bookings')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
          {isAdmin ? 'All Bookings' : 'My Bookings'}
        </button>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Book {bookingModal.name}</h2>
                <button onClick={() => setBookingModal(null)}><X className="w-5 h-5" /></button>
              </div>
              <input type="date" className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={bookForm.date} onChange={e => setBookForm(f => ({ ...f, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
              <div>
                <p className="text-sm font-medium mb-2">Select Time Slot</p>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot} onClick={() => setBookForm(f => ({ ...f, timeSlot: slot }))} className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${bookForm.timeSlot === slot ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted border-border'}`}>{slot}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setBookingModal(null)}>Cancel</Button>
                <Button className="flex-1" onClick={() => bookMutation.mutate()} disabled={!bookForm.date || !bookForm.timeSlot || bookMutation.isPending}>
                  {bookMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Amenity Modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Add Amenity</h2><button onClick={() => setCreateModal(false)}><X className="w-5 h-5" /></button></div>
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Name *" value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} />
              <textarea className="w-full border rounded-lg px-3 py-2 bg-background text-sm resize-none" rows={2} placeholder="Description *" value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
              <input type="number" className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Capacity *" value={createForm.capacity} onChange={e => setCreateForm(f => ({ ...f, capacity: e.target.value }))} />
              <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setCreateModal(false)}>Cancel</Button><Button className="flex-1" onClick={() => createMutation.mutate()} disabled={!createForm.name || !createForm.description || !createForm.capacity || createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create'}</Button></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Amenities Tab */}
      {activeTab === 'amenities' && (
        loadingAmenities ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
        : amenities.length === 0 ? <Card><CardContent className="p-12 text-center"><Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No amenities available.</p></CardContent></Card>
        : <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {amenities.map(a => (
              <Card key={a._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="p-2 bg-teal-50 dark:bg-teal-950 rounded-lg"><Building2 className="w-5 h-5 text-teal-600" /></div>
                    <Badge className="bg-teal-100 text-teal-700 text-xs flex items-center gap-1"><Users className="w-3 h-3" /> {a.capacity}</Badge>
                  </div>
                  <h3 className="font-semibold">{a.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                  <Button className="w-full mt-4 text-sm" onClick={() => setBookingModal(a)}>
                    <CalendarCheck className="w-4 h-4 mr-2" /> Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        loadingBookings ? <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        : (isAdmin ? bookings : myBookings).length === 0 ? <Card><CardContent className="p-12 text-center"><CalendarCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No bookings found.</p></CardContent></Card>
        : <div className="space-y-2">
            {(isAdmin ? bookings : myBookings).map(b => (
              <Card key={b._id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium">{typeof b.amenity === 'object' ? b.amenity.name : 'Amenity'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(b.date).toLocaleDateString()} · {b.timeSlot}</p>
                    {isAdmin && typeof b.bookedBy === 'object' && <p className="text-xs text-muted-foreground">By: {b.bookedBy.name} ({b.bookedBy.unit ?? 'No unit'})</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${statusColor[b.status]}`}>{b.status}</Badge>
                    {isAdmin && b.status === 'Pending' && (
                      <>
                        <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Approved' })} className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => statusMutation.mutate({ id: b._id, status: 'Rejected' })} className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"><XCircle className="w-4 h-4" /></button>
                      </>
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
