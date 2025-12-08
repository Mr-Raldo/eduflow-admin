import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout/Layout';
import { Toaster } from 'sonner';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Schools from '@/pages/Schools';
import Administrators from '@/pages/Administrators';
import Departments from '@/pages/Departments';
import AcademicLevels from '@/pages/AcademicLevels';
import Subjects from '@/pages/Subjects';
import Teachers from '@/pages/Teachers';
import Students from '@/pages/Students';
import Parents from '@/pages/Parents';
import Classes from '@/pages/Classes';
import TeacherAssignments from '@/pages/TeacherAssignments';
import MyClasses from '@/pages/MyClasses';
import Syllabi from '@/pages/Syllabi';
import Assignments from '@/pages/Assignments';
import Resources from '@/pages/Resources';
import TeacherSubjects from '@/pages/TeacherSubjects';
import StudentClasses from '@/pages/StudentClasses';
import StudentAssignments from '@/pages/StudentAssignments';
import StudentSubjects from '@/pages/StudentSubjects';
import StudentGrades from '@/pages/StudentGrades';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard - All roles */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Super Admin Only Routes */}
            <Route
              path="schools"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <Schools />
                </ProtectedRoute>
              }
            />
            <Route
              path="administrators"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <Administrators />
                </ProtectedRoute>
              }
            />

            {/* School Administrator Routes */}
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="academic-levels"
              element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <AcademicLevels />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-subjects"
              element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="teachers"
              element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="parents"
              element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <Parents />
                </ProtectedRoute>
              }
            />
            <Route
              path="classes"
              element={
                <ProtectedRoute allowedRoles={['school_admin', 'teacher']}>
                  <Classes />
                </ProtectedRoute>
              }
            />
            <Route
              path="teacher-assignments"
              element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <TeacherAssignments />
                </ProtectedRoute>
              }
            />

            {/* Teacher Routes */}
            <Route
              path="my-classes"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <MyClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="subjects"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="syllabi"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Syllabi />
                </ProtectedRoute>
              }
            />
            <Route
              path="assignments"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Assignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="resources"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <Resources />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="student-classes"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-classes"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="student-assignments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-assignments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="student-subjects"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-subjects"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="student-grades"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentGrades />
                </ProtectedRoute>
              }
            />
            <Route
              path="my-grades"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentGrades />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
