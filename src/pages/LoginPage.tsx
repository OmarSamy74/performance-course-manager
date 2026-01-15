import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Lock, GraduationCap, Users, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FormField } from '../components/ui/FormField';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { actions, state } = useApp();
  const [loginType, setLoginType] = useState<'student' | 'staff'>('student');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<UserRole | null>(null);

  // Navigate when user state updates after login
  useEffect(() => {
    if (pendingNavigation && state.user) {
      const role = state.user.role;
      if (role === pendingNavigation) {
        setPendingNavigation(null);
        setLoading(false);
        if (role === UserRole.ADMIN) {
          navigate('/admin', { replace: true });
        } else if (role === UserRole.TEACHER) {
          navigate('/teacher', { replace: true });
        } else if (role === UserRole.SALES) {
          navigate('/sales', { replace: true });
        } else if (role === UserRole.STUDENT) {
          navigate('/student', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [state.user, pendingNavigation, navigate]);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await actions.login(phone, phone);
      setTimeout(() => {
        navigate('/student', { replace: true });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'رقم الهاتف غير صحيح');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setPendingNavigation(null);

    try {
      const result = await actions.login(username, password);
      
      // Try to get user from result or state
      let loggedInUser = result;
      
      // If we have a user, navigate immediately
      if (loggedInUser?.role) {
        setLoading(false);
        if (loggedInUser.role === UserRole.ADMIN) {
          navigate('/admin', { replace: true });
        } else if (loggedInUser.role === UserRole.TEACHER) {
          navigate('/teacher', { replace: true });
        } else if (loggedInUser.role === UserRole.SALES) {
          navigate('/sales', { replace: true });
        } else if (loggedInUser.role === UserRole.STUDENT) {
          navigate('/student', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // Wait for state to update, then navigate via useEffect
        // Try to determine role from username (fallback)
        let expectedRole: UserRole | null = null;
        if (username === 'admin') {
          expectedRole = UserRole.ADMIN;
        } else if (username === 'omar.samy' || username === 'abdelatif.reda' || username === 'karim.ali' || username === 'teacher') {
          expectedRole = UserRole.TEACHER;
        } else if (username === 'sales') {
          expectedRole = UserRole.SALES;
        }
        
        if (expectedRole) {
          setPendingNavigation(expectedRole);
          // Set timeout to prevent infinite loading
          setTimeout(() => {
            if (loading) {
              setLoading(false);
              setPendingNavigation(null);
              setError('فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
            }
          }, 5000);
        } else {
          setLoading(false);
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'بيانات خاطئة. Admin: admin/123 | Teacher: omar.samy/123 | Sales: sales/123');
      setLoading(false);
      setPendingNavigation(null);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-red-600 via-red-700 to-red-800 p-8 text-center text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30 transform hover:scale-110 transition-transform duration-300">
                <GraduationCap size={48} className="drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2 drop-shadow-lg">⚽ أكاديمية كرة القدم</h1>
                <p className="text-red-100 font-semibold text-lg">نظام إدارة التدريب والأداء</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Login Type Selector - Enhanced */}
            <div className="flex gap-3 mb-8 bg-gray-100 p-1.5 rounded-2xl shadow-inner">
              <button
                type="button"
                onClick={() => {
                  setLoginType('student');
                  setError('');
                  setPhone('');
                }}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${
                  loginType === 'student'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {loginType === 'student' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></span>
                )}
                <User size={20} className="relative z-10" />
                <span className="relative z-10">طالب</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType('staff');
                  setError('');
                  setUsername('');
                  setPassword('');
                }}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${
                  loginType === 'staff'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {loginType === 'staff' && (
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></span>
                )}
                <Users size={20} className="relative z-10" />
                <span className="relative z-10">فريق العمل</span>
              </button>
            </div>

            {/* Student Login Form */}
            {loginType === 'student' && (
              <form onSubmit={handleStudentLogin} className="space-y-6">
                <div className="relative group">
                  <label className="absolute right-4 top-3 text-gray-400 text-sm font-medium transition-all duration-300 pointer-events-none group-focus-within:text-red-600 group-focus-within:scale-90 group-focus-within:-translate-y-6">
                    رقم الهاتف
                  </label>
                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-focus-within:text-red-600 z-10" />
                    <Input
                      type="tel"
                      placeholder=""
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                      dir="ltr"
                      required
                      variant={error ? 'error' : 'default'}
                      className="pr-12 pt-6 pb-2 h-14 text-base bg-gray-50 border-2 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                    <p className="text-red-700 font-medium text-sm flex items-center gap-2">
                      <span className="text-red-600">⚠️</span>
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full h-14 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  {!loading && '🚀 '}
                  دخول كطالب
                </Button>
              </form>
            )}

            {/* Staff Login Form */}
            {loginType === 'staff' && (
              <form onSubmit={handleStaffLogin} className="space-y-6">
                <div className="relative group">
                  <label className="absolute right-4 top-3 text-gray-400 text-sm font-medium transition-all duration-300 pointer-events-none group-focus-within:text-red-600 group-focus-within:scale-90 group-focus-within:-translate-y-6">
                    اسم المستخدم
                  </label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-focus-within:text-red-600 z-10" />
                    <Input
                      type="text"
                      placeholder=""
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      dir="ltr"
                      required
                      variant={error ? 'error' : 'default'}
                      className="pr-12 pt-6 pb-2 h-14 text-base bg-gray-50 border-2 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="absolute right-4 top-3 text-gray-400 text-sm font-medium transition-all duration-300 pointer-events-none group-focus-within:text-red-600 group-focus-within:scale-90 group-focus-within:-translate-y-6">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors duration-300 group-focus-within:text-red-600 z-10" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder=""
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      dir="ltr"
                      required
                      variant={error ? 'error' : 'default'}
                      className="pr-12 pl-12 pt-6 pb-2 h-14 text-base bg-gray-50 border-2 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors z-10"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                    <p className="text-red-700 font-medium text-sm flex items-center gap-2">
                      <span className="text-red-600">⚠️</span>
                      {error}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full h-14 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                >
                  {!loading && '🚀 '}
                  دخول كفريق عمل
                </Button>

                <div className="pt-6 border-t border-gray-200 mt-6">
                  <p className="text-xs text-gray-500 text-center mb-3 font-bold">🔑 حسابات تجريبية</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600 font-medium">Admin:</span>
                      <span className="text-gray-800 font-mono">admin / 123</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600 font-medium">Teacher:</span>
                      <span className="text-gray-800 font-mono">omar.samy / 123</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-gray-600 font-medium">Sales:</span>
                      <span className="text-gray-800 font-mono">sales / 123</span>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
