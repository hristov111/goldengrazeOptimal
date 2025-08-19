import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const ADMIN_EMAILS = [
  'admin@mygoldengraze.com',
  'goldengraze1@outlook.com'
];

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isLoggedIn, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <Navigate to="/signin" replace />;
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;