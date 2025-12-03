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
  // FIXED: /teacher not /teachers
  getAll: async () => {
    const response = await api.get<ApiResponse<Teacher[]>>('/teacher');
    return response.data.data; // Extract data from wrapper
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Teacher>>(`/teacher/${id}`);
    return response.data.data; // Extract data from wrapper
  },

  create: async (data: CreateTeacherData) => {
    const response = await api.post('/auth/create-account', data, {
      params: { account_type: 'teacher' },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<CreateTeacherData, 'password'>>) => {
    const response = await api.patch<ApiResponse<Teacher>>('/teacher', {
      id,
      ...data,
    });
    return response.data.data; // Extract data from wrapper
  },

  delete: async (id: string) => {
    await api.delete(`/teacher/${id}`);
  },
};
