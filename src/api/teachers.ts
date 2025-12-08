import api from '@/lib/api';

export interface Teacher {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTeacherData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

// Backend response wrapper
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const teachersApi = {
  // Teacher endpoints - aligned with backend
  getAll: async () => {
    // Backend doesn't have list endpoint - use admin endpoint
    const response = await api.get<ApiResponse<Teacher[]>>('/admin/users?role=teacher');
    return response.data.data || [];
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Teacher>>(`/admin/users/${id}`);
    return response.data.data;
  },

  create: async (data: CreateTeacherData) => {
    // Uses admin register endpoint with role=teacher
    const response = await api.post('/auth/register', {
      ...data,
      role: 'teacher'
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<CreateTeacherData, 'password'>>) => {
    const response = await api.put<ApiResponse<Teacher>>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },
};
