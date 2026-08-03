import React from 'react';

export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
    </div>
  );
};

export const FeedSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
};
