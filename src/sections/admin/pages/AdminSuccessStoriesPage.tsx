import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { AppNotificationService } from '../../../lib/appNotifications';
import { formatAdminDate, getStatusTone } from '../helpers';
import { uploadFile } from '../../../lib/uploadUtils';

type StoryRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  role: string | null;
  organization: string | null;
  story: string;
  image_url: string | null;
  is_published: boolean;
  created_at: string;
};

const AdminSuccessStoriesPage = () => {
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [newStory, setNewStory] = useState({
    full_name: '',
    role: '',
    organization: '',
    story: '',
    image_url: '',
    publishNow: false
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const loadStories = async () => {
    try {
      const { data, error } = await supabase
        .from('impact_stories')
        .select('id, user_id, full_name, role, organization, story, image_url, is_published, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories((data || []) as StoryRow[]);
    } catch (error) {
      console.error('Error loading impact story moderation page:', error);
      toast.error('Success stories could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStories();
  }, []);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      if (filter === 'pending') return !story.is_published;
      if (filter === 'published') return story.is_published;
      return true;
    });
  }, [filter, stories]);

  const summary = {
    total: stories.length,
    published: stories.filter((story) => story.is_published).length,
    pending: stories.filter((story) => !story.is_published).length,
  };

  const updateStory = async (story: StoryRow, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from('impact_stories')
        .update({ is_published: isPublished })
        .eq('id', story.id);

      if (error) throw error;

      setStories((current) =>
        current.map((item) =>
          item.id === story.id ? { ...item, is_published: isPublished } : item
        )
      );

      if (story.user_id) {
        await AppNotificationService.notifyUser(story.user_id, {
          title: isPublished ? 'Impact story approved' : 'Impact story unpublished',
          message: isPublished
            ? 'Your success story has been approved and is now live on the Impact page.'
            : 'Your success story has been moved out of the public Impact page for further review.',
          type: isPublished ? 'success' : 'warning',
          data: {
            action: 'impact_story_moderation',
            storyId: story.id,
            published: isPublished,
          },
        }).catch((error) => console.warn('Impact story notification failed:', error));
      }

      toast.success(isPublished ? 'Story approved and published.' : 'Story moved back to moderation.');
    } catch (error) {
      console.error('Error updating success story status:', error);
      toast.error('Story moderation update failed.');
    }
  };

  const handleCreateStory = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newStory.full_name.trim() || !newStory.story.trim()) {
      toast.error('Name and story text are required.');
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from('impact_stories').insert({
        full_name: newStory.full_name.trim(),
        role: newStory.role.trim() || null,
        organization: newStory.organization.trim() || null,
        story: newStory.story.trim(),
        image_url: newStory.image_url.trim() || null,
        is_published: newStory.publishNow
      });

      if (error) throw error;

      toast.success(newStory.publishNow ? 'Story created and published.' : 'Story created in review queue.');
      setNewStory({
        full_name: '',
        role: '',
        organization: '',
        story: '',
        image_url: '',
        publishNow: false
      });
      setImagePreview(null);
      await loadStories();
    } catch (error) {
      console.error('Error creating impact story:', error);
      toast.error('Story could not be created.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!window.confirm('Delete this story from the moderation queue?')) return;

    try {
      const { error } = await supabase.from('impact_stories').delete().eq('id', storyId);
      if (error) throw error;
      setStories((current) => current.filter((story) => story.id !== storyId));
      toast.success('Story removed.');
    } catch (error) {
      console.error('Error deleting impact story:', error);
      toast.error('Story could not be deleted.');
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }

    setIsImageUploading(true);
    try {
      const { url } = await uploadFile(file, 'stories');
      setNewStory((current) => ({ ...current, image_url: url }));
      setImagePreview(url);
      toast.success('Image uploaded.');
    } catch (error) {
      console.error('Error uploading story image:', error);
      toast.error('Image upload failed.');
    } finally {
      setIsImageUploading(false);
    }
  };

  const removeImage = () => {
    setNewStory((current) => ({ ...current, image_url: '' }));
    setImagePreview(null);
  };

  return (
    <div className="admin-section-shell">
      <form onSubmit={handleCreateStory} className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Create a new impact story</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Admin-created stories can be saved directly to the review queue or published immediately.
            </p>
          </div>
          <button type="submit" disabled={isCreating} className="sp-btn-primary inline-flex items-center gap-2 px-4 py-2 disabled:opacity-60">
            <PlusCircle size={16} />
            {isCreating ? 'Saving...' : 'Create story'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Member name</label>
            <input
              value={newStory.full_name}
              onChange={(event) => setNewStory((current) => ({ ...current, full_name: event.target.value }))}
              className="input-glass w-full"
              placeholder="Example: Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Role</label>
            <input
              value={newStory.role}
              onChange={(event) => setNewStory((current) => ({ ...current, role: event.target.value }))}
              className="input-glass w-full"
              placeholder="Example: Policy Analyst"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Organization or project</label>
            <input
              value={newStory.organization}
              onChange={(event) => setNewStory((current) => ({ ...current, organization: event.target.value }))}
              className="input-glass w-full"
              placeholder="Example: Ministry of Health"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--text-primary)]">Story image</label>
            <div className="space-y-3">
              {imagePreview ? (
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Story preview"
                    className="h-16 w-16 rounded-2xl object-cover border border-white/10"
                  />
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-[var(--text-secondary)]">Image ready</span>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="sp-btn-glass px-3 py-1 text-xs inline-flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer hover:border-[var(--sp-accent)]/60 transition-colors">
                  <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <ImagePlus size={18} />
                    <span className="text-sm">
                      {isImageUploading ? 'Uploading image...' : 'Upload image from local storage'}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">JPG, PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isImageUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      void handleImageUpload(file);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--text-primary)]">Story</label>
          <textarea
            value={newStory.story}
            onChange={(event) => setNewStory((current) => ({ ...current, story: event.target.value }))}
            className="input-glass w-full min-h-[140px]"
            placeholder="Describe the impact story to publish."
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={newStory.publishNow}
            onChange={(event) => setNewStory((current) => ({ ...current, publishNow: event.target.checked }))}
            className="w-4 h-4 rounded"
          />
          Publish immediately on the Impact page
        </label>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Submitted', value: summary.total },
          { label: 'Published', value: summary.published },
          { label: 'Pending review', value: summary.pending },
        ].map((item) => (
          <div key={item.label} className="admin-surface-card premium-glass p-5 rounded-[24px] border border-white/5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--text-secondary)]">{item.label}</p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-4">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All stories' },
            { id: 'pending', label: 'Pending review' },
            { id: 'published', label: 'Published' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as 'all' | 'pending' | 'published')}
              className={`rounded-full px-4 py-2 text-sm ${
                filter === item.id
                  ? 'bg-[var(--sp-accent)] text-[var(--text-inverse)]'
                  : 'bg-white/5 text-[var(--text-secondary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredStories.map((story) => (
          <div key={story.id} className="admin-surface-card premium-glass p-6 rounded-[28px] border border-white/5">
            <div className="flex flex-col xl:flex-row gap-5 xl:items-start xl:justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{story.full_name}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusTone(story.is_published ? 'approved' : 'pending')}`}>
                    {story.is_published ? 'published' : 'pending'}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {story.role || 'Role not supplied'}{story.organization ? ` · ${story.organization}` : ''}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">Submitted {formatAdminDate(story.created_at)}</p>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] whitespace-pre-wrap">
                  {story.story}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 xl:max-w-xs">
                <button onClick={() => updateStory(story, !story.is_published)} className="sp-btn-primary px-4 py-2 text-sm">
                  {story.is_published ? 'Move back to review' : 'Approve and publish'}
                </button>
                <button onClick={() => deleteStory(story.id)} className="sp-btn-glass px-4 py-2 text-sm text-red-300 border-red-500/20">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredStories.length === 0 && (
        <div className="admin-surface-card premium-glass p-10 rounded-[28px] border border-dashed border-white/10 text-center text-[var(--text-secondary)]">
          No success stories match this moderation view.
        </div>
      )}
    </div>
  );
};

export default AdminSuccessStoriesPage;
