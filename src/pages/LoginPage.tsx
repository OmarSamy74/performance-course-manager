import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Lock, GraduationCap, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FormField } from '../components/ui/FormField';

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

    try {
      await actions.login(username, password);
      setTimeout(() => {
        const currentUser = state.user;
        if (currentUser?.role === UserRole.ADMIN) {
          navigate('/admin', { replace: true });
        } else if (currentUser?.role === UserRole.TEACHER) {
          navigate('/teacher', { replace: true });
        } else if (currentUser?.role === UserRole.SALES) {
          navigate('/sales', { replace: true });
        } else if (currentUser?.role === UserRole.STUDENT) {
          navigate('/student', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 200);
    } catch (err: any) {
      setError(err.message || 'بيانات خاطئة. Admin: admin/123 | Teacher: omar.samy/123 | Sales: sales/123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-center text-white">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <GraduationCap size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-black mb-2">⚽ أكاديمية كرة القدم</h1>
                <p className="text-red-100 font-semibold">نظام إدارة التدريب والأداء</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Login Type Selector */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setLoginType('student');
                  setError('');
                  setPhone('');
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  loginType === 'student'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <User size={18} />
                طالب
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType('staff');
                  setError('');
                  setUsername('');
                  setPassword('');
                }}
                className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                  loginType === 'staff'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Users size={18} />
                فريق العمل
              </button>
            </div>

            {/* Student Login Form */}
            {loginType === 'student' && (
              <form onSubmit={handleStudentLogin} className="space-y-5">
                <FormField label="رقم الهاتف" required icon={Phone} error={error}>
                  <Input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    dir="ltr"
                    required
                    variant={error ? 'error' : 'default'}
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full"
                >
                  دخول كطالب
                </Button>
              </form>
            )}

            {/* Staff Login Form */}
            {loginType === 'staff' && (
              <form onSubmit={handleStaffLogin} className="space-y-5">
                <FormField label="اسم المستخدم" required icon={User} error={error}>
                  <Input
                    type="text"
                    placeholder="admin, teacher, sales..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    dir="ltr"
                    required
                    variant={error ? 'error' : 'default'}
                  />
                </FormField>

                <FormField label="كلمة المرور" required icon={Lock}>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    dir="ltr"
                    required
                    variant={error ? 'error' : 'default'}
                  />
                </FormField>

                {error && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-red-700 font-medium text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  className="w-full"
                >
                  دخول كفريق عمل
                </Button>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center mb-2 font-semibold">🔑 حسابات تجريبية:</p>
                  <div className="text-xs text-gray-400 text-center space-y-1">
                    <p>Admin: admin / 123</p>
                    <p>Teacher: omar.samy / 123</p>
                    <p>Sales: sales / 123</p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
