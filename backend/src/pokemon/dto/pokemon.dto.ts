import { ApiProperty } from '@nestjs/swagger';

export class PokemonStatsDto {
  @ApiProperty({ example: 45 })
  hp: number;

  @ApiProperty({ example: 49 })
  attack: number;

  @ApiProperty({ example: 49 })
  defense: number;

  @ApiProperty({ example: 65 })
  specialAttack: number;

  @ApiProperty({ example: 65 })
  specialDefense: number;

  @ApiProperty({ example: 45 })
  speed: number;

  @ApiProperty({ example: 318 })
  total: number;
}

export class PokemonListItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'フシギダネ' })
  name: string;

  @ApiProperty({ example: 'bulbasaur' })
  nameEn: string;

  @ApiProperty({ example: ['grass', 'poison'] })
  types: string[];

  @ApiProperty({
    example:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
  })
  sprite: string;

  @ApiProperty({ type: PokemonStatsDto })
  stats: PokemonStatsDto;

  @ApiProperty({ example: 1 })
  generation: number;
}

export class PokemonDetailDto extends PokemonListItemDto {
  @ApiProperty({ example: ['overgrow', 'chlorophyll'] })
  abilities: string[];

  @ApiProperty({ example: 7 })
  height: number;

  @ApiProperty({ example: 69 })
  weight: number;
}

export class PaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 1025 })
  total: number;

  @ApiProperty({ example: 52 })
  totalPages: number;
}

export class PokemonListResponseDto {
  @ApiProperty({ type: [PokemonListItemDto] })
  data: PokemonListItemDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
