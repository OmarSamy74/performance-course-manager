import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserRole } from '../../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, BarChart3, Users, Wallet, BookOpen, Briefcase } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();

  // Redirect based on user role
  React.useEffect(() => {
    if (state.loading) {
      return; // Wait for auth to load
    }

    if (!state.user) {
      navigate('/login', { replace: true });
      return;
    }

    // Navigate based on role
    const roleRoutes: Record<string, string> = {
      [UserRole.ADMIN]: '/admin',
      [UserRole.TEACHER]: '/teacher',
      [UserRole.SALES]: '/sales',
      [UserRole.STUDENT]: '/student',
    };

    const targetRoute = roleRoutes[state.user.role];
    if (targetRoute) {
      navigate(targetRoute, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [state.user, state.loading, navigate]);

  if (state.loading || !state.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-100 to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التوجيه...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="أكاديمية كرة القدم" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-3xl font-black text-red-700">⚽ أكاديمية كرة القدم</h1>
                <p className="text-gray-600 font-semibold">مرحباً، {state.user.username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Card Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admin Dashboard */}
          {state.user.role === UserRole.ADMIN && (
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-red-200">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-100 rounded-full">
                    <Wallet className="h-12 w-12 text-red-700" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-red-700">لوحة التحكم</CardTitle>
                <CardDescription className="text-base mt-2">
                  إدارة الطلاب والمدفوعات
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/admin')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg"
                >
                  الذهاب إلى لوحة التحكم
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Teacher Dashboard */}
          {state.user.role === UserRole.TEACHER && (
            <>
              <Card className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-red-200">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-red-100 rounded-full">
                      <BookOpen className="h-12 w-12 text-red-700" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-red-700">الكلاس روم</CardTitle>
                  <CardDescription className="text-base mt-2">
                    إدارة المحاضرات والملفات التعليمية
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => navigate('/teacher')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg"
                  >
                    الذهاب إلى الكلاس روم
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-blue-200">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Users className="h-12 w-12 text-blue-700" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-blue-700">إدارة الطلاب</CardTitle>
                  <CardDescription className="text-base mt-2">
                    عرض وإدارة بيانات الطلاب
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => navigate('/admin')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg"
                  >
                    الذهاب إلى إدارة الطلاب
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Sales Dashboard */}
          {state.user.role === UserRole.SALES && (
            <Card className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-purple-200">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-purple-100 rounded-full">
                    <Briefcase className="h-12 w-12 text-purple-700" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-purple-700">نظام المبيعات</CardTitle>
                <CardDescription className="text-base mt-2">
                  إدارة العملاء المحتملين والتحويلات
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate('/sales')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg"
                >
                  الذهاب إلى نظام المبيعات
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Student Dashboard */}
          {state.user.role === UserRole.STUDENT && (
            <>
              <Card className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-green-200">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <Wallet className="h-12 w-12 text-green-700" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-green-700">المدفوعات</CardTitle>
                  <CardDescription className="text-base mt-2">
                    عرض حالة الأقساط والمدفوعات
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => navigate('/student')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                  >
                    عرض المدفوعات
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer border-2 border-blue-200">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <BookOpen className="h-12 w-12 text-blue-700" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-blue-700">الكلاس روم</CardTitle>
                  <CardDescription className="text-base mt-2">
                    الوصول إلى المحاضرات والمواد التعليمية
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => navigate('/student')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg"
                  >
                    الذهاب إلى الكلاس روم
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
