'use client';

const TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

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
  steel: 'bg-gray-400',
  fairy: 'bg-pink-300',
};

interface TypeCoverageData {
  defensive: Record<string, number>;
  weaknessCount: number;
  resistanceCount: number;
  immunityCount: number;
}

interface TypeCoverageChartProps {
  data: TypeCoverageData;
}

function getMultiplierDisplay(value: number): {
  label: string;
  className: string;
} {
  if (value === 0)
    return { label: '✕', className: 'bg-gray-900 text-white font-bold' };
  if (value === 0.25)
    return { label: '¼', className: 'bg-green-600 text-white font-bold' };
  if (value === 0.5)
    return { label: '½', className: 'bg-green-400 text-white' };
  if (value === 1)
    return { label: '1', className: 'bg-gray-100 text-gray-400' };
  if (value === 2) return { label: '2', className: 'bg-red-400 text-white' };
  if (value === 4)
    return { label: '4', className: 'bg-red-600 text-white font-bold' };
  return { label: String(value), className: 'bg-gray-100 text-gray-400' };
}

export function TypeCoverageChart({ data }: TypeCoverageChartProps) {
  return (
    <div>
      {/* Stats Summary */}
      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
          <span className="text-sm text-gray-600">
            Weaknesses: <strong>{data.weaknessCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
          <span className="text-sm text-gray-600">
            Resistances: <strong>{data.resistanceCount}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-700 inline-block" />
          <span className="text-sm text-gray-600">
            Immunities: <strong>{data.immunityCount}</strong>
          </span>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <div className="flex flex-wrap gap-2 min-w-max">
          {TYPES.map((type) => {
            const value = data.defensive[type] ?? 1;
            const { label, className } = getMultiplierDisplay(value);
            return (
              <div key={type} className="flex flex-col items-center gap-1">
                <span
                  className={`text-xs text-white px-2 py-0.5 rounded-full ${TYPE_COLORS[type]}`}
                >
                  {type}
                </span>
                <span
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm ${className}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-500">
        <span>
          <span className="inline-block w-4 h-4 bg-red-600 rounded mr-1 align-middle" />
          4× weak
        </span>
        <span>
          <span className="inline-block w-4 h-4 bg-red-400 rounded mr-1 align-middle" />
          2× weak
        </span>
        <span>
          <span className="inline-block w-4 h-4 bg-gray-100 border rounded mr-1 align-middle" />
          1× normal
        </span>
        <span>
          <span className="inline-block w-4 h-4 bg-green-400 rounded mr-1 align-middle" />
          ½× resist
        </span>
        <span>
          <span className="inline-block w-4 h-4 bg-green-600 rounded mr-1 align-middle" />
          ¼× resist
        </span>
        <span>
          <span className="inline-block w-4 h-4 bg-gray-900 rounded mr-1 align-middle" />
          immune
        </span>
      </div>
    </div>
  );
}
