import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Image, Video, Smile, Plus } from 'lucide-react';
import { api } from '../api/client';
import type { Post } from '../types';
import { PostCard } from '../components/PostCard';
import { FeedSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';

interface FeedProps {
  searchQuery: string;
  onOpenCreateModal: () => void;
}

export const Feed: React.FC<FeedProps> = ({ searchQuery, onOpenCreateModal }) => {
  const { user } = useAuth();

  const { data: posts, isLoading, isError, error } = useQuery<Post[]>({
    queryKey: ['posts', searchQuery],
    queryFn: async () => {
      const res = await api.get<Post[]>('/posts/', {
        params: { search: searchQuery },
      });
      return res.data;
    },
    staleTime: 1000 * 30, // 30s caching
  });

  return (
    <div className="space-y-6">
      {/* Create Post Prompt Bar */}
      {user && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
              {user.email[0].toUpperCase()}
            </div>
            <button
              onClick={onOpenCreateModal}
              className="flex-1 text-left px-4 py-3 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl text-slate-400 text-sm font-medium transition-colors"
            >
              What's on your mind, {user.email.split('@')[0]}?
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs font-medium text-slate-500 dark:text-slate-400">
            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Video className="w-4 h-4 text-rose-500" />
              <span>Live Video</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Image className="w-4 h-4 text-emerald-500" />
              <span>Photo/video</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Smile className="w-4 h-4 text-amber-500" />
              <span>Feeling/activity</span>
            </button>
          </div>
        </div>
      )}

      {/* Feed Title / Status */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
          <span>Main Feed</span>
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </h2>
        {searchQuery && (
          <span className="text-xs text-slate-500">
            Results for "<span className="font-semibold">{searchQuery}</span>"
          </span>
        )}
      </div>

      {/* Feed Content */}
      {isLoading ? (
        <FeedSkeleton />
      ) : isError ? (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-6 text-center space-y-2">
          <p className="text-rose-600 dark:text-rose-400 font-semibold">Failed to load feed</p>
          <p className="text-xs text-slate-500">
            {error instanceof Error ? error.message : 'Check backend server connection'}
          </p>
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No posts found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Be the first to share something amazing with the community!
            </p>
          </div>
          {user && (
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};
