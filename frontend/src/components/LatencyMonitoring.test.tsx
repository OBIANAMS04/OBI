import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LatencyMonitoring } from './LatencyMonitoring';
import api from '../services/api';

jest.mock('../services/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('LatencyMonitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMetrics = {
    period: { startTime: '2026-08-04T00:00:00Z', endTime: '2026-08-04T01:00:00Z', hours: 1 },
    globalStats: {
      totalOperations: 500,
      operationsWithinSLO: 475,
      globalSLORate: 95.0,
    },
    byEntity: [
      {
        entityType: 'users',
        operation: 'create',
        count: 100,
        averageLatency: 5000,
        p95Latency: 15000,
        p99Latency: 20000,
        withinSLO: 95,
        sloViolationRate: 5.0,
      },
      {
        entityType: 'cases',
        operation: 'update',
        count: 150,
        averageLatency: 8000,
        p95Latency: 25000,
        p99Latency: 28000,
        withinSLO: 145,
        sloViolationRate: 3.33,
      },
    ],
  };

  const mockHealth = {
    healthy: true,
    status: 'OK',
    sloRate: 95.0,
    globalTarget: 95,
    totalOperations: 500,
    withinSLO: 475,
    violations: 0,
    timestamp: new Date().toISOString(),
  };

  it('should load and display latency metrics', async () => {
    mockedApi.get.mockResolvedValue({ data: mockMetrics });

    render(<LatencyMonitoring token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('500')).toBeInTheDocument(); // Total operations
      expect(screen.getByText('95.0%')).toBeInTheDocument(); // SLO rate
    });
  });

  it('should display global SLO status', async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: mockMetrics })
      .mockResolvedValueOnce({ data: mockHealth });

    render(<LatencyMonitoring token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Global Data Pipeline Status')).toBeInTheDocument();
      expect(screen.getByText('Total Operations')).toBeInTheDocument();
    });
  });

  it('should display per-entity performance table', async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: mockMetrics })
      .mockResolvedValueOnce({ data: mockHealth });

    render(<LatencyMonitoring token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Performance by Entity Type')).toBeInTheDocument();
      expect(screen.getByText('users')).toBeInTheDocument();
      expect(screen.getByText('cases')).toBeInTheDocument();
    });
  });

  it('should change time period when button clicked', async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: mockMetrics })
      .mockResolvedValueOnce({ data: mockHealth });

    render(<LatencyMonitoring token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('1h')).toBeInTheDocument();
    });

    const button6h = screen.getByText('6h');
    fireEvent.click(button6h);

    await waitFor(() => {
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining('hours=6'),
        expect.any(Object)
      );
    });
  });

  it('should display health status badge', async () => {
    mockedApi.get
      .mockResolvedValueOnce({ data: mockMetrics })
      .mockResolvedValueOnce({ data: mockHealth });

    render(<LatencyMonitoring token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('OK')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    mockedApi.get.mockRejectedValue({
      response: {
        data: {
          error: {
            message: 'Failed to load latency metrics',
          },
        },
      },
    });

    render(<LatencyMonitoring token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load latency metrics')).toBeInTheDocument();
    });
  });

  it('should color-code p95 latency violations', async () => {
    const violatedMetrics = {
      ...mockMetrics,
      byEntity: [
        {
          ...mockMetrics.byEntity[0],
          p95Latency: 35000, // Over 30s
        },
      ],
    };

    mockedApi.get
      .mockResolvedValueOnce({ data: violatedMetrics })
      .mockResolvedValueOnce({ data: mockHealth });

    const { container } = render(<LatencyMonitoring token="test-token" />);

    await waitFor(() => {
      const redElements = container.querySelectorAll('.text-red-600');
      expect(redElements.length).toBeGreaterThan(0);
    });
  });

  it('should not render without token', () => {
    const { container } = render(<LatencyMonitoring />);
    expect(container).toBeInTheDocument();
  });
});
