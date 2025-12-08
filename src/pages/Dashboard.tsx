import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, School, BookOpen, GraduationCap, FileText, TrendingUp, Calendar, Clock, Download, FolderOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { schoolAdminApi } from '@/api/school-admin';
import { studentsApi, extractJoinData } from '@/api/students';
import { teacherApi } from '@/api/teacher';
import { parentApi } from '@/api/parent';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

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
    queryKey: ['departments'],
    queryFn: () => schoolAdminApi.getDepartments(''),
  });

  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => schoolAdminApi.getSubjects(''),
  });

  const { data: teachers = [], isLoading: loadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => schoolAdminApi.getSchoolTeachers(''),
  });

  const { data: students = [], isLoading: loadingStudents } = useQuery({
    queryKey: ['students'],
    queryFn: () => schoolAdminApi.getSchoolStudents(''),
  });

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: schoolAdminApi.getClasses,
  });

  const { data: parents = [], isLoading: loadingParents } = useQuery({
    queryKey: ['parents'],
    queryFn: schoolAdminApi.getParents,
  });

  console.log('Dashboard metrics:', { departments, subjects, teachers, students, classes, parents });

  const isLoading = loadingDepartments || loadingSubjects || loadingTeachers || loadingStudents || loadingClasses || loadingParents;

  const stats = [
    {
      label: 'Students',
      value: isLoading ? '...' : students.length.toString(),
      icon: Users,
      color: 'text-student'
    },
    {
      label: 'Teachers',
      value: isLoading ? '...' : teachers.length.toString(),
      icon: GraduationCap,
      color: 'text-teacher'
    },
    {
      label: 'Classes',
      value: isLoading ? '...' : classes.length.toString(),
      icon: School,
      color: 'text-super-admin'
    },
    {
      label: 'Parents',
      value: isLoading ? '...' : parents.length.toString(),
      icon: Users,
      color: 'text-parent'
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
  // Fetch real data from backend
  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: teacherApi.getMyClasses,
  });

  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: teacherApi.getMySubjects,
  });

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn: teacherApi.getMyAssignments,
  });

  const { data: materials = [], isLoading: loadingMaterials } = useQuery({
    queryKey: ['teacher-materials'],
    queryFn: teacherApi.getMyMaterials,
  });

  const isLoading = loadingClasses || loadingSubjects || loadingAssignments || loadingMaterials;

  // Calculate total students across all classes
  const totalStudents = classes.reduce((sum: number, cls: any) => sum + (cls.student_count || 0), 0);

  const stats = [
    {
      label: 'My Classes',
      value: isLoading ? '...' : classes.length.toString(),
      icon: School,
      color: 'text-teacher',
      link: '/my-classes'
    },
    {
      label: 'Subjects',
      value: isLoading ? '...' : subjects.length.toString(),
      icon: BookOpen,
      color: 'text-super-admin',
      link: '/subjects'
    },
    {
      label: 'Assignments',
      value: isLoading ? '...' : assignments.length.toString(),
      icon: FileText,
      color: 'text-parent',
      link: '/assignments'
    },
    {
      label: 'Resources',
      value: isLoading ? '...' : materials.length.toString(),
      icon: FolderOpen,
      color: 'text-student',
      link: '/resources'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all cursor-pointer h-full">
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
          </Link>
        ))}
      </div>

      {/* Assigned Classes & Subjects */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Classes */}
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-teacher" />
              My Classes
            </CardTitle>
            <Link to="/my-classes" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading classes...</p>
            ) : classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {classes.slice(0, 5).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.class?.name || 'Unknown Class'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.subject?.name} ({item.subject?.code})
                      </p>
                    </div>
                    <BookOpen className="w-4 h-4 text-teacher flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Subjects */}
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-super-admin" />
              Assigned Subjects
            </CardTitle>
            <Link to="/subjects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading subjects...</p>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {subjects.slice(0, 5).map((subject: any) => (
                  <div
                    key={subject.id}
                    className="flex items-start justify-between p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {subject.code} • {subject.department?.name}
                      </p>
                    </div>
                    <GraduationCap className="w-4 h-4 text-super-admin flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();

  console.log('[StudentDashboard] User:', user);

  // Fetch student data
  const { data: classes = [], isLoading: loadingClasses, error: classesError } = useQuery({
    queryKey: ['student-classes'],
    queryFn: async () => {
      console.log('[StudentDashboard] Fetching classes for student:', user?.id);
      try {
        const result = await studentsApi.getMyClasses(user?.id || '');
        console.log('[StudentDashboard] Classes fetched:', result);
        return result;
      } catch (error) {
        console.error('[StudentDashboard] Error fetching classes:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  const { data: assignments = [], isLoading: loadingAssignments, error: assignmentsError } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: async () => {
      console.log('[StudentDashboard] Fetching assignments for student:', user?.id);
      try {
        const result = await studentsApi.getMyAssignments(user?.id || '');
        console.log('[StudentDashboard] Assignments fetched:', result);
        return result;
      } catch (error) {
        console.error('[StudentDashboard] Error fetching assignments:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  const { data: subjects = [], isLoading: loadingSubjects, error: subjectsError } = useQuery({
    queryKey: ['student-subjects'],
    queryFn: async () => {
      console.log('[StudentDashboard] Fetching subjects for student:', user?.id);
      try {
        const result = await studentsApi.getMySubjects(user?.id || '');
        console.log('[StudentDashboard] Subjects fetched:', result);
        return result;
      } catch (error) {
        console.error('[StudentDashboard] Error fetching subjects:', error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  // Fetch resources and syllabi for all subjects
  const subjectIds = subjects.map(s => s.id);

  const { data: allResources = [], isLoading: loadingResources } = useQuery({
    queryKey: ['student-all-resources', subjectIds],
    queryFn: async () => {
      const resourcesPromises = subjectIds.map(id =>
        studentsApi.getResourcesForSubject(id).catch(() => [])
      );
      const results = await Promise.all(resourcesPromises);
      return results.flat();
    },
    enabled: subjectIds.length > 0,
  });

  const { data: allSyllabi = [], isLoading: loadingSyllabi } = useQuery({
    queryKey: ['student-all-syllabi', subjectIds],
    queryFn: async () => {
      const syllabiPromises = subjectIds.map(id =>
        studentsApi.getSyllabiForSubject(id).catch(() => [])
      );
      const results = await Promise.all(syllabiPromises);
      return results.flat();
    },
    enabled: subjectIds.length > 0,
  });

  const isLoading = loadingClasses || loadingAssignments || loadingSubjects || loadingResources || loadingSyllabi;

  // Log errors if any
  if (classesError) console.error('[StudentDashboard] Classes error:', classesError);
  if (assignmentsError) console.error('[StudentDashboard] Assignments error:', assignmentsError);
  if (subjectsError) console.error('[StudentDashboard] Subjects error:', subjectsError);

  // Calculate due assignments (assignments with future due dates)
  const now = new Date();
  const dueAssignments = assignments.filter((a) => new Date(a.due_date) > now);
  const completedAssignments = assignments.filter((a) => new Date(a.due_date) <= now);

  const stats = [
    {
      label: 'My Classes',
      value: isLoading ? '...' : classes.length.toString(),
      icon: School,
      color: 'text-student',
      link: '/student-classes'
    },
    {
      label: 'Assignments Due',
      value: isLoading ? '...' : dueAssignments.length.toString(),
      icon: FileText,
      color: 'text-parent',
      link: '/student-assignments'
    },
    {
      label: 'My Subjects',
      value: isLoading ? '...' : subjects.length.toString(),
      icon: BookOpen,
      color: 'text-super-admin',
      link: '/student-subjects'
    },
    {
      label: 'Resources',
      value: isLoading ? '...' : allResources.length.toString(),
      icon: FolderOpen,
      color: 'text-teacher',
      link: '/student-subjects'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.link}>
            <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all cursor-pointer h-full">
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
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Classes */}
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <School className="w-5 h-5 text-student" />
              My Classes
            </CardTitle>
            <Link to="/student-classes" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading classes...</p>
            ) : classes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes enrolled yet.</p>
            ) : (
              <div className="space-y-3">
                {classes.slice(0, 5).map((enrollment: any, index) => {
                  console.log(`[Dashboard] Rendering class ${index + 1}:`, enrollment);

                  // Extract nested data safely (PostgREST returns joins as arrays)
                  const classData = extractJoinData(enrollment.classes);
                  const teacherData = extractJoinData(enrollment.teacher);
                  const subjectData = extractJoinData(classData?.subjects);

                  const subjectName = subjectData?.name || 'Unknown Subject';
                  const subjectCode = subjectData?.code;
                  const academicLevel = classData?.academic_level;
                  const teacherName = teacherData
                    ? `${teacherData.first_name} ${teacherData.last_name}`
                    : null;
                  const enrollmentStatus = enrollment.status;

                  return (
                    <Link key={enrollment.id || index} to="/student-classes">
                      <div className="flex items-start justify-between p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{subjectName}</p>
                            {subjectCode && (
                              <span className="text-xs text-muted-foreground">({subjectCode})</span>
                            )}
                            {enrollmentStatus && (
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                enrollmentStatus === 'Enrolled' || enrollmentStatus === 'Active' || enrollmentStatus === 'active'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              }`}>
                                {enrollmentStatus}
                              </span>
                            )}
                          </div>
                          {academicLevel && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Level: {academicLevel}
                            </p>
                          )}
                          {teacherName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Teacher: {teacherName}
                            </p>
                          )}
                        </div>
                        <BookOpen className="w-4 h-4 text-student flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Assignments */}
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-parent" />
              Upcoming Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading assignments...</p>
            ) : dueAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming assignments.</p>
            ) : (
              <div className="space-y-3">
                {dueAssignments.slice(0, 5).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-start justify-between p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{assignment.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(assignment.due_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <FileText className="w-4 h-4 text-parent flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Subjects */}
        <Card className="rounded-3xl border-none shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-super-admin" />
              My Subjects
            </CardTitle>
            <Link to="/student-subjects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading subjects...</p>
            ) : subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjects.slice(0, 6).map((subject) => (
                  <Link key={subject.id} to="/student-subjects">
                    <div className="p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{subject.name}</h4>
                        <BookOpen className="w-4 h-4 text-super-admin" />
                      </div>
                      {subject.code && (
                        <p className="text-xs text-muted-foreground">{subject.code}</p>
                      )}
                      {subject.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {subject.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Resources */}
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-teacher" />
              Recent Resources
            </CardTitle>
            <Link to="/student-subjects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading resources...</p>
            ) : allResources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resources available yet.</p>
            ) : (
              <div className="space-y-3">
                {allResources.slice(0, 5).map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{resource.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground capitalize">{resource.material_type}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {resource.file_size ? (resource.file_size / (1024 * 1024)).toFixed(1) : '0.0'} MB
                        </span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-teacher flex-shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Syllabi */}
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-super-admin" />
              Course Syllabi
            </CardTitle>
            <Link to="/student-subjects" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              View all →
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading syllabi...</p>
            ) : allSyllabi.length === 0 ? (
              <p className="text-sm text-muted-foreground">No syllabi available yet.</p>
            ) : (
              <div className="space-y-3">
                {allSyllabi.slice(0, 5).map((syllabus) => (
                  <a
                    key={syllabus.id}
                    href={syllabus.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{syllabus.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{syllabus.academic_year}</span>
                        {syllabus.status && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground capitalize">{syllabus.status}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-super-admin flex-shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Summary */}
      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Academic Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-2xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Total Classes</p>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Pending Assignments</p>
              <p className="text-2xl font-bold text-parent">{dueAssignments.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Completed Assignments</p>
              <p className="text-2xl font-bold text-success">{completedAssignments.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Available Syllabi</p>
              <p className="text-2xl font-bold">{allSyllabi.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ParentDashboard = () => {
  // Fetch children data
  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ['parent-children'],
    queryFn: parentApi.getMyChildren,
  });

  // Fetch all children's assignments
  const childrenIds = children.map((child: any) => child.id);

  const { data: allAssignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['parent-all-assignments', childrenIds],
    queryFn: async () => {
      const assignmentsPromises = childrenIds.map((id: string) =>
        parentApi.getChildAssignments(id).catch(() => [])
      );
      const results = await Promise.all(assignmentsPromises);
      return results.flat();
    },
    enabled: childrenIds.length > 0,
  });

  // Fetch all children's performance
  const { data: allPerformance = [], isLoading: loadingPerformance } = useQuery({
    queryKey: ['parent-all-performance', childrenIds],
    queryFn: async () => {
      const performancePromises = childrenIds.map((id: string) =>
        parentApi.getChildPerformance(id).catch(() => ({ grades: [] }))
      );
      const results = await Promise.all(performancePromises);
      return results;
    },
    enabled: childrenIds.length > 0,
  });

  const isLoading = loadingChildren || loadingAssignments || loadingPerformance;

  // Calculate statistics
  const totalClasses = children.reduce((sum: number, child: any) => {
    return sum + (child.class ? 1 : 0);
  }, 0);

  const totalGrades = allPerformance.reduce((sum: number, perf: any) => {
    return sum + (perf.grades?.length || 0);
  }, 0);

  // Calculate average performance from all grades
  const allGrades = allPerformance.flatMap((perf: any) => perf.grades || []);
  const avgPerformance = allGrades.length > 0
    ? (allGrades.reduce((sum: number, grade: any) => sum + (grade.score || 0), 0) / allGrades.length).toFixed(1)
    : '0';

  const stats = [
    {
      label: 'Children',
      value: isLoading ? '...' : children.length.toString(),
      icon: Users,
      color: 'text-parent'
    },
    {
      label: 'Total Classes',
      value: isLoading ? '...' : totalClasses.toString(),
      icon: School,
      color: 'text-student'
    },
    {
      label: 'Assignments',
      value: isLoading ? '...' : allAssignments.length.toString(),
      icon: FileText,
      color: 'text-super-admin'
    },
    {
      label: 'Avg Performance',
      value: isLoading ? '...' : `${avgPerformance}%`,
      icon: TrendingUp,
      color: 'text-success'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
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

      {/* Children Cards */}
      {!isLoading && children.length > 0 && (
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-parent" />
              My Children
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {children.map((child: any) => (
                <div
                  key={child.id}
                  className="p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">
                        {child.user?.first_name} {child.user?.last_name}
                      </h4>
                      <p className="text-xs text-muted-foreground">{child.student_number}</p>
                    </div>
                    <GraduationCap className="w-5 h-5 text-student" />
                  </div>
                  {child.class && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        Class: {child.class.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Level: {child.class.level}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
