import { renderHook, act, waitFor } from '@testing-library/react';
import { TeamProvider, useTeam } from '../TeamContext';
import { api } from '@/lib/api';

// Mock api
jest.mock('@/lib/api');

describe('TeamContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TeamProvider>{children}</TeamProvider>
  );

  const mockPokemon1 = {
    id: 1,
    name: 'フシギダネ',
    nameEn: 'bulbasaur',
    types: ['grass', 'poison'],
    sprite: 'https://example.com/1.png',
  };

  const mockPokemon2 = {
    id: 4,
    name: 'ヒトカゲ',
    nameEn: 'charmander',
    types: ['fire'],
    sprite: 'https://example.com/4.png',
  };

  it('should have initial empty party', () => {
    const { result } = renderHook(() => useTeam(), { wrapper });

    expect(result.current.party).toEqual([null, null, null, null, null, null]);
    expect(result.current.currentTeamId).toBeNull();
    expect(result.current.isEditing).toBe(false);
  });

  describe('addPokemon', () => {
    it('should add pokemon to specific position', () => {
      const { result } = renderHook(() => useTeam(), { wrapper });

      act(() => {
        const success = result.current.addPokemon(mockPokemon1, 0);
        expect(success).toBe(true);
      });

      expect(result.current.party[0]).toEqual(mockPokemon1);
      expect(result.current.party[1]).toBeNull();
    });

    it('should prevent duplicate pokemon', () => {
      const { result } = renderHook(() => useTeam(), { wrapper });

      act(() => {
        result.current.addPokemon(mockPokemon1, 0);
      });

      act(() => {
        const success = result.current.addPokemon(mockPokemon1, 1);
        expect(success).toBe(false);
      });

      expect(result.current.party[0]).toEqual(mockPokemon1);
      expect(result.current.party[1]).toBeNull();
    });

    it('should reject invalid position', () => {
      const { result } = renderHook(() => useTeam(), { wrapper });

      act(() => {
        const success = result.current.addPokemon(mockPokemon1, 6);
        expect(success).toBe(false);
      });

      expect(result.current.party).toEqual([null, null, null, null, null, null]);
    });
  });

  describe('removePokemon', () => {
    it('should remove pokemon from position', () => {
      const { result } = renderHook(() => useTeam(), { wrapper });

      act(() => {
        result.current.addPokemon(mockPokemon1, 0);
      });

      act(() => {
        result.current.removePokemon(0);
      });

      expect(result.current.party[0]).toBeNull();
    });
  });

  describe('movePokemon', () => {
    it('should swap pokemon positions', () => {
      const { result } = renderHook(() => useTeam(), { wrapper });

      act(() => {
        result.current.addPokemon(mockPokemon1, 0);
        result.current.addPokemon(mockPokemon2, 1);
      });

      act(() => {
        result.current.movePokemon(0, 1);
      });

      expect(result.current.party[0]).toEqual(mockPokemon2);
      expect(result.current.party[1]).toEqual(mockPokemon1);
    });
  });

  describe('clearTeam', () => {
    it('should clear all pokemon and team id', () => {
      const { result } = renderHook(() => useTeam(), { wrapper });

      act(() => {
        result.current.addPokemon(mockPokemon1, 0);
      });

      act(() => {
        result.current.clearTeam();
      });

      expect(result.current.party).toEqual([null, null, null, null, null, null]);
      expect(result.current.currentTeamId).toBeNull();
    });
  });

  describe('loadTeam', () => {
    it('should load team from API', async () => {
      const mockTeam = {
        id: 'team-id',
        name: 'Test Team',
        pokemon: [
          {
            position: 0,
            pokemonId: 1,
            pokemon: mockPokemon1,
          },
          {
            position: 2,
            pokemonId: 4,
            pokemon: mockPokemon2,
          },
        ],
      };

      (api.getTeam as jest.Mock).mockResolvedValue(mockTeam);

      const { result } = renderHook(() => useTeam(), { wrapper });

      await act(async () => {
        await result.current.loadTeam('team-id');
      });

      expect(result.current.party[0]).toEqual(mockPokemon1);
      expect(result.current.party[1]).toBeNull();
      expect(result.current.party[2]).toEqual(mockPokemon2);
      expect(result.current.currentTeamId).toBe('team-id');
      expect(result.current.isEditing).toBe(true);
    });
  });

  describe('saveTeam', () => {
    it('should create new team', async () => {
      const mockCreatedTeam = {
        id: 'new-team-id',
        name: 'New Team',
      };

      (api.createTeam as jest.Mock).mockResolvedValue(mockCreatedTeam);

      const { result } = renderHook(() => useTeam(), { wrapper });

      act(() => {
        result.current.addPokemon(mockPokemon1, 0);
      });

      await act(async () => {
        await result.current.saveTeam('New Team', true);
      });

      expect(api.createTeam).toHaveBeenCalledWith({
        name: 'New Team',
        isPublic: true,
        pokemon: [{ pokemonId: 1, position: 0 }],
      });
      expect(result.current.currentTeamId).toBe('new-team-id');
    });

    it('should update existing team', async () => {
      const mockTeam = {
        id: 'team-id',
        name: 'Test Team',
        pokemon: [
          {
            position: 0,
            pokemonId: 1,
            pokemon: mockPokemon1,
          },
        ],
      };

      (api.getTeam as jest.Mock).mockResolvedValue(mockTeam);
      (api.updateTeam as jest.Mock).mockResolvedValue({ ...mockTeam, name: 'Updated Team' });

      const { result } = renderHook(() => useTeam(), { wrapper });

      await act(async () => {
        await result.current.loadTeam('team-id');
      });

      await act(async () => {
        await result.current.saveTeam('Updated Team', false);
      });

      expect(api.updateTeam).toHaveBeenCalledWith('team-id', {
        name: 'Updated Team',
        isPublic: false,
        pokemon: [{ pokemonId: 1, position: 0 }],
      });
    });

    it('should throw error when saving empty team', async () => {
      const { result } = renderHook(() => useTeam(), { wrapper });

      await expect(
        result.current.saveTeam('Empty Team', true)
      ).rejects.toThrow('Cannot save empty team');
    });
  });
});