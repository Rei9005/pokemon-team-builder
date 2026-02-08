import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class TeamPokemonDto {
  @ApiProperty({
    example: 1,
    description: 'Pokemon ID from PokeAPI',
  })
  @IsInt()
  @Min(1)
  pokemonId: number;

  @ApiProperty({
    example: 0,
    description: 'Position in team (0-5)',
    minimum: 0,
    maximum: 5,
  })
  @IsInt()
  @Min(0)
  @Max(5)
  position: number;
}

export class CreateTeamDto {
  @ApiProperty({
    example: 'My Main Team',
    description: 'Team name',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: false,
    description: 'Whether the team is public',
    default: false,
  })
  @IsBoolean()
  isPublic: boolean;

  @ApiProperty({
    type: [TeamPokemonDto],
    description: 'List of Pokemon in the team (max 6)',
    example: [
      { pokemonId: 1, position: 0 },
      { pokemonId: 4, position: 1 },
    ],
  })
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => TeamPokemonDto)
  pokemon: TeamPokemonDto[];
}
