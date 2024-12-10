'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentUser {
  email?: string;
  profile?: {
    first_name?: string;
    last_name?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  visitor_id?: string;
  is_visitor: boolean;
  user?: CommentUser;
}

export function Comments({ listingId }: { listingId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  
  const fetchComments = async () => {
    const response = await fetch(`/api/comments?listing_id=${listingId}`);
    const { data } = await response.json();
    setComments(data || []);
  };

  useEffect(() => {
    fetchComments();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('comments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
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
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing_id: listingId,
        content: newComment.trim()
      })
    });

    if (!response.ok) {
      toast.error('Failed to post comment', {
        position: 'bottom-center'
      });
    } else {
      toast.success('Comment posted successfully', {
        position: 'bottom-center'
      });
      setNewComment('');
      await fetchComments();
    }
    setLoading(false);
  };

  const getCommentorName = (comment: Comment) => {
    if (comment.is_visitor) {
      return `Visitor_${comment.visitor_id?.slice(0, 6)}`;
    }
    if (comment.user?.profile?.first_name) {
      return `${comment.user.profile.first_name} ${comment.user.profile.last_name}`;
    }
    return comment.user?.email?.split('@')[0] || 'Unknown';
  };

  const getInitial = (comment: Comment) => {
    if (comment.is_visitor) return 'V';
    return comment.user?.profile?.first_name?.[0] || 
           comment.user?.email?.[0]?.toUpperCase() || 
           '?';
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
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="text-base font-medium text-blue-600 dark:text-blue-400">
                {getInitial(comment)}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">
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