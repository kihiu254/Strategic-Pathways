import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const AdminRoute = () => {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isRoleChecking, setIsRoleChecking] = useState(true);
  const [isAdminRole, setIsAdminRole] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsRoleChecking(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (!error && data?.role === 'admin') {
          setIsAdminRole(true);
        }
      } catch (err) {
        console.error('Error checking admin role:', err);
      } finally {
        setIsRoleChecking(false);
      }
    };
    
    if (!isLoading) {
      checkRole();
    }
  }, [user, isLoading]);

  if (isLoading || isRoleChecking) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--sp-accent)]">
        Loading...
      </div>
    );
  }

  // If there's no session, immediately redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Basic role check. 
  // For production, this should ideally be checked against a secure 'role' column
  // in the 'profiles' table, but for this demo, we can authorize demo admins.
  const isAdminHardcoded = user?.email?.includes('admin') || 
                  user?.email?.includes('joinstrategicpathways') ||
                  user?.email === '1kihiupaul@gmail.com';

  const isAdmin = isAdminHardcoded || isAdminRole;

  if (!isAdmin) {
    // If they aren't an admin, redirect them to the normal profile
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
