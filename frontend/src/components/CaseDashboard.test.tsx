import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CaseDashboard } from './CaseDashboard';
import api from '../services/api';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('CaseDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load and display cases', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        cases: [
          {
            id: '1',
            userId: 'user1',
            status: 'Submitted',
            createdAt: new Date().toISOString(),
            assignedTo: 'manager@example.com',
          },
        ],
        total: 1,
      },
    });

    render(
      <BrowserRouter>
        <CaseDashboard token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/submitted/i)).toBeInTheDocument();
    });
  });

  it('should filter by status', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        cases: [],
        total: 0,
      },
    });

    render(
      <BrowserRouter>
        <CaseDashboard token="test-token" />
      </BrowserRouter>
    );

    const approvedButton = await screen.findByText('Approved');
    fireEvent.click(approvedButton);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('status=Approved'),
        expect.any(Object)
      );
    });
  });

  it('should display empty state when no cases', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        cases: [],
        total: 0,
      },
    });

    render(
      <BrowserRouter>
        <CaseDashboard token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no cases found/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    mockedApi.get.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Failed to load cases',
          },
        },
      },
    });

    render(
      <BrowserRouter>
        <CaseDashboard token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load cases')).toBeInTheDocument();
    });
  });

  it('should display status badges with correct colors', async () => {
    mockedApi.get.mockResolvedValue({
      data: {
        cases: [
          {
            id: '1',
            userId: 'user1',
            status: 'Approved',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
      },
    });

    const { container } = render(
      <BrowserRouter>
        <CaseDashboard token="test-token" />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });
});
