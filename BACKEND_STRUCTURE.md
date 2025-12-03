# Education 5.0.1 - Backend Structure & Webapp Integration

## 🎯 Overview

This document explains the backend architecture and how the webapp has been restructured to match it.

---

## 👥 User Roles & Hierarchy

### 1. **Super Administrator** (`super_admin`)
- **Backend Table**: `administrator`
- **Backend Endpoints**: `/super-administrator/*`
- **Login Account Type**: `administrator` (mapped from `super_admin` in webapp)

**Capabilities:**
- ✅ Create and manage schools (system-wide)
- ✅ Create and manage administrators
- ✅ Assign administrators to schools
- ✅ View all system data
- ❌ Cannot directly manage school-specific resources (departments, subjects)

**Webapp Features:**
- Schools Management (CRUD)
- Administrators Management (CRUD)
- System-wide Dashboard

**Backend Endpoints Used:**
```
POST   /super-administrator/school-administrator  - Create school with admin
GET    /school-administrator                      - List all schools
GET    /school-administrator/:id                  - Get school details
PATCH  /school-administrator                      - Update school
DELETE /school-administrator/:id                  - Delete school

POST   /super-administrator                       - Create administrator
GET    /super-administrator                       - List administrators
GET    /super-administrator/:id                   - Get administrator
PATCH  /super-administrator                       - Update administrator
DELETE /super-administrator/:id                   - Delete administrator
```

---

### 2. **School Administrator** (`school_admin`)
- **Backend Table**: `administrator` (same as super_admin)
- **Backend Endpoints**: `/school-administrator/*`
- **Login Account Type**: `administrator` (mapped from `school_admin` in webapp)
- **Context**: Associated with specific school(s) via `administrator_schools` table

**Capabilities:**
- ✅ Create and manage departments for their school
- ✅ Create and manage subjects for their school
- ✅ Create and manage teachers for their school
- ✅ Create and manage students for their school
- ✅ View all school-specific data
- ❌ Cannot access other schools' data
- ❌ Cannot create new schools

**Webapp Features:**
- Departments Management (CRUD)
- Subjects Management (CRUD)
- Teachers Management (CRUD)
- Students Management (CRUD)
- Parents Management (CRUD)
- Classes Management (CRUD)
- School-specific Dashboard

**Backend Endpoints Used:**
```
# School Resources
GET  /school-administrator/departments/:school_id  - List school departments
POST /school-administrator/department              - Create department
GET  /school-administrator/subjects/:school_id     - List school subjects
POST /school-administrator/subject                 - Create subject
GET  /school-administrator/teachers/:school_id     - List school teachers
POST /school-administrator/teacher                 - Create teacher
GET  /school-administrator/students/:school_id     - List school students
POST /school-administrator/student                 - Create student
```

---

### 3. **Teacher** (`teacher`)
- **Backend Table**: `teachers`
- **Backend Endpoints**: `/teacher/*`
- **Context**: Associated with school via `school_id`

**Capabilities:**
- ✅ Create and manage classes
- ✅ Create and manage syllabi
- ✅ Create assignments and resources
- ✅ Enroll students into classes
- ✅ View their classes and students

**Webapp Features:**
- My Classes
- Syllabi Management
- Assignments Management
- Resources Management
- Class Dashboard

**Backend Endpoints Used:**
```
POST /teacher/class                           - Create class
GET  /teacher/:teacher_id/classes             - Get teacher's classes
POST /teacher/assignment                      - Create assignment
GET  /teacher/:syllabus_id/assignments        - Get assignments for syllabus
POST /teacher/resource                        - Create resource
GET  /teacher/:syllabus_id/resources          - Get resources for syllabus
POST /teacher/enrol                           - Enroll student in class
```

---

### 4. **Student** (`student`)
- **Backend Table**: `students`
- **Backend Endpoints**: `/student/*`
- **Context**: Associated with school via `school_id`

**Capabilities:**
- ✅ View enrolled classes
- ✅ View assignments
- ✅ View resources
- ✅ Submit assignments (when implemented)

**Webapp Features:**
- My Classes
- Assignments
- Grades
- Student Dashboard

**Backend Endpoints Used:**
```
GET /student/:student_id/classes              - Get student's classes
GET /student/:id                              - Get student details
```

---

### 5. **Parent/Guardian** (`parent`)
- **Backend Table**: `parents_guardians`
- **Backend Endpoints**: TBD
- **Context**: Linked to students via `student_parents_guardians` table

**Capabilities:**
- ✅ View children's information
- ✅ View children's classes and assignments
- ✅ View children's performance

**Webapp Features:**
- Children Management
- Performance Dashboard

---

## 🗄️ Database Structure

### Core Entities

#### Schools
```typescript
{
  id: string;
  admin_id: string;  // References administrator
  name: string;
  physical_address?: string;
  phone?: string;
  email?: string;
  staff_size?: number;
  student_body_size?: number;
}
```

#### Administrators
```typescript
{
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  phone?: string;
  email: string;
  password: string;
}
```

#### Departments
```typescript
{
  id: string;
  code: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  head_of_department?: string;  // UUID
  academic_levels?: string[];
  school_id: string;
}
```

#### Subjects
```typescript
{
  id: string;
  code: string;
  name: string;
  academic_level: string;
  department?: string;  // UUID
  teacher_in_charge?: string;  // UUID
  course_content?: string;  // UUID (syllabus)
  school_id: string;
  department_id: string;
}
```

#### Teachers
```typescript
{
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  email: string;
  password: string;
  department?: string;  // UUID
  qualifications?: string[];
  school_id?: string;
}
```

#### Students
```typescript
{
  id: string;
  code: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  email: string;
  password: string;
  academic_level?: string;
  enrolment_date?: string;
  school_id: string;
}
```

### Junction/Relationship Tables

- `administrator_schools` - Links administrators to schools (many-to-many)
- `school_departments` - Links schools to departments
- `school_subjects` - Links schools to subjects
- `school_teachers` - Links schools to teachers
- `school_students` - Links schools to students
- `teacher_subjects` - Links teachers to subjects
- `student_classes` - Links students to classes
- `teacher_classes` - Links teachers to classes
- `student_parents_guardians` - Links students to parents/guardians

---

## 🔒 Authentication & Security

### Login Flow

1. User selects role from dropdown:
   - Super Administrator
   - School Administrator
   - Teacher
   - Student
   - Parent

2. Frontend maps role to backend `account_type`:
   ```typescript
   super_admin → administrator
   school_admin → administrator
   teacher → teachers
   student → students
   parent → parents_guardians
   ```

3. Backend validates credentials against appropriate table

4. Backend returns:
   - `access_token` (JWT)
   - `refresh_token`
   - User profile data

5. Frontend stores:
   - Tokens in localStorage
   - User data with original frontend role type

### Important Security Note

⚠️ **RBAC NOT IMPLEMENTED IN BACKEND**
- Backend has NO role-based guards
- All endpoints are currently open
- Frontend implements role-based routing for UI organization
- Backend security needs to be implemented before production

---

## 📊 API Response Format

All backend responses follow this structure:

```typescript
{
  statusCode: number;      // 200, 201, 400, 404, 500, etc.
  message: string;         // Human-readable message
  data: T;                 // Actual data (array or object)
}
```

**Frontend API Layer:**
All API functions extract `response.data.data` to unwrap the response:

```typescript
const response = await api.get<ApiResponse<School[]>>('/school-administrator');
return response.data.data;  // Returns the actual array
```

---

## 🚀 Webapp Structure

### File Organization

```
src/
├── api/
│   ├── schools.ts              # Super Admin - Schools CRUD
│   ├── administrators.ts       # Super Admin - Administrators CRUD
│   ├── school-admin.ts         # School Admin - Departments, Subjects, etc.
│   ├── teachers.ts             # Teachers CRUD
│   └── students.ts             # Students CRUD
│
├── components/
│   ├── Layout/
│   │   ├── Layout.tsx          # Main layout with Outlet
│   │   ├── Sidebar.tsx         # Role-based navigation
│   │   └── Header.tsx          # Header with user info
│   ├── ProtectedRoute.tsx      # Role-based route protection
│   └── tables/
│       └── DataTable.tsx       # Reusable data table
│
├── contexts/
│   └── AuthContext.tsx         # Authentication & role management
│
├── pages/
│   ├── Login.tsx               # Login with role selection
│   ├── Dashboard.tsx           # Role-specific dashboards
│   ├── Schools.tsx             # Super Admin - Schools management
│   ├── Administrators.tsx      # Super Admin - Admins management
│   ├── Teachers.tsx            # School Admin - Teachers management
│   ├── Students.tsx            # School Admin - Students management
│   └── NotFound.tsx            # 404 page
│
├── lib/
│   ├── api.ts                  # Axios instance with interceptors
│   └── axios.ts                # Axios configuration
│
├── App.tsx                     # Routing configuration
└── main.tsx                    # App entry point with providers
```

### Routing Structure

```typescript
/login                          → Public
/dashboard                      → All authenticated users

// Super Admin Only
/schools                        → Schools management
/administrators                 → Administrators management

// School Admin Only
/departments                    → Departments management
/subjects                       → Subjects management
/teachers                       → Teachers management
/students                       → Students management
/parents                        → Parents management
/classes                        → Classes management

// Teacher
/my-classes                     → Teacher's classes
/syllabi                        → Syllabi management
/assignments                    → Assignments management
/resources                      → Resources management

// Student
/my-classes                     → Enrolled classes
/my-assignments                 → Student assignments
/grades                         → Grades view

// Parent
/children                       → Children list
/performance                    → Children's performance
```

---

## 🔄 Key Differences: Super Admin vs School Admin

| Feature | Super Admin | School Admin |
|---------|-------------|--------------|
| **Backend Table** | `administrator` | `administrator` |
| **Backend Endpoints** | `/super-administrator/*` | `/school-administrator/*` |
| **Scope** | System-wide | School-specific |
| **Create Schools** | ✅ Yes | ❌ No |
| **Manage Administrators** | ✅ Yes | ❌ No |
| **Create Departments** | ❌ No | ✅ Yes |
| **Create Subjects** | ❌ No | ✅ Yes |
| **Create Teachers** | ❌ No | ✅ Yes |
| **Create Students** | ❌ No | ✅ Yes |
| **Multiple Schools** | ✅ All schools | ✅ Assigned schools |
| **Navigation** | Schools, Administrators | Departments, Subjects, Teachers, Students |

---

## 📝 Implementation Notes

### Current Status

✅ **Completed:**
- Role-based authentication
- API layer with correct endpoints
- Super Admin features (Schools, Administrators)
- School Admin structure and routing
- Role-based navigation
- Dashboard for each role
- Response unwrapping from backend format

⚠️ **In Progress:**
- School Admin pages (Departments, Subjects)
- Teacher pages (Classes, Syllabi, Assignments)
- Student pages (My Classes, Grades)
- Parent pages (Children, Performance)

❌ **Not Started:**
- Backend RBAC implementation
- Real-time data fetching for dashboards
- File upload for resources
- Assignment submission
- Grading system

### Next Steps

1. **Implement School Admin Pages:**
   - Departments CRUD
   - Subjects CRUD
   - Enhanced Teachers/Students management with school context

2. **Implement Teacher Features:**
   - Classes management
   - Syllabi management
   - Assignments creation
   - Resources management
   - Student enrollment

3. **Implement Student Features:**
   - View enrolled classes
   - View and submit assignments
   - View grades and performance

4. **Backend Security:**
   - Implement JWT guards on all endpoints
   - Create role-based decorators
   - Add permission checks in services
   - Validate school context in requests

5. **Advanced Features:**
   - Multi-school support for admins
   - School selector dropdown
   - Real-time notifications
   - File upload and management
   - Reports and analytics

---

## 🛠️ Development Guidelines

### Adding New Pages

1. Create API file in `src/api/` with proper response unwrapping
2. Create page component in `src/pages/`
3. Add route in `App.tsx` with appropriate `ProtectedRoute`
4. Add navigation item in `Sidebar.tsx` for relevant role
5. Update dashboard if needed

### Testing

1. **Super Admin Flow:**
   - Login as Super Administrator
   - Create a school
   - Create an administrator
   - Assign administrator to school

2. **School Admin Flow:**
   - Login as School Administrator
   - Create departments
   - Create subjects
   - Create teachers
   - Create students

3. **Teacher Flow:**
   - Login as Teacher
   - Create classes
   - Create assignments
   - Enroll students

4. **Student Flow:**
   - Login as Student
   - View classes
   - View assignments
   - Check grades

---

## 📞 Support

For questions or issues:
- Backend API Docs: `http://192.168.100.215:4003/docs/api`
- GitHub Issues: https://github.com/anthropics/claude-code/issues

---

**Last Updated:** 2025-12-01
**Version:** 1.0.0
**Author:** Education 5.0.1 Development Team
