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

export interface PokemonListResponse {
  data: Pokemon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
