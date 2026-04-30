import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFeed, createPost, toggleLike, closePost, deletePost } from '@/api/feed';
import type { FeedPost } from '@/api/feed';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Plus, X, ShoppingBag, Search, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CATEGORIES = ['All', 'Buy', 'Sell', 'Rent', 'Lost & Found', 'Announcement', 'Event', 'General'];

const CAT_COLOR: Record<string, string> = {
  Buy:          'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Sell:         'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Rent:         'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Lost & Found':'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Announcement: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Event:        'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  General:      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const STATUS_COLOR: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-100 text-gray-600',
  Sold:   'bg-blue-100 text-blue-700',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CommunityFeedPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'General', price: '', contactPhone: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['feed', activeCategory],
    queryFn: () => getFeed({ category: activeCategory === 'All' ? undefined : activeCategory }),
  });

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setShowCreate(false);
      setForm({ title: '', description: '', category: 'General', price: '', contactPhone: '' });
    },
  });

  const likeMutation = useMutation({
    mutationFn: (id: string) => toggleLike(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  const closeMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'Closed' | 'Sold' }) => closePost(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  const posts = (data?.posts ?? []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const isOwner = (post: FeedPost) =>
    typeof post.postedBy === 'object' && post.postedBy.name === user?.name;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-pink-500" /> Community Feed
        </h1>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border hover:bg-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full border rounded-lg pl-9 pr-3 py-2 bg-background text-sm"
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Create Post Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Create Post</h2>
                <button onClick={() => setShowCreate(false)}><X className="w-5 h-5" /></button>
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 mt-1 bg-background text-sm"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1 bg-background text-sm"
                  placeholder="e.g. Selling sofa set — good condition"
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 mt-1 bg-background text-sm resize-none"
                  rows={3}
                  placeholder="Describe your post..."
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                />
              </div>
              {['Sell', 'Rent'].includes(form.category) && (
                <div>
                  <label className="text-sm font-medium">Price (₹)</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 mt-1 bg-background text-sm"
                    placeholder="0"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Contact Phone (optional)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 mt-1 bg-background text-sm"
                  placeholder="+91 98765 43210"
                  value={form.contactPhone}
                  onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={createMutation.isPending || !form.title || !form.description}
                  onClick={() => createMutation.mutate({
                    title: form.title,
                    description: form.description,
                    category: form.category,
                    price: form.price ? parseFloat(form.price) : undefined,
                    contactPhone: form.contactPhone || undefined,
                  })}
                >
                  {createMutation.isPending ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(post => (
            <Card key={post._id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col gap-3 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={`text-xs ${CAT_COLOR[post.category] ?? ''}`}>{post.category}</Badge>
                    <Badge className={`text-xs ${STATUS_COLOR[post.status] ?? ''}`}>{post.status}</Badge>
                  </div>
                  {isOwner(post) && (
                    <button
                      onClick={() => deleteMutation.mutate(post._id)}
                      className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm leading-tight">{post.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.description}</p>
                </div>

                {/* Price */}
                {post.price && (
                  <p className="text-lg font-bold text-green-600">₹{post.price.toLocaleString()}</p>
                )}

                {/* Contact */}
                {post.contactPhone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    📞 {post.contactPhone}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {post.postedBy?.name?.[0] ?? '?'}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{post.postedBy?.name}</p>
                      {post.postedBy?.unit && <p className="text-xs text-muted-foreground">Unit {post.postedBy.unit}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
                    <button
                      onClick={() => likeMutation.mutate(post._id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      {post.likes?.length ?? 0}
                    </button>
                  </div>
                </div>

                {/* Owner actions */}
                {isOwner(post) && post.status === 'Active' && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => closeMutation.mutate({ id: post._id, status: 'Sold' })}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Mark Sold
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => closeMutation.mutate({ id: post._id, status: 'Closed' })}
                    >
                      <X className="w-3 h-3 mr-1" /> Close
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
