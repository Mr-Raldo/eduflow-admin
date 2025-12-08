import { useQuery } from '@tanstack/react-query';
import { teacherApi } from '@/api/teacher';
import { DataTable, Column } from '@/components/tables/DataTable';
import { School, Users, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MyClasses = () => {
  // Fetch my assigned classes
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['teacher-classes'],
    queryFn: teacherApi.getMyClasses,
  });

  const columns: Column<any>[] = [
    {
      header: 'Class',
      accessor: (row) => row.class?.name || 'Unknown',
      sortable: true,
    },
    {
      header: 'Level',
      accessor: (row) => row.class?.level || '-',
    },
    {
      header: 'Subject',
      accessor: (row) => row.subject?.name || 'Unknown',
      sortable: true,
    },
    {
      header: 'Subject Code',
      accessor: (row) => row.subject?.code || '-',
    },
    {
      header: 'Capacity',
      accessor: (row) => row.class?.capacity || '-',
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
            <School className="w-8 h-8 text-teacher" />
            My Classes
          </h1>
          <p className="text-muted-foreground mt-1">
            Classes and subjects assigned to you
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assignments
            </CardTitle>
            <School className="w-5 h-5 text-teacher" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Class-subject combinations
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Classes
            </CardTitle>
            <Users className="w-5 h-5 text-student" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(classes.map((c: any) => c.class?.id)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Different classes
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Subjects
            </CardTitle>
            <BookOpen className="w-5 h-5 text-super-admin" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(classes.map((c: any) => c.subject?.id)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Different subjects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader>
          <CardTitle>Your Teaching Assignments</CardTitle>
          <CardDescription>
            Classes and subjects you're assigned to teach
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classes.length === 0 ? (
            <div className="text-center py-12">
              <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No classes assigned yet. Contact your administrator.
              </p>
            </div>
          ) : (
            <DataTable
              data={classes}
              columns={columns}
              searchPlaceholder="Search classes..."
              searchKeys={['class.name', 'subject.name', 'subject.code']}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyClasses;
