import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Profile } from './Profile';

// Mock API
jest.mock('../services/api', () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

// Mock useAuthStore
jest.mock('../store/authStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      user: { id: 'user-123', email: 'test@example.com', fullName: 'Test User' },
      token: 'fake-token',
      logout: jest.fn(),
    };
    return selector(store);
  }),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockProfileData = {
  id: 'user-123',
  email: 'test@example.com',
  fullName: 'Test User',
  ssn: '123-45-6789',
  dob: '1990-01-01',
  phone: '+1-555-123-4567',
  address: '123 Main St, City, State 12345',
  mfaEnabled: false,
  complianceStatus: 'Eligible',
};

const renderProfile = () => {
  return render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  );
};

describe('Profile Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile page with user data', async () => {
    const api = require('../services/api').default;
    api.get.mockResolvedValue({ data: mockProfileData });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText('Your Profile')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should display compliance status', async () => {
    const api = require('../services/api').default;
    api.get.mockResolvedValue({ data: mockProfileData });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText('Eligible')).toBeInTheDocument();
    });
  });

  it('should display phone and address', async () => {
    const api = require('../services/api').default;
    api.get.mockResolvedValue({ data: mockProfileData });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument();
      expect(screen.getByText('123 Main St, City, State 12345')).toBeInTheDocument();
    });
  });

  it('should show edit button initially', async () => {
    const api = require('../services/api').default;
    api.get.mockResolvedValue({ data: mockProfileData });

    renderProfile();

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
    });
  });

  it('should allow user to edit profile', async () => {
    const api = require('../services/api').default;
    api.get.mockResolvedValue({ data: mockProfileData });
    api.put.mockResolvedValue({ data: mockProfileData });

    renderProfile();

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit profile/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/\+1-555/)).toBeInTheDocument();
    });
  });

  it('should update profile on save', async () => {
    const api = require('../services/api').default;
    api.get.mockResolvedValue({ data: mockProfileData });
    api.put.mockResolvedValue({
      data: {
        ...mockProfileData,
        phone: '+1-555-999-8888',
      },
    });

    renderProfile();

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editButton);
    });

    const phoneInput = screen.getByPlaceholderText(/\+1-555/) as HTMLInputElement;
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '+1-555-999-8888');

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalled();
    });
  });

  it('should show logout button', async () => {
    const api = require('../services/api').default;
    api.get.mockResolvedValue({ data: mockProfileData });

    renderProfile();

    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  it('should logout on logout button click', async () => {
    const api = require('../services/api').default;
    api.get.mockResolvedValue({ data: mockProfileData });

    renderProfile();

    await waitFor(() => {
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should display pending review status with guidance', async () => {
    const api = require('../services/api').default;
    const pendingData = {
      ...mockProfileData,
      complianceStatus: 'Pending Review',
      phone: null,
    };
    api.get.mockResolvedValue({ data: pendingData });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText('Pending Review')).toBeInTheDocument();
      expect(screen.getByText(/Complete your profile/)).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    const api = require('../services/api').default;
    api.get.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Failed to load profile',
          },
        },
      },
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText('Failed to load profile')).toBeInTheDocument();
    });
  });

  it('should require phone and address for eligibility', async () => {
    const api = require('../services/api').default;
    const noContactData = {
      ...mockProfileData,
      phone: null,
      address: null,
      complianceStatus: 'Pending Review',
    };
    api.get.mockResolvedValue({ data: noContactData });

    renderProfile();

    await waitFor(() => {
      const phoneLabel = screen.getByLabelText(/Phone Number/);
      expect(phoneLabel.textContent).toContain('required for eligibility');
    });
  });
});
