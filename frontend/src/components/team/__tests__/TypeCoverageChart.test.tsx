import { render, screen } from '@testing-library/react';
import { TypeCoverageChart } from '../TypeCoverageChart';

const mockData = {
  defensive: {
    normal: 1,
    fire: 2,
    water: 0.5,
    electric: 1,
    grass: 0.25,
    ice: 2,
    fighting: 1,
    poison: 1,
    ground: 0,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 4,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 1,
    fairy: 1,
  },
  weaknessCount: 3,
  resistanceCount: 2,
  immunityCount: 1,
};

describe('TypeCoverageChart', () => {
  it('renders weakness, resistance, immunity counts', () => {
    render(<TypeCoverageChart data={mockData} />);
    expect(screen.getByText(/Weaknesses:/)).toBeInTheDocument();
    expect(screen.getByText(/Resistances:/)).toBeInTheDocument();
    expect(screen.getByText(/Immunities:/)).toBeInTheDocument();

    // strongタグ内の数字で確認
    const strongs = document.querySelectorAll('strong');
    const strongTexts = Array.from(strongs).map((el) => el.textContent);
    expect(strongTexts).toContain('3');
    expect(strongTexts).toContain('2');
    expect(strongTexts).toContain('1');
  });


  it('renders all 18 type labels', () => {
    render(<TypeCoverageChart data={mockData} />);
    const types = [
      'normal',
      'fire',
      'water',
      'electric',
      'grass',
      'ice',
      'fighting',
      'poison',
      'ground',
      'flying',
      'psychic',
      'bug',
      'rock',
      'ghost',
      'dragon',
      'dark',
      'steel',
      'fairy',
    ];
    types.forEach((type) => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });

  it('displays 4x weakness correctly', () => {
    render(<TypeCoverageChart data={mockData} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('displays immunity correctly', () => {
    render(<TypeCoverageChart data={mockData} />);
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('displays resistance correctly', () => {
    render(<TypeCoverageChart data={mockData} />);
    expect(screen.getByText('½')).toBeInTheDocument();
    expect(screen.getByText('¼')).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(<TypeCoverageChart data={mockData} />);
    expect(screen.getByText(/4× weak/)).toBeInTheDocument();
    expect(screen.getByText(/2× weak/)).toBeInTheDocument();
    expect(screen.getByText(/immune/)).toBeInTheDocument();
  });
});
