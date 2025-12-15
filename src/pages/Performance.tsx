import { useQuery } from '@tanstack/react-query';
import { parentApi, Child } from '@/api/parent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, GraduationCap, FileText, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Performance = () => {
  const { data: children = [], isLoading: loadingChildren } = useQuery({
    queryKey: ['parent-children'],
    queryFn: parentApi.getMyChildren,
  });

  const childrenIds = children.map((child: Child) => child.id);

  // Fetch performance for all children
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

  // Fetch assignments for all children
  const { data: allAssignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['parent-all-assignments', childrenIds],
    queryFn: async () => {
      const assignmentsPromises = childrenIds.map((id: string) =>
        parentApi.getChildAssignments(id).catch(() => [])
      );
      const results = await Promise.all(assignmentsPromises);
      return results;
    },
    enabled: childrenIds.length > 0,
  });

  const isLoading = loadingChildren || loadingPerformance || loadingAssignments;

  // Calculate statistics
  const totalGrades = allPerformance.reduce((sum: number, perf: any) => {
    return sum + (perf.grades?.length || 0);
  }, 0);

  const allGrades = allPerformance.flatMap((perf: any) => perf.grades || []);
  const avgPerformance = allGrades.length > 0
    ? (allGrades.reduce((sum: number, grade: any) => sum + (grade.score || 0), 0) / allGrades.length).toFixed(1)
    : '0';

  const totalAssignments = allAssignments.reduce((sum: number, assignments: any[]) => sum + assignments.length, 0);
  const completedAssignments = allAssignments.reduce((sum: number, assignments: any[]) => {
    return sum + assignments.filter((a: any) => a.status === 'submitted' || a.status === 'graded').length;
  }, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-success" />
            Performance Overview
          </h1>
          <p className="text-muted-foreground">Track your children's academic progress</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-success" />
          Performance Overview
        </h1>
        <p className="text-muted-foreground">Track your children's academic progress</p>
      </div>

      {children.length === 0 ? (
        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                You don't have any children registered in the system yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Overall Statistics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-3xl border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Children
                </CardTitle>
                <Users className="w-5 h-5 text-parent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{children.length}</div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Performance
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgPerformance}%</div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Grades
                </CardTitle>
                <BarChart3 className="w-5 h-5 text-super-admin" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalGrades}</div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Assignments
                </CardTitle>
                <FileText className="w-5 h-5 text-student" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedAssignments}/{totalAssignments}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Individual Children Performance */}
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-student" />
                Individual Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.map((child: Child, index: number) => {
                  const childPerformance = allPerformance[index] || { grades: [] };
                  const childAssignments = allAssignments[index] || [];
                  const childGrades = childPerformance.grades || [];
                  const childAvg = childGrades.length > 0
                    ? (childGrades.reduce((sum: number, grade: any) => sum + (grade.score || 0), 0) / childGrades.length).toFixed(1)
                    : 'N/A';

                  const completedCount = childAssignments.filter(
                    (a: any) => a.status === 'submitted' || a.status === 'graded'
                  ).length;

                  return (
                    <Link key={child.id} to={`/children/${child.id}`}>
                      <div className="p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">
                              {child.user?.first_name} {child.user?.last_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {child.student_number} • {child.class?.name || 'No class'}
                            </p>
                          </div>
                          <GraduationCap className="w-6 h-6 text-student" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 rounded-xl bg-background">
                            <p className="text-xs text-muted-foreground mb-1">Average</p>
                            <p className="text-xl font-bold text-success">
                              {typeof childAvg === 'number' ? `${childAvg}%` : childAvg}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-background">
                            <p className="text-xs text-muted-foreground mb-1">Grades</p>
                            <p className="text-xl font-bold">{childGrades.length}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-background">
                            <p className="text-xs text-muted-foreground mb-1">Assignments</p>
                            <p className="text-xl font-bold">{completedCount}/{childAssignments.length}</p>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-primary font-medium">
                          View Details →
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Performance;
