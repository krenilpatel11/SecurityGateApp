import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  type Announcement,
} from "@/api/announcements";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { MdPushPin, MdDelete, MdAdd } from "react-icons/md";

function AnnouncementCard({
  announcement,
  isAdmin,
  onDelete,
}: {
  announcement: Announcement;
  isAdmin: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className={announcement.isPinned ? "border-primary" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {announcement.isPinned && <MdPushPin className="text-primary w-4 h-4" />}
              <h3 className="font-semibold text-base">{announcement.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <span>By {announcement.author?.name ?? "Admin"}</span>
              <span>·</span>
              <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => onDelete(announcement._id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Delete announcement"
            >
              <MdDelete className="w-5 h-5" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PostAnnouncementModal({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; isPinned: boolean }) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({ title, content, isPinned });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Post Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content *</label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm bg-background min-h-[100px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement..."
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="isPinned" className="text-sm">Pin this announcement</label>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-sm hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncements,
  });

  const createMutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Community Announcements</h1>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90"
          >
            <MdAdd className="w-4 h-4" />
            Post Announcement
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-1/3 mb-2 animate-pulse" />
                <div className="h-3 bg-muted rounded w-full mb-1 animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-muted-foreground">No announcements yet.</p>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <AnnouncementCard
              key={a._id}
              announcement={a}
              isAdmin={isAdmin}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <PostAnnouncementModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
          isPending={createMutation.isPending}
        />
      )}
    </div>
  );
}
