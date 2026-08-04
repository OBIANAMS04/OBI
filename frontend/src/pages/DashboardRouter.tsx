import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getDashboardPath, UserRole } from '../utils/rbac';
import CitizenDashboard from './CitizenDashboard';
import CaseManagerDashboard from './CaseManagerDashboard';
import AdminDashboard from './AdminDashboard';
import LeadershipDashboard from './LeadershipDashboard';

/**
 * DashboardRouter - Routes users to their role-specific dashboard
 */
export const DashboardRouter = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role as UserRole;

  switch (userRole) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'case_manager':
      return <CaseManagerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'leadership':
      return <LeadershipDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

/**
 * Dashboard component for a specific role
 * Used when accessing /dashboard/:role directly
 */
export const RoleSpecificDashboard = ({ role }: { role: UserRole }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has access to this dashboard
  if (user.role !== role && user.role !== 'admin' && user.role !== 'leadership') {
    return <Navigate to={getDashboardPath(user as any)} replace />;
  }

  switch (role) {
    case 'citizen':
      return <CitizenDashboard />;
    case 'case_manager':
      return <CaseManagerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'leadership':
      return <LeadershipDashboard />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

export default DashboardRouter;
