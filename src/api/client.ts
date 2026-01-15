const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:8888/.netlify/functions' 
  : '/.netlify/functions';

let authToken: string | null = localStorage.getItem('auth_token') || null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const data = await request<{ user: any; token: string; expiresAt: string }>('/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setAuthToken(data.token);
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
