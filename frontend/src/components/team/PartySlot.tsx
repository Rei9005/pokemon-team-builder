'use client';

import Image from 'next/image';
import { useDroppable } from '@dnd-kit/core';
import { TeamPokemon } from '@/contexts/TeamContext';

interface PartySlotProps {
  index: number;
  pokemon: TeamPokemon | null;
  onRemove: (position: number) => void;
}

export function PartySlot({ index, pokemon, onRemove }: PartySlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { position: index },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative transition-all
        ${isOver ? 'border-blue-400 bg-blue-50 scale-105' : 'border-gray-300 bg-white'}
        ${pokemon ? 'border-solid border-gray-200' : ''}
      `}
    >
      {pokemon ? (
        <>
          <Image
            src={pokemon.sprite}
            alt={pokemon.nameEn}
            width={64}
            height={64}
            className="pixelated"
          />
          <p className="text-xs text-gray-600 truncate w-full text-center px-1">
            {pokemon.name}
          </p>
          <button
            onClick={() => onRemove(index)}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Remove pokemon"
          >
            ×
          </button>
        </>
      ) : (
        <span className="text-gray-300 text-2xl">+</span>
      )}
    </div>
  );
}
