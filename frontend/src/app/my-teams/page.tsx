'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { TeamCard } from '@/components/team/TeamCard';
import type { Team } from '@/types/team';

export default function MyTeamsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch teams
  useEffect(() => {
    if (!user) return;

    const fetchTeams = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getTeams();
        setTeams(data.teams || []);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
        setError('Failed to load teams. Please try again.');
        setTeams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [user]);

  // Handle delete
  const handleDelete = async (teamId: string) => {
    try {
      await api.deleteTeam(teamId);
      setTeams(teams.filter((t) => t.id !== teamId));
    } catch (err) {
      console.error('Failed to delete team:', err);
      alert('Failed to delete team. Please try again.');
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">My Teams</h1>
        <button
          onClick={() => router.push('/team-builder')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + New Team
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        {teams?.length || 0}/10 teams
      </p>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading teams...</p>
        </div>
      ) : teams.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12">
          <div className="mb-4">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No teams yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first team to get started!
          </p>
          <button
            onClick={() => router.push('/team-builder')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Your First Team
          </button>
        </div>
      ) : (
        /* Teams Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}