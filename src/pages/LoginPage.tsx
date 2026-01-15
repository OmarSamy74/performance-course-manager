import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, User, Lock, GraduationCap, Users, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
  const [hasNavigated, setHasNavigated] = useState(false);
  const loginAttemptRef = React.useRef(false);

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
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous login attempts
    if (loginAttemptRef.current || loading) {
      return;
    }
    
    setError('');
    setLoading(true);
    setHasNavigated(false);
    loginAttemptRef.current = true;

    try {
      const result = await actions.login(username, password);
      
      // If we already navigated, don't navigate again
      if (hasNavigated) {
        return;
      }
      
      // Try to get user from result or state
      let loggedInUser = result || state.user;
      
      // If we have a user, navigate immediately
      if (loggedInUser?.role) {
        setHasNavigated(true);
        setLoading(false);
        loginAttemptRef.current = false;
        
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
        // Wait a bit for state to update, then check again
        await new Promise(resolve => setTimeout(resolve, 300));
        loggedInUser = state.user;
        
        if (loggedInUser?.role && !hasNavigated) {
          setHasNavigated(true);
          setLoading(false);
          loginAttemptRef.current = false;
          
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
          setLoading(false);
          loginAttemptRef.current = false;
          setError('فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'بيانات خاطئة. Admin: admin/123 | Teacher: omar.samy/123 | Sales: sales/123');
      setLoading(false);
      loginAttemptRef.current = false;
      setHasNavigated(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center p-4" style={{ fontFamily: "'Cairo', 'Poppins', sans-serif" }}>
      <div className="login-container-neumorphic">
        {/* Profile Image */}
        <div className="profile-img-neumorphic">
          <GraduationCap size={40} className="text-red-600" />
        </div>

        <h2 className="text-[#333] text-xl font-bold mb-1">⚽ أكاديمية كرة القدم</h2>
        <p className="text-[#666] text-sm mb-6">نظام إدارة التدريب والأداء</p>

        {/* Login Type Selector */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginType('student');
              setError('');
              setPhone('');
            }}
            className={`flex-1 py-2.5 px-4 rounded-2xl font-semibold text-sm transition-all ${
              loginType === 'student'
                ? 'bg-[#40a9c3] text-white shadow-[5px_5px_15px_#a3b1c6,-5px_-5px_15px_#ffffff]'
                : 'bg-[#e0e5ec] text-[#666] shadow-[inset_6px_6px_10px_#a3b1c6,inset_-6px_-6px_10px_#ffffff] hover:shadow-[5px_5px_15px_#a3b1c6,-5px_-5px_15px_#ffffff]'
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
            className={`flex-1 py-2.5 px-4 rounded-2xl font-semibold text-sm transition-all ${
              loginType === 'staff'
                ? 'bg-[#40a9c3] text-white shadow-[5px_5px_15px_#a3b1c6,-5px_-5px_15px_#ffffff]'
                : 'bg-[#e0e5ec] text-[#666] shadow-[inset_6px_6px_10px_#a3b1c6,inset_-6px_-6px_10px_#ffffff] hover:shadow-[5px_5px_15px_#a3b1c6,-5px_-5px_15px_#ffffff]'
            }`}
          >
            🎓 فريق العمل
          </button>
        </div>

        {/* Student Login Form */}
        {loginType === 'student' && (
          <form onSubmit={handleStudentLogin} className="space-y-5">
            <div className="input-field-neumorphic">
              <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#666] z-10" size={20} />
              <Input
                type="tel"
                placeholder="رقم الهاتف"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                dir="ltr"
                required
                className="pr-12 pl-4 h-12 bg-[#e0e5ec] border-0 shadow-[inset_6px_6px_10px_#a3b1c6,inset_-6px_-6px_10px_#ffffff] rounded-2xl text-[#333] placeholder:text-[#999] focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border-0 rounded-2xl bg-[#40a9c3] text-white text-base font-semibold cursor-pointer shadow-[5px_5px_15px_#a3b1c6,-5px_-5px_15px_#ffffff] transition-all hover:bg-[#3a97af] hover:shadow-[3px_3px_10px_#a3b1c6,-3px_-3px_10px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الدخول...' : '🚀 دخول كطالب'}
            </button>
          </form>
        )}

        {/* Staff Login Form */}
        {loginType === 'staff' && (
          <form onSubmit={handleStaffLogin} className="space-y-5">
            <div className="input-field-neumorphic">
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#666] z-10" size={20} />
              <Input
                type="text"
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                dir="ltr"
                required
                className="pr-12 pl-4 h-12 bg-[#e0e5ec] border-0 shadow-[inset_6px_6px_10px_#a3b1c6,inset_-6px_-6px_10px_#ffffff] rounded-2xl text-[#333] placeholder:text-[#999] focus:outline-none"
              />
            </div>

            <div className="input-field-neumorphic">
              <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#666] z-10" size={20} />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                dir="ltr"
                required
                className="pr-12 pl-12 h-12 bg-[#e0e5ec] border-0 shadow-[inset_6px_6px_10px_#a3b1c6,inset_-6px_-6px_10px_#ffffff] rounded-2xl text-[#333] placeholder:text-[#999] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#666] hover:text-[#40a9c3] transition-colors z-10"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border-0 rounded-2xl bg-[#40a9c3] text-white text-base font-semibold cursor-pointer shadow-[5px_5px_15px_#a3b1c6,-5px_-5px_15px_#ffffff] transition-all hover:bg-[#3a97af] hover:shadow-[3px_3px_10px_#a3b1c6,-3px_-3px_10px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الدخول...' : '🚀 دخول كفريق عمل'}
            </button>

            <div className="options-neumorphic mt-4 text-sm text-[#555]">
              <p className="mb-2 font-semibold">🔑 حسابات تجريبية:</p>
              <div className="space-y-1 text-xs">
                <p>Admin: <span className="font-mono text-[#333]">admin / 123</span></p>
                <p>Teacher: <span className="font-mono text-[#333]">omar.samy / 123</span></p>
                <p>Sales: <span className="font-mono text-[#333]">sales / 123</span></p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
