import type { SignupResponse, LoginResponse } from '@/types/auth';
import type { PokemonListResponse, PokemonDetail } from '@/types/pokemon';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Auth API
export const api = {
  signup: async (email: string, password: string): Promise<SignupResponse> => {
    return fetchApi<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<void> => {
    return fetchApi<void>('/auth/logout', {
      method: 'POST',
    });
  },

  // Pokemon API
  getPokemon: async (params: {
    page?: number;
    limit?: number;
    generation?: number;
    type?: string;
    search?: string;
  }): Promise<PokemonListResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.generation) query.set('generation', String(params.generation));
    if (params.type) query.set('type', params.type);
    if (params.search) query.set('search', params.search);

    return fetchApi<PokemonListResponse>(`/pokemon?${query}`);
  },

  getPokemonDetail: async (id: number): Promise<PokemonDetail> => {
    return fetchApi<PokemonDetail>(`/pokemon/${id}`);
  },
};
