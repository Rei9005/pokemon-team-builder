import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  ArrayMaxSize,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

class TeamPokemonDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  pokemonId: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  @Max(5)
  position: number;
}

export class UpdateTeamDto {
  @ApiProperty({
    example: 'Updated Team Name',
    description: 'Team name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: true,
    description: 'Whether the team is public',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    type: [TeamPokemonDto],
    description: 'List of Pokemon in the team (max 6)',
    required: false,
    example: [
      { pokemonId: 1, position: 0 },
      { pokemonId: 25, position: 1 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => TeamPokemonDto)
  pokemon?: TeamPokemonDto[];
}
