'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

// Pokemon minimal info for team building
export interface TeamPokemon {
  id: number;
  name: string;
  nameEn: string;
  types: string[];
  sprite: string;
}

// Party slot (null = empty slot)
export type PartySlot = TeamPokemon | null;

interface TeamContextType {
  party: PartySlot[];
  currentTeamId: string | null;
  isEditing: boolean;

  // Actions
  addPokemon: (pokemon: TeamPokemon, position: number) => boolean;
  removePokemon: (position: number) => void;
  movePokemon: (fromPosition: number, toPosition: number) => void;
  loadTeam: (teamId: string) => Promise<void>;
  clearTeam: () => void;
  saveTeam: (
    name: string,
    isPublic: boolean
  ) => Promise<{ shareId?: string | null }>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [party, setParty] = useState<PartySlot[]>(Array(6).fill(null));
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  const isEditing = currentTeamId !== null;

  const addPokemon = (pokemon: TeamPokemon, position: number): boolean => {
    if (position < 0 || position > 5) return false;

    let success = false;
    setParty((prevParty) => {
      const isDuplicate = prevParty.some(
        (slot) => slot !== null && slot.id === pokemon.id
      );
      if (isDuplicate) {
        success = false;
        return prevParty;
      }

      const newParty = [...prevParty];
      newParty[position] = pokemon;
      success = true;
      return newParty;
    });
    return success;
  };

  const removePokemon = (position: number) => {
    if (position < 0 || position > 5) return;

    setParty((prevParty) => {
      const newParty = [...prevParty];
      newParty[position] = null;
      return newParty;
    });
  };

  const movePokemon = (fromPosition: number, toPosition: number) => {
    if (
      fromPosition < 0 ||
      fromPosition > 5 ||
      toPosition < 0 ||
      toPosition > 5
    ) {
      return;
    }

    setParty((prevParty) => {
      const newParty = [...prevParty];
      const temp = newParty[fromPosition];
      newParty[fromPosition] = newParty[toPosition];
      newParty[toPosition] = temp;
      return newParty;
    });
  };

  const loadTeam = async (teamId: string) => {
    try {
      const team = await api.getTeam(teamId);

      const newParty: PartySlot[] = Array(6).fill(null);

      team.pokemon.forEach((tp) => {
        if (tp.pokemon && tp.position >= 0 && tp.position < 6) {
          newParty[tp.position] = {
            id: tp.pokemon.id,
            name: tp.pokemon.name,
            nameEn: tp.pokemon.nameEn,
            types: tp.pokemon.types,
            sprite: tp.pokemon.sprite,
          };
        }
      });

      setParty(newParty);
      setCurrentTeamId(teamId);
    } catch (error) {
      console.error('Failed to load team:', error);
      throw error;
    }
  };

  const clearTeam = () => {
    setParty(Array(6).fill(null));
    setCurrentTeamId(null);
  };

  const saveTeam = async (
    name: string,
    isPublic: boolean
  ): Promise<{ shareId?: string | null }> => {
    const pokemonInParty = party
      .map((slot, index) =>
        slot ? { pokemonId: slot.id, position: index } : null
      )
      .filter((p): p is { pokemonId: number; position: number } => p !== null);

    if (pokemonInParty.length === 0) {
      throw new Error('Cannot save empty team');
    }

    try {
      if (isEditing && currentTeamId) {
        const updated = await api.updateTeam(currentTeamId, {
          name,
          isPublic,
          pokemon: pokemonInParty,
        });
        return { shareId: updated.shareId };
      } else {
        const team = await api.createTeam({
          name,
          isPublic,
          pokemon: pokemonInParty,
        });
        setCurrentTeamId(team.id);
        return { shareId: team.shareId };
      }
    } catch (error) {
      console.error('Failed to save team:', error);
      throw error;
    }
  };

  return (
    <TeamContext.Provider
      value={{
        party,
        currentTeamId,
        isEditing,
        addPokemon,
        removePokemon,
        movePokemon,
        loadTeam,
        clearTeam,
        saveTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within TeamProvider');
  }
  return context;
}
