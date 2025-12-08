import axios from '@/lib/axios';

// Types
export interface Assignment {
  id: string;
  subject_id: string;
  class_id: string;
  name: string;
  description: string;
  publish_url: string;
  submission_url: string;
  date_assigned: string;
  due_date: string;
  percentage_of_coursework: number;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  subject_id: string;
  class_id?: string;
  title: string; // backend uses 'title'
  description: string;
  file_url: string; // backend uses 'file_url'
  file_size: number; // in bytes
  material_type: string; // backend uses 'material_type'
  uploaded_by?: string;
  is_approved?: boolean;
  created_at: string;
  updated_at: string;
  subject?: any; // populated by backend join
  class?: any; // populated by backend join
}

export interface Syllabus {
  id: string;
  subject_id: string;
  class_id?: string;
  title: string;
  description: string;
  file_url: string;
  file_size: number; // in bytes
  academic_year: string;
  term?: string;
  uploaded_by?: string;
  status: string;
  created_at: string;
  updated_at: string;
  subject?: any; // populated by backend join
  class?: any; // populated by backend join
}

export interface TeacherClass {
  id: string;
  teacher_in_charge: string;
  academic_level: string;
  subject_id: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentEnrollment {
  student_id: string;
  class_id: string;
  teacher_id: string;
  status?: string;
}

export interface CreateAssignmentData {
  subject_id: string;
  class_id: string;
  name: string;
  description: string;
  publish_url: string;
  submission_url: string;
  date_assigned: string;
  due_date: string;
  percentage_of_coursework: number;
}

export interface CreateResourceData {
  subject_id: string;
  name: string;
  description: string;
  publish_url: string;
  size_mb: number;
  type: string;
  category: string; // Books, Notes, Videos, Slides, etc.
}

export interface CreateSyllabusData {
  subject_id: string;
  name: string;
  description: string;
  file_url: string;
  file_size_mb: number;
  academic_year: string;
  status?: string;
}

export interface CreateClassData {
  teacher_in_charge: string;
  academic_level: string;
  subject_id: string;
  // school_id is inferred from authenticated user on backend
}

// API Functions
export const teacherApi = {
  // Classes
  getMyClasses: async (): Promise<any[]> => {
    const response = await axios.get('/teacher/classes');
    return response.data.classes || [];
  },

  getClassStudents: async (classId: string): Promise<any[]> => {
    const response = await axios.get(`/teacher/classes/${classId}/students`);
    return response.data.students || [];
  },

  // Get assigned subjects (READ-ONLY - assigned by admin)
  getMySubjects: async (): Promise<any[]> => {
    const response = await axios.get('/teacher/subjects');
    return response.data.subjects || [];
  },

  // Learning Materials
  getMyMaterials: async (): Promise<any[]> => {
    const response = await axios.get('/teacher/materials');
    return response.data.materials || [];
  },

  uploadMaterial: async (data: any): Promise<any> => {
    const response = await axios.post('/teacher/materials', data);
    return response.data.material || response.data;
  },

  updateMaterial: async (id: string, data: any): Promise<any> => {
    const response = await axios.put(`/teacher/materials/${id}`, data);
    return response.data.material || response.data;
  },

  deleteMaterial: async (id: string): Promise<void> => {
    await axios.delete(`/teacher/materials/${id}`);
  },

  // Assignments
  getMyAssignments: async (): Promise<any[]> => {
    const response = await axios.get('/teacher/assignments');
    return response.data.assignments || [];
  },

  createAssignment: async (data: any): Promise<any> => {
    const response = await axios.post('/teacher/assignments', data);
    return response.data.assignment || response.data;
  },

  updateAssignment: async (id: string, data: any): Promise<any> => {
    const response = await axios.put(`/teacher/assignments/${id}`, data);
    return response.data.assignment || response.data;
  },

  deleteAssignment: async (id: string): Promise<void> => {
    await axios.delete(`/teacher/assignments/${id}`);
  },

  getAssignmentSubmissions: async (assignmentId: string): Promise<any[]> => {
    const response = await axios.get(`/teacher/assignments/${assignmentId}/submissions`);
    return response.data.submissions || [];
  },

  gradeSubmission: async (id: string, data: { score: number; feedback?: string }): Promise<any> => {
    const response = await axios.put(`/teacher/submissions/${id}/grade`, data);
    return response.data.submission || response.data;
  },

  // Syllabi
  getMySyllabi: async (): Promise<any[]> => {
    const response = await axios.get('/teacher/syllabi');
    return response.data.syllabi || [];
  },

  createSyllabus: async (data: any): Promise<any> => {
    const response = await axios.post('/teacher/syllabi', data);
    return response.data.syllabus || response.data;
  },

  updateSyllabus: async (id: string, data: any): Promise<any> => {
    const response = await axios.put(`/teacher/syllabi/${id}`, data);
    return response.data.syllabus || response.data;
  },

  deleteSyllabus: async (id: string): Promise<void> => {
    await axios.delete(`/teacher/syllabi/${id}`);
  },

  // Attendance
  markAttendance: async (data: any): Promise<any> => {
    const response = await axios.post('/teacher/attendance', data);
    return response.data;
  },

  getClassAttendance: async (classId: string): Promise<any[]> => {
    const response = await axios.get(`/teacher/attendance/class/${classId}`);
    return response.data.attendance || [];
  },

  // Announcements
  createAnnouncement: async (data: any): Promise<any> => {
    const response = await axios.post('/teacher/announcements', data);
    return response.data.announcement || response.data;
  },

  // File Upload to Supabase Storage
  uploadFile: async (file: File, bucket: string, folder: string): Promise<{ publicUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    formData.append('folder', folder);

    const response = await axios.post('/teacher/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      publicUrl: response.data.publicUrl || response.data.url || '',
    };
  },

  // Resources (using materials endpoint)
  getResourcesForSubject: async (subjectId: string): Promise<any[]> => {
    const response = await axios.get('/teacher/materials');
    const materials = response.data.materials || [];
    return subjectId ? materials.filter((m: any) => m.subject_id === subjectId) : materials;
  },

  createResource: async (data: any): Promise<any> => {
    // Map resource data to material data
    // Convert material_type to lowercase and map to allowed values
    const typeMap: Record<string, string> = {
      'PDF': 'pdf',
      'Video': 'video',
      'Document': 'doc',
      'Link': 'link',
      'Image': 'image',
      'Other': 'other'
    };

    const materialData = {
      title: data.name,
      description: data.description,
      material_type: typeMap[data.type] || data.type.toLowerCase(),
      file_url: data.publish_url,
      file_size: data.size_mb ? Math.round(data.size_mb * 1024 * 1024) : null, // Convert MB to bytes
      subject_id: data.subject_id,
      class_id: data.class_id || null,
    };
    const response = await axios.post('/teacher/materials', materialData);
    return response.data.material || response.data;
  },

  // Get assignments for a specific class
  getAssignmentsForClass: async (classId: string): Promise<any[]> => {
    const response = await axios.get('/teacher/assignments');
    const assignments = response.data.assignments || [];
    return classId ? assignments.filter((a: any) => a.class_id === classId) : assignments;
  },
};
