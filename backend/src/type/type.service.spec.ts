import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TypeService } from './type.service';
import { PokeapiService } from '../pokeapi/pokeapi.service';
import { PokemonService, CachedPokemon } from '../pokemon/pokemon.service';

/**
 * Minimal type data mock covering 3 types (fire, water, grass).
 * Only the damage relations relevant to these 3 types are defined.
 * All other types are omitted to keep the test focused.
 */
function buildMockTypeData(
  name: string,
  doubleTo: string[],
  halfTo: string[],
  noTo: string[],
) {
  return {
    name,
    damage_relations: {
      double_damage_to: doubleTo.map((n) => ({ name: n, url: '' })),
      half_damage_to: halfTo.map((n) => ({ name: n, url: '' })),
      no_damage_to: noTo.map((n) => ({ name: n, url: '' })),
      double_damage_from: [],
      half_damage_from: [],
      no_damage_from: [],
    },
  };
}

/** Mock type data for all 18 types */
const MOCK_TYPE_DATA: Record<string, ReturnType<typeof buildMockTypeData>> = {
  normal: buildMockTypeData('normal', [], [], ['ghost']),
  fire: buildMockTypeData(
    'fire',
    ['grass', 'bug', 'ice', 'steel'],
    ['fire', 'water', 'rock', 'dragon'],
    [],
  ),
  water: buildMockTypeData(
    'water',
    ['fire', 'ground', 'rock'],
    ['water', 'grass', 'dragon'],
    [],
  ),
  electric: buildMockTypeData(
    'electric',
    ['water', 'flying'],
    ['electric', 'grass', 'dragon'],
    ['ground'],
  ),
  grass: buildMockTypeData(
    'grass',
    ['water', 'ground', 'rock'],
    ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
    [],
  ),
  ice: buildMockTypeData(
    'ice',
    ['grass', 'ground', 'flying', 'dragon'],
    ['water', 'ice', 'steel'],
    [],
  ),
  fighting: buildMockTypeData(
    'fighting',
    ['normal', 'ice', 'rock', 'dark', 'steel'],
    ['poison', 'flying', 'psychic', 'bug', 'fairy'],
    ['ghost'],
  ),
  poison: buildMockTypeData(
    'poison',
    ['grass', 'fairy'],
    ['poison', 'ground', 'rock', 'ghost'],
    ['steel'],
  ),
  ground: buildMockTypeData(
    'ground',
    ['fire', 'electric', 'poison', 'rock', 'steel'],
    ['grass', 'bug'],
    ['flying'],
  ),
  flying: buildMockTypeData(
    'flying',
    ['grass', 'fighting', 'bug'],
    ['electric', 'rock', 'steel'],
    [],
  ),
  psychic: buildMockTypeData(
    'psychic',
    ['fighting', 'poison'],
    ['psychic', 'steel'],
    ['dark'],
  ),
  bug: buildMockTypeData(
    'bug',
    ['grass', 'psychic', 'dark'],
    ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
    [],
  ),
  rock: buildMockTypeData(
    'rock',
    ['fire', 'ice', 'flying', 'bug'],
    ['fighting', 'ground', 'steel'],
    [],
  ),
  ghost: buildMockTypeData('ghost', ['psychic', 'ghost'], ['dark'], ['normal']),
  dragon: buildMockTypeData('dragon', ['dragon'], ['steel'], ['fairy']),
  dark: buildMockTypeData(
    'dark',
    ['psychic', 'ghost'],
    ['fighting', 'dark', 'fairy'],
    [],
  ),
  steel: buildMockTypeData(
    'steel',
    ['ice', 'rock', 'fairy'],
    ['fire', 'water', 'electric', 'steel'],
    [],
  ),
  fairy: buildMockTypeData(
    'fairy',
    ['fighting', 'dragon', 'dark'],
    ['fire', 'poison', 'steel'],
    [],
  ),
};

/** Helper to build a minimal CachedPokemon */
function buildCachedPokemon(id: number, types: string[]): CachedPokemon {
  return {
    id,
    nameEn: `pokemon-${id}`,
    name: `ポケモン${id}`,
    types,
    sprite: '',
    stats: {
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
      total: 318,
    },
    generation: 1,
  };
}

describe('TypeService', () => {
  let service: TypeService;
  let pokemonService: jest.Mocked<PokemonService>;

  beforeEach(async () => {
    const pokeapiService = {
      getType: jest.fn().mockImplementation((name: string) => {
        return Promise.resolve(MOCK_TYPE_DATA[name]);
      }),
    } as unknown as jest.Mocked<PokeapiService>;

    pokemonService = {
      getByIdFromCache: jest.fn(),
    } as unknown as jest.Mocked<PokemonService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeService,
        { provide: PokeapiService, useValue: pokeapiService },
        { provide: PokemonService, useValue: pokemonService },
      ],
    }).compile();

    await module.init(); // Triggers onModuleInit (runs buildTypeMatrix)
    service = module.get<TypeService>(TypeService);
  });

  describe('analyzeTeam', () => {
    it('should calculate correct defensive multipliers for a single Water-type Pokemon', () => {
      // Water is weak to Grass and Electric (2x each), resistant to Fire, Water, Steel (0.5x)
      pokemonService.getByIdFromCache.mockReturnValue(
        buildCachedPokemon(7, ['water']),
      );

      const result = service.analyzeTeam([7]);

      expect(result.defensive['grass']).toBe(2);
      expect(result.defensive['electric']).toBe(2);
      expect(result.defensive['fire']).toBe(0.5);
      expect(result.defensive['water']).toBe(0.5);
      expect(result.defensive['steel']).toBe(0.5);
      expect(result.defensive['normal']).toBe(1);
    });

    it('should calculate 4x weakness for a dual-type Pokemon (Grass/Bug vs Fire)', () => {
      // Fire is 2x vs Grass AND 2x vs Bug → 2 × 2 = 4
      pokemonService.getByIdFromCache.mockReturnValue(
        buildCachedPokemon(1, ['grass', 'bug']),
      );

      const result = service.analyzeTeam([1]);

      expect(result.defensive['fire']).toBe(4);
    });

    it('should take the max multiplier across the team (worst-case vulnerability)', () => {
      // Pokemon A: Water (weak to Grass 2x)
      // Pokemon B: Fire  (resists Grass 0.5x)
      // Team max for Grass = max(2, 0.5) = 2
      pokemonService.getByIdFromCache.mockImplementation((id: number) => {
        if (id === 7) return buildCachedPokemon(7, ['water']);
        if (id === 4) return buildCachedPokemon(4, ['fire']);
        return undefined;
      });

      const result = service.analyzeTeam([7, 4]);

      expect(result.defensive['grass']).toBe(2);
    });

    it('should correctly count weaknesses, resistances, and immunities', () => {
      // Normal type: immune to Ghost (0x), weak to Fighting (2x), no resistances
      pokemonService.getByIdFromCache.mockReturnValue(
        buildCachedPokemon(143, ['normal']),
      );

      const result = service.analyzeTeam([143]);

      expect(result.immunityCount).toBe(1); // Ghost → 0x
      expect(result.weaknessCount).toBe(1); // Fighting → 2x
      expect(result.resistanceCount).toBe(0);
    });

    it('should throw NotFoundException for an invalid Pokemon ID', () => {
      pokemonService.getByIdFromCache.mockReturnValue(undefined);

      expect(() => service.analyzeTeam([9999])).toThrow(NotFoundException);
    });
  });
});
