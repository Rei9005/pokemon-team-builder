import { render, screen, fireEvent } from '@testing-library/react';
import { TeamCard } from '../TeamCard';
import { ToastProvider } from '@/contexts/ToastContext';
import type { Team } from '@/types/team';

// Wrapper with ToastProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('TeamCard', () => {
  const mockOnDelete = jest.fn();

  const mockTeam: Team = {
    id: 'team-1',
    name: 'Test Team',
    isPublic: true,
    shareId: 'abc123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    pokemon: [
      {
        id: 'tp-1',
        pokemonId: 1,
        position: 0,
        pokemon: {
          id: 1,
          name: 'フシギダネ',
          nameEn: 'bulbasaur',
          types: ['grass', 'poison'],
          sprite: 'https://example.com/1.png',
        },
      },
      {
        id: 'tp-2',
        pokemonId: 4,
        position: 1,
        pokemon: {
          id: 4,
          name: 'ヒトカゲ',
          nameEn: 'charmander',
          types: ['fire'],
          sprite: 'https://example.com/4.png',
        },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render team name and public status', () => {
    render(<TeamCard team={mockTeam} onDelete={mockOnDelete} />, { wrapper });

    expect(screen.getByText('Test Team')).toBeInTheDocument();
    expect(screen.getByText('🔓 Public')).toBeInTheDocument();
  });

  it('should render private status for private team', () => {
    const privateTeam = { ...mockTeam, isPublic: false, shareId: null };
    render(<TeamCard team={privateTeam} onDelete={mockOnDelete} />, { wrapper });

    expect(screen.getByText('🔒 Private')).toBeInTheDocument();
  });

  it('should render pokemon icons', () => {
    render(<TeamCard team={mockTeam} onDelete={mockOnDelete} />, { wrapper });

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/1.png');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/4.png');
  });

  it('should render empty slots', () => {
    render(<TeamCard team={mockTeam} onDelete={mockOnDelete} />, { wrapper });

    const emptySlots = screen.getAllByText('+');
    expect(emptySlots).toHaveLength(4);
  });

  it('should display created date', () => {
    render(<TeamCard team={mockTeam} onDelete={mockOnDelete} />, { wrapper });

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('should render Edit button', () => {
    render(<TeamCard team={mockTeam} onDelete={mockOnDelete} />, { wrapper });

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should render Share button for public team', () => {
    render(<TeamCard team={mockTeam} onDelete={mockOnDelete} />, { wrapper });

    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('should not render Share button for private team', () => {
    const privateTeam = { ...mockTeam, isPublic: false, shareId: null };
    render(<TeamCard team={privateTeam} onDelete={mockOnDelete} />, { wrapper });

    expect(screen.queryByRole('button', { name: /share/i })).not.toBeInTheDocument();
  });

  it('should render Delete button', () => {
    render(<TeamCard team={mockTeam} onDelete={mockOnDelete} />, { wrapper });

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should call onDelete when Delete is clicked and confirmed', () => {
    global.confirm = jest.fn(() => true);

    render(<TeamCard team={mockTeam} onDelete={mockOnDelete} />, { wrapper });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith(
      'Are you sure you want to delete "Test Team"?'
    );
    expect(mockOnDelete).toHaveBeenCalledWith('team-1');
  });

  it('should not call onDelete when Delete is cancelled', () => {
    global.confirm = jest.fn(() => false);

    render(<TeamCard team={mockTeam} onDelete={mockOnDelete} />, { wrapper });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });
});