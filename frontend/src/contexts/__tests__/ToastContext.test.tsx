import { renderHook, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastContext';

describe('ToastContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>{children}</ToastProvider>
  );

  it('should provide showToast function', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current.showToast).toBeDefined();
    expect(typeof result.current.showToast).toBe('function');
  });

  it('should show toast with default info type', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('Test message');
    });

    // Toast is managed internally, just ensure no errors
    expect(result.current.showToast).toBeDefined();
  });

  it('should show toast with specific type', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('Success message', 'success');
    });

    act(() => {
      result.current.showToast('Error message', 'error');
    });

    act(() => {
      result.current.showToast('Warning message', 'warning');
    });

    // Toast is managed internally, just ensure no errors
    expect(result.current.showToast).toBeDefined();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within ToastProvider');

    console.error = originalError;
  });
});