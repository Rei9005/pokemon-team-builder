import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  ArrayNotEmpty,
  ArrayMaxSize,
  Min,
  Max,
} from 'class-validator';

export class AnalyzeTeamRequestDto {
  @ApiProperty({
    description: 'Array of Pokemon IDs to analyze (1-6)',
    example: [1, 4, 7, 25, 133, 143],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(6)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(1025, { each: true })
  pokemonIds!: number[];
}

export class AnalyzeTeamResponseDto {
  @ApiProperty({
    description: 'Defensive multipliers against each of the 18 types',
    additionalProperties: { type: 'number' },
    example: {
      normal: 1.0,
      fire: 4.0,
      water: 2.0,
      electric: 1.0,
      grass: 1.0,
      ice: 2.0,
      fighting: 2.0,
      poison: 1.0,
      ground: 2.0,
      flying: 1.0,
      psychic: 2.0,
      bug: 1.0,
      rock: 2.0,
      ghost: 1.0,
      dragon: 1.0,
      dark: 1.0,
      steel: 1.0,
      fairy: 1.0,
    },
  })
  defensive!: Record<string, number>;

  @ApiProperty({
    description: 'Number of types the team is weak to (multiplier >= 2)',
    example: 4,
  })
  weaknessCount!: number;

  @ApiProperty({
    description:
      'Number of types the team resists (0 < multiplier <= 0.5, excluding immunities)',
    example: 2,
  })
  resistanceCount!: number;

  @ApiProperty({
    description: 'Number of types the team is immune to (multiplier === 0)',
    example: 0,
  })
  immunityCount!: number;
}
