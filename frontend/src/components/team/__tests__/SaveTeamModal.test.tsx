import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SaveTeamModal } from '../SaveTeamModal';

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SaveTeamModal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <SaveTeamModal
        isOpen={false}
        isEditing={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(screen.queryByText('Save Team')).not.toBeInTheDocument();
  });

  it('renders save team title when not editing', () => {
    render(
      <SaveTeamModal
        isOpen={true}
        isEditing={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Save Team' })
    ).toBeInTheDocument();
  });

  it('renders update team title when editing', () => {
    render(
      <SaveTeamModal
        isOpen={true}
        isEditing={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    expect(
      screen.getByRole('heading', { name: 'Update Team' })
    ).toBeInTheDocument();
  });

  it('shows error when saving with empty name', async () => {
    render(
      <SaveTeamModal
        isOpen={true}
        isEditing={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText('Please enter a team name')
    ).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with name and isPublic when valid', async () => {
    mockOnSave.mockResolvedValue(undefined);
    render(
      <SaveTeamModal
        isOpen={true}
        isEditing={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('e.g. My Awesome Team'), {
      target: { value: 'My Team' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('My Team', false);
    });
  });

  it('calls onClose when cancel is clicked', () => {
    render(
      <SaveTeamModal
        isOpen={true}
        isEditing={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows error when onSave throws', async () => {
    mockOnSave.mockRejectedValue(new Error('Server error'));
    render(
      <SaveTeamModal
        isOpen={true}
        isEditing={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );
    fireEvent.change(screen.getByPlaceholderText('e.g. My Awesome Team'), {
      target: { value: 'My Team' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(
      await screen.findByText('Failed to save team. Please try again.')
    ).toBeInTheDocument();
  });
});

