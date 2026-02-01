import { Module } from '@nestjs/common';
import { PokeapiModule } from '../pokeapi/pokeapi.module';
import { PokemonService } from './pokemon.service';
import { PokemonController } from './pokemon.controller';

@Module({
  imports: [PokeapiModule],
  providers: [PokemonService],
  controllers: [PokemonController],
  exports: [PokemonService],
})
export class PokemonModule {}
