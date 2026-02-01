import { Test, TestingModule } from '@nestjs/testing';
import { PokemonService } from './pokemon.service';
import { PokeapiService } from '../pokeapi/pokeapi.service';
import { Pokemon, PokemonSpecies } from '../pokeapi/types/pokeapi.types';

/** Mock data simulating PokeAPI responses */
const mockPokemonResponses: Record<
  number,
  { pokemon: Pokemon; species: PokemonSpecies }
> = {
  1: {
    pokemon: buildMockPokemon(1, 'bulbasaur', ['grass', 'poison'], {
      hp: 45,
      attack: 49,
      defense: 49,
      'special-attack': 65,
      'special-defense': 65,
      speed: 45,
    }),
    species: buildMockSpecies('generation-i', 'フシギダネ'),
  },
  4: {
    pokemon: buildMockPokemon(4, 'charmander', ['fire'], {
      hp: 39,
      attack: 52,
      defense: 43,
      'special-attack': 60,
      'special-defense': 50,
      speed: 65,
    }),
    species: buildMockSpecies('generation-i', 'ヒトカゲ'),
  },
  7: {
    pokemon: buildMockPokemon(7, 'squirtle', ['water'], {
      hp: 44,
      attack: 48,
      defense: 65,
      'special-attack': 50,
      'special-defense': 64,
      speed: 43,
    }),
    species: buildMockSpecies('generation-i', 'ゼニガメ'),
  },
};

function buildMockPokemon(
  id: number,
  name: string,
  types: string[],
  stats: Record<string, number>,
): Pokemon {
  return {
    id,
    name,
    base_experience: 0,
    height: 0,
    weight: 0,
    is_default: true,
    order: id,
    abilities: [],
    types: types.map((t, i) => ({ slot: i + 1, type: { name: t, url: '' } })),
    sprites: {
      front_default: `https://example.com/sprites/${id}.png`,
      front_shiny: null,
      front_female: null,
      front_shiny_female: null,
      back_default: null,
      back_shiny: null,
      back_female: null,
      back_shiny_female: null,
    },
    stats: Object.entries(stats).map(([name, base_stat]) => ({
      base_stat,
      effort: 0,
      stat: { name, url: '' },
    })),
  };
}

function buildMockSpecies(
  generation: string,
  japaneseName: string,
): PokemonSpecies {
  return {
    id: 0,
    name: '',
    order: 0,
    gender_rate: 0,
    capture_rate: 0,
    base_happiness: 0,
    is_baby: false,
    is_legendary: false,
    is_mythical: false,
    hatch_counter: 0,
    has_gender_differences: false,
    forms_switchable: false,
    names: [{ name: japaneseName, language: { name: 'ja', url: '' } }],
    generation: { name: generation, url: '' },
  };
}

describe('PokemonService', () => {
  let service: PokemonService;
  let pokeapiService: jest.Mocked<PokeapiService>;

  beforeEach(async () => {
    pokeapiService = {
      getPokemonById: jest.fn(),
      getPokemonSpecies: jest.fn(),
      getType: jest.fn(),
    } as unknown as jest.Mocked<PokeapiService>;

    // Mock to return only 3 Pokemon (override the 1025 loop)
    // We patch Array.from inside buildCache by mocking responses for IDs 1-3 only
    // and returning null (caught internally) for the rest.
    pokeapiService.getPokemonById.mockImplementation((id: number) => {
      const entry = mockPokemonResponses[id];
      if (!entry) return Promise.reject(new Error(`Not found: ${id}`));
      return Promise.resolve(entry.pokemon);
    });
    pokeapiService.getPokemonSpecies.mockImplementation((id: number) => {
      const entry = mockPokemonResponses[id];
      if (!entry) return Promise.reject(new Error(`Not found: ${id}`));
      return Promise.resolve(entry.species);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PokemonService,
        { provide: PokeapiService, useValue: pokeapiService },
      ],
    }).compile();

    await module.init(); // Triggers onModuleInit (runs buildCache)
    service = module.get<PokemonService>(PokemonService);
  });

  describe('getByIdFromCache', () => {
    it('should return a cached Pokemon by ID', () => {
      const result = service.getByIdFromCache(1);

      expect(result).toBeDefined();
      expect(result!.id).toBe(1);
      expect(result!.nameEn).toBe('bulbasaur');
      expect(result!.name).toBe('フシギダネ');
      expect(result!.types).toEqual(['grass', 'poison']);
    });

    it('should return undefined for a non-existent ID', () => {
      const result = service.getByIdFromCache(999);

      expect(result).toBeUndefined();
    });
  });

  describe('getList', () => {
    it('should return all cached Pokemon with default pagination', () => {
      const result = service.getList({});

      expect(result.data).toHaveLength(3);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it('should filter by generation', () => {
      // All 3 mock Pokemon are gen 1 (IDs 1-151)
      const result = service.getList({ generation: 1 });
      expect(result.data).toHaveLength(3);

      const resultGen2 = service.getList({ generation: 2 });
      expect(resultGen2.data).toHaveLength(0);
    });

    it('should filter by type', () => {
      const result = service.getList({ type: 'fire' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(4);
    });

    it('should filter by multiple types (AND condition)', () => {
      const result = service.getList({ type: 'grass,poison' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(1);
    });

    it('should search by Japanese name', () => {
      const result = service.getList({ search: 'ヒトカゲ' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(4);
    });

    it('should search by English name', () => {
      const result = service.getList({ search: 'squirtle' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(7);
    });

    it('should paginate correctly', () => {
      const result = service.getList({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.totalPages).toBe(2);

      const page2 = service.getList({ page: 2, limit: 2 });
      expect(page2.data).toHaveLength(1);
    });
  });
});
