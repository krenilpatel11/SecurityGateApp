import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEvents, createEvent, rsvpEvent, deleteEvent, type CommunityEvent } from '@/api/events';
import { getPolls, createPoll, votePoll, type Poll } from '@/api/polls';
import { CalendarDays, Plus, X, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowEventModal(false);
      setEventForm({ title: '', location: '', date: '', rsvpRequired: false, description: '' });
    },
    onError: () => alert('Failed to create event.'),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      setShowPollModal(false);
      setPollForm({ question: '', options: ['', ''], endsAt: '' });
    },
    onError: () => alert('Failed to create poll.'),
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, optionIndex }: { id: string; optionIndex: number }) => votePoll(id, optionIndex),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['polls'] }),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Failed to vote.');
    },
  });

  const hasVoted = (poll: Poll) => poll.votedBy?.includes(user?.id ?? '');
  const totalVotes = (poll: Poll) => poll.options.reduce((s, o) => s + o.votes, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-violet-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Community</h1>
        </div>
        {isAdmin && (
          <button onClick={() => activeTab === 'events' ? setShowEventModal(true) : setShowPollModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> {activeTab === 'events' ? 'Create Event' : 'Create Poll'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['events', 'polls'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-violet-600 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Events */}
      {activeTab === 'events' && (
        loadingEvents ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" /></div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <CalendarDays className="w-10 h-10 mb-2" />
            <p>No events scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((e) => {
              const userRsvpd = e.rsvps?.some((r) => r._id === user?.id);
              return (
                <div key={e._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{e.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">📍 {e.location}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">📅 {new Date(e.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                      {e.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{e.description}</p>}
                    </div>
                    {isAdmin && (
                      <button onClick={() => { if (confirm('Delete this event?')) deleteEventMutation.mutate(e._id); }}
                        className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{e.rsvps?.length ?? 0} attending</span>
                    {e.rsvpRequired && (
                      <button onClick={() => rsvpMutation.mutate(e._id)}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium ${userRsvpd ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}>
                        {userRsvpd ? <><CheckCircle className="w-3 h-3" /> RSVP'd</> : 'RSVP'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Polls */}
      {activeTab === 'polls' && (
        loadingPolls ? (
          <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" /></div>
        ) : polls.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <CalendarDays className="w-10 h-10 mb-2" />
            <p>No active polls</p>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => {
              const voted = hasVoted(poll);
              const total = totalVotes(poll);
              const expired = new Date(poll.endsAt) < new Date();
              return (
                <div key={poll._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{poll.question}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${expired ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {expired ? 'Ended' : `Ends ${new Date(poll.endsAt).toLocaleDateString()}`}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {poll.options.map((opt, i) => {
                      const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                      return (
                        <div key={i}>
                          {voted || expired ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700 dark:text-gray-300">{opt.option}</span>
                                <span className="text-gray-500">{pct}% ({opt.votes})</span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-violet-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => voteMutation.mutate({ id: poll._id, optionIndex: i })}
                              className="w-full text-left px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-400 transition-colors">
                              {opt.option}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400">{total} total votes</p>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Event</h2>
              <button onClick={() => setShowEventModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              {[['Title', 'title', 'text'], ['Location', 'location', 'text']].map(([label, field, type]) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                  <input type={type} value={eventForm[field as keyof typeof eventForm] as string}
                    onChange={(e) => setEventForm({ ...eventForm, [field]: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                <input type="datetime-local" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={eventForm.rsvpRequired} onChange={(e) => setEventForm({ ...eventForm, rsvpRequired: e.target.checked })} className="rounded" />
                RSVP Required
              </label>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowEventModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={() => createEventMutation.mutate()} disabled={createEventMutation.isPending || !eventForm.title || !eventForm.location || !eventForm.date}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {createEventMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Poll</h2>
              <button onClick={() => setShowPollModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label>
                <input type="text" value={pollForm.question} onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Options</label>
                {pollForm.options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={opt} onChange={(e) => { const opts = [...pollForm.options]; opts[i] = e.target.value; setPollForm({ ...pollForm, options: opts }); }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
                    {pollForm.options.length > 2 && (
                      <button onClick={() => setPollForm({ ...pollForm, options: pollForm.options.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPollForm({ ...pollForm, options: [...pollForm.options, ''] })}
                  className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add option
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ends At</label>
                <input type="datetime-local" value={pollForm.endsAt} onChange={(e) => setPollForm({ ...pollForm, endsAt: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowPollModal(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Cancel</button>
              <button onClick={() => createPollMutation.mutate()} disabled={createPollMutation.isPending || !pollForm.question || pollForm.options.filter(Boolean).length < 2 || !pollForm.endsAt}
                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {createPollMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
