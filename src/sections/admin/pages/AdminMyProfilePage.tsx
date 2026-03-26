import { useOutletContext } from 'react-router-dom';
import type { AdminLayoutOutletContext } from '../../AdminDashboard';
import AdminProfile from '../AdminProfile';

const AdminMyProfilePage = () => {
  const { adminProfile, userEmail } = useOutletContext<AdminLayoutOutletContext>();

  return (
    <AdminProfile adminProfile={adminProfile} userEmail={userEmail} />
  );
};

export default AdminMyProfilePage;
