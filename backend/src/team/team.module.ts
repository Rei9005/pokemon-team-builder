import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PokemonModule } from '../pokemon/pokemon.module';

@Module({
  imports: [PrismaModule, PokemonModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
