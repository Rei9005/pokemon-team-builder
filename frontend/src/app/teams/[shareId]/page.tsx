'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useTeam } from '@/contexts/TeamContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { Team } from '@/types/team';

const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-gray-400',
  fire: 'bg-orange-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-cyan-300',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-300',
  psychic: 'bg-pink-500',
  bug: 'bg-lime-500',
  rock: 'bg-yellow-700',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-600',
  dark: 'bg-gray-700',
  steel: 'bg-slate-400',
  fairy: 'bg-pink-300',
};

export default function SharedTeamPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const { user } = useAuth();
  const { loadTeam } = useTeam();
  const { showToast } = useToast();

  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await api.getSharedTeam(shareId);
        setTeam(data);
      } catch {
        setError('This team could not be found or is no longer public.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [shareId]);

  const handleCopyUrl = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  // Load this team into Team Builder (requires login)
  const handleUseTeam = async () => {
    if (!user) {
      showToast('Please log in to use this team', 'warning');
      router.push('/login');
      return;
    }
    if (!team) return;

    setIsLoadingTeam(true);
    try {
      await loadTeam(team.id);
      showToast('Team loaded! You can now edit it.', 'success');
      router.push('/team-builder');
    } catch {
      showToast('Failed to load team', 'error');
    } finally {
      setIsLoadingTeam(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">{error ?? 'Team not found.'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Go Home
        </button>
      </div>
    );
  }

  // Build ordered slots array
  const slots = Array<Team['pokemon'][number] | null>(6).fill(null);
  team.pokemon.forEach((tp) => {
    if (tp.position >= 0 && tp.position < 6) {
      slots[tp.position] = tp;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="text-sm text-gray-400 mb-1">Shared Team</p>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {team.pokemon.length} / 6 Pokémon
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              disabled={isCopying}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 text-gray-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 12h6a2 2 0 002-2v-8a2 2 0 00-2-2h-6a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {isCopying ? 'Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={handleUseTeam}
              disabled={isLoadingTeam}
              className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {isLoadingTeam ? 'Loading...' : 'Use This Team'}
            </button>
          </div>
        </div>

        {/* Party grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-10">
          {slots.map((slot, i) =>
            slot && slot.pokemon ? (
              <div
                key={i}
                className="bg-white rounded-2xl p-3 flex flex-col items-center gap-1 shadow-sm border border-gray-100"
              >
                <Image
                  src={slot.pokemon.sprite}
                  alt={slot.pokemon.nameEn}
                  width={72}
                  height={72}
                  className="object-contain"
                />
                <p className="text-xs font-semibold text-gray-800 text-center leading-tight">
                  {slot.pokemon.name}
                </p>
                <div className="flex gap-1 flex-wrap justify-center">
                  {slot.pokemon.types.map((t) => (
                    <span
                      key={t}
                      className={`px-1.5 py-0.5 text-[10px] text-white rounded-full font-medium ${TYPE_COLORS[t] ?? 'bg-gray-400'}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div
                key={i}
                className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center"
              >
                <span className="text-gray-300 text-2xl">＋</span>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          This is a read-only view.{' '}
          <button
            onClick={() => router.push('/team-builder')}
            className="underline hover:text-blue-500"
          >
            Build your own team →
          </button>
        </p>
      </div>
    </div>
  );
}
