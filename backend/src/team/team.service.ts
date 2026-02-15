import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma/prisma.service';
import { PokemonService } from '../pokemon/pokemon.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService,
    private pokemonService: PokemonService,
  ) {}

  async create(userId: string, dto: CreateTeamDto) {
    // Check if user has reached team limit (10 teams max)
    const teamCount = await this.prisma.team.count({
      where: { userId },
    });

    if (teamCount >= 10) {
      throw new BadRequestException('Maximum 10 teams per user allowed');
    }

    // Validate unique positions
    const positions = dto.pokemon.map((p) => p.position);
    const uniquePositions = new Set(positions);
    if (positions.length !== uniquePositions.size) {
      throw new BadRequestException('Duplicate positions are not allowed');
    }

    // Generate shareId if team is public
    const shareId = dto.isPublic ? nanoid(10) : null;

    // Create team with pokemon
    const team = await this.prisma.team.create({
      data: {
        userId,
        name: dto.name,
        isPublic: dto.isPublic,
        shareId,
        pokemon: {
          create: dto.pokemon.map((p) => ({
            pokemonId: p.pokemonId,
            position: p.position,
          })),
        },
      },
      include: {
        pokemon: true,
      },
    });

    return team;
  }

  async findAllByUser(userId: string) {
    const teams = await this.prisma.team.findMany({
      where: { userId },
      include: {
        pokemon: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Populate pokemon data from cache
    const teamsWithPokemonData = teams.map((team) => {
      const pokemonWithData = team.pokemon.map((tp) => {
        const pokemonData = this.pokemonService.getByIdFromCache(tp.pokemonId);

        if (!pokemonData) {
          // Fallback: pokemon not found in cache
          return {
            ...tp,
            pokemon: {
              id: tp.pokemonId,
              name: `Pokemon #${tp.pokemonId}`,
              nameEn: `pokemon-${tp.pokemonId}`,
              types: [],
              sprite: '',
            },
          };
        }

        return {
          ...tp,
          pokemon: {
            id: pokemonData.id,
            name: pokemonData.name,
            nameEn: pokemonData.nameEn,
            types: pokemonData.types,
            sprite: pokemonData.sprite,
          },
        };
      });

      return {
        ...team,
        pokemon: pokemonWithData,
      };
    });

    return teamsWithPokemonData;
  }

  async findOne(teamId: string, userId?: string) {
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        pokemon: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user has access to this team
    if (userId && team.userId !== userId && !team.isPublic) {
      throw new ForbiddenException('Access denied');
    }

    return team;
  }

  async findByShareId(shareId: string) {
    const team = await this.prisma.team.findUnique({
      where: { shareId },
      include: {
        pokemon: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (!team.isPublic) {
      throw new ForbiddenException('This team is not public');
    }

    return team;
  }

  async update(teamId: string, userId: string, dto: UpdateTeamDto) {
    // Check if team exists and belongs to user
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Validate unique positions if pokemon array is provided
    if (dto.pokemon) {
      const positions = dto.pokemon.map((p) => p.position);
      const uniquePositions = new Set(positions);
      if (positions.length !== uniquePositions.size) {
        throw new BadRequestException('Duplicate positions are not allowed');
      }
    }

    // Generate or remove shareId based on isPublic
    let shareId = team.shareId;
    if (dto.isPublic !== undefined) {
      if (dto.isPublic && !team.shareId) {
        shareId = nanoid(10);
      } else if (!dto.isPublic) {
        shareId = null;
      }
    }

    // Update team
    const updatedTeam = await this.prisma.team.update({
      where: { id: teamId },
      data: {
        name: dto.name,
        isPublic: dto.isPublic,
        shareId,
        ...(dto.pokemon && {
          pokemon: {
            deleteMany: {},
            create: dto.pokemon.map((p) => ({
              pokemonId: p.pokemonId,
              position: p.position,
            })),
          },
        }),
      },
      include: {
        pokemon: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    return updatedTeam;
  }

  async remove(teamId: string, userId: string) {
    // Check if team exists and belongs to user
    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Delete team (cascade delete will remove pokemon)
    await this.prisma.team.delete({
      where: { id: teamId },
    });

    return { message: 'Team deleted successfully' };
  }
}
