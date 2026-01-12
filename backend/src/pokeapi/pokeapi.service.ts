import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import {
  type Pokemon,
  type PokemonSpecies,
  type TypeData,
} from './types/pokeapi.types';

@Injectable()
export class PokeapiService {
  private readonly logger = new Logger(PokeapiService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Fetch basic Pokemon data by ID
   * @param id Pokemon ID (1-1025)
   * @returns Raw Pokemon data from PokeAPI
   */
  async getPokemonById(id: number): Promise<Pokemon> {
    try {
      this.logger.log(`Fetching pokemon with id: ${id}`);

      const response: AxiosResponse<Pokemon> = await firstValueFrom(
        this.httpService.get<Pokemon>(`/pokemon/${id}`),
      );

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch pokemon ${id}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Fetch Pokemon species data (includes localized names)
   * @param id Pokemon ID
   * @returns Species data including Japanese names
   */
  async getPokemonSpecies(id: number): Promise<PokemonSpecies> {
    try {
      this.logger.log(`Fetching pokemon species with id: ${id}`);

      const response: AxiosResponse<PokemonSpecies> = await firstValueFrom(
        this.httpService.get<PokemonSpecies>(`/pokemon-species/${id}`),
      );

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch species ${id}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Fetch type effectiveness data
   * @param name Type name (e.g., 'fire', 'water')
   * @returns Type data including damage relations
   */
  async getType(name: string): Promise<TypeData> {
    try {
      this.logger.log(`Fetching type: ${name}`);

      const response: AxiosResponse<TypeData> = await firstValueFrom(
        this.httpService.get<TypeData>(`/type/${name}`),
      );

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch type ${name}:`, errorMessage);
      throw error;
    }
  }
}
