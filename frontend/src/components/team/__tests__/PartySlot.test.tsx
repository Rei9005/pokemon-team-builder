import { render, screen, fireEvent } from '@testing-library/react';
import { PartySlot } from '../PartySlot';

const mockPokemon = {
  id: 1,
  name: 'フシギダネ',
  nameEn: 'bulbasaur',
  types: ['grass', 'poison'],
  sprite:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
};

const mockOnRemove = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PartySlot', () => {
  it('renders empty slot with + when no pokemon', () => {
    render(<PartySlot index={0} pokemon={null} onRemove={mockOnRemove} />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('renders pokemon name when pokemon is present', () => {
    render(
      <PartySlot index={0} pokemon={mockPokemon} onRemove={mockOnRemove} />
    );
    expect(screen.getByText('フシギダネ')).toBeInTheDocument();
  });

  it('renders remove button when pokemon is present', () => {
    render(
      <PartySlot index={0} pokemon={mockPokemon} onRemove={mockOnRemove} />
    );
    expect(
      screen.getByRole('button', { name: 'Remove pokemon' })
    ).toBeInTheDocument();
  });

  it('does not render remove button when slot is empty', () => {
    render(<PartySlot index={0} pokemon={null} onRemove={mockOnRemove} />);
    expect(
      screen.queryByRole('button', { name: 'Remove pokemon' })
    ).not.toBeInTheDocument();
  });

  it('calls onRemove with correct index when remove button clicked', () => {
    render(
      <PartySlot index={2} pokemon={mockPokemon} onRemove={mockOnRemove} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remove pokemon' }));
    expect(mockOnRemove).toHaveBeenCalledWith(2);
  });
});
