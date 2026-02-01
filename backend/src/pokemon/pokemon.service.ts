import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PokeapiService } from '../pokeapi/pokeapi.service';
import {
  PokemonListItemDto,
  PokemonDetailDto,
  PokemonStatsDto,
} from './dto/pokemon.dto';

export interface CachedPokemon {
  id: number;
  nameEn: string;
  name: string;
  types: string[];
  sprite: string;
  stats: PokemonStatsDto;
  generation: number;
}

// Pokedex number ranges for each generation
const GENERATION_RANGES: Record<number, { min: number; max: number }> = {
  1: { min: 1, max: 151 },
  2: { min: 152, max: 251 },
  3: { min: 252, max: 386 },
  4: { min: 387, max: 493 },
  5: { min: 494, max: 649 },
  6: { min: 650, max: 721 },
  7: { min: 722, max: 809 },
  8: { min: 810, max: 905 },
  9: { min: 906, max: 1025 },
};

@Injectable()
export class PokemonService implements OnModuleInit {
  private readonly logger = new Logger(PokemonService.name);
  private cache: CachedPokemon[] = [];

  constructor(private readonly pokeapiService: PokeapiService) {}

  async onModuleInit() {
    await this.buildCache();
  }

  /**
   * Builds the initial Pokemon cache (Runs once on application startup)
   */
  private async buildCache(): Promise<void> {
    this.logger.log('Building pokemon cache...');

    const pokemonIds = Array.from({ length: 1025 }, (_, i) => i + 1);
    const batchSize = 50;
    const results: CachedPokemon[] = [];

    for (let i = 0; i < pokemonIds.length; i += batchSize) {
      const batch = pokemonIds.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (id) => {
          try {
            const [pokemon, species] = await Promise.all([
              this.pokeapiService.getPokemonById(id),
              this.pokeapiService.getPokemonSpecies(id),
            ]);

            const japaneseName =
              species.names.find((n) => n.language.name === 'ja')?.name ??
              pokemon.name;

            const stats = this.extractStats(pokemon.stats);

            return {
              id: pokemon.id,
              nameEn: pokemon.name,
              name: japaneseName,
              types: pokemon.types.map((t) => t.type.name),
              sprite: pokemon.sprites.front_default ?? '',
              stats,
              generation: this.extractGeneration(species.generation.name),
            } satisfies CachedPokemon;
          } catch {
            this.logger.warn(`Failed to fetch pokemon #${id}, skipping`);
            return null;
          }
        }),
      );

      results.push(
        ...batchResults.filter((r): r is CachedPokemon => r !== null),
      );
      this.logger.log(`Cached ${results.length}/1025 pokemon...`);
    }

    this.cache = results;
    this.logger.log(`Pokemon cache built: ${this.cache.length} entries`);
  }

  private extractStats(
    rawStats: Array<{ base_stat: number; stat: { name: string } }>,
  ): PokemonStatsDto {
    const getStat = (name: string) =>
      rawStats.find((s) => s.stat.name === name)?.base_stat ?? 0;

    const hp = getStat('hp');
    const attack = getStat('attack');
    const defense = getStat('defense');
    const specialAttack = getStat('special-attack');
    const specialDefense = getStat('special-defense');
    const speed = getStat('speed');

    return {
      hp,
      attack,
      defense,
      specialAttack,
      specialDefense,
      speed,
      total: hp + attack + defense + specialAttack + specialDefense + speed,
    };
  }

  private extractGeneration(genName: string): number {
    const match = genName.match(/generation-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Retrieves a Pokemon from cache by ID (used by TypeService for type lookups)
   */
  getByIdFromCache(id: number): CachedPokemon | undefined {
    return this.cache.find((p) => p.id === id);
  }

  /**
   * Retrieves a list of Pokemon with filtering and pagination (using cache)
   */
  getList(params: {
    page?: number;
    limit?: number;
    generation?: number;
    type?: string;
    search?: string;
  }): {
    data: PokemonListItemDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    let filtered = this.cache;

    if (params.generation) {
      const range = GENERATION_RANGES[params.generation];
      if (range) {
        filtered = filtered.filter(
          (p) => p.id >= range.min && p.id <= range.max,
        );
      }
    }

    if (params.type) {
      const types = params.type.split(',');
      filtered = filtered.filter((p) =>
        types.every((t) => p.types.includes(t)),
      );
    }

    if (params.search) {
      const query = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.nameEn.toLowerCase().includes(query),
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      data: paginated,
      pagination: { page, limit, total, totalPages },
    };
  }

  /**
   * Fetches detailed Pokemon information (fetches from PokeAPI on demand)
   */
  async getById(id: number): Promise<PokemonDetailDto | null> {
    try {
      const [pokemon, species] = await Promise.all([
        this.pokeapiService.getPokemonById(id),
        this.pokeapiService.getPokemonSpecies(id),
      ]);

      const japaneseName =
        species.names.find((n) => n.language.name === 'ja')?.name ??
        pokemon.name;

      const stats = this.extractStats(pokemon.stats);

      return {
        id: pokemon.id,
        nameEn: pokemon.name,
        name: japaneseName,
        types: pokemon.types.map((t) => t.type.name),
        sprite: pokemon.sprites.front_default ?? '',
        stats,
        generation: this.extractGeneration(species.generation.name),
        abilities: pokemon.abilities.map((a) => a.ability.name),
        height: pokemon.height,
        weight: pokemon.weight,
      };
    } catch {
      this.logger.error(`Failed to fetch pokemon detail for id: ${id}`);
      return null;
    }
  }
}
