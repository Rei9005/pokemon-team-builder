'use client';

import { useState } from 'react';

interface SaveTeamModalProps {
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSave: (name: string, isPublic: boolean) => Promise<void>;
}

export function SaveTeamModal({
  isOpen,
  isEditing,
  onClose,
  onSave,
}: SaveTeamModalProps) {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a team name');
      return;
    }
    if (name.length > 100) {
      setError('Team name must be 100 characters or less');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave(name.trim(), isPublic);
      setName('');
      setIsPublic(false);
      onClose();
    } catch {
      setError('Failed to save team. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Update Team' : 'Save Team'}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g. My Awesome Team"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            maxLength={100}
            autoFocus
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-blue-500' : 'bg-gray-300'
              } relative`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-sm text-gray-700">Make this team public</span>
          </label>
          <p className="text-xs text-gray-400 mt-1 ml-14">
            Public teams can be shared via URL
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 font-medium"
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
