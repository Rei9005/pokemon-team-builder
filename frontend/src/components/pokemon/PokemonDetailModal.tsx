'use client';

import { useEffect } from 'react';
import type { PokemonDetail } from '@/types/pokemon';

interface PokemonDetailModalProps {
  pokemon: PokemonDetail;
  onClose: () => void;
}

export function PokemonDetailModal({ pokemon, onClose }: PokemonDetailModalProps) {
  // Close modal on ESC key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Type colors for badges
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-300',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-600',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-700',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
  };

  // Convert height from decimeters to meters
  const heightInMeters = (pokemon.height / 10).toFixed(1);
  // Convert weight from hectograms to kilograms
  const weightInKg = (pokemon.weight / 10).toFixed(1);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{pokemon.name}</h2>
            <p className="text-gray-600 text-sm capitalize">{pokemon.nameEn}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pokemon Image and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Image */}
            <div className="flex-shrink-0">
              <img
                src={pokemon.sprite}
                alt={pokemon.name}
                className="w-48 h-48 mx-auto"
              />
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">No.</p>
                <p className="text-xl font-bold">#{pokemon.id.toString().padStart(3, '0')}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Type</p>
                <div className="flex gap-2">
                  {pokemon.types.map((type) => (
                    <span
                      key={type}
                      className={`${
                        typeColors[type] || 'bg-gray-400'
                      } text-white px-3 py-1 rounded-full text-sm capitalize`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Height</p>
                  <p className="font-semibold">{heightInMeters} m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Weight</p>
                  <p className="font-semibold">{weightInKg} kg</p>
                </div>
              </div>
            </div>
          </div>

          {/* Abilities */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Abilities</h3>
            <div className="flex flex-wrap gap-2">
              {pokemon.abilities.map((ability) => (
                <span
                  key={ability}
                  className="bg-gray-100 px-3 py-1 rounded-lg text-sm capitalize"
                >
                  {ability.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Base Stats */}
          <div>
            <h3 className="text-lg font-bold mb-3">Base Stats</h3>
            <div className="space-y-2">
              {/* HP */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700">HP</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${(pokemon.stats.hp / 255) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold">{pokemon.stats.hp}</span>
              </div>

              {/* Attack */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700">Attack</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${(pokemon.stats.attack / 255) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold">{pokemon.stats.attack}</span>
              </div>

              {/* Defense */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700">Defense</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(pokemon.stats.defense / 255) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold">{pokemon.stats.defense}</span>
              </div>

              {/* Sp. Attack */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700">Sp. Attack</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full"
                    style={{ width: `${(pokemon.stats.specialAttack / 255) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold">{pokemon.stats.specialAttack}</span>
              </div>

              {/* Sp. Defense */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700">Sp. Defense</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-yellow-500 h-full"
                    style={{ width: `${(pokemon.stats.specialDefense / 255) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold">{pokemon.stats.specialDefense}</span>
              </div>

              {/* Speed */}
              <div className="flex items-center gap-3">
                <span className="w-24 text-sm font-medium text-gray-700">Speed</span>
                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-pink-500 h-full"
                    style={{ width: `${(pokemon.stats.speed / 255) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold">{pokemon.stats.speed}</span>
              </div>

              {/* Total */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <span className="w-24 text-sm font-bold text-gray-700">Total</span>
                <div className="flex-1"></div>
                <span className="w-12 text-right text-lg font-bold text-blue-600">{pokemon.stats.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}