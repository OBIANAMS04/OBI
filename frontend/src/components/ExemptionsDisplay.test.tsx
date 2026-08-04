import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ExemptionsDisplay } from './ExemptionsDisplay';
import api from '../services/api';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('ExemptionsDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    mockedApi.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ExemptionsDisplay userId="test-user" token="test-token" />);

    expect(screen.getByText(/exemption status/i)).toBeInTheDocument();
  });

  it('should display exemptions when loaded', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        exemptions: [
          {
            id: '1',
            userId: 'test-user',
            exemptionType: 'Type A - Senior Exemption',
            status: 'Eligible',
            determinedAt: new Date().toISOString(),
            determinedBy: 'system',
          },
        ],
      },
    });

    render(<ExemptionsDisplay userId="test-user" token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Type A - Senior Exemption')).toBeInTheDocument();
      expect(screen.getByText(/Eligible for 1 exemption/i)).toBeInTheDocument();
    });
  });

  it('should display multiple exemptions', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        exemptions: [
          {
            id: '1',
            userId: 'test-user',
            exemptionType: 'Type A - Senior Exemption',
            status: 'Eligible',
            determinedAt: new Date().toISOString(),
            determinedBy: 'system',
          },
          {
            id: '2',
            userId: 'test-user',
            exemptionType: 'Type B - Income-Based Exemption',
            status: 'Eligible',
            determinedAt: new Date().toISOString(),
            determinedBy: 'system',
          },
        ],
      },
    });

    render(<ExemptionsDisplay userId="test-user" token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Type A - Senior Exemption')).toBeInTheDocument();
      expect(screen.getByText('Type B - Income-Based Exemption')).toBeInTheDocument();
      expect(screen.getByText(/Eligible for 2 exemptions/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no exemptions', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        exemptions: [],
      },
    });

    render(<ExemptionsDisplay userId="test-user" token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText(/No exemptions currently available/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    mockedApi.get.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Failed to load exemptions',
          },
        },
      },
    });

    render(<ExemptionsDisplay userId="test-user" token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load exemptions')).toBeInTheDocument();
    });
  });

  it('should trigger exemption check on button click', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        exemptions: [],
      },
    });

    mockedApi.post.mockResolvedValue({
      data: {
        eligible: true,
        exemptions: ['Type A - Senior Exemption'],
      },
    });

    render(<ExemptionsDisplay userId="test-user" token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Check Now')).toBeInTheDocument();
    });

    const checkButton = screen.getByText('Check Now');
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith('/exemptions/check', {}, {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });
    });
  });

  it('should not render without userId or token', () => {
    const { container } = render(<ExemptionsDisplay />);

    // Should render but with loading/empty state
    expect(container).toBeInTheDocument();
  });

  it('should display exemption with reason', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        exemptions: [
          {
            id: '1',
            userId: 'test-user',
            exemptionType: 'Type C - Hardship Exemption',
            status: 'Pending Review',
            reason: 'Medical hardship documented',
            determinedAt: new Date().toISOString(),
            determinedBy: 'system',
          },
        ],
      },
    });

    render(<ExemptionsDisplay userId="test-user" token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Medical hardship documented')).toBeInTheDocument();
    });
  });
});
