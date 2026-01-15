import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, BookOpen, Users, Briefcase } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../../types';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();

  if (!state.user) return null;

  const handleLogout = async () => {
    await actions.logout();
    navigate('/login');
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'مدير';
      case UserRole.TEACHER:
        return 'معلم';
      case UserRole.SALES:
        return 'مبيعات';
      case UserRole.STUDENT:
        return 'طالب';
      default:
        return 'مستخدم';
    }
  };

  return (
    <nav className="navbar-new">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" 
            alt="أكاديمية كرة القدم" 
            className="logo-large"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <h1 className="text-3xl font-black text-white">⚽ أكاديمية كرة القدم</h1>
            <p className="text-red-100 font-semibold">{state.user.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {state.user.role === UserRole.TEACHER && (
            <button
              onClick={() => navigate('/students')}
              className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/30 backdrop-blur-sm transition-colors"
            >
              <Users size={16} />
              إدارة الطلاب
            </button>
          )}

          {state.user.role === UserRole.ADMIN && (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white/30 backdrop-blur-sm transition-colors"
            >
              <Briefcase size={16} />
              لوحة التحكم
            </button>
          )}

          <div className="h-6 w-px bg-white/30"></div>

          <div className="flex items-center gap-2 text-white">
            <User size={16} />
            <span className="text-sm">{getRoleLabel(state.user.role)}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors backdrop-blur-sm"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">خروج</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
