# Implementation Guide - Complete the Webapp

## ✅ What Has Been Created

### API Layer
- `src/lib/api.ts` - Axios instance with auth interceptors
- `src/api/schools.ts` - Schools API functions
- `src/api/administrators.ts` - Administrators API functions
- `src/api/teachers.ts` - Teachers API functions
- `src/api/students.ts` - Students API functions

### Components
- `src/components/tables/DataTable.tsx` - Reusable data table with search, sort, edit, delete

### Pages (CRUD Complete)
- `src/pages/Schools.tsx` - Full CRUD for schools (Super Admin)
- `src/pages/Administrators.tsx` - Create/Delete administrators (Super Admin)

## 📋 Steps to Complete the Implementation

### Step 1: Install Dependencies

```bash
cd C:\Users\chimw\Documents\Work-Gs\edu5.0\webapp\eduflow-admin

# Install TanStack Query
npm install @tanstack/react-query

# If axios is not installed
npm install axios
```

### Step 2: Setup Query Client

Update `src/main.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Wrap your app with QueryClientProvider
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Step 3: Update Routing

Update `src/App.tsx` to include all new routes:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout/Layout';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Schools from '@/pages/Schools';
import Administrators from '@/pages/Administrators';
import Teachers from '@/pages/Teachers';
import Students from '@/pages/Students';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Super Admin Routes */}
            <Route path="schools" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Schools />
              </ProtectedRoute>
            } />
            <Route path="administrators" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Administrators />
              </ProtectedRoute>
            } />

            {/* Administrator Routes */}
            <Route path="teachers" element={
              <ProtectedRoute allowedRoles={['super_admin', 'administrator']}>
                <Teachers />
              </ProtectedRoute>
            } />
            <Route path="students" element={
              <ProtectedRoute allowedRoles={['super_admin', 'administrator']}>
                <Students />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### Step 4: Update Layout to Use Outlet

Update `src/components/Layout/Layout.tsx`:

```typescript
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
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
          <Outlet />  {/* This renders nested routes */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
```

### Step 5: Create Additional Pages (Similar Pattern)

Create these pages using the same pattern as Schools/Administrators:

#### Teachers.tsx
```typescript
// Copy pattern from Administrators.tsx
// Use teachersApi from src/api/teachers.ts
// Update header/title/colors to use text-teacher
```

#### Students.tsx
```typescript
// Copy pattern from Administrators.tsx
// Use studentsApi from src/api/students.ts
// Update header/title/colors to use text-student
```

#### Parents.tsx, Departments.tsx, Subjects.tsx, Classes.tsx
```typescript
// 1. Create API files in src/api/ (copy pattern from schools.ts)
// 2. Create page components (copy pattern from Schools.tsx)
// 3. Update types/interfaces for each entity
```

### Step 6: Test the Application

1. **Start the backend** (if not running):
   ```bash
   cd C:\Users\chimw\Documents\Work-Gs\edu5.0\backend\education-5.0.1-backend
   pnpm run start:dev
   ```

2. **Start the webapp**:
   ```bash
   cd C:\Users\chimw\Documents\Work-Gs\edu5.0\webapp\eduflow-admin
   npm run dev
   ```

3. **Test Super Admin Flow**:
   - Login with super_admin role
   - Navigate to Schools → Create a school
   - Navigate to Administrators → Create an administrator
   - Verify all CRUD operations work

4. **Test Administrator Flow**:
   - Login with administrator role
   - Navigate to Teachers → Create a teacher
   - Navigate to Students → Create a student
   - Verify role-based access (shouldn't see Schools menu)

## 🎨 Customization Guide

### Colors for Different Entities

Already configured in your theme:
- **Super Admin**: `bg-super-admin` (Yellow #FBBF24)
- **Teacher**: `bg-teacher` (Purple #9333EA)
- **Student**: `bg-student` (Teal #14B8A6)
- **Parent**: `bg-parent` (Orange #F97316)

### Adding New Entity Pages

1. **Create API file** (`src/api/entity.ts`):
   - Define interface
   - Export CRUD functions
   - Use the api instance from `@/lib/api`

2. **Create page component** (`src/pages/Entity.tsx`):
   - Copy Schools.tsx or Administrators.tsx
   - Update API calls
   - Customize form fields
   - Update colors/icons

3. **Add to routing** in App.tsx:
   - Add route with appropriate role protection
   - Add to sidebar navigation (already done in Sidebar.tsx)

## 🔧 Troubleshooting

### CORS Issues
If you get CORS errors, ensure backend has:
```typescript
app.enableCors();  // In main.ts
```

### 401 Unauthorized
Check that:
1. Token is being stored in localStorage
2. Axios interceptor is adding Authorization header
3. Backend accepts the token format

### Type Errors
Run:
```bash
npm install --save-dev @types/react @types/react-dom
```

## 📊 Current Status

✅ **Completed:**
- API layer with auth
- DataTable component
- Schools CRUD page
- Administrators CRUD page
- Protected routes
- Role-based navigation

⏳ **In Progress:**
- Teachers page (need to create)
- Students page (need to create)

❌ **TODO:**
- Parents page
- Departments page
- Subjects page
- Classes page
- Syllabi page
- Assignments page
- Resources page

## 🚀 Quick Start Commands

```bash
# Install dependencies
cd C:\Users\chimw\Documents\Work-Gs\edu5.0\webapp\eduflow-admin
npm install @tanstack/react-query axios

# Run development server
npm run dev

# Build for production
npm run build
```

Your webapp foundation is complete! Just follow the steps above to finish the implementation.
