import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, Student, Lead, CourseMaterial, UserRole } from '../../types';
import { useAuth } from '../hooks/useAuth';
import { studentsApi, leadsApi, materialsApi, lessonsApi, assignmentsApi, quizzesApi } from '../api/client';

interface AppState {
  user: User | null;
  students: Student[];
  leads: Lead[];
  materials: CourseMaterial[];
  lessons: any[];
  assignments?: any[];
  quizzes?: any[];
  loading: boolean;
}

interface AppContextType {
  state: AppState;
  actions: {
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshData: () => Promise<void>;
    updateStudents: (students: Student[]) => void;
    updateLeads: (leads: Lead[]) => void;
    updateMaterials: (materials: CourseMaterial[]) => void;
    updateLessons: (lessons: any[]) => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, login: apiLogin, logout: apiLogout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false); // Start as false, will be set to true when needed

  // Ref to prevent multiple simultaneous refreshData calls
  const refreshInProgressRef = useRef(false);
  
  // Fetch data from API when user is logged in
  const refreshData = async () => {
    // Prevent multiple simultaneous calls
    if (refreshInProgressRef.current) {
      console.log('⚠️ refreshData already in progress, skipping...');
      return;
    }
    
    if (!user) {
      setDataLoading(false);
      return;
    }

    refreshInProgressRef.current = true;
    setDataLoading(true);
    try {
      // Fetch data based on user role
      // Students can access: students (own), materials, lessons
      // Admin/Teacher/Sales can access: students, leads, materials, lessons
      const promises: Promise<any>[] = [];
      
      // Students: always fetch (students can see their own data)
      promises.push(studentsApi.list().catch((err) => {
        console.warn('Failed to fetch students:', err);
        return { students: [] };
      }));
      
      // Leads: only for admin, teacher, sales
      if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER || user.role === UserRole.SALES) {
        promises.push(leadsApi.list().catch((err) => {
          console.warn('Failed to fetch leads:', err);
          return { leads: [] };
        }));
      } else {
        promises.push(Promise.resolve({ leads: [] }));
      }
      
      // Materials: all authenticated users can access
      promises.push(materialsApi.list().catch((err) => {
        console.warn('Failed to fetch materials:', err);
        return { materials: [] };
      }));
      
      // Lessons: all authenticated users can access
      promises.push(lessonsApi.list().catch((err) => {
        console.warn('Failed to fetch lessons:', err);
        return { lessons: [] };
      }));
      
      // Assignments: all authenticated users can access
      promises.push(assignmentsApi.list().catch((err) => {
        console.warn('Failed to fetch assignments:', err);
        return { assignments: [] };
      }));
      
      // Quizzes: all authenticated users can access
      promises.push(quizzesApi.list().catch((err) => {
        console.warn('Failed to fetch quizzes:', err);
        return { quizzes: [] };
      }));

      const [studentsRes, leadsRes, materialsRes, lessonsRes, assignmentsRes, quizzesRes] = await Promise.all(promises);

      setStudents(studentsRes.students || []);
      setLeads(leadsRes.leads || []);
      setMaterials(materialsRes.materials || []);
      setLessons(lessonsRes.lessons || []);
      setAssignments(assignmentsRes.assignments || []);
      setQuizzes(quizzesRes.quizzes || []);
    } catch (error) {
      console.error('Failed to load data from API:', error);
      setStudents([]);
      setLeads([]);
      setMaterials([]);
      setLessons([]);
      setAssignments([]);
      setQuizzes([]);
    } finally {
      setDataLoading(false);
      refreshInProgressRef.current = false;
    }
  };

  const userRef = React.useRef<string | null>(null);
  const refreshTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    // If auth is still loading, wait
    if (authLoading) {
      return;
    }
    
    // If no user, set loading to false and clear ref
    if (!user) {
      userRef.current = null;
      setDataLoading(false);
      return;
    }
    
    // Only refresh data if user ID actually changed
    if (user.id !== userRef.current) {
      userRef.current = user.id;
      // Add a small delay to debounce rapid user changes
      refreshTimeoutRef.current = setTimeout(() => {
        refreshData();
      }, 100);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user?.id, authLoading]); // Only depend on user.id to avoid unnecessary refreshes

  const loginInProgressRef = useRef(false);
  
  const login = async (username: string, password: string) => {
    // Prevent multiple simultaneous login calls
    if (loginInProgressRef.current) {
      throw new Error('Login already in progress');
    }
    
    loginInProgressRef.current = true;
    try {
      const result = await apiLogin(username, password);
      // Return the user from the login result for immediate navigation
      // Don't wait for state to update - use the result directly
      loginInProgressRef.current = false;
      return result?.user || user;
    } catch (error) {
      loginInProgressRef.current = false;
      throw error;
    }
  };

  const logout = async () => {
    await apiLogout();
    setStudents([]);
    setLeads([]);
    setMaterials([]);
    setLessons([]);
    setAssignments([]);
    setQuizzes([]);
  };

  const state: AppState = {
    user,
    students,
    leads,
    materials,
    lessons,
    assignments,
    quizzes,
    loading: authLoading || dataLoading,
  };

  const actions = {
    login,
    logout,
    refreshData,
    updateStudents: setStudents,
    updateLeads: setLeads,
    updateMaterials: setMaterials,
    updateLessons: setLessons,
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
