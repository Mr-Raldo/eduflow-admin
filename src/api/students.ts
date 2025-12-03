import api from '@/lib/api';

export interface Student {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentData {
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

export const studentsApi = {
  // FIXED: /student not /students
  getAll: async () => {
    const response = await api.get<ApiResponse<Student[]>>('/student');
    return response.data.data; // Extract data from wrapper
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Student>>(`/student/${id}`);
    return response.data.data; // Extract data from wrapper
  },

  create: async (data: CreateStudentData) => {
    const response = await api.post('/auth/create-account', data, {
      params: { account_type: 'student' },
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<CreateStudentData, 'password'>>) => {
    const response = await api.patch<ApiResponse<Student>>('/student', {
      id,
      ...data,
    });
    return response.data.data; // Extract data from wrapper
  },

  delete: async (id: string) => {
    await api.delete(`/student/${id}`);
  },
};
