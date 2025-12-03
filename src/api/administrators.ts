import api from '@/lib/api';

export interface Administrator {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAdministratorData {
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

export const administratorsApi = {
  // Get all administrators - FIXED: /super-administrator endpoint
  getAll: async () => {
    const response = await api.get<ApiResponse<Administrator[]>>('/super-administrator');
    return response.data.data; // Extract data from wrapper
  },

  // Get single administrator
  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Administrator>>(`/super-administrator/${id}`);
    return response.data.data; // Extract data from wrapper
  },

  // Create administrator account - Uses super-administrator endpoint
  create: async (data: CreateAdministratorData) => {
    const response = await api.post<ApiResponse<Administrator>>('/super-administrator', data);
    return response.data.data; // Extract data from wrapper
  },

  // Update administrator - FIXED: Send id in body
  update: async (id: string, data: Partial<Omit<CreateAdministratorData, 'password'>>) => {
    const response = await api.patch<ApiResponse<Administrator>>('/super-administrator', {
      id,
      ...data,
    });
    return response.data.data; // Extract data from wrapper
  },

  // Delete administrator
  delete: async (id: string) => {
    await api.delete(`/super-administrator/${id}`);
  },

  // Get administrator's schools
  getSchools: async (adminId: string) => {
    const response = await api.get<ApiResponse<any>>(`/administrator-schools`, {
      params: { administrator_id: adminId },
    });
    return response.data.data; // Extract data from wrapper
  },

  // Assign administrator to school
  assignToSchool: async (adminId: string, schoolId: string) => {
    const response = await api.post<ApiResponse<any>>('/administrator-schools', {
      administrator_id: adminId,
      school_id: schoolId,
    });
    return response.data.data; // Extract data from wrapper
  },
};
