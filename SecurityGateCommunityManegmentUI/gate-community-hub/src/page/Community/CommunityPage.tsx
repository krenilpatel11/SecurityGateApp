import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, createEvent, rsvpEvent, deleteEvent, type CommunityEvent } from '@/api/events';
import { getPolls, createPoll, votePoll, type Poll } from '@/api/polls';
import { CalendarDays, Plus, X, Trash2, CheckCircle, MapPin, Clock, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function daysUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return 'Ended';
  if (days === 0) return 'Ends today';
  return `Ends in ${days}d`;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'events' | 'polls'>('events');

  // Events
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({ title: '', location: '', date: '', rsvpRequired: false, description: '' });

  const { data: events = [], isLoading: loadingEvents } = useQuery<CommunityEvent[]>({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  const createEventMutation = useMutation({
    mutationFn: () => createEvent(eventForm),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); setShowEventModal(false); setEventForm({ title: '', location: '', date: '', rsvpRequired: false, description: '' }); },
  });

  const rsvpMutation = useMutation({
    mutationFn: rsvpEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  // Polls
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollForm, setPollForm] = useState({ question: '', options: ['', ''], endsAt: '' });

  const { data: polls = [], isLoading: loadingPolls } = useQuery<Poll[]>({
    queryKey: ['polls'],
    queryFn: getPolls,
  });

  const createPollMutation = useMutation({
    mutationFn: () => createPoll({ question: pollForm.question, options: pollForm.options.filter(Boolean), endsAt: pollForm.endsAt }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['polls'] }); setShowPollModal(false); setPollForm({ question: '', options: ['', ''], endsAt: '' }); },
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, optionIndex }: { id: string; optionIndex: number }) => votePoll(id, optionIndex),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['polls'] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="w-6 h-6 text-purple-600" /> Community</h1>
        {isAdmin && (
          <Button onClick={() => activeTab === 'events' ? setShowEventModal(true) : setShowPollModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> {activeTab === 'events' ? 'Add Event' : 'Add Poll'}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(['events', 'polls'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{tab}</button>
        ))}
      </div>

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Create Event</h2><button onClick={() => setShowEventModal(false)}><X className="w-5 h-5" /></button></div>
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Event title *" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} />
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Location *" value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} />
              <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 bg-background text-sm" value={eventForm.date} onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))} />
              <textarea className="w-full border rounded-lg px-3 py-2 bg-background text-sm resize-none" rows={2} placeholder="Description" value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} />
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={eventForm.rsvpRequired} onChange={e => setEventForm(f => ({ ...f, rsvpRequired: e.target.checked }))} className="rounded" />
                RSVP Required
              </label>
              <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setShowEventModal(false)}>Cancel</Button><Button className="flex-1" onClick={() => createEventMutation.mutate()} disabled={!eventForm.title || !eventForm.location || !eventForm.date || createEventMutation.isPending}>{createEventMutation.isPending ? 'Creating...' : 'Create'}</Button></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Create Poll</h2><button onClick={() => setShowPollModal(false)}><X className="w-5 h-5" /></button></div>
              <input className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder="Poll question *" value={pollForm.question} onChange={e => setPollForm(f => ({ ...f, question: e.target.value }))} />
              {pollForm.options.map((opt, i) => (
                <input key={i} className="w-full border rounded-lg px-3 py-2 bg-background text-sm" placeholder={`Option ${i + 1} *`} value={opt} onChange={e => { const opts = [...pollForm.options]; opts[i] = e.target.value; setPollForm(f => ({ ...f, options: opts })); }} />
              ))}
              <button className="text-sm text-primary hover:underline" onClick={() => setPollForm(f => ({ ...f, options: [...f.options, ''] }))}>+ Add option</button>
              <div><label className="text-xs text-muted-foreground">Ends at</label><input type="date" className="w-full border rounded-lg px-3 py-2 bg-background text-sm mt-1" value={pollForm.endsAt} onChange={e => setPollForm(f => ({ ...f, endsAt: e.target.value }))} /></div>
              <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setShowPollModal(false)}>Cancel</Button><Button className="flex-1" onClick={() => createPollMutation.mutate()} disabled={!pollForm.question || pollForm.options.filter(Boolean).length < 2 || !pollForm.endsAt || createPollMutation.isPending}>{createPollMutation.isPending ? 'Creating...' : 'Create'}</Button></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        loadingEvents ? <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
        : events.length === 0 ? <Card><CardContent className="p-12 text-center"><CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No upcoming events.</p></CardContent></Card>
        : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map(e => {
              const hasRsvp = e.rsvps.some(r => r._id === user?.id);
              return (
                <Card key={e._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-purple-600">{new Date(e.date).toLocaleDateString('en', { month: 'short' })}</span>
                        <span className="text-lg font-bold text-purple-800 dark:text-purple-200">{new Date(e.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{e.location}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(e.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
                        {e.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{e.description}</p>}
                      </div>
                      {isAdmin && <button onClick={() => deleteEventMutation.mutate(e._id)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{e.rsvps.length} RSVPs</span>
                      {e.rsvpRequired && (
                        <button onClick={() => rsvpMutation.mutate(e._id)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 ${hasRsvp ? 'bg-green-100 text-green-700' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}>
                          {hasRsvp ? <><CheckCircle className="w-3 h-3" /> RSVP'd</> : 'RSVP'}
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
      )}

      {/* Polls Tab */}
      {activeTab === 'polls' && (
        loadingPolls ? <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
        : polls.length === 0 ? <Card><CardContent className="p-12 text-center"><p className="text-muted-foreground">No active polls.</p></CardContent></Card>
        : <div className="space-y-4">
            {polls.map(p => {
              const totalVotes = p.options.reduce((s, o) => s + o.votes, 0);
              const hasVoted = p.votedBy.includes(user?.id ?? '');
              const isExpired = new Date(p.endsAt) < new Date();
              return (
                <Card key={p._id}>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">{p.question}</p>
                      <Badge className={isExpired ? 'bg-gray-100 text-gray-600 text-xs' : 'bg-green-100 text-green-700 text-xs'}>{isExpired ? 'Ended' : daysUntil(p.endsAt)}</Badge>
                    </div>
                    <div className="space-y-2">
                      {p.options.map((opt, i) => {
                        const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{opt.option}</span>
                              <span className="text-muted-foreground text-xs">{opt.votes} votes ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {!hasVoted && !isExpired && (
                      <div className="flex gap-2 flex-wrap pt-1">
                        {p.options.map((opt, i) => (
                          <button key={i} onClick={() => voteMutation.mutate({ id: p._id, optionIndex: i })} disabled={voteMutation.isPending} className="text-xs px-3 py-1.5 rounded-full border hover:bg-primary hover:text-primary-foreground transition-colors">
                            Vote: {opt.option}
                          </button>
                        ))}
                      </div>
                    )}
                    {hasVoted && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> You voted</p>}
                    <p className="text-xs text-muted-foreground">{totalVotes} total votes · By {p.createdBy?.name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
      )}
    </div>
  );
}
