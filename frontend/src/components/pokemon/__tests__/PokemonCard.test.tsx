import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { PokemonCard } from '../PokemonCard';
import type { Pokemon } from '@/types/pokemon';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('PokemonCard', () => {
  const mockPokemon: Pokemon = {
    id: 1,
    name: 'フシギダネ',
    nameEn: 'bulbasaur',
    types: ['grass', 'poison'],
    sprite: 'https://example.com/sprites/1.png',
    stats: {
      hp: 45,
      attack: 49,
      defense: 49,
      specialAttack: 65,
      specialDefense: 65,
      speed: 45,
      total: 318,
    },
  };

  it('should render pokemon information correctly', () => {
    render(<PokemonCard pokemon={mockPokemon} />);

    // Check if pokemon name is displayed
    expect(screen.getByText('フシギダネ')).toBeInTheDocument();

    // Check if pokemon ID is displayed (without leading zeros)
    expect(screen.getByText('#1', { exact: false })).toBeInTheDocument();

    // Check if types are displayed
    expect(screen.getByText('grass')).toBeInTheDocument();
    expect(screen.getByText('poison')).toBeInTheDocument();

    // Check if stats total is displayed
    expect(screen.getByText('318', { exact: false })).toBeInTheDocument();
  });

  it('should render pokemon image with correct src', () => {
    render(<PokemonCard pokemon={mockPokemon} />);

    const image = screen.getByAltText('フシギダネ');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/sprites/1.png');
  });

  it('should display single type pokemon correctly', () => {
    const singleTypePokemon: Pokemon = {
      ...mockPokemon,
      types: ['fire'],
    };

    render(<PokemonCard pokemon={singleTypePokemon} />);

    expect(screen.getByText('fire')).toBeInTheDocument();
    expect(screen.queryByText('poison')).not.toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();

    render(<PokemonCard pokemon={mockPokemon} onClick={handleClick} />);

    // Get the card div (not a button)
    const card = screen.getByText('フシギダネ').closest('div');
    fireEvent.click(card!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick if not provided', () => {
    // Should not throw error when onClick is not provided
    expect(() => {
      render(<PokemonCard pokemon={mockPokemon} />);
    }).not.toThrow();
  });

  it('should display pokemon ID without leading zeros', () => {
    const pokemon10: Pokemon = { ...mockPokemon, id: 10 };
    const pokemon100: Pokemon = { ...mockPokemon, id: 100 };

    const { rerender } = render(<PokemonCard pokemon={pokemon10} />);
    expect(screen.getByText('#10', { exact: false })).toBeInTheDocument();

    rerender(<PokemonCard pokemon={pokemon100} />);
    expect(screen.getByText('#100', { exact: false })).toBeInTheDocument();
  });

  it('should have hover effect styles', () => {
    render(<PokemonCard pokemon={mockPokemon} />);

    const card = screen.getByText('フシギダネ').closest('div');
    
    // Check if card has transition classes (Tailwind)
    expect(card?.className).toContain('transition');
  });

  it('should be clickable with cursor pointer', () => {
    render(<PokemonCard pokemon={mockPokemon} onClick={jest.fn()} />);

    const card = screen.getByText('フシギダネ').closest('div');
    expect(card?.className).toContain('cursor-pointer');
  });
});