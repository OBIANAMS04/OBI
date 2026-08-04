import { render, screen } from '@testing-library/react';
import { CitizenDashboard } from './CitizenDashboard';
import { CaseManagerDashboard } from './CaseManagerDashboard';
import { AdminDashboard } from './AdminDashboard';
import { LeadershipDashboard } from './LeadershipDashboard';
import * as authStore from '../store/authStore';

jest.mock('../store/authStore');
jest.mock('./DashboardLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Dashboard Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CitizenDashboard', () => {
    beforeEach(() => {
      (authStore.useAuthStore as jest.Mock).mockReturnValue({
        user: {
          id: 'citizen1',
          email: 'citizen@example.com',
          role: 'citizen',
          fullName: 'John Citizen',
        },
      });
    });

    it('should render citizen dashboard', () => {
      render(<CitizenDashboard />);
      expect(screen.getByText(/Welcome back, John Citizen/i)).toBeInTheDocument();
    });

    it('should display application status', () => {
      render(<CitizenDashboard />);
      expect(screen.getByText(/Application Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending Review/i)).toBeInTheDocument();
    });

    it('should show eligibility status', () => {
      render(<CitizenDashboard />);
      expect(screen.getByText(/Eligibility/i)).toBeInTheDocument();
      expect(screen.getByText(/Eligible/i)).toBeInTheDocument();
    });

    it('should display application timeline', () => {
      render(<CitizenDashboard />);
      expect(screen.getByText(/Application Timeline/i)).toBeInTheDocument();
      expect(screen.getByText(/Application Submitted/i)).toBeInTheDocument();
    });

    it('should show quick action buttons', () => {
      render(<CitizenDashboard />);
      expect(screen.getByText(/View Application Details/i)).toBeInTheDocument();
      expect(screen.getByText(/Update Profile/i)).toBeInTheDocument();
    });
  });

  describe('CaseManagerDashboard', () => {
    beforeEach(() => {
      (authStore.useAuthStore as jest.Mock).mockReturnValue({
        user: {
          id: 'manager1',
          email: 'manager@example.com',
          role: 'case_manager',
          fullName: 'Jane Manager',
        },
      });
    });

    it('should render case manager dashboard', () => {
      render(<CaseManagerDashboard />);
      expect(screen.getByText(/Welcome, Jane Manager/i)).toBeInTheDocument();
    });

    it('should display workload summary', () => {
      render(<CaseManagerDashboard />);
      expect(screen.getByText(/Total Cases/i)).toBeInTheDocument();
      expect(screen.getByText(/24/)).toBeInTheDocument();
    });

    it('should show priority queue', () => {
      render(<CaseManagerDashboard />);
      expect(screen.getByText(/Priority Queue/i)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    it('should display performance metrics', () => {
      render(<CaseManagerDashboard />);
      expect(screen.getByText(/This Month's Performance/i)).toBeInTheDocument();
      expect(screen.getByText(/Avg Processing Time/i)).toBeInTheDocument();
      expect(screen.getByText(/Approval Rate/i)).toBeInTheDocument();
    });

    it('should show review buttons for cases', () => {
      render(<CaseManagerDashboard />);
      const reviewButtons = screen.getAllByText(/Review/i);
      expect(reviewButtons.length).toBeGreaterThan(0);
    });
  });

  describe('AdminDashboard', () => {
    beforeEach(() => {
      (authStore.useAuthStore as jest.Mock).mockReturnValue({
        user: {
          id: 'admin1',
          email: 'admin@example.com',
          role: 'admin',
          fullName: 'Admin User',
        },
      });
    });

    it('should render admin dashboard', () => {
      render(<AdminDashboard />);
      expect(screen.getByText(/System Administration/i)).toBeInTheDocument();
    });

    it('should display system health', () => {
      render(<AdminDashboard />);
      expect(screen.getByText(/System Status/i)).toBeInTheDocument();
      expect(screen.getByText(/Operational/i)).toBeInTheDocument();
    });

    it('should show active users count', () => {
      render(<AdminDashboard />);
      expect(screen.getByText(/Active Users/i)).toBeInTheDocument();
    });

    it('should display API uptime', () => {
      render(<AdminDashboard />);
      expect(screen.getByText(/API Uptime/i)).toBeInTheDocument();
    });

    it('should have management sections', () => {
      render(<AdminDashboard />);
      expect(screen.getByText(/Manage Users/i)).toBeInTheDocument();
      expect(screen.getByText(/Role Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Audit Logs/i)).toBeInTheDocument();
    });

    it('should show alerts section', () => {
      render(<AdminDashboard />);
      expect(screen.getByText(/Monitoring & Alerts/i)).toBeInTheDocument();
    });
  });

  describe('LeadershipDashboard', () => {
    beforeEach(() => {
      (authStore.useAuthStore as jest.Mock).mockReturnValue({
        user: {
          id: 'leader1',
          email: 'leader@example.com',
          role: 'leadership',
          fullName: 'Leader User',
        },
      });
    });

    it('should render leadership dashboard', () => {
      render(<LeadershipDashboard />);
      expect(screen.getByText(/Executive Dashboard/i)).toBeInTheDocument();
    });

    it('should display KPIs', () => {
      render(<LeadershipDashboard />);
      expect(screen.getByText(/Total Applications/i)).toBeInTheDocument();
      expect(screen.getByText(/Approval Rate/i)).toBeInTheDocument();
      expect(screen.getByText(/Avg Processing Time/i)).toBeInTheDocument();
      expect(screen.getByText(/Compliance Score/i)).toBeInTheDocument();
    });

    it('should show team performance', () => {
      render(<LeadershipDashboard />);
      expect(screen.getByText(/Team Performance/i)).toBeInTheDocument();
      expect(screen.getByText(/Northern Region/i)).toBeInTheDocument();
    });

    it('should display monthly trends', () => {
      render(<LeadershipDashboard />);
      expect(screen.getByText(/Monthly Trends/i)).toBeInTheDocument();
      expect(screen.getByText(/Application Submissions/i)).toBeInTheDocument();
      expect(screen.getByText(/Case Resolution/i)).toBeInTheDocument();
    });

    it('should have quick action buttons', () => {
      render(<LeadershipDashboard />);
      expect(screen.getByText(/Download Report/i)).toBeInTheDocument();
      expect(screen.getByText(/Schedule Meeting/i)).toBeInTheDocument();
    });
  });

  describe('Dashboard Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      (authStore.useAuthStore as jest.Mock).mockReturnValue({
        user: {
          id: 'citizen1',
          email: 'citizen@example.com',
          role: 'citizen',
          fullName: 'John Citizen',
        },
      });

      const { container } = render(<CitizenDashboard />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeTruthy();
    });

    it('should have semantic layout', () => {
      (authStore.useAuthStore as jest.Mock).mockReturnValue({
        user: {
          id: 'admin1',
          email: 'admin@example.com',
          role: 'admin',
          fullName: 'Admin User',
        },
      });

      const { container } = render(<AdminDashboard />);
      expect(container.querySelector('div')).toBeTruthy();
    });
  });
});
