import {
  Injectable,
  Logger,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common';
import { PokeapiService } from '../pokeapi/pokeapi.service';
import { PokemonService } from '../pokemon/pokemon.service';
import { AnalyzeTeamResponseDto } from './dto/type.dto';

/** All 18 Pokemon types */
const ALL_TYPES = [
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

/**
 * Type effectiveness matrix indexed by [attackerType][defenderType]
 * Values represent damage multipliers (0, 0.5, 1, or 2)
 */
type TypeMatrix = Record<string, Record<string, number>>;

@Injectable()
export class TypeService implements OnModuleInit {
  private readonly logger = new Logger(TypeService.name);
  private typeMatrix: TypeMatrix = {};

  constructor(
    private readonly pokeapiService: PokeapiService,
    private readonly pokemonService: PokemonService,
  ) {}

  async onModuleInit() {
    await this.buildTypeMatrix();
  }

  /**
   * Fetches all 18 types from PokeAPI and builds the attack-to-defense multiplier matrix.
   * PokeAPI returns damage_relations from the attacker's perspective:
   *   double_damage_to → attacker deals 2x to those defender types
   *   half_damage_to   → attacker deals 0.5x to those defender types
   *   no_damage_to     → attacker deals 0x  to those defender types
   */
  private async buildTypeMatrix(): Promise<void> {
    this.logger.log('Building type effectiveness matrix...');

    const typeDataList = await Promise.all(
      ALL_TYPES.map((name) => this.pokeapiService.getType(name)),
    );

    const matrix: TypeMatrix = {};

    for (const typeData of typeDataList) {
      const attacker = typeData.name;

      // Initialize all matchups to 1x (neutral)
      const row: Record<string, number> = {};
      for (const defender of ALL_TYPES) {
        row[defender] = 1;
      }

      // Override with actual damage relations
      for (const target of typeData.damage_relations.double_damage_to) {
        row[target.name] = 2;
      }
      for (const target of typeData.damage_relations.half_damage_to) {
        row[target.name] = 0.5;
      }
      for (const target of typeData.damage_relations.no_damage_to) {
        row[target.name] = 0;
      }

      matrix[attacker] = row;
    }

    this.typeMatrix = matrix;
    this.logger.log('Type effectiveness matrix built');
  }

  /**
   * Calculates the damage multiplier when an attacker type hits a Pokemon.
   * For dual-type Pokemon, the multipliers from each type are multiplied together.
   * Example: Fire vs Grass/Poison → 2 (vs Grass) × 1 (vs Poison) = 2
   */
  private calculateDefense(
    attackerType: string,
    defenderTypes: string[],
  ): number {
    return defenderTypes.reduce(
      (multiplier, defType) =>
        multiplier * (this.typeMatrix[attackerType]?.[defType] ?? 1),
      1,
    );
  }

  /**
   * Analyzes type coverage for a team of Pokemon.
   *
   * For each of the 18 attacking types, finds the maximum damage multiplier
   * across all team members. This represents the team's worst vulnerability —
   * the type matchup an opponent could exploit against the weakest Pokemon.
   *
   * Counts:
   *   weaknessCount   — types where max multiplier >= 2
   *   resistanceCount — types where max multiplier is > 0 and <= 0.5
   *   immunityCount   — types where max multiplier === 0
   */
  analyzeTeam(pokemonIds: number[]): AnalyzeTeamResponseDto {
    // Resolve each Pokemon's types from cache
    const teamTypes: string[][] = pokemonIds.map((id) => {
      const pokemon = this.pokemonService.getByIdFromCache(id);
      if (!pokemon) {
        throw new NotFoundException(`Pokemon with ID ${id} not found`);
      }
      return pokemon.types;
    });

    // For each attacking type, take the maximum multiplier across the team
    const defensive: Record<string, number> = {};

    for (const attackerType of ALL_TYPES) {
      const multipliers = teamTypes.map((defenderTypes) =>
        this.calculateDefense(attackerType, defenderTypes),
      );
      defensive[attackerType] = Math.max(...multipliers);
    }

    // Aggregate counts
    const values = Object.values(defensive);
    const weaknessCount = values.filter((v) => v >= 2).length;
    const resistanceCount = values.filter((v) => v > 0 && v <= 0.5).length;
    const immunityCount = values.filter((v) => v === 0).length;

    return { defensive, weaknessCount, resistanceCount, immunityCount };
  }
}
