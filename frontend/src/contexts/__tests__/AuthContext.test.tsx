import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock fetch
global.fetch = jest.fn();

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('should have initial state: user null, isLoading true initially', async () => {
    // Mock getMe to fail (not authenticated)
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toBeNull();

    // Wait for checkAuth to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user).toBeNull();
  });

  describe('signup', () => {
    it('should signup successfully', async () => {
      // Mock initial getMe call (not authenticated)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const mockResponse = {
        id: 'user-id',
        email: 'test@example.com',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await act(async () => {
        await result.current.signup('test@example.com', 'Password123');
      });

      expect(result.current.user).toEqual(mockResponse);
      expect(result.current.isLoading).toBe(false);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/signup',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'Password123',
          }),
        })
      );
    });

    it('should handle signup error', async () => {
      // Mock initial getMe call (not authenticated)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Conflict',
      });

      await expect(
        result.current.signup('test@example.com', 'Password123')
      ).rejects.toThrow('API Error: Conflict');

      expect(result.current.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      // Mock initial getMe call (not authenticated)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

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

      await act(async () => {
        await result.current.login('test@example.com', 'Password123');
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isLoading).toBe(false);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/login',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    it('should handle login error', async () => {
      // Mock initial getMe call (not authenticated)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      await expect(
        result.current.login('test@example.com', 'WrongPassword')
      ).rejects.toThrow('API Error: Unauthorized');

      expect(result.current.user).toBeNull();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Mock initial getMe call (not authenticated)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial auth check
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First, login
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 'user-id', email: 'test@example.com' },
        }),
      });

      await act(async () => {
        await result.current.login('test@example.com', 'Password123');
      });

      // Then logout
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out successfully' }),
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/auth/logout',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });
  });
});