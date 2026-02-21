import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { PrismaService } from '../prisma/prisma.service';
import { PokemonService } from '../pokemon/pokemon.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

describe('TeamService', () => {
  let service: TeamService;

  const mockPrismaService = {
    team: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockPokemonService = {
    getByIdFromCache: jest.fn((id: number) => ({
      id,
      name: `Pokemon ${id}`,
      nameEn: `pokemon-${id}`,
      types: ['normal'],
      sprite: `https://example.com/sprites/${id}.png`,
      stats: {
        hp: 50,
        attack: 50,
        defense: 50,
        specialAttack: 50,
        specialDefense: 50,
        speed: 50,
        total: 300,
      },
      generation: 1,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PokemonService,
          useValue: mockPokemonService,
        },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user-id';
    const createTeamDto: CreateTeamDto = {
      name: 'My Team',
      isPublic: true,
      pokemon: [
        { pokemonId: 1, position: 0 },
        { pokemonId: 4, position: 1 },
      ],
    };

    it('should create a new team', async () => {
      const mockTeam = {
        id: 'team-id',
        userId,
        name: createTeamDto.name,
        isPublic: true,
        shareId: 'abc123',
        createdAt: new Date(),
        updatedAt: new Date(),
        pokemon: [
          {
            id: 'pokemon-1',
            teamId: 'team-id',
            pokemonId: 1,
            position: 0,
            createdAt: new Date(),
          },
          {
            id: 'pokemon-2',
            teamId: 'team-id',
            pokemonId: 4,
            position: 1,
            createdAt: new Date(),
          },
        ],
      };

      mockPrismaService.team.count.mockResolvedValue(5);
      mockPrismaService.team.create.mockResolvedValue(mockTeam);

      const result = await service.create(userId, createTeamDto);

      expect(mockPrismaService.team.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrismaService.team.create).toHaveBeenCalled();
      expect(result).toEqual(mockTeam);
    });

    it('should throw BadRequestException if user has 10 teams', async () => {
      mockPrismaService.team.count.mockResolvedValue(10);

      await expect(service.create(userId, createTeamDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.team.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrismaService.team.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if duplicate positions', async () => {
      const dtoWithDuplicates: CreateTeamDto = {
        name: 'Team',
        isPublic: false,
        pokemon: [
          { pokemonId: 1, position: 0 },
          { pokemonId: 4, position: 0 },
        ],
      };

      mockPrismaService.team.count.mockResolvedValue(5);

      await expect(service.create(userId, dtoWithDuplicates)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.team.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    const userId = 'user-id';

    it('should return all teams for user', async () => {
      const mockTeams = [
        {
          id: 'team-1',
          userId,
          name: 'Team 1',
          isPublic: true,
          shareId: 'abc',
          createdAt: new Date(),
          updatedAt: new Date(),
          pokemon: [],
        },
        {
          id: 'team-2',
          userId,
          name: 'Team 2',
          isPublic: false,
          shareId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          pokemon: [],
        },
      ];

      mockPrismaService.team.findMany.mockResolvedValue(mockTeams);

      const result = await service.findAllByUser(userId);

      expect(mockPrismaService.team.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { pokemon: true },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(mockTeams);
    });
  });

  describe('findOne', () => {
    const teamId = 'team-id';
    const userId = 'user-id';

    it('should return team if user owns it', async () => {
      const mockTeam = {
        id: teamId,
        userId,
        name: 'Team',
        isPublic: false,
        shareId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        pokemon: [],
      };

      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);

      const result = await service.findOne(teamId, userId);

      expect(mockPrismaService.team.findUnique).toHaveBeenCalledWith({
        where: { id: teamId },
        include: { pokemon: { orderBy: { position: 'asc' } } },
      });
      expect(result).toEqual(mockTeam);
    });

    it('should throw NotFoundException if team not found', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(null);

      await expect(service.findOne(teamId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own private team', async () => {
      const mockTeam = {
        id: teamId,
        userId: 'other-user',
        name: 'Team',
        isPublic: false,
        shareId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        pokemon: [],
      };

      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);

      await expect(service.findOne(teamId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should populate pokemon data from cache', async () => {
      const mockTeam = {
        id: teamId,
        userId,
        name: 'Team',
        isPublic: false,
        shareId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        pokemon: [
          {
            id: 'tp-1',
            teamId,
            pokemonId: 1,
            position: 0,
            createdAt: new Date(),
          },
        ],
      };

      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);

      const result = await service.findOne(teamId, userId);

      expect(result.pokemon[0].pokemon).toEqual({
        id: 1,
        name: 'Pokemon 1',
        nameEn: 'pokemon-1',
        types: ['normal'],
        sprite: 'https://example.com/sprites/1.png',
      });
    });
  });

  describe('findByShareId', () => {
    const shareId = 'abc123';

    it('should return public team', async () => {
      const mockTeam = {
        id: 'team-id',
        userId: 'user-id',
        name: 'Public Team',
        isPublic: true,
        shareId,
        createdAt: new Date(),
        updatedAt: new Date(),
        pokemon: [],
      };

      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);

      const result = await service.findByShareId(shareId);

      expect(mockPrismaService.team.findUnique).toHaveBeenCalledWith({
        where: { shareId },
        include: { pokemon: { orderBy: { position: 'asc' } } },
      });
      expect(result).toEqual(mockTeam);
    });

    it('should throw NotFoundException if team not found', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(null);

      await expect(service.findByShareId(shareId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if team is not public', async () => {
      const mockTeam = {
        id: 'team-id',
        userId: 'user-id',
        name: 'Private Team',
        isPublic: false,
        shareId,
        createdAt: new Date(),
        updatedAt: new Date(),
        pokemon: [],
      };

      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);

      await expect(service.findByShareId(shareId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should populate pokemon data from cache', async () => {
      const mockTeam = {
        id: 'team-id',
        userId: 'user-id',
        name: 'Public Team',
        isPublic: true,
        shareId,
        createdAt: new Date(),
        updatedAt: new Date(),
        pokemon: [
          {
            id: 'tp-1',
            teamId: 'team-id',
            pokemonId: 4,
            position: 0,
            createdAt: new Date(),
          },
        ],
      };

      mockPrismaService.team.findUnique.mockResolvedValue(mockTeam);

      const result = await service.findByShareId(shareId);

      expect(result.pokemon[0].pokemon).toEqual({
        id: 4,
        name: 'Pokemon 4',
        nameEn: 'pokemon-4',
        types: ['normal'],
        sprite: 'https://example.com/sprites/4.png',
      });
    });
  });

  describe('update', () => {
    const teamId = 'team-id';
    const userId = 'user-id';
    const updateTeamDto: UpdateTeamDto = {
      name: 'Updated Team',
      isPublic: true,
      pokemon: [{ pokemonId: 25, position: 0 }],
    };

    it('should update team', async () => {
      const existingTeam = {
        id: teamId,
        userId,
        name: 'Old Name',
        isPublic: false,
        shareId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTeam = {
        ...existingTeam,
        name: updateTeamDto.name,
        isPublic: true,
        shareId: 'newshare',
        pokemon: [],
      };

      mockPrismaService.team.findUnique.mockResolvedValue(existingTeam);
      mockPrismaService.team.update.mockResolvedValue(updatedTeam);

      const result = await service.update(teamId, userId, updateTeamDto);

      expect(mockPrismaService.team.findUnique).toHaveBeenCalledWith({
        where: { id: teamId },
      });
      expect(mockPrismaService.team.update).toHaveBeenCalled();
      expect(result).toEqual(updatedTeam);
    });

    it('should throw NotFoundException if team not found', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(null);

      await expect(
        service.update(teamId, userId, updateTeamDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own team', async () => {
      const existingTeam = {
        id: teamId,
        userId: 'other-user',
        name: 'Team',
        isPublic: false,
        shareId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.team.findUnique.mockResolvedValue(existingTeam);

      await expect(
        service.update(teamId, userId, updateTeamDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    const teamId = 'team-id';
    const userId = 'user-id';

    it('should delete team', async () => {
      const existingTeam = {
        id: teamId,
        userId,
        name: 'Team',
        isPublic: false,
        shareId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.team.findUnique.mockResolvedValue(existingTeam);
      mockPrismaService.team.delete.mockResolvedValue(existingTeam);

      const result = await service.remove(teamId, userId);

      expect(mockPrismaService.team.findUnique).toHaveBeenCalledWith({
        where: { id: teamId },
      });
      expect(mockPrismaService.team.delete).toHaveBeenCalledWith({
        where: { id: teamId },
      });
      expect(result).toEqual({ message: 'Team deleted successfully' });
    });

    it('should throw NotFoundException if team not found', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(null);

      await expect(service.remove(teamId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own team', async () => {
      const existingTeam = {
        id: teamId,
        userId: 'other-user',
        name: 'Team',
        isPublic: false,
        shareId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.team.findUnique.mockResolvedValue(existingTeam);

      await expect(service.remove(teamId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
