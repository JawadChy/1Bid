'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Profile {
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  visitor_id?: string;
  is_visitor: boolean;
  profile?: Profile;
}

export function Comments({ listingId }: { listingId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments?listing_id=${listingId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const { data } = await response.json();
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments', { position: 'bottom-center' });
    }
  };

  useEffect(() => {
    fetchComments();
    
    const channel = supabase
      .channel(`comments-${listingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comment',
        filter: `listing_id=eq.${listingId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          content: newComment.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      toast.success('Comment posted successfully', {
        position: 'bottom-center'
      });
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment', {
        position: 'bottom-center'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCommentorName = (comment: Comment) => {
    if (comment.is_visitor) {
      return `Visitor_${comment.visitor_id?.slice(0, 6)}`;
    }
    if (comment.profile?.first_name && comment.profile?.last_name) {
      return `${comment.profile.first_name} ${comment.profile.last_name}`;
    }
    return 'Unknown';
  };

  const getInitial = (comment: Comment) => {
    if (comment.is_visitor) return 'V';
    return comment.profile?.first_name?.[0] || '?';
  };

  const getAvatarColor = (comment: Comment) => {
    if (comment.is_visitor) {
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    }
    if (comment.profile?.role === 'S') {
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    }
    return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
  };

  const getNameColor = (comment: Comment) => {
    if (comment.is_visitor) {
      return 'text-green-600 dark:text-green-400';
    }
    if (comment.profile?.role === 'S') {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[100px]"
        />
        <Button 
          type="submit"
          disabled={loading || !newComment.trim()}
          className="w-full md:w-auto"
        >
          Post Comment
        </Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 p-4 rounded-lg bg-white/50 dark:bg-zinc-800/50">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              getAvatarColor(comment)
            )}>
              <span className="text-base font-medium">
                {getInitial(comment)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={cn("font-medium", getNameColor(comment))}>
                  {getCommentorName(comment)}
                </p>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}