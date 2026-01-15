import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Phone, UserCircle, Lock, Shield, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Student } from '../../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { actions, state } = useApp();
  const [loginType, setLoginType] = useState<'student' | 'staff'>('student');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await actions.login(phone, phone);
      navigate('/student');
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

    try {
      await actions.login(username, password);
      // Navigate based on role
      if (state.user?.role === 'ADMIN') {
        navigate('/admin');
      } else if (state.user?.role === 'TEACHER') {
        navigate('/teacher');
      } else if (state.user?.role === 'SALES') {
        navigate('/sales');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'بيانات خاطئة. Admin: admin/123 | Teacher: teacher/123 | Sales: sales/123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-4 relative overflow-hidden">
      {/* Soccer Field Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-0 w-24 h-32 border-4 border-white transform -translate-y-1/2 border-r-0 rounded-r-full"></div>
        <div className="absolute top-1/2 right-0 w-24 h-32 border-4 border-white transform -translate-y-1/2 border-l-0 rounded-l-full"></div>
      </div>

      {/* Soccer Ball Decoration */}
      <div className="absolute top-10 right-10 w-20 h-20 opacity-20 animate-bounce">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="white"/>
          <path d="M50 5 L50 95 M5 50 L95 50 M25 25 L75 75 M75 25 L25 75" stroke="#1a472a" strokeWidth="3"/>
          <circle cx="50" cy="50" r="8" fill="#1a472a"/>
        </svg>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-300 relative z-10 border-4 border-green-400">
        {/* Soccer Theme Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-white">
              <circle cx="12" cy="12" r="10" fill="white" opacity="0.3"/>
              <path d="M12 2 L12 22 M2 12 L22 12 M6 6 L18 18 M18 6 L6 18" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="2" fill="white"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚽ أكاديمية كرة القدم</h1>
          <p className="text-gray-600 font-semibold">نظام إدارة التدريب والأداء</p>
        </div>

        {/* Login Type Selector */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setLoginType('student');
              setError('');
              setPhone('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              loginType === 'student'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            👤 طالب
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('staff');
              setError('');
              setUsername('');
              setPassword('');
            }}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
              loginType === 'staff'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎓 فريق العمل
          </button>
        </div>

        {/* Student Login Form */}
        {loginType === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-green-600" />
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                dir="ltr"
                required
              />
              <p className="text-xs text-gray-500 mt-1">استخدم رقم هاتفك المسجل</p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Target size={20} />}
              {loading ? 'جاري الدخول...' : 'دخول كطالب'}
            </button>
          </form>
        )}

        {/* Staff Login Form */}
        {loginType === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <UserCircle size={16} className="text-green-600" />
                اسم المستخدم
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin, teacher, sales..."
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-green-600" />
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none"
                dir="ltr"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} />}
              {loading ? 'جاري الدخول...' : 'دخول كفريق عمل'}
            </button>

            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              <p className="mb-1">🔑 حسابات تجريبية:</p>
              <p>Admin: admin / 123</p>
              <p>Teacher: omar.samy / 123</p>
              <p>Sales: sales / 123</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
