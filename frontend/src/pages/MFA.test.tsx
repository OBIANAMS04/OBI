import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { MFA } from './MFA';

// Mock API
jest.mock('../services/api', () => ({
  post: jest.fn(),
}));

// Mock useAuthStore
jest.mock('../store/authStore', () => ({
  useAuthStore: jest.fn((selector) => {
    const store = {
      user: { id: 'user-123', email: 'test@example.com', fullName: 'Test User' },
      token: 'fake-token',
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

const renderMFA = () => {
  return render(
    <BrowserRouter>
      <MFA />
    </BrowserRouter>
  );
};

describe('MFA Setup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render MFA setup page', async () => {
    const api = require('../services/api').default;
    api.post.mockResolvedValue({
      data: {
        secret: 'JBSWY3DPEBLW64TMMQ======',
        qrCode: 'data:image/png;base64,test',
      },
    });

    renderMFA();

    await waitFor(() => {
      expect(screen.getByText('Set Up 2FA')).toBeInTheDocument();
    });
  });

  it('should display QR code after setup', async () => {
    const api = require('../services/api').default;
    api.post.mockResolvedValue({
      data: {
        secret: 'JBSWY3DPEBLW64TMMQ======',
        qrCode: 'data:image/png;base64,test',
      },
    });

    renderMFA();

    await waitFor(() => {
      const qrImage = screen.getByAltText('MFA QR Code') as HTMLImageElement;
      expect(qrImage.src).toContain('data:image/png');
    });
  });

  it('should display manual entry code', async () => {
    const api = require('../services/api').default;
    const testSecret = 'JBSWY3DPEBLW64TMMQ======';
    api.post.mockResolvedValue({
      data: {
        secret: testSecret,
        qrCode: 'data:image/png;base64,test',
      },
    });

    renderMFA();

    await waitFor(() => {
      expect(screen.getByText(testSecret)).toBeInTheDocument();
    });
  });

  it('should allow copying secret code', async () => {
    const api = require('../services/api').default;
    const testSecret = 'JBSWY3DPEBLW64TMMQ======';
    api.post.mockResolvedValue({
      data: {
        secret: testSecret,
        qrCode: 'data:image/png;base64,test',
      },
    });

    renderMFA();

    await waitFor(() => {
      const copyButton = screen.getByRole('button', { name: 'Copy' });
      expect(copyButton).toBeInTheDocument();
    });
  });

  it('should move to verification step', async () => {
    const api = require('../services/api').default;
    api.post.mockResolvedValue({
      data: {
        secret: 'JBSWY3DPEBLW64TMMQ======',
        qrCode: 'data:image/png;base64,test',
      },
    });

    renderMFA();

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Next: Verify Code/i });
      expect(nextButton).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /Next: Verify Code/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });
  });

  it('should accept only numeric input for TOTP code', async () => {
    const api = require('../services/api').default;
    api.post.mockResolvedValue({
      data: {
        secret: 'JBSWY3DPEBLW64TMMQ======',
        qrCode: 'data:image/png;base64,test',
      },
    });

    renderMFA();

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Next: Verify Code/i });
      fireEvent.click(nextButton);
    });

    const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
    await userEvent.type(input, 'abc123');

    expect(input.value).toBe('123'); // Only digits
  });

  it('should limit TOTP code to 6 digits', async () => {
    const api = require('../services/api').default;
    api.post.mockResolvedValue({
      data: {
        secret: 'JBSWY3DPEBLW64TMMQ======',
        qrCode: 'data:image/png;base64,test',
      },
    });

    renderMFA();

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Next: Verify Code/i });
      fireEvent.click(nextButton);
    });

    const input = screen.getByPlaceholderText('000000') as HTMLInputElement;
    await userEvent.type(input, '1234567890');

    expect(input.value).toBe('123456'); // Only first 6 digits
  });

  it('should verify TOTP code and enable MFA', async () => {
    const api = require('../services/api').default;
    api.post
      .mockResolvedValueOnce({
        data: {
          secret: 'JBSWY3DPEBLW64TMMQ======',
          qrCode: 'data:image/png;base64,test',
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          message: 'MFA enabled',
        },
      });

    renderMFA();

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Next: Verify Code/i });
      fireEvent.click(nextButton);
    });

    const input = screen.getByPlaceholderText('000000');
    await userEvent.type(input, '123456');

    const verifyButton = screen.getByRole('button', { name: /Verify & Enable 2FA/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('2FA Enabled!')).toBeInTheDocument();
    });
  });

  it('should display error on invalid TOTP code', async () => {
    const api = require('../services/api').default;
    api.post
      .mockResolvedValueOnce({
        data: {
          secret: 'JBSWY3DPEBLW64TMMQ======',
          qrCode: 'data:image/png;base64,test',
        },
      })
      .mockRejectedValueOnce({
        response: {
          data: {
            error: {
              message: 'Invalid code',
            },
          },
        },
      });

    renderMFA();

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Next: Verify Code/i });
      fireEvent.click(nextButton);
    });

    const input = screen.getByPlaceholderText('000000');
    await userEvent.type(input, '000000');

    const verifyButton = screen.getByRole('button', { name: /Verify & Enable 2FA/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid code/)).toBeInTheDocument();
    });
  });

  it('should navigate back to profile on completion', async () => {
    const api = require('../services/api').default;
    api.post
      .mockResolvedValueOnce({
        data: {
          secret: 'JBSWY3DPEBLW64TMMQ======',
          qrCode: 'data:image/png;base64,test',
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
        },
      });

    renderMFA();

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Next: Verify Code/i });
      fireEvent.click(nextButton);
    });

    const input = screen.getByPlaceholderText('000000');
    await userEvent.type(input, '123456');

    const verifyButton = screen.getByRole('button', { name: /Verify & Enable 2FA/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /Back to Profile/i });
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should disable verify button until 6 digits entered', async () => {
    const api = require('../services/api').default;
    api.post.mockResolvedValue({
      data: {
        secret: 'JBSWY3DPEBLW64TMMQ======',
        qrCode: 'data:image/png;base64,test',
      },
    });

    renderMFA();

    await waitFor(() => {
      const nextButton = screen.getByRole('button', { name: /Next: Verify Code/i });
      fireEvent.click(nextButton);
    });

    const verifyButton = screen.getByRole('button', {
      name: /Verify & Enable 2FA/i,
    }) as HTMLButtonElement;

    expect(verifyButton.disabled).toBe(true);

    const input = screen.getByPlaceholderText('000000');
    await userEvent.type(input, '123456');

    await waitFor(() => {
      expect(verifyButton.disabled).toBe(false);
    });
  });
});
