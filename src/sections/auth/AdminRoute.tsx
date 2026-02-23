import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AdminRoute = () => {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);

  // If there's no session, immediately redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Basic role check. 
  // For production, this should ideally be checked against a secure 'role' column
  // in the 'profiles' table, but for this demo, we can authorize demo admins.
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('joinstrategicpathways');

  if (!isAdmin) {
    // If they aren't an admin, redirect them to the normal profile
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
