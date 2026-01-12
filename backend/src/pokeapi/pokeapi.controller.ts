import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PokeapiService } from './pokeapi.service';

@Controller('pokeapi')
export class PokeapiController {
  constructor(private readonly pokeapiService: PokeapiService) {}

  /**
   * Test endpoint: Get Pokemon by ID
   * GET /pokeapi/pokemon/:id
   */
  @Get('pokemon/:id')
  async getPokemon(@Param('id', ParseIntPipe) id: number) {
    const pokemon = await this.pokeapiService.getPokemonById(id);
    return {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map((t) => t.type.name),
      stats: pokemon.stats.map((s) => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
    };
  }

  /**
   * Test endpoint: Get Pokemon species
   * GET /pokeapi/species/:id
   */
  @Get('species/:id')
  async getSpecies(@Param('id', ParseIntPipe) id: number) {
    const species = await this.pokeapiService.getPokemonSpecies(id);
    const japaneseName = species.names.find((n) => n.language.name === 'ja');
    return {
      id: species.id,
      name: species.name,
      japaneseName: japaneseName?.name || species.name,
    };
  }

  /**
   * Test endpoint: Get type data
   * GET /pokeapi/type/:name
   */
  @Get('type/:name')
  async getType(@Param('name') name: string) {
    const type = await this.pokeapiService.getType(name);
    return {
      name: type.name,
      doubleDamageTo: type.damage_relations.double_damage_to.map((t) => t.name),
      doubleDamageFrom: type.damage_relations.double_damage_from.map(
        (t) => t.name,
      ),
    };
  }
}
