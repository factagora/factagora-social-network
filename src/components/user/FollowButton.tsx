"use client";

import { useState } from 'react';

interface FollowButtonProps {
  userId: string;
  initialFollowing: boolean;
  followerCount: number;
}

export function FollowButton({ userId, initialFollowing, followerCount }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(followerCount);
  const [loading, setLoading] = useState(false);

  const handleToggleFollow = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: isFollowing ? 'unfollow' : 'follow' })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle follow');
      }

      setIsFollowing(!isFollowing);
      setCount(prev => isFollowing ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleToggleFollow}
        disabled={loading}
        className={`px-6 py-2 font-semibold rounded-lg transition-colors disabled:opacity-50 ${
          isFollowing
            ? 'bg-slate-700 hover:bg-slate-600 text-white'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
      </button>
      <div className="text-sm text-slate-400">
        <span className="font-semibold text-white">{count}</span> followers
      </div>
    </div>
  );
}
