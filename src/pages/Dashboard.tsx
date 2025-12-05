import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, School, BookOpen, GraduationCap, FileText, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { profile, getRoleGradient, hasRole } = useAuth();

  const getRoleDashboard = () => {
    if (hasRole('admin')) return <AdminDashboard />;
    if (hasRole('headmaster')) return <HeadmasterDashboard />;
    if (hasRole('hod')) return <HODDashboard />;
    if (hasRole('teacher')) return <TeacherDashboard />;
    if (hasRole('student')) return <StudentDashboard />;
    if (hasRole('parent')) return <ParentDashboard />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className={`${getRoleGradient()} rounded-3xl p-8 text-white`}>
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.first_name || 'User'}!
        </h1>
        <p className="text-white/90">
          Here's what's happening with your education platform today.
        </p>
      </div>

      {getRoleDashboard()}
    </div>
  );
};

const AdminDashboard = () => {
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

const HeadmasterDashboard = () => {
  const stats = [
    { label: 'Departments', value: '8', icon: BookOpen, color: 'text-super-admin' },
    { label: 'Teachers', value: '45', icon: GraduationCap, color: 'text-teacher' },
    { label: 'Students', value: '1,234', icon: Users, color: 'text-student' },
    { label: 'Classes', value: '32', icon: School, color: 'text-parent' },
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

const HODDashboard = () => {
  const stats = [
    { label: 'Subjects', value: '6', icon: BookOpen, color: 'text-super-admin' },
    { label: 'Teachers', value: '12', icon: GraduationCap, color: 'text-teacher' },
    { label: 'Resources', value: '145', icon: FileText, color: 'text-parent' },
    { label: 'Pending Approvals', value: '8', icon: TrendingUp, color: 'text-student' },
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
