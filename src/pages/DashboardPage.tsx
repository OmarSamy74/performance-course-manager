import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../../types';

export const DashboardPage: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  // Redirect based on user role
  React.useEffect(() => {
    if (!state.user) {
      navigate('/login');
      return;
    }

    switch (state.user.role) {
      case UserRole.ADMIN:
        navigate('/admin', { replace: true });
        break;
      case UserRole.TEACHER:
        navigate('/teacher', { replace: true });
        break;
      case UserRole.SALES:
        navigate('/sales', { replace: true });
        break;
      case UserRole.STUDENT:
        navigate('/student', { replace: true });
        break;
      default:
        navigate('/login', { replace: true });
    }
  }, [state.user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري التوجيه...</p>
      </div>
    </div>
  );
};
