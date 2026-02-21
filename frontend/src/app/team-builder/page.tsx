'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, rectSwappingStrategy } from '@dnd-kit/sortable';
import { useTeam, TeamPokemon } from '@/contexts/TeamContext';
import { useToast } from '@/contexts/ToastContext';
import { PartySlot } from '@/components/team/PartySlot';
import { DraggablePokemonCard } from '@/components/team/DraggablePokemonCard';
import { api, fetchApi } from '@/lib/api';
import { TypeCoverageChart } from '@/components/team/TypeCoverageChart';

const POKEMON_PER_PAGE = 24;

export default function TeamBuilderPage() {
  const { party, addPokemon, removePokemon, movePokemon, clearTeam } =
    useTeam();
  const { showToast } = useToast();

  const [activePokemon, setActivePokemon] = useState<TeamPokemon | null>(null);
  const [pokemonList, setPokemonList] = useState<TeamPokemon[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typeCoverage, setTypeCoverage] = useState<{
    defensive: Record<string, number>;
    weaknessCount: number;
    resistanceCount: number;
    immunityCount: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const fetchPokemon = useCallback(
    async (pageNum: number, searchTerm: string) => {
      setIsLoading(true);
      try {
        const data = await api.getPokemon({
          page: pageNum,
          limit: POKEMON_PER_PAGE,
          search: searchTerm || undefined,
        });
        setPokemonList(
          data.data.map((p) => ({
            id: p.id,
            name: p.name,
            nameEn: p.nameEn,
            types: p.types,
            sprite: p.sprite,
          }))
        );
        setTotalPages(data.pagination.totalPages);
      } catch {
        showToast('Failed to load Pokémon', 'error');
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  const fetchTypeCoverage = useCallback(async () => {
    const pokemonIds = party.filter(Boolean).map((p) => p!.id);

    if (pokemonIds.length === 0) {
      setTypeCoverage(null);
      return;
    }

    try {
      const data = await fetchApi<{
        defensive: Record<string, number>;
        weaknessCount: number;
        resistanceCount: number;
        immunityCount: number;
      }>('/types/analyze', {
        method: 'POST',
        body: JSON.stringify({ pokemonIds }),
      });
      setTypeCoverage(data);
    } catch {
      showToast('Failed to analyze type coverage', 'error');
    }
  }, [party, showToast]);

  // Initial load
  useState(() => {
    fetchPokemon(1, '');
  });

  useEffect(() => {
    fetchTypeCoverage();
  }, [fetchTypeCoverage]);

  const handleDragStart = (event: DragStartEvent) => {
    const { data } = event.active;
    if (data.current?.pokemon) {
      setActivePokemon(data.current.pokemon);
    } else if (data.current?.type === 'slot' && data.current?.pokemon) {
      setActivePokemon(data.current.pokemon);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    setActivePokemon(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // スロット同士の入れ替え
    if (activeData?.type === 'slot' && overData?.position !== undefined) {
      const fromPosition = activeData.position as number;
      const toPosition = overData.position as number;
      if (fromPosition !== toPosition) {
        movePokemon(fromPosition, toPosition);
      }
      return;
    }

    // ポケモンリスト → スロットへのドロップ
    const pokemon = activeData?.pokemon as TeamPokemon;
    const position = overData?.position as number;

    if (pokemon && position !== undefined) {
      const success = addPokemon(pokemon, position);
      if (!success) {
        showToast(`${pokemon.name} is already in your party!`, 'warning');
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchPokemon(1, value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPokemon(newPage, search);
  };

  const slotIds = Array.from({ length: 6 }, (_, i) => `slot-${i}`);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Team Builder</h1>
            <button
              onClick={() => {
                clearTeam();
                showToast('Team cleared', 'info');
              }}
              className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              Clear All
            </button>
          </div>

          {/* Party Slots */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Your Party ({party.filter(Boolean).length}/6)
            </h2>
            <SortableContext items={slotIds} strategy={rectSwappingStrategy}>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <PartySlot
                    key={index}
                    index={index}
                    pokemon={party[index]}
                    onRemove={removePokemon}
                  />
                ))}
              </div>
            </SortableContext>
          </section>

          {/* Type Coverage */}
          <section className="mb-8 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Type Coverage
            </h2>
            {typeCoverage ? (
              <TypeCoverageChart data={typeCoverage} />
            ) : (
              <p className="text-gray-400 text-sm">
                Add Pokémon to your party to see type coverage.
              </p>
            )}
          </section>

          {/* Pokemon List */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Pokémon List
            </h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search Pokémon..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {Array.from({ length: POKEMON_PER_PAGE }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {pokemonList.map((pokemon) => (
                  <DraggablePokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
              >
                ←
              </button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100"
              >
                →
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activePokemon && (
          <div className="bg-white rounded-xl p-2 flex flex-col items-center gap-1 border border-blue-400 shadow-xl opacity-90">
            <Image
              src={activePokemon.sprite}
              alt={activePokemon.nameEn}
              width={64}
              height={64}
            />
            <p className="text-xs font-medium text-gray-700">
              {activePokemon.name}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
