'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/contexts/ToastContext';
import type { Team } from '@/types/team';

interface TeamCardProps {
  team: Team;
  onDelete: (teamId: string) => void;
}

export function TeamCard({ team, onDelete }: TeamCardProps) {
  const router = useRouter();
  const { loadTeam } = useTeam();
  const { showToast } = useToast();

  const handleEditClick = async () => {
    try {
      await loadTeam(team.id);
      router.push('/team-builder');
    } catch (err) {
      showToast('Failed to load team. Please try again.', 'error');
    }
  };

  const handleShareClick = () => {
    if (!team.shareId) {
      showToast('This team is not public', 'warning');
      return;
    }
    // Navigate to the shared team page
    router.push(`/teams/${team.shareId}`);
  };

  const handleDeleteClick = () => {
    if (confirm(`Are you sure you want to delete "${team.name}"?`)) {
      onDelete(team.id);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-bold truncate flex-1" title={team.name}>
          {team.name}
        </h3>
        <span className="text-sm ml-2 flex-shrink-0">
          {team.isPublic ? '🔓 Public' : '🔒 Private'}
        </span>
      </div>

      {/* Pokemon icons */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {team.pokemon
          .sort((a, b) => a.position - b.position)
          .map((tp) => (
            <div key={tp.id} className="relative group">
              <Image
                src={tp.pokemon.sprite}
                alt={tp.pokemon.name}
                width={48}
                height={48}
                className="w-12 h-12"
                title={tp.pokemon.name}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tp.pokemon.name}
              </div>
            </div>
          ))}

        {/* Empty slots */}
        {Array.from({ length: 6 - team.pokemon.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs"
          >
            +
          </div>
        ))}
      </div>

      {/* Created date */}
      <p className="text-sm text-gray-500 mb-3">
        Created: {new Date(team.createdAt).toLocaleDateString()}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleEditClick}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Edit
        </button>

        {team.shareId && (
          <button
            onClick={handleShareClick}
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Share
          </button>
        )}

        <button
          onClick={handleDeleteClick}
          className="bg-red-600 text-white py-2 px-3 rounded hover:bg-red-700 transition-colors text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
