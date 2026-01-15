import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Phone, User, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

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
    <div className="login-container-new">
      <div className="login-background-pattern"></div>
      <Card className="login-card-new">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="flex flex-col items-center">
            <div className="logo-wrapper-new">
              <img 
                src="/logo.png" 
                alt="أكاديمية كرة القدم" 
                className="logo-login-large animate-float-slow hover:scale-110 transition-all duration-500" 
                onError={(e) => {
                  // Hide logo if not found
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="text-center">
              <CardTitle className="text-5xl font-black text-red-700 animate-fade-in mb-2 tracking-tight">
                ⚽ أكاديمية كرة القدم
              </CardTitle>
              <p className="text-lg text-gray-600 mt-2 font-bold tracking-wide">
                نظام إدارة التدريب والأداء
              </p>
            </div>
          </div>
          <CardDescription className="text-gray-500 text-lg font-medium">
            تسجيل الدخول للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
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
                  ? 'bg-red-600 text-white shadow-md'
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
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              🎓 فريق العمل
            </button>
          </div>

          {/* Student Login Form */}
          {loginType === 'student' && (
            <form onSubmit={handleStudentLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base font-semibold text-gray-700">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pr-12 h-14 text-base border-2 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    disabled={loading}
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-7 text-xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-[1.02] rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    جاري الدخول...
                  </>
                ) : (
                  'دخول كطالب'
                )}
              </Button>
            </form>
          )}

          {/* Staff Login Form */}
          {loginType === 'staff' && (
            <form onSubmit={handleStaffLogin} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="username" className="text-base font-semibold text-gray-700">اسم المستخدم</Label>
                <div className="relative">
                  <User className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin, teacher, sales..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pr-12 h-14 text-base border-2 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    disabled={loading}
                    dir="ltr"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold text-gray-700">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12 h-14 text-base border-2 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    disabled={loading}
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-7 text-xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-[1.02] rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    جاري الدخول...
                  </>
                ) : (
                  'دخول كفريق عمل'
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center pt-2 border-t">
                <p className="mb-1">🔑 حسابات تجريبية:</p>
                <p>Admin: admin / 123</p>
                <p>Teacher: omar.samy / 123</p>
                <p>Sales: sales / 123</p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
