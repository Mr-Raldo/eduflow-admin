import api from '@/lib/api';

// Backend response wrapper
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ===== DEPARTMENTS =====

export interface Department {
  id: string;
  name: string;
  description?: string;
  hod_id?: string;
  hod?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  hod_id?: string;
}

export interface UpdateDepartmentData extends CreateDepartmentData {
  id: string;
}

// ===== SUBJECTS =====

export interface Subject {
  id: string;
  name: string;
  code: string;
  department_id?: string;
  description?: string;
  department?: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubjectData {
  name: string;
  code: string;
  department_id?: string;
  description?: string;
}

export interface UpdateSubjectData extends CreateSubjectData {
  id: string;
}

// ===== ACADEMIC LEVELS =====

export interface AcademicLevel {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAcademicLevelData {
  name: string;
  description?: string;
  display_order?: number;
}

export interface SubjectAcademicLevel {
  id: string;
  subject_id: string;
  academic_level_id: string;
  is_required: boolean;
  subject?: Subject;
}

// ===== CLASSES =====

export interface Class {
  id: string;
  name: string;
  level: string;
  class_teacher_id?: string;
  capacity: number;
  academic_level_id?: string;
  academic_level?: AcademicLevel;
  created_at: string;
  updated_at: string;
}

export interface CreateClassData {
  name: string;
  level?: string;
  class_teacher_id?: string;
  capacity?: number;
  academic_level_id: string;
}

export interface UpdateClassData extends CreateClassData {
  id: string;
}

// ===== PARENTS/GUARDIANS =====

export interface Parent {
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  phone?: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CreateParentData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  school_id: string;  // Required for multi-tenant isolation
}

// School Administrator API - manages school-specific resources
export const schoolAdminApi = {
  // ===== DEPARTMENTS =====

  getDepartments: async (schoolId: string) => {
    // Backend: GET /api/admin/departments
    const response = await api.get<{ success: boolean; count: number; departments: Department[] }>('/admin/departments');
    return response.data.departments || [];
  },

  getDepartmentById: async (id: string) => {
    // Backend doesn't have this endpoint - would need to filter from getAll
    const departments = await schoolAdminApi.getDepartments('');
    return departments.find(d => d.id === id);
  },

  createDepartment: async (data: CreateDepartmentData) => {
    console.log('🌐 [API] createDepartment called');
    console.log('🌐 [API] Request endpoint: POST /admin/departments');
    console.log('🌐 [API] Request payload:', JSON.stringify(data, null, 2));

    try {
      // Backend: POST /api/admin/departments
      const response = await api.post<{ success: boolean; message: string; department: Department }>('/admin/departments', {
        name: data.name,
        description: data.description,
        hod_id: data.head_of_department
      });
      console.log('🌐 [API] Response status:', response.status);
      console.log('🌐 [API] Response data:', response.data);
      return response.data.department;
    } catch (error: any) {
      console.error('🌐 [API] Request failed');
      console.error('🌐 [API] Error status:', error.response?.status);
      console.error('🌐 [API] Error data:', error.response?.data);
      console.error('🌐 [API] Error message:', error.message);
      throw error;
    }
  },

  updateDepartment: async (id: string, data: Partial<CreateDepartmentData>) => {
    // Backend: PUT /api/admin/departments/:id
    const response = await api.put<{ success: boolean; message: string; department: Department }>(`/admin/departments/${id}`, {
      name: data.name,
      description: data.description,
      hod_id: data.head_of_department
    });
    return response.data.department;
  },

  deleteDepartment: async (id: string) => {
    // Backend: DELETE /api/admin/departments/:id
    await api.delete(`/admin/departments/${id}`);
  },

  // ===== SUBJECTS =====

  getSubjects: async (schoolId: string) => {
    // Backend: GET /api/admin/subjects
    const response = await api.get<{ success: boolean; count: number; subjects: Subject[] }>('/admin/subjects');
    return response.data.subjects || [];
  },

  getSubjectById: async (id: string) => {
    // Get all subjects and filter by id
    const subjects = await schoolAdminApi.getSubjects('');
    return subjects.find(s => s.id === id);
  },

  createSubject: async (data: CreateSubjectData) => {
    // Backend: POST /api/admin/subjects
    const response = await api.post<{ success: boolean; message: string; subject: Subject }>('/admin/subjects', data);
    return response.data.subject;
  },

  updateSubject: async (id: string, data: Partial<CreateSubjectData>) => {
    // Backend: PUT /api/admin/subjects/:id
    const response = await api.put<{ success: boolean; message: string; subject: Subject }>(`/admin/subjects/${id}`, data);
    return response.data.subject;
  },

  deleteSubject: async (id: string) => {
    // Backend: DELETE /api/admin/subjects/:id
    await api.delete(`/admin/subjects/${id}`);
  },

  // ===== CLASSES =====

  // Get all classes for a school (filtered by school context)
  getClasses: async () => {
    // Backend: GET /api/admin/classes
    const response = await api.get<{ success: boolean; count: number; classes: Class[] }>('/admin/classes');
    return response.data.classes || [];
  },

  getClassById: async (id: string) => {
    // Backend doesn't have this endpoint - filter from getAll
    const classes = await schoolAdminApi.getClasses();
    return classes.find(c => c.id === id);
  },

  getClassSubjects: async (classId: string) => {
    // Backend: GET /api/admin/classes/:classId/subjects
    const response = await api.get<{ success: boolean; count: number; subjects: any[] }>(`/admin/classes/${classId}/subjects`);
    return response.data.subjects || [];
  },

  assignTeacherToSubject: async (data: { teacher_id: string; subject_id: string; class_id: string }) => {
    // Backend: POST /api/admin/assign-teacher-subject
    const response = await api.post<{ success: boolean; message: string; assignment: any }>('/admin/assign-teacher-subject', data);
    return response.data.assignment;
  },

  removeTeacherAssignment: async (assignmentId: string) => {
    // Backend: DELETE /api/admin/class-subjects/:id
    await api.delete(`/admin/class-subjects/${assignmentId}`);
  },

  createClass: async (data: CreateClassData) => {
    // Backend: POST /api/admin/classes
    const response = await api.post<{ success: boolean; message: string; class: Class }>('/admin/classes', {
      name: data.name,
      level: data.level || '',
      class_teacher_id: data.class_teacher_id,
      capacity: data.capacity || 40,
      academic_level_id: data.academic_level_id
    });
    return response.data.class;
  },

  updateClass: async (id: string, data: Partial<CreateClassData>) => {
    // Backend: PUT /api/admin/classes/:id
    const response = await api.put<{ success: boolean; message: string; class: Class }>(`/admin/classes/${id}`, {
      name: data.name,
      level: data.level || '',
      class_teacher_id: data.class_teacher_id,
      capacity: data.capacity || 40,
      academic_level_id: data.academic_level_id
    });
    return response.data.class;
  },

  deleteClass: async (id: string) => {
    // Backend: DELETE /api/admin/classes/:id
    await api.delete(`/admin/classes/${id}`);
  },

  // ===== PARENTS/GUARDIANS =====

  getParents: async () => {
    // Backend: GET /api/admin/users?role=parent
    const response = await api.get<{ success: boolean; count: number; users: Parent[] }>('/admin/users?role=parent');
    return response.data.users || [];
  },

  getParentById: async (id: string) => {
    const response = await api.get<ApiResponse<Parent>>(`/admin/users/${id}`);
    return response.data.data;
  },

  createParent: async (data: CreateParentData) => {
    // Backend: POST /api/auth/register with role=parent
    const response = await api.post<{ success: boolean; message: string; user: any; parent_id: string }>('/auth/register', {
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      role: 'parent'
    });
    return {
      ...response.data,
      id: response.data.parent_id  // Add the parent ID for easy access
    };
  },

  updateParent: async (id: string, data: Partial<Omit<CreateParentData, 'password'>>) => {
    const response = await api.put<ApiResponse<Parent>>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  deleteParent: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  linkParentToStudents: async (parentId: string, studentIds: string[]) => {
    // Backend: POST /api/admin/parents/link-students
    const response = await api.post('/admin/parents/link-students', {
      parent_id: parentId,
      student_ids: studentIds
    });
    return response.data;
  },

  // ===== TEACHERS =====

  getSchoolTeachers: async (schoolId: string) => {
    // Backend: GET /api/admin/teachers
    const response = await api.get<ApiResponse<any[]>>('/admin/teachers');
    return response.data.data || [];
  },

  createTeacher: async (data: { email: string; password: string; first_name: string; last_name: string; department_id?: string; subject_id?: string }) => {
    // Backend: POST /api/auth/register with role=teacher
    const response = await api.post<ApiResponse<any>>('/auth/register', {
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      department_id: data.department_id,
      subject_id: data.subject_id,
      role: 'teacher'
    });
    return response.data.user;
  },

  updateTeacher: async (id: string, data: Partial<{ first_name: string; last_name: string; email: string }>) => {
    const response = await api.put<ApiResponse<any>>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  deleteTeacher: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  // ===== STUDENTS =====

  getSchoolStudents: async (schoolId: string) => {
    // Backend: GET /api/admin/students
    const response = await api.get<{ success: boolean; count: number; students: any[] }>('/admin/students');
    return response.data.students || [];
  },

  createStudent: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    school_id: string;
    class_id?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
  }) => {
    // Backend: POST /api/auth/register with role=student
    const response = await api.post<{ success: boolean; message: string; user: any }>('/auth/register', {
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      role: 'student',
      class_id: data.class_id,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      address: data.address
    });
    return response.data.user;
  },

  updateStudent: async (id: string, data: Partial<{ first_name: string; last_name: string; email: string }>) => {
    const response = await api.put<ApiResponse<any>>(`/admin/users/${id}`, data);
    return response.data.data;
  },

  deleteStudent: async (id: string) => {
    await api.delete(`/admin/users/${id}`);
  },

  // ===== ACADEMIC LEVELS =====

  getAcademicLevels: async () => {
    const response = await api.get<{ success: boolean; count: number; academicLevels: AcademicLevel[] }>('/admin/academic-levels');
    return response.data.academicLevels || [];
  },

  createAcademicLevel: async (data: CreateAcademicLevelData) => {
    const response = await api.post<{ success: boolean; message: string; academicLevel: AcademicLevel }>('/admin/academic-levels', data);
    return response.data.academicLevel;
  },

  updateAcademicLevel: async (id: string, data: Partial<CreateAcademicLevelData>) => {
    const response = await api.put<{ success: boolean; message: string; academicLevel: AcademicLevel }>(`/admin/academic-levels/${id}`, data);
    return response.data.academicLevel;
  },

  deleteAcademicLevel: async (id: string) => {
    await api.delete(`/admin/academic-levels/${id}`);
  },

  getAcademicLevelSubjects: async (academicLevelId: string) => {
    const response = await api.get<{ success: boolean; count: number; subjects: SubjectAcademicLevel[] }>(`/admin/academic-levels/${academicLevelId}/subjects`);
    return response.data.subjects || [];
  },

  assignSubjectToAcademicLevel: async (data: { academic_level_id: string; subject_id: string; is_required?: boolean }) => {
    const response = await api.post('/admin/academic-levels/assign-subject', data);
    return response.data;
  },

  removeSubjectFromAcademicLevel: async (id: string) => {
    await api.delete(`/admin/academic-levels/subjects/${id}`);
  },
};
