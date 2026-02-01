import { Module } from '@nestjs/common';
import { PokeapiModule } from '../pokeapi/pokeapi.module';
import { PokemonModule } from '../pokemon/pokemon.module';
import { TypeService } from './type.service';
import { TypeController } from './type.controller';

@Module({
  imports: [PokeapiModule, PokemonModule],
  providers: [TypeService],
  controllers: [TypeController],
})
export class TypeModule {}
