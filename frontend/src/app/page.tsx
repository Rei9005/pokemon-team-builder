'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PokemonCard } from '@/components/pokemon/PokemonCard';
import { PokemonDetailModal } from '@/components/pokemon/PokemonDetailModal';
import type { Pokemon, PokemonDetail } from '@/types/pokemon';

export default function PokemonListPage() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [generation, setGeneration] = useState<number | undefined>();
  const [type, setType] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchPokemon = async () => {
      setIsLoading(true);
      try {
        const data = await api.getPokemon({
          page,
          limit: 20,
          generation,
          type,
          search,
        });
        setPokemon(data.data);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        console.error('Failed to fetch pokemon:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemon();
  }, [page, generation, type, search]);

  // Handle card click
  const handleCardClick = async (pokemonId: number) => {
    setIsLoadingDetail(true);
    try {
      const detail = await api.getPokemonDetail(pokemonId);
      setSelectedPokemon(detail);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch pokemon detail:', error);
      alert('Failed to load pokemon details');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Pokemon List</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Generation</label>
          <select
            value={generation || ''}
            onChange={(e) => {
              setGeneration(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
              <option key={gen} value={gen}>
                Gen {gen}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            value={type || ''}
            onChange={(e) => {
              setType(e.target.value || undefined);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All</option>
            {['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {/* Pokemon Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pokemon.map((p) => (
              <PokemonCard
                key={p.id}
                pokemon={p}
                onClick={() => handleCardClick(p.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>
            
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {isModalOpen && selectedPokemon && (
        <PokemonDetailModal pokemon={selectedPokemon} onClose={handleCloseModal} />
      )}

      {/* Loading overlay for detail fetch */}
      {isLoadingDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <p className="text-gray-700">Loading details...</p>
          </div>
        </div>
      )}
    </div>
  );
}