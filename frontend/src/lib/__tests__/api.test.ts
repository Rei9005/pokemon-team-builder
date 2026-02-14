import { api } from '../api';

// Mock fetch
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('signup', () => {
    it('should call signup endpoint with correct parameters', async () => {
      const mockResponse = {
        id: 'user-id',
        email: 'test@example.com',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.signup('test@example.com', 'Password123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/signup',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Password123',
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed signup', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Conflict',
      });

      await expect(
        api.signup('test@example.com', 'Password123')
      ).rejects.toThrow('API Error: Conflict');
    });
  });

  describe('login', () => {
    it('should call login endpoint with correct parameters', async () => {
      const mockResponse = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.login('test@example.com', 'Password123');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Password123',
          }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed login', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(
        api.login('test@example.com', 'WrongPassword')
      ).rejects.toThrow('API Error: Unauthorized');
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out successfully' }),
      });

      await api.logout();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/logout',
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('should throw error on failed logout', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(api.logout()).rejects.toThrow(
        'API Error: Internal Server Error'
      );
    });
  });

  describe('getPokemon', () => {
    it('should call pokemon endpoint with default parameters', async () => {
      const mockResponse = {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await api.getPokemon({});

      // Empty params results in empty query string
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/pokemon?',
        {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include query parameters when provided', async () => {
      const mockResponse = {
        data: [],
        pagination: {
          page: 2,
          limit: 10,
          total: 50,
          totalPages: 5,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.getPokemon({
        page: 2,
        limit: 10,
        generation: 1,
        type: 'fire',
        search: 'char',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/pokemon?page=2&limit=10&generation=1&type=fire&search=char',
        expect.any(Object)
      );
    });

    it('should handle empty query parameters', async () => {
      const mockResponse = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await api.getPokemon({ generation: undefined, type: '' });

      // Empty/undefined values are not added to query string
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/pokemon?',
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should throw error on failed request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(api.getPokemon({})).rejects.toThrow(
        'API Error: Internal Server Error'
      );
    });
  });
});
