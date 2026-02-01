import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { PokemonListResponseDto, PokemonDetailDto } from './dto/pokemon.dto';

@ApiTags('pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({ summary: 'Get pokemon list with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'generation', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    example: 'fire,flying',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'ピカチュウ',
  })
  @ApiResponse({ status: 200, type: PokemonListResponseDto })
  getList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('generation') generation?: number,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ): PokemonListResponseDto {
    return this.pokemonService.getList({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      generation: generation ? Number(generation) : undefined,
      type,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pokemon detail by ID' })
  @ApiResponse({ status: 200, type: PokemonDetailDto })
  @ApiResponse({ status: 404, description: 'Pokemon not found' })
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PokemonDetailDto> {
    const pokemon = await this.pokemonService.getById(id);
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }
    return pokemon;
  }
}
