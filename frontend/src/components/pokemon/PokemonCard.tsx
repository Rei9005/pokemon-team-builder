import type { Pokemon } from '@/types/pokemon';

interface PokemonCardProps {
  pokemon: Pokemon;
  onClick?: () => void;
}

export function PokemonCard({ pokemon, onClick }: PokemonCardProps) {
  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-4 hover:shadow-lg cursor-pointer transition-shadow bg-white"
    >
      <img
        src={pokemon.sprite}
        alt={pokemon.name}
        className="w-24 h-24 mx-auto"
      />
      <p className="text-center font-bold text-gray-700">#{pokemon.id}</p>
      <p className="text-center text-lg font-semibold">{pokemon.name}</p>
      <p className="text-center text-sm text-gray-500">{pokemon.nameEn}</p>
      
      <div className="flex justify-center gap-1 mt-2">
        {pokemon.types.map((type) => (
          <span
            key={type}
            className="px-2 py-1 bg-gray-200 rounded text-xs font-medium"
          >
            {type}
          </span>
        ))}
      </div>
      
      <p className="text-center text-sm text-gray-600 mt-2">
        Total: {pokemon.stats.total}
      </p>
    </div>
  );
}
