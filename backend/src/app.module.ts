import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PokeapiModule } from './pokeapi/pokeapi.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    PokeapiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
