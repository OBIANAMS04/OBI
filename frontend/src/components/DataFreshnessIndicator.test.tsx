import { render, screen, waitFor } from '@testing-library/react';
import { DataFreshnessIndicator } from './DataFreshnessIndicator';

// Mock the hook
jest.mock('../hooks/useRealTimeData', () => ({
  useRealTimeData: jest.fn(),
}));

const mockUseRealTimeData = require('../hooks/useRealTimeData').useRealTimeData;

describe('DataFreshnessIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseRealTimeData.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      indicators: { isGreen: false, isYellow: false, isRed: false },
      freshness: null,
      dataAge: null,
      isSLOMet: false,
    });

    render(<DataFreshnessIndicator />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseRealTimeData.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to fetch',
      indicators: { isGreen: false, isYellow: false, isRed: false },
      freshness: null,
      dataAge: null,
      isSLOMet: false,
    });

    render(<DataFreshnessIndicator />);

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('should render green indicator for fresh data', () => {
    mockUseRealTimeData.mockReturnValue({
      data: {
        lastRefresh: new Date().toISOString(),
        dataAge: 5000,
        freshness: 'fresh',
        cachedAt: new Date().toISOString(),
        slo: { target: 30000, met: true },
        indicators: { isGreen: true, isYellow: false, isRed: false },
      },
      isLoading: false,
      error: null,
      indicators: { isGreen: true, isYellow: false, isRed: false },
      freshness: 'fresh',
      dataAge: 5000,
      isSLOMet: true,
    });

    render(<DataFreshnessIndicator />);

    expect(screen.getByText('Fresh')).toBeInTheDocument();
  });

  it('should render yellow indicator for stale data', () => {
    mockUseRealTimeData.mockReturnValue({
      data: {
        lastRefresh: new Date().toISOString(),
        dataAge: 15000,
        freshness: 'stale',
        cachedAt: new Date().toISOString(),
        slo: { target: 30000, met: true },
        indicators: { isGreen: false, isYellow: true, isRed: false },
      },
      isLoading: false,
      error: null,
      indicators: { isGreen: false, isYellow: true, isRed: false },
      freshness: 'stale',
      dataAge: 15000,
      isSLOMet: true,
    });

    render(<DataFreshnessIndicator />);

    expect(screen.getByText('Stale')).toBeInTheDocument();
  });

  it('should render red indicator for very stale data', () => {
    mockUseRealTimeData.mockReturnValue({
      data: {
        lastRefresh: new Date().toISOString(),
        dataAge: 35000,
        freshness: 'very_stale',
        cachedAt: new Date().toISOString(),
        slo: { target: 30000, met: false },
        indicators: { isGreen: false, isYellow: false, isRed: true },
      },
      isLoading: false,
      error: null,
      indicators: { isGreen: false, isYellow: false, isRed: true },
      freshness: 'very_stale',
      dataAge: 35000,
      isSLOMet: false,
    });

    render(<DataFreshnessIndicator />);

    expect(screen.getByText('Very Stale')).toBeInTheDocument();
  });

  it('should show compact view when requested', () => {
    mockUseRealTimeData.mockReturnValue({
      data: {
        lastRefresh: new Date().toISOString(),
        dataAge: 5000,
        freshness: 'fresh',
        cachedAt: new Date().toISOString(),
        slo: { target: 30000, met: true },
        indicators: { isGreen: true, isYellow: false, isRed: false },
      },
      isLoading: false,
      error: null,
      indicators: { isGreen: true, isYellow: false, isRed: false },
      freshness: 'fresh',
      dataAge: 5000,
      isSLOMet: true,
    });

    render(<DataFreshnessIndicator compact={true} />);

    expect(screen.getByText('Fresh')).toBeInTheDocument();
    expect(screen.queryByText('Data Freshness')).not.toBeInTheDocument();
  });

  it('should show details when showDetails is true', () => {
    mockUseRealTimeData.mockReturnValue({
      data: {
        lastRefresh: new Date().toISOString(),
        dataAge: 5000,
        freshness: 'fresh',
        cachedAt: new Date().toISOString(),
        slo: { target: 30000, met: true },
        indicators: { isGreen: true, isYellow: false, isRed: false },
      },
      isLoading: false,
      error: null,
      indicators: { isGreen: true, isYellow: false, isRed: false },
      freshness: 'fresh',
      dataAge: 5000,
      isSLOMet: true,
    });

    render(<DataFreshnessIndicator showDetails={true} />);

    expect(screen.getByText('Data Age:')).toBeInTheDocument();
    expect(screen.getByText('SLO (< 30s):')).toBeInTheDocument();
    expect(screen.getByText('✓ Met')).toBeInTheDocument();
  });

  it('should format data age correctly', () => {
    mockUseRealTimeData.mockReturnValue({
      data: {
        lastRefresh: new Date().toISOString(),
        dataAge: 65000, // 1 minute 5 seconds
        freshness: 'very_stale',
        cachedAt: new Date().toISOString(),
        slo: { target: 30000, met: false },
        indicators: { isGreen: false, isYellow: false, isRed: true },
      },
      isLoading: false,
      error: null,
      indicators: { isGreen: false, isYellow: false, isRed: true },
      freshness: 'very_stale',
      dataAge: 65000,
      isSLOMet: false,
    });

    render(<DataFreshnessIndicator showDetails={true} />);

    expect(screen.getByText(/1m 5s ago/)).toBeInTheDocument();
  });

  it('should report SLO exceeded when met is false', () => {
    mockUseRealTimeData.mockReturnValue({
      data: {
        lastRefresh: new Date().toISOString(),
        dataAge: 35000,
        freshness: 'very_stale',
        cachedAt: new Date().toISOString(),
        slo: { target: 30000, met: false },
        indicators: { isGreen: false, isYellow: false, isRed: true },
      },
      isLoading: false,
      error: null,
      indicators: { isGreen: false, isYellow: false, isRed: true },
      freshness: 'very_stale',
      dataAge: 35000,
      isSLOMet: false,
    });

    render(<DataFreshnessIndicator showDetails={true} />);

    expect(screen.getByText('✗ Exceeded')).toBeInTheDocument();
  });

  it('should accept userId prop', () => {
    mockUseRealTimeData.mockReturnValue({
      data: {
        lastRefresh: new Date().toISOString(),
        dataAge: 5000,
        freshness: 'fresh',
        cachedAt: new Date().toISOString(),
        slo: { target: 30000, met: true },
        indicators: { isGreen: true, isYellow: false, isRed: false },
      },
      isLoading: false,
      error: null,
      indicators: { isGreen: true, isYellow: false, isRed: false },
      freshness: 'fresh',
      dataAge: 5000,
      isSLOMet: true,
    });

    render(<DataFreshnessIndicator userId="test-user-id" />);

    expect(mockUseRealTimeData).toHaveBeenCalledWith('test-user-id', 5000);
  });
});
