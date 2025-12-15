import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/api/teacher';
import { DataTable, Column } from '@/components/tables/DataTable';
import { BookOpen, Building2, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TeacherSubjects = () => {
  // Fetch my assigned subjects
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['teacher-subjects'],
    queryFn: teacherApi.getMySubjects,
  });

  const columns: Column<any>[] = [
    {
      header: 'Subject Name',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Code',
      accessor: 'code',
      sortable: true,
    },
    {
      header: 'Department',
      accessor: (row) => row.department?.name || '-',
      sortable: true,
    },
    {
      header: 'Description',
      accessor: (row) => row.description || '-',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-super-admin" />
            My Subjects
          </h1>
          <p className="text-muted-foreground mt-1">
            Subjects you're assigned to teach
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subjects
            </CardTitle>
            <BookOpen className="w-5 h-5 text-super-admin" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Subjects you teach
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
            <Building2 className="w-5 h-5 text-teacher" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(subjects.map((s: any) => s.department?.id).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Different departments
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subject Codes
            </CardTitle>
            <GraduationCap className="w-5 h-5 text-student" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique codes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subjects Table */}
      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader>
          <CardTitle>Your Assigned Subjects</CardTitle>
          <CardDescription>
            All subjects you're currently teaching
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No subjects assigned yet. Contact your administrator.
              </p>
            </div>
          ) : (
            <DataTable
              data={subjects}
              columns={columns}
              searchPlaceholder="Search subjects..."
              searchKeys={['name', 'code', 'department.name']}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherSubjects;
