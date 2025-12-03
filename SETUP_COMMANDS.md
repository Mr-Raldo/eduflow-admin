# Quick Setup Commands - Run These Now

## Step 1: Install Required Dependencies

```bash
cd C:\Users\chimw\Documents\Work-Gs\edu5.0\webapp\eduflow-admin

# Install TanStack Query for data fetching
npm install @tanstack/react-query

# Install Axios if not already installed
npm install axios

# Install Sonner for toast notifications (if not installed)
npm install sonner
```

## Step 2: Update main.tsx

Add QueryClientProvider wrapper. Update your `src/main.tsx`:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

## Step 3: Update App.tsx Routing

Replace your `src/App.tsx` with:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout/Layout';
import { Toaster } from 'sonner';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Schools from '@/pages/Schools';
import Administrators from '@/pages/Administrators';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Super Admin Routes */}
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
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

## Step 4: Update Layout.tsx

Update `src/components/Layout/Layout.tsx` to use Outlet:

```typescript
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
```

## Step 5: Start Development

```bash
# Make sure backend is running first
cd C:\Users\chimw\Documents\Work-Gs\edu5.0\backend\education-5.0.1-backend
pnpm run start:dev

# In another terminal, start webapp
cd C:\Users\chimw\Documents\Work-Gs\edu5.0\webapp\eduflow-admin
npm run dev
```

## Step 6: Test the Application

1. Open browser to `http://localhost:5173` (or whatever port Vite shows)
2. Login with Super Admin role:
   - Email: `raldo1@gmail.com`
   - Password: `Martha2554#`
   - Role: Super Admin

3. Test CRUD operations:
   - Click "Schools" in sidebar
   - Click "Create School" button
   - Fill form and submit
   - Verify school appears in table
   - Test Edit and Delete

4. Test Administrators page similarly

## ✅ Verification Checklist

- [ ] Dependencies installed (`@tanstack/react-query`, `axios`, `sonner`)
- [ ] `main.tsx` updated with QueryClientProvider
- [ ] `App.tsx` updated with new routes
- [ ] `Layout.tsx` updated to use Outlet
- [ ] Backend running on port 4003
- [ ] Webapp running on Vite dev server
- [ ] Can login as Super Admin
- [ ] Schools page loads
- [ ] Can create/edit/delete schools
- [ ] Administrators page works
- [ ] Role-based navigation works (only Super Admin sees Schools/Administrators)

## 🎯 What's Working After This

✅ **Super Admin Can:**
- Create, view, edit, delete schools
- Create and delete administrators
- See role-appropriate dashboard and navigation

✅ **Authentication:**
- Login with all roles (account_type mapping fixed)
- Protected routes
- Auto-logout on 401

✅ **UI/UX:**
- Beautiful data tables with search and sort
- Form dialogs for create/edit
- Delete confirmations
- Toast notifications
- Role-based colors

## 🚀 Next: Add More Pages

Follow the pattern in `Schools.tsx` to create:
- Teachers page (for Administrators)
- Students page (for Administrators)
- Parents, Departments, Subjects, Classes pages
- Teacher-specific pages (Syllabi, Assignments, Resources)

All the foundation is ready! Just copy and customize the Schools page for each new entity.
