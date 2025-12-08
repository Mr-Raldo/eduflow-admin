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
  // Get all administrators - uses admin users endpoint
  getAll: async () => {
    // Backend: GET /api/admin/users?role=admin
    const response = await api.get<{ success: boolean; count: number; users: Administrator[] }>('/admin/users?role=admin');
    return response.data.users || [];
  },

  // Get single administrator
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; user: Administrator }>(`/admin/users/${id}`);
    return response.data.user;
  },

  // Create administrator account
  create: async (data: CreateAdministratorData) => {
    // Backend: POST /api/admin/users with role=admin
    const response = await api.post<{ success: boolean; user: Administrator }>('/admin/users', {
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: 'admin'
    });

    console.log('Create admin response:', response.data);

    // Backend returns { success: true, user: {...} }
    const admin = response.data.user;

    if (!admin?.id) {
      console.error('Admin ID is missing! Response:', response.data);
      throw new Error('Failed to get administrator ID from server response');
    }

    return admin;
  },

  // Update administrator
  update: async (id: string, data: Partial<Omit<CreateAdministratorData, 'password'>>) => {
    const response = await api.put<ApiResponse<Administrator>>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  // Delete administrator
  delete: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },
};
