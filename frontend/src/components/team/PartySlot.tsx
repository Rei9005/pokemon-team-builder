'use client';

import Image from 'next/image';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TeamPokemon } from '@/contexts/TeamContext';

interface PartySlotProps {
  index: number;
  pokemon: TeamPokemon | null;
  onRemove: (position: number) => void;
}

export function PartySlot({ index, pokemon, onRemove }: PartySlotProps) {
  // ポケモンがいる場合はSortable、空の場合はDroppable
  const {
    setNodeRef: setSortableRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `slot-${index}`,
    data: { type: 'slot', position: index, pokemon },
    disabled: !pokemon,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `slot-${index}`,
    data: { position: index },
    disabled: !!pokemon,
  });

  const setNodeRef = pokemon ? setSortableRef : setDroppableRef;

  const style = pokemon
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 10 : 1,
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center relative transition-colors
        ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'}
        ${pokemon ? 'border-solid border-gray-200 cursor-grab' : ''}
        ${isDragging ? 'border-blue-300' : ''}
      `}
      {...(pokemon ? { ...attributes, ...listeners } : {})}
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
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Remove pokemon"
            onPointerDown={(e) => e.stopPropagation()}
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
