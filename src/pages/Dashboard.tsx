import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, School, BookOpen, GraduationCap, FileText, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { schoolAdminApi } from '@/api/school-admin';

const Dashboard = () => {
  const { user, getRoleGradient } = useAuth();

  const getRoleDashboard = () => {
    if (!user) return null;

    const dashboards: Record<string, JSX.Element> = {
      super_admin: <SuperAdminDashboard />,
      school_admin: <SchoolAdminDashboard />,
      teacher: <TeacherDashboard />,
      student: <StudentDashboard />,
      parent: <ParentDashboard />,
    };

    return dashboards[user.account_type] || null;
  };

  return (
    <div className="space-y-6">
      <div className={`${getRoleGradient()} rounded-3xl p-8 text-white`}>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-white/90">
          Here's what's happening with your education platform today.
        </p>
      </div>

      {getRoleDashboard()}
    </div>
  );
};

const SuperAdminDashboard = () => {
  const stats = [
    { label: 'Total Schools', value: '24', icon: School, color: 'text-super-admin' },
    { label: 'Administrators', value: '156', icon: Users, color: 'text-super-admin' },
    { label: 'Total Students', value: '12,543', icon: GraduationCap, color: 'text-student' },
    { label: 'Active Teachers', value: '892', icon: Users, color: 'text-teacher' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const SchoolAdminDashboard = () => {
  const { user } = useAuth();

  // Fetch real data from backend
  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments', user?.school_id],
    queryFn: () => schoolAdminApi.getDepartments(user?.school_id || ''),
    enabled: !!user?.school_id,
  });

  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects', user?.school_id],
    queryFn: () => schoolAdminApi.getSubjects(user?.school_id || ''),
    enabled: !!user?.school_id,
  });

  const { data: teachers = [], isLoading: loadingTeachers } = useQuery({
    queryKey: ['teachers', user?.school_id],
    queryFn: () => schoolAdminApi.getSchoolTeachers(user?.school_id || ''),
    enabled: !!user?.school_id,
  });

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students', user?.school_id],
    queryFn: () => schoolAdminApi.getSchoolStudents(user?.school_id || ''),
    enabled: !!user?.school_id,
  });

  const isLoading = loadingDepartments || loadingSubjects || loadingTeachers || loadingStudents;

  const stats = [
    {
      label: 'Departments',
      value: isLoading ? '...' : departments.length.toString(),
      icon: BookOpen,
      color: 'text-super-admin'
    },
    {
      label: 'Subjects',
      value: isLoading ? '...' : subjects.length.toString(),
      icon: BookOpen,
      color: 'text-parent'
    },
    {
      label: 'Teachers',
      value: isLoading ? '...' : teachers.length.toString(),
      icon: GraduationCap,
      color: 'text-teacher'
    },
    {
      label: 'Students',
      value: isLoading ? '...' : students.length.toString(),
      icon: Users,
      color: 'text-student'
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const TeacherDashboard = () => {
  const stats = [
    { label: 'My Classes', value: '6', icon: School, color: 'text-teacher' },
    { label: 'Students', value: '142', icon: Users, color: 'text-student' },
    { label: 'Assignments', value: '18', icon: FileText, color: 'text-parent' },
    { label: 'Resources', value: '34', icon: BookOpen, color: 'text-super-admin' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const StudentDashboard = () => {
  const stats = [
    { label: 'My Classes', value: '7', icon: School, color: 'text-student' },
    { label: 'Assignments Due', value: '5', icon: FileText, color: 'text-parent' },
    { label: 'Completed', value: '23', icon: BookOpen, color: 'text-super-admin' },
    { label: 'Average Grade', value: '87%', icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ParentDashboard = () => {
  const stats = [
    { label: 'Children', value: '2', icon: Users, color: 'text-parent' },
    { label: 'Total Classes', value: '14', icon: School, color: 'text-student' },
    { label: 'Assignments', value: '12', icon: FileText, color: 'text-super-admin' },
    { label: 'Avg Performance', value: '85%', icon: TrendingUp, color: 'text-success' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
