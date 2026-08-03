import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Registration } from './Registration';

// Mock the API
jest.mock('../services/api', () => ({
  authAPI: {
    register: jest.fn(),
  },
}));

// Mock useAuthStore
jest.mock('../store/authStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      setAuth: jest.fn(),
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

const renderRegistration = () => {
  return render(
    <BrowserRouter>
      <Registration />
    </BrowserRouter>
  );
};

describe('Registration Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render registration form', () => {
    renderRegistration();

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/social security number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('should show password strength meter', async () => {
    renderRegistration();

    const passwordInput = screen.getByLabelText(/^password/i);
    await userEvent.type(passwordInput, 'WeakPass1!');

    expect(screen.getByText(/weak/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    renderRegistration();

    const emailInput = screen.getByLabelText(/email address/i);
    await userEvent.type(emailInput, 'invalid-email');

    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.queryByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('should validate password strength', async () => {
    renderRegistration();

    const passwordInput = screen.getByLabelText(/^password/i);
    await userEvent.type(passwordInput, 'weak');

    expect(screen.getByText(/password must be at least 12 characters/i)).toBeInTheDocument();
  });

  it('should validate SSN format', async () => {
    renderRegistration();

    const ssnInput = screen.getByLabelText(/social security number/i);
    await userEvent.type(ssnInput, 'invalid-ssn');

    fireEvent.blur(ssnInput);

    await waitFor(() => {
      expect(screen.queryByText(/invalid ssn format/i)).toBeInTheDocument();
    });
  });

  it('should format SSN as user types', async () => {
    renderRegistration();

    const ssnInput = screen.getByLabelText(/social security number/i) as HTMLInputElement;
    await userEvent.type(ssnInput, '12345678');

    expect(ssnInput.value).toBe('123-45-6789');
  });

  it('should validate age (must be 18+)', async () => {
    renderRegistration();

    const dobInput = screen.getByLabelText(/date of birth/i);
    const today = new Date();
    const tooYoung = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
    const dobString = tooYoung.toISOString().split('T')[0];

    await userEvent.type(dobInput, dobString);

    fireEvent.blur(dobInput);

    await waitFor(() => {
      expect(screen.queryByText(/must be at least 18 years old/i)).toBeInTheDocument();
    });
  });

  it('should disable submit button when form is invalid', () => {
    renderRegistration();

    const submitButton = screen.getByRole('button', { name: /create account/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is valid', async () => {
    renderRegistration();

    const emailInput = screen.getByLabelText(/email address/i);
    const nameInput = screen.getByLabelText(/full name/i);
    const ssnInput = screen.getByLabelText(/social security number/i);
    const dobInput = screen.getByLabelText(/date of birth/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(ssnInput, '123-45-6789');

    const today = new Date();
    const twentyYearsAgo = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
    const dobString = twentyYearsAgo.toISOString().split('T')[0];
    await userEvent.type(dobInput, dobString);

    await userEvent.type(passwordInput, 'SecurePass123!');
    await userEvent.type(confirmPasswordInput, 'SecurePass123!');

    const submitButton = screen.getByRole('button', { name: /create account/i });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should have link to login page', () => {
    renderRegistration();

    const loginLink = screen.getByRole('link', { name: /sign in/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
