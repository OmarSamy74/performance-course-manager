// Smart API base URL detection
const getApiBase = () => {
  // Development: always use local server
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  
  // Production: check for explicit API URL first
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim();
    
    // Remove trailing slashes
    url = url.replace(/\/+$/, '');
    
    // Add protocol if missing (assume https for production)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    // Ensure it ends with /api (but not /api/)
    if (url.endsWith('/api/')) {
      url = url.slice(0, -1); // Remove trailing slash
    } else if (!url.endsWith('/api')) {
      url = `${url}/api`;
    }
    
    return url;
  }
  
  // Check if we're on Netlify (has .netlify in hostname)
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify')) {
    return '/.netlify/functions';
  }
  
  // Default: assume same origin (Railway serves both frontend and API)
  return '/api';
};

const API_BASE = getApiBase();

// Auth token stored in memory only (no localStorage)
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  // Token stored in memory only - cleared on page refresh
  // User will need to login again after page refresh
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // For Netlify functions, endpoints map directly to function names
  // e.g., /auth -> /.netlify/functions/auth
  const isNetlify = API_BASE === '/.netlify/functions';
  let finalEndpoint = endpoint;
  
  if (isNetlify) {
    // Remove leading slash and any /api prefix
    finalEndpoint = endpoint.replace(/^\/api\//, '').replace(/^\//, '');
  } else {
    // Ensure endpoint starts with / (for non-Netlify)
    if (!finalEndpoint.startsWith('/')) {
      finalEndpoint = `/${finalEndpoint}`;
    }
  }
  
  // Remove any double slashes (except after http:// or https://)
  const url = `${API_BASE}${finalEndpoint}`.replace(/([^:]\/)\/+/g, '$1');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Always get the latest token (ensures it's fresh from localStorage)
  const currentToken = getAuthToken();
  
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
    // Debug logging (remove in production if needed)
    if (import.meta.env.DEV) {
      console.log('🔑 Sending token in request:', currentToken.substring(0, 20) + '...');
    }
  } else {
    // Debug logging
    if (import.meta.env.DEV) {
      console.warn('⚠️ No auth token available for request');
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle 404 specifically
      if (response.status === 404) {
        console.error(`404 Error: ${url} not found. Check API_BASE: ${API_BASE}`);
        throw new Error(`API endpoint not found: ${url}. Please check your VITE_API_URL environment variable.`);
      }
      
      const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    // Enhanced error logging
    if (error.message && !error.message.includes('API endpoint')) {
      console.error(`API Request failed: ${url}`, error);
    }
    throw error;
  }
}

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const data = await request<{ user: any; token: string; expiresAt: string }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    // Set token immediately after successful login
    if (data.token) {
      setAuthToken(data.token);
      console.log('✅ Auth token set after login');
    } else {
      console.error('❌ No token received from login response');
    }
    
    return data;
  },
  logout: async () => {
    await request('/auth', { method: 'DELETE' });
    setAuthToken(null);
  },
  getCurrentUser: async () => {
    return request<{ user: any }>('/auth');
  },
};

// Students API
export const studentsApi = {
  list: async () => {
    return request<{ students: any[] }>('/students');
  },
  get: async (id: string) => {
    return request<{ student: any }>(`/students/${id}`);
  },
  create: async (student: any) => {
    return request<{ student: any }>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
  },
  update: async (id: string, updates: any) => {
    return request<{ student: any }>('/students', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  },
  delete: async (id: string) => {
    return request<{ message: string }>(`/students/${id}`, {
      method: 'DELETE',
    });
  },
};

// Leads API
export const leadsApi = {
  list: async () => {
    return request<{ leads: any[] }>('/leads');
  },
  get: async (id: string) => {
    return request<{ lead: any }>(`/leads/${id}`);
  },
  create: async (lead: any) => {
    return request<{ lead: any }>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  },
  update: async (id: string, updates: any) => {
    return request<{ lead: any }>('/leads', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  },
  delete: async (id: string) => {
    return request<{ message: string }>(`/leads/${id}`, {
      method: 'DELETE',
    });
  },
};

// Materials API
export const materialsApi = {
  list: async () => {
    return request<{ materials: any[] }>('/materials');
  },
  get: async (id: string) => {
    return request<{ material: any }>(`/materials/${id}`);
  },
  create: async (material: any) => {
    return request<{ material: any }>('/materials', {
      method: 'POST',
      body: JSON.stringify(material),
    });
  },
  update: async (id: string, updates: any) => {
    return request<{ material: any }>('/materials', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  },
  delete: async (id: string) => {
    return request<{ message: string }>(`/materials/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    return request<{
      financial: any;
      crm: any;
    }>('/dashboard');
  },
};

// Lessons API
export const lessonsApi = {
  list: async () => {
    return request<{ lessons: any[] }>('/lessons');
  },
  get: async (id: string) => {
    return request<{ lesson: any }>(`/lessons/${id}`);
  },
  create: async (lesson: any) => {
    return request<{ lesson: any }>('/lessons', {
      method: 'POST',
      body: JSON.stringify(lesson),
    });
  },
  update: async (id: string, updates: any) => {
    return request<{ lesson: any }>('/lessons', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  },
  delete: async (id: string) => {
    return request<{ message: string }>(`/lessons/${id}`, {
      method: 'DELETE',
    });
  },
};

// Assignments API
export const assignmentsApi = {
  list: async () => {
    return request<{ assignments: any[] }>('/assignments');
  },
  get: async (id: string) => {
    return request<{ assignment: any }>(`/assignments/${id}`);
  },
  getSubmissions: async (assignmentId: string) => {
    return request<{ submissions: any[] }>(`/assignments/${assignmentId}/submissions`);
  },
  create: async (assignment: any) => {
    return request<{ assignment: any }>('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  },
  submit: async (assignmentId: string, fileUrl: string) => {
    return request<{ submission: any }>('/assignments/submit', {
      method: 'POST',
      body: JSON.stringify({ assignmentId, fileUrl }),
    });
  },
  grade: async (submissionId: string, score: number, feedback?: string) => {
    return request<{ submission: any }>('/assignments', {
      method: 'PUT',
      body: JSON.stringify({ submissionId, score, feedback }),
    });
  },
  update: async (id: string, updates: any) => {
    return request<{ assignment: any }>('/assignments', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  },
  delete: async (id: string) => {
    return request<{ message: string }>(`/assignments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Quizzes API
export const quizzesApi = {
  list: async () => {
    return request<{ quizzes: any[] }>('/quizzes');
  },
  get: async (id: string) => {
    return request<{ quiz: any }>(`/quizzes/${id}`);
  },
  getAttempts: async (quizId: string) => {
    return request<{ attempts: any[] }>(`/quizzes/${quizId}/attempts`);
  },
  create: async (quiz: any) => {
    return request<{ quiz: any }>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quiz),
    });
  },
  submit: async (quizId: string, answers: Record<string, string | string[]>, timeSpent?: number) => {
    return request<{ attempt: any }>('/quizzes/submit', {
      method: 'POST',
      body: JSON.stringify({ quizId, answers, timeSpent }),
    });
  },
  update: async (id: string, updates: any) => {
    return request<{ quiz: any }>('/quizzes', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  },
  delete: async (id: string) => {
    return request<{ message: string }>(`/quizzes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Progress API
export const progressApi = {
  get: async (lessonId?: string) => {
    if (lessonId) {
      return request<{ progress: any }>(`/progress/${lessonId}`);
    }
    return request<{ progress: any[] }>('/progress');
  },
  getSummary: async () => {
    return request<{
      totalLessons: number;
      completedLessons: number;
      completionPercentage: number;
      totalTimeSpent: number;
      lastActivityAt: string;
    }>('/progress/summary');
  },
  update: async (lessonId: string, data: { completed?: boolean; progress?: number; timeSpent?: number }) => {
    return request<{ progress: any }>('/progress', {
      method: 'POST',
      body: JSON.stringify({ lessonId, ...data }),
    });
  },
};

// Grades API
export const gradesApi = {
  list: async (studentId?: string) => {
    const url = studentId ? `/grades?studentId=${studentId}` : '/grades';
    return request<{ grades: any[] }>(url);
  },
  create: async (grade: any) => {
    return request<{ grade: any }>('/grades', {
      method: 'POST',
      body: JSON.stringify(grade),
    });
  },
  update: async (id: string, updates: any) => {
    return request<{ grade: any }>('/grades', {
      method: 'PUT',
      body: JSON.stringify({ id, ...updates }),
    });
  },
};

// Users API (Admin only)
export const usersApi = {
  list: async () => {
    return request<{ users: any[]; count: number; note: string }>('/users');
  },
  updatePasswords: async () => {
    return request<{ message: string; passwords: Record<string, string>; warning: string }>('/users/update-passwords', {
      method: 'POST',
    });
  },
};
