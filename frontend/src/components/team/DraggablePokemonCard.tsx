'use client';

import Image from 'next/image';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { TeamPokemon } from '@/contexts/TeamContext';

interface DraggablePokemonCardProps {
  pokemon: TeamPokemon;
}

export function DraggablePokemonCard({ pokemon }: DraggablePokemonCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `pokemon-${pokemon.id}`,
      data: { pokemon },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white rounded-xl p-2 flex flex-col items-center gap-1 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all select-none"
    >
      <Image
        src={pokemon.sprite}
        alt={pokemon.nameEn}
        width={64}
        height={64}
        className="pixelated"
      />
      <p className="text-xs font-medium text-gray-700 truncate w-full text-center">
        {pokemon.name}
      </p>
      <div className="flex gap-1">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600"
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
}
