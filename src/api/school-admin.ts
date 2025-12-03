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
  code: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  head_of_department?: string;
  academic_levels?: string[];
  school_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentData {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  head_of_department?: string;
  academic_levels?: string[];
  school_id: string;
}

export interface UpdateDepartmentData extends CreateDepartmentData {
  id: string;
}

// ===== SUBJECTS =====

export interface Subject {
  id: string;
  code: string;
  name: string;
  academic_level: string;
  department?: string;
  teacher_in_charge?: string;
  course_content?: string;
  school_id: string;
  department_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSubjectData {
  name: string;
  academic_level: string;
  department?: string;
  teacher_in_charge?: string;
  school_id: string;
  department_id: string;
}

export interface UpdateSubjectData extends CreateSubjectData {
  id: string;
}

// ===== CLASSES =====

export interface Class {
  id: string;
  teacher_in_charge: string;
  academic_level: string;
  subject_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClassData {
  teacher_in_charge: string;
  academic_level: string;
  subject_id: string;
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
}

// School Administrator API - manages school-specific resources
export const schoolAdminApi = {
  // ===== DEPARTMENTS =====

  getDepartments: async (schoolId: string) => {
    const response = await api.get<ApiResponse<Department[]>>(`/school-administrator/departments/${schoolId}`);
    return response.data.data;
  },

  getDepartmentById: async (id: string) => {
    const response = await api.get<ApiResponse<Department>>(`/departments/${id}`);
    return response.data.data;
  },

  createDepartment: async (data: CreateDepartmentData) => {
    const response = await api.post<ApiResponse<Department>>('/school-administrator/department', data);
    return response.data.data;
  },

  updateDepartment: async (id: string, data: Partial<CreateDepartmentData>) => {
    const updateData: UpdateDepartmentData = {
      id,
      name: data.name || '',
      school_id: data.school_id || '',
      ...data,
    };
    const response = await api.patch<ApiResponse<Department>>('/departments', updateData);
    return response.data.data;
  },

  deleteDepartment: async (id: string) => {
    await api.delete(`/departments/${id}`);
  },

  // ===== SUBJECTS =====

  getSubjects: async (schoolId: string) => {
    const response = await api.get<ApiResponse<Subject[]>>(`/school-administrator/subjects/${schoolId}`);
    return response.data.data;
  },

  getSubjectById: async (id: string) => {
    const response = await api.get<ApiResponse<Subject>>(`/subjects/${id}`);
    return response.data.data;
  },

  createSubject: async (data: CreateSubjectData) => {
    const response = await api.post<ApiResponse<Subject>>('/school-administrator/subject', data);
    return response.data.data;
  },

  updateSubject: async (id: string, data: Partial<CreateSubjectData>) => {
    const updateData: UpdateSubjectData = {
      id,
      name: data.name || '',
      academic_level: data.academic_level || '',
      school_id: data.school_id || '',
      department_id: data.department_id || '',
      ...data,
    };
    const response = await api.patch<ApiResponse<Subject>>('/subjects', updateData);
    return response.data.data;
  },

  deleteSubject: async (id: string) => {
    await api.delete(`/subjects/${id}`);
  },

  // ===== CLASSES =====

  // Get all classes for a school (filtered by school context)
  getClasses: async () => {
    // Assuming there's a generic endpoint - may need to be teacher-specific
    const response = await api.get<ApiResponse<Class[]>>('/classes');
    return response.data.data;
  },

  getClassById: async (id: string) => {
    const response = await api.get<ApiResponse<Class>>(`/classes/${id}`);
    return response.data.data;
  },

  createClass: async (data: CreateClassData) => {
    const response = await api.post<ApiResponse<Class>>('/teacher/class', data);
    return response.data.data;
  },

  updateClass: async (id: string, data: Partial<CreateClassData>) => {
    const updateData: UpdateClassData = {
      id,
      teacher_in_charge: data.teacher_in_charge || '',
      academic_level: data.academic_level || '',
      subject_id: data.subject_id || '',
    };
    const response = await api.patch<ApiResponse<Class>>('/classes', updateData);
    return response.data.data;
  },

  deleteClass: async (id: string) => {
    await api.delete(`/classes/${id}`);
  },

  // ===== PARENTS/GUARDIANS =====

  getParents: async () => {
    const response = await api.get<ApiResponse<Parent[]>>('/parent-guardian');
    return response.data.data;
  },

  getParentById: async (id: string) => {
    const response = await api.get<ApiResponse<Parent>>(`/parent-guardian/${id}`);
    return response.data.data;
  },

  createParent: async (data: CreateParentData) => {
    const response = await api.post('/auth/create-account', data, {
      params: { account_type: 'parent_guardian' },
    });
    return response.data;
  },

  updateParent: async (id: string, data: Partial<Omit<CreateParentData, 'password'>>) => {
    const response = await api.patch<ApiResponse<Parent>>('/parent-guardian', {
      id,
      ...data,
    });
    return response.data.data;
  },

  deleteParent: async (id: string) => {
    await api.delete(`/parent-guardian/${id}`);
  },

  linkParentToStudents: async (parentId: string, studentIds: string[]) => {
    const promises = studentIds.map(studentId =>
      api.post('/student-parents-guardians', {
        student_id: studentId,
        parent_guardian_id: parentId,
      })
    );
    await Promise.all(promises);
  },

  // ===== TEACHERS =====

  getSchoolTeachers: async (schoolId: string) => {
    const response = await api.get<ApiResponse<any[]>>(`/school-administrator/teachers/${schoolId}`);
    return response.data.data;
  },

  createTeacher: async (data: { email: string; password: string; first_name: string; last_name: string; school_id: string }) => {
    const response = await api.post<ApiResponse<any>>('/school-administrator/teacher', data);
    return response.data.data;
  },

  updateTeacher: async (id: string, data: Partial<{ first_name: string; last_name: string; email: string }>) => {
    const response = await api.patch<ApiResponse<any>>('/teachers', { id, ...data });
    return response.data.data;
  },

  deleteTeacher: async (id: string) => {
    await api.delete(`/teachers/${id}`);
  },

  // ===== STUDENTS =====

  getSchoolStudents: async (schoolId: string) => {
    const response = await api.get<ApiResponse<any[]>>(`/school-administrator/students/${schoolId}`);
    return response.data.data;
  },

  createStudent: async (data: { email: string; password: string; first_name: string; last_name: string; school_id: string }) => {
    const response = await api.post<ApiResponse<any>>('/school-administrator/student', data);
    return response.data.data;
  },

  updateStudent: async (id: string, data: Partial<{ first_name: string; last_name: string; email: string }>) => {
    const response = await api.patch<ApiResponse<any>>('/students', { id, ...data });
    return response.data.data;
  },

  deleteStudent: async (id: string) => {
    await api.delete(`/students/${id}`);
  },
};
