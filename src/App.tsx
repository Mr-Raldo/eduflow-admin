import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout/Layout';
import { Toaster } from 'sonner';

// Pages
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Schools from '@/pages/Schools';
import Administrators from '@/pages/Administrators';
import Departments from '@/pages/Departments';
import Subjects from '@/pages/Subjects';
import Teachers from '@/pages/Teachers';
import Students from '@/pages/Students';
import Parents from '@/pages/Parents';
import Classes from '@/pages/Classes';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />

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

            {/* Admin Only Routes */}
            <Route
              path="schools"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Schools />
                </ProtectedRoute>
              }
            />
            <Route
              path="administrators"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Administrators />
                </ProtectedRoute>
              }
            />

            {/* Admin & Headmaster Routes */}
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['admin', 'headmaster', 'hod']}>
                  <Departments />
                </ProtectedRoute>
              }
            />
            <Route
              path="subjects"
              element={
                <ProtectedRoute allowedRoles={['admin', 'headmaster', 'hod']}>
                  <Subjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="teachers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'headmaster']}>
                  <Teachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="students"
              element={
                <ProtectedRoute allowedRoles={['admin', 'headmaster', 'teacher']}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="parents"
              element={
                <ProtectedRoute allowedRoles={['admin', 'headmaster']}>
                  <Parents />
                </ProtectedRoute>
              }
            />
            <Route
              path="classes"
              element={
                <ProtectedRoute allowedRoles={['admin', 'headmaster', 'teacher']}>
                  <Classes />
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
