import axios from '@/lib/axios';

// Types
export interface Child {
  id: string;
  student_number: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_image?: string;
  };
  class: {
    id: string;
    name: string;
    level: string;
  };
}

export interface ChildPerformance {
  grades: any[];
}

export interface ChildAssignment {
  id: string;
  assignment: {
    id: string;
    title: string;
    due_date: string;
    total_marks: number;
    subject: {
      name: string;
    };
  };
  marks_obtained?: number;
  status: string;
  submitted_at?: string;
}

export interface ChildAttendance {
  records: any[];
  summary: {
    totalDays: number;
    presentDays: number;
    percentage: string;
  };
}

// API Functions
export const parentApi = {
  // Children
  getMyChildren: async (): Promise<Child[]> => {
    const response = await axios.get('/parent/children');
    return response.data.children || [];
  },

  // Performance
  getChildPerformance: async (studentId: string): Promise<ChildPerformance> => {
    const response = await axios.get(`/parent/children/${studentId}/performance`);
    return response.data;
  },

  // Assignments
  getChildAssignments: async (studentId: string): Promise<ChildAssignment[]> => {
    const response = await axios.get(`/parent/children/${studentId}/assignments`);
    return response.data.submissions || [];
  },

  // Attendance
  getChildAttendance: async (studentId: string): Promise<ChildAttendance> => {
    const response = await axios.get(`/parent/children/${studentId}/attendance`);
    return response.data.attendance;
  },
};
