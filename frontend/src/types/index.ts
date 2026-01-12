export interface Pokemon {
  id: number;
  name: string;
  nameEn: string;
  types: string[];
  sprite: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
    total: number;
  };
}

export interface Team {
  id: string;
  name: string;
  isPublic: boolean;
  shareId: string | null;
  pokemon: TeamPokemon[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamPokemon {
  id: string;
  position: number;
  pokemonId: number;
  pokemon: Pokemon;
}
