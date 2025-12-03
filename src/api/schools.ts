import api from '@/lib/api';

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateSchoolData extends CreateSchoolData {
  id: string;
}

// Backend response wrapper
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const schoolsApi = {
  // Get all schools - FIXED: /school-administrator endpoint
  getAll: async () => {
    const response = await api.get<ApiResponse<School[]>>('/school-administrator');
    return response.data.data; // Extract data from wrapper
  },

  // Get single school
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<School>>(`/school-administrator/${id}`);
    return response.data.data; // Extract data from wrapper
  },

  // Create school - Super Admin creates school via /super-administrator/school-administrator
  create: async (data: CreateSchoolData) => {
    const response = await api.post<ApiResponse<School>>('/super-administrator/school-administrator', data);
    return response.data.data; // Extract data from wrapper
  },

  // Update school - FIXED: Send id in body, not URL
  update: async (id: string, data: Partial<CreateSchoolData>) => {
    const updateData: UpdateSchoolData = {
      id,
      name: data.name || '',
      ...data,
    };
    const response = await api.patch<ApiResponse<School>>('/school-administrator', updateData);
    return response.data.data; // Extract data from wrapper
  },

  // Delete school
  delete: async (id: string) => {
    await api.delete(`/school-administrator/${id}`);
  },
};
