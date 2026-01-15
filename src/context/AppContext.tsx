import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Student, Lead, CourseMaterial } from '../../types';
import { useAuth } from '../hooks/useAuth';
import { studentsApi, leadsApi, materialsApi, lessonsApi } from '../api/client';

interface AppState {
  user: User | null;
  students: Student[];
  leads: Lead[];
  materials: CourseMaterial[];
  lessons: any[];
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
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch data from API when user is logged in
  const refreshData = async () => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    try {
      const [studentsRes, leadsRes, materialsRes, lessonsRes] = await Promise.all([
        studentsApi.list().catch(() => ({ students: [] })),
        leadsApi.list().catch(() => ({ leads: [] })),
        materialsApi.list().catch(() => ({ materials: [] })),
        lessonsApi.list().catch(() => ({ lessons: [] }))
      ]);

      setStudents(studentsRes.students || []);
      setLeads(leadsRes.leads || []);
      setMaterials(materialsRes.materials || []);
      setLessons(lessonsRes.lessons || []);
    } catch (error) {
      console.error('Failed to load data from API:', error);
      setStudents([]);
      setLeads([]);
      setMaterials([]);
      setLessons([]);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const login = async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    // The user state will be updated by the useAuth hook via useEffect
    // Return the user from the login result for immediate navigation
    return result?.user || user;
  };

  const logout = async () => {
    await apiLogout();
    setStudents([]);
    setLeads([]);
    setMaterials([]);
    setLessons([]);
  };

  const state: AppState = {
    user,
    students,
    leads,
    materials,
    lessons,
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
