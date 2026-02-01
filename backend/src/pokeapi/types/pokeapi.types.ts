/**
 * PokeAPI Response Type Definitions
 * Based on https://pokeapi.co/docs/v2
 */

/**
 * Pokemon type slot
 */
export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

/**
 * Pokemon stat
 */
export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

/**
 * Pokemon sprite URLs
 */
export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  front_female: string | null;
  front_shiny_female: string | null;
  back_default: string | null;
  back_shiny: string | null;
  back_female: string | null;
  back_shiny_female: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

/**
 * Pokemon ability
 */
export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: {
    name: string;
    url: string;
  };
}

/**
 * Main Pokemon data response from /pokemon/:id
 */
export interface Pokemon {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  is_default: boolean;
  order: number;
  abilities: PokemonAbility[];
  types: PokemonType[];
  stats: PokemonStat[];
  sprites: PokemonSprites;
}

/**
 * Localized name
 */
export interface LocalizedName {
  name: string;
  language: {
    name: string;
    url: string;
  };
}

/**
 * Pokemon species data response from /pokemon-species/:id
 */
export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  names: LocalizedName[];
  generation: {
    name: string;
    url: string;
  };
}

/**
 * Type relation (damage multipliers)
 */
export interface TypeRelation {
  name: string;
  url: string;
}

/**
 * Damage relations for a type
 */
export interface DamageRelations {
  no_damage_to: TypeRelation[];
  half_damage_to: TypeRelation[];
  double_damage_to: TypeRelation[];
  no_damage_from: TypeRelation[];
  half_damage_from: TypeRelation[];
  double_damage_from: TypeRelation[];
}

/**
 * Type data response from /type/:name
 */
export interface TypeData {
  id: number;
  name: string;
  damage_relations: DamageRelations;
  generation: {
    name: string;
    url: string;
  };
  move_damage_class: {
    name: string;
    url: string;
  } | null;
}
