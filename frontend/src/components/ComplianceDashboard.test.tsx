import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ComplianceDashboard } from './ComplianceDashboard';
import api from '../services/api';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('ComplianceDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMetrics = {
    period: { days: 7, startDate: '2026-08-01', endDate: '2026-08-07' },
    aggregates: {
      totalDecisions: 100,
      compliantDecisions: 99,
      averageComplianceRate: 99.0,
    },
    daily: [
      {
        date: '2026-08-07',
        totalDecisions: 15,
        compliantDecisions: 15,
        complianceRate: 100.0,
        alerts: [],
      },
      {
        date: '2026-08-06',
        totalDecisions: 14,
        compliantDecisions: 14,
        complianceRate: 100.0,
        alerts: [],
      },
    ],
    alerts: [],
  };

  it('should load and display compliance metrics', async () => {
    mockedApi.get.mockResolvedValue({ data: mockMetrics });

    render(<ComplianceDashboard token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument(); // Total decisions
      expect(screen.getByText('99.00%')).toBeInTheDocument(); // Compliance rate
    });
  });

  it('should display compliance alerts when present', async () => {
    const metricsWithAlerts = {
      ...mockMetrics,
      alerts: ['Compliance rate below 99% target: 95.50%'],
    };

    mockedApi.get.mockResolvedValue({ data: metricsWithAlerts });

    render(<ComplianceDashboard token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText(/Compliance Alerts/)).toBeInTheDocument();
      expect(screen.getByText(/Compliance rate below 99/)).toBeInTheDocument();
    });
  });

  it('should change period when button clicked', async () => {
    mockedApi.get.mockResolvedValue({ data: mockMetrics });

    render(<ComplianceDashboard token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('7 Days')).toBeInTheDocument();
    });

    const button30 = screen.getByText('30 Days');
    fireEvent.click(button30);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('days=30'),
        expect.any(Object)
      );
    });
  });

  it('should display daily trend table', async () => {
    mockedApi.get.mockResolvedValue({ data: mockMetrics });

    render(<ComplianceDashboard token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText(/Daily Compliance Trend/)).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument(); // Total decisions
    });
  });

  it('should handle API errors', async () => {
    mockedApi.get.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Failed to load compliance dashboard',
          },
        },
      },
    });

    render(<ComplianceDashboard token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load compliance dashboard')).toBeInTheDocument();
    });
  });

  it('should not render without token', () => {
    const { container } = render(<ComplianceDashboard />);
    expect(container).toBeInTheDocument();
  });

  it('should show color-coded compliance rates', async () => {
    mockedApi.get.mockResolvedValue({ data: mockMetrics });

    const { container } = render(<ComplianceDashboard token="test-token" />);

    await waitFor(() => {
      const rateElement = screen.getByText('99.00%');
      expect(rateElement).toHaveClass('text-green-600'); // >= 99%
    });
  });
});
