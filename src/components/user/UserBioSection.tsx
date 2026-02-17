"use client";

import { useState } from 'react';

interface UserBioSectionProps {
  bio?: string;
  location?: string;
  joinedDate: string;
  website?: string;
  twitter?: string;
  isOwner?: boolean;
  onEdit?: (bio: string) => Promise<void>;
}

export function UserBioSection({
  bio,
  location,
  joinedDate,
  website,
  twitter,
  isOwner = false,
  onEdit
}: UserBioSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(bio || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onEdit) return;

    setSaving(true);
    try {
      await onEdit(editedBio);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
      alert('Failed to update bio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-white">About</h3>
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editedBio}
            onChange={(e) => setEditedBio(e.target.value)}
            placeholder="Tell others about yourself..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            rows={4}
            maxLength={500}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {editedBio.length} / 500 characters
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditedBio(bio || '');
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {bio ? (
            <p className="text-slate-300 mb-4 whitespace-pre-wrap">{bio}</p>
          ) : (
            <p className="text-slate-500 italic mb-4">No bio yet</p>
          )}

          <div className="space-y-2 text-sm">
            {location && (
              <div className="flex items-center gap-2 text-slate-400">
                <span>📍</span>
                <span>{location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-400">
              <span>📅</span>
              <span>Joined {new Date(joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
            {website && (
              <div className="flex items-center gap-2 text-slate-400">
                <span>🔗</span>
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {twitter && (
              <div className="flex items-center gap-2 text-slate-400">
                <span>𝕏</span>
                <a
                  href={`https://twitter.com/${twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  @{twitter}
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
