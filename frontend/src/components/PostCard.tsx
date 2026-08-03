import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Trash2, MoreHorizontal } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLiking, setIsLiking] = useState(false);

  const isOwner = user?.id === post.owner_id;

  // Optimistic Like Mutation
  const voteMutation = useMutation({
    mutationFn: async () => {
      const dir = post.user_voted ? 0 : 1;
      await api.post('/vote/', { post_id: post.id, dir });
    },
    onMutate: async () => {
      setIsLiking(true);
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData<Post[]>(['posts']);

      queryClient.setQueryData<Post[]>(['posts'], (old) => {
        if (!old) return [];
        return old.map((p) => {
          if (p.id === post.id) {
            const nextVoted = !p.user_voted;
            const countDiff = nextVoted ? 1 : -1;
            return {
              ...p,
              user_voted: nextVoted,
              votes_count: Math.max(0, p.votes_count + countDiff),
            };
          }
          return p;
        });
      });

      return { previousPosts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setTimeout(() => setIsLiking(false), 300);
    },
  });

  // Delete Post Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/posts/${post.id}`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const previousPosts = queryClient.getQueryData<Post[]>(['posts']);
      queryClient.setQueryData<Post[]>(['posts'], (old) =>
        old ? old.filter((p) => p.id !== post.id) : []
      );
      return { previousPosts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const formattedDate = new Date(post.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const avatarInitial = post.owner?.email ? post.owner.email[0].toUpperCase() : 'U';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-inner">
            {avatarInitial}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                {post.owner?.email.split('@')[0]}
              </span>
              {isOwner && (
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold">
                  You
                </span>
              )}
            </div>
            <span className="text-xs text-slate-400">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {isOwner && (
            <button
              onClick={() => {
                if (window.confirm('Delete this post?')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-4 space-y-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {post.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-6">
          <motion.button
            whileTap={{ scale: 0.85 }}
            animate={isLiking ? { scale: [1, 1.35, 1], rotate: [0, -15, 15, 0] } : {}}
            onClick={() => {
              if (!user) {
                alert('Please log in to like posts');
                return;
              }
              voteMutation.mutate();
            }}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${
              post.user_voted
                ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40'
                : 'hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={post.user_voted ? 'liked' : 'unliked'}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Heart
                  className={`w-4 h-4 ${post.user_voted ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </motion.div>
            </AnimatePresence>
            <span>{post.votes_count}</span>
          </motion.button>

          <button className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>Comments</span>
          </button>
        </div>

        <button className="flex items-center space-x-2 px-3 py-1.5 rounded-full hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </motion.article>
  );
};
