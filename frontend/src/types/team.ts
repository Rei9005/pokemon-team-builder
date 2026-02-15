export interface TeamPokemon {
  id: string;
  position: number;
  pokemonId: number;
  pokemon: {
    id: number;
    name: string;
    nameEn: string;
    types: string[];
    sprite: string;
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

export interface TeamListResponse {
  teams: Team[];
}

export interface CreateTeamRequest {
  name: string;
  isPublic: boolean;
  pokemon: {
    pokemonId: number;
    position: number;
  }[];
}

export interface UpdateTeamRequest {
  name?: string;
  isPublic?: boolean;
  pokemon?: {
    pokemonId: number;
    position: number;
  }[];
}
