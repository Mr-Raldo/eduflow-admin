import api from '@/lib/api';

export interface School {
  id: string;
  school_name: string;
  school_logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  current_term?: string;
  term_start_date?: string;
  term_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolData {
  school_name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  current_term?: string;
  term_start_date?: string;
  term_end_date?: string;
}

export interface UpdateSchoolData extends CreateSchoolData {
  id: string;
}

// Backend response wrapper
interface ApiResponse {
  success: boolean;
  message?: string;
  school: School;
}

export const schoolsApi = {
  // Get school info - Backend only stores ONE school's information
  getAll: async (): Promise<School[]> => {
    // Backend: GET /api/admin/school (returns single school info)
    const response = await api.get<ApiResponse>('/admin/school');
    // Convert to array for compatibility with table display
    return response.data.school ? [response.data.school] : [];
  },

  // Get single school
  getById: async (id: string): Promise<School> => {
    // Backend: GET /api/admin/school (doesn't support ID lookup)
    const response = await api.get<ApiResponse>('/admin/school');
    return response.data.school;
  },

  // Create school - Backend doesn't support creating new schools
  // Instead, it updates the existing school_info record
  create: async (data: CreateSchoolData): Promise<School> => {
    // Backend only has one school_info record, so "create" is actually an update
    const response = await api.put<ApiResponse>('/admin/school', data);
    return response.data.school;
  },

  // Update school
  update: async (id: string, data: Partial<CreateSchoolData>): Promise<School> => {
    // Backend: PUT /api/admin/school
    const response = await api.put<ApiResponse>('/admin/school', data);
    return response.data.school;
  },

  // Delete school - Not available in backend (school info is required)
  delete: async (id: string): Promise<void> => {
    throw new Error('Deleting school information is not supported');
  },
};
