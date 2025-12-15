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

// Helper type for PostgREST joins (can be single object or array)
type PostgRESTJoin<T> = T | T[];

// Helper function to safely extract single object from PostgREST join
export function extractJoinData<T>(data: PostgRESTJoin<T> | undefined): T | undefined {
  if (!data) return undefined;
  return Array.isArray(data) ? data[0] : data;
}

export interface StudentClass {
  // From student_classes table
  id: string;
  student_id: string;
  class_id: string;
  teacher_id: string;
  status: string;
  created_at: string;
  updated_at?: string;

  // Nested class details (PostgREST may return as array)
  classes?: PostgRESTJoin<{
    id: string;
    code: string;
    academic_level: string;
    status: string;
    teacher_in_charge: string;
    subject_id: string;
    subjects?: PostgRESTJoin<{
      id: string;
      name: string;
      code: string;
      academic_level?: string;
    }>;
  }>;

  // Nested teacher details (PostgREST may return as array)
  teacher?: PostgRESTJoin<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  }>;

  // Nested student details (PostgREST may return as array)
  students?: PostgRESTJoin<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    code: string;
  }>;
}

export interface DashboardStats {
  total_classes: number;
  total_subjects: number;
  total_assignments: number;
  pending_assignments: number;
  completed_assignments: number;
  total_resources: number;
  total_syllabi: number;
}

export interface Assignment {
  id: string;
  subject_id: string;
  class_id: string;
  name: string;
  description: string;
  instructions?: string;
  publish_url: string;
  submission_url: string;
  date_assigned: string;
  due_date: string;
  percentage_of_coursework: number;
  status?: string;
  created_at: string;
  updated_at: string;

  // Nested class details (from class_id join - PostgREST may return as array)
  classes?: PostgRESTJoin<{
    id: string;
    code: string;
    academic_level: string;
    subjects?: PostgRESTJoin<{
      id: string;
      name: string;
      code: string;
      academic_level?: string;
    }>;
  }>;

  // Nested subject details (from subject_id join - PostgREST may return as array)
  subjects?: PostgRESTJoin<{
    id: string;
    name: string;
    code: string;
    academic_level?: string;
  }>;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  academic_level?: string;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  publish_url: string;
  size_mb: number;
  type: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Syllabus {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  file_url: string;
  file_size_mb: number;
  academic_year: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Backend response wrapper
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export const studentsApi = {
  // Student endpoints - aligned with backend /api/student routes
  getAll: async () => {
    // Note: This endpoint doesn't exist in backend - need admin endpoint
    const response = await api.get<ApiResponse<Student[]>>('/admin/users?role=student');
    return response.data.data || [];
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Student>>(`/admin/users/${id}`);
    return response.data.data;
  },

  create: async (data: CreateStudentData) => {
    // Uses admin register endpoint with role=student
    const response = await api.post('/auth/register', {
      ...data,
      role: 'student'
    });
    return response.data;
  },

  update: async (id: string, data: Partial<Omit<CreateStudentData, 'password'>>) => {
    const response = await api.put<ApiResponse<Student>>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  // Student-specific endpoints - these match backend studentController
  getMyClasses: async (studentId: string): Promise<StudentClass[]> => {
    console.log('[studentsApi] Fetching classes for student:', studentId);
    const response = await api.get('/student/subjects');
    console.log('[studentsApi] Classes response:', response.data);
    return response.data.subjects || [];
  },

  getMyAssignments: async (studentId: string): Promise<Assignment[]> => {
    console.log('[studentsApi] Fetching assignments for student:', studentId);
    const response = await api.get('/student/assignments');
    console.log('[studentsApi] Assignments response:', response.data);
    return response.data.assignments || [];
  },

  getMySubjects: async (studentId: string): Promise<Subject[]> => {
    console.log('[studentsApi] Fetching subjects for student:', studentId);
    const response = await api.get('/student/subjects');
    console.log('[studentsApi] Subjects response:', response.data);
    // Backend returns class_subjects with nested subject data
    const classSubjects = response.data.subjects || [];
    return classSubjects.map((cs: any) => ({
      id: cs.subject?.id || cs.id,
      name: cs.subject?.name,
      code: cs.subject?.code,
      description: cs.subject?.description,
      ...cs.subject
    }));
  },

  getResourcesForSubject: async (subjectId: string): Promise<Resource[]> => {
    console.log('[studentsApi] Fetching resources for subject:', subjectId);
    const response = await api.get(`/student/subjects/${subjectId}/materials`);
    console.log('[studentsApi] Resources response:', response.data);
    return response.data.materials || [];
  },

  getSyllabiForSubject: async (subjectId: string): Promise<Syllabus[]> => {
    console.log('[studentsApi] Fetching syllabi for subject:', subjectId);
    const response = await api.get(`/student/syllabi?subject_id=${subjectId}`);
    console.log('[studentsApi] Syllabi response:', response.data);
    return response.data.syllabi || [];
  },

  getDashboardStats: async (studentId: string): Promise<DashboardStats> => {
    const response = await api.get('/student/dashboard');
    return response.data.data || response.data;
  },

  getMyGrades: async (studentId: string): Promise<any[]> => {
    console.log('[studentsApi] Fetching grades for student:', studentId);
    const response = await api.get('/student/grades');
    console.log('[studentsApi] Grades response:', response.data);
    return response.data.grades || [];
  },

  submitAssignment: async (assignmentId: string, submissionData: { submission_text?: string; file_url: string }): Promise<any> => {
    console.log('[studentsApi] Submitting assignment:', assignmentId, submissionData);
    const response = await api.post(`/student/assignments/${assignmentId}/submit`, submissionData);
    console.log('[studentsApi] Submit response:', response.data);
    return response.data.submission || response.data;
  },
};
