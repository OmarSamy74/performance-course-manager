import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { UserRole } from '../types';

// Pages
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { TeacherPage } from './pages/TeacherPage';
import { SalesPage } from './pages/SalesPage';
import { StudentPage } from './pages/StudentPage';
import { DashboardPage } from './pages/DashboardPage';

// Loading Component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
      </div>
      <p className="mt-4 text-white font-bold">⚽ جاري التحميل...</p>
    </div>
  </div>
);

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole={UserRole.ADMIN}>
                  <Navbar />
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute requiredRole={UserRole.TEACHER}>
                  <Navbar />
                  <TeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute requiredRole={UserRole.SALES}>
                  <Navbar />
                  <SalesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole={UserRole.STUDENT}>
                  <Navbar />
                  <StudentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
