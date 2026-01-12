import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PokeapiService } from './pokeapi.service';
import { PokeapiController } from './pokeapi.controller';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://pokeapi.co/api/v2',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
  providers: [PokeapiService],
  exports: [PokeapiService],
  controllers: [PokeapiController],
})
export class PokeapiModule {}
