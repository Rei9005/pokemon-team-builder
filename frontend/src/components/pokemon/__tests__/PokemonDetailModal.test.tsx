import { render, screen, fireEvent } from '@testing-library/react';
import { PokemonDetailModal } from '../PokemonDetailModal';
import type { PokemonDetail } from '@/types/pokemon';

describe('PokemonDetailModal', () => {
  const mockPokemon: PokemonDetail = {
    id: 1,
    name: 'フシギダネ',
    nameEn: 'bulbasaur',
    types: ['grass', 'poison'],
    sprite: 'https://example.com/1.png',
    stats: {
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
      total: 318,
    },
    abilities: ['overgrow', 'chlorophyll'],
    height: 7,
    weight: 69,
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal with pokemon data', () => {
    render(<PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />);

    expect(screen.getByText('フシギダネ')).toBeInTheDocument();
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('#001')).toBeInTheDocument();
  });

  it('should display pokemon stats', () => {
    render(<PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />);

    // Check stat labels
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('Attack')).toBeInTheDocument();
    expect(screen.getByText('Defense')).toBeInTheDocument();
    expect(screen.getByText('Sp. Attack')).toBeInTheDocument();
    expect(screen.getByText('Sp. Defense')).toBeInTheDocument();
    expect(screen.getByText('Speed')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();

    // Check specific stat values
    expect(screen.getByText('318')).toBeInTheDocument(); // Total
    expect(screen.getAllByText('45')).toHaveLength(2); // HP and Speed
    expect(screen.getAllByText('49')).toHaveLength(2); // Attack and Defense
    expect(screen.getAllByText('65')).toHaveLength(2); // Sp. Attack and Sp. Defense
  });

  it('should display abilities', () => {
    render(<PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />);

    expect(screen.getByText(/overgrow/i)).toBeInTheDocument();
    expect(screen.getByText(/chlorophyll/i)).toBeInTheDocument();
  });

  it('should display height and weight', () => {
    render(<PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />);

    expect(screen.getByText(/0\.7/)).toBeInTheDocument();
    expect(screen.getByText(/6\.9/)).toBeInTheDocument();
  });

  it('should display type badges', () => {
    render(<PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />);

    expect(screen.getByText('grass')).toBeInTheDocument();
    expect(screen.getByText('poison')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', () => {
    render(<PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when background is clicked', () => {
    const { container } = render(
      <PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />
    );

    // Click on the backdrop (first div with fixed inset-0)
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should close modal when ESC key is pressed', () => {
    render(<PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close modal when content is clicked', () => {
    const { container } = render(
      <PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />
    );

    // Click on the modal content (second div, not the backdrop)
    const content = container.querySelector('.bg-white.rounded-lg') as HTMLElement;
    fireEvent.click(content);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should prevent body scroll when mounted', () => {
    render(<PokemonDetailModal pokemon={mockPokemon} onClose={mockOnClose} />);

    expect(document.body.style.overflow).toBe('hidden');
  });
});