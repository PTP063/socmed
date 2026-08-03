import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Heart, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { Post } from '../types';
import { PostCard } from '../components/PostCard';
import { FeedSkeleton } from '../components/SkeletonLoader';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await api.get<Post[]>('/posts/');
      return res.data;
    },
  });

  if (!user) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <p className="text-slate-600 dark:text-slate-400">Please sign in to view your profile.</p>
      </div>
    );
  }

  const userPosts = posts ? posts.filter((p) => p.owner_id === user.id) : [];
  const totalLikes = userPosts.reduce((acc, p) => acc + p.votes_count, 0);

  const joinedDate = new Date(user.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Profile Banner & Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
        {/* Cover Photo */}
        <div className="h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative" />

        {/* User Info Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-12 mb-4 gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-xl">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-inner">
                {user.email[0].toUpperCase()}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-full shadow-md transition-all">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {user.email.split('@')[0]}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>

            <div className="flex items-center space-x-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center space-x-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-900 dark:text-slate-100">{userPosts.length}</span>
                <span className="text-slate-500 text-xs">Posts</span>
              </div>

              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="font-bold text-slate-900 dark:text-slate-100">{totalLikes}</span>
                <span className="text-slate-500 text-xs">Likes Received</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Posts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Your Posts</h3>
        {isLoading ? (
          <FeedSkeleton />
        ) : userPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm">
            You haven't published any posts yet.
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
