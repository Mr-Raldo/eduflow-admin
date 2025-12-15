import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { parentApi } from '@/api/parent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const ChildDetail = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();

  // Fetch child data
  const { data: children = [], isLoading: loadingChild } = useQuery({
    queryKey: ['parent-children'],
    queryFn: parentApi.getMyChildren,
  });

  const child = children.find((c: any) => c.id === childId);

  // Fetch child performance
  const { data: performance, isLoading: loadingPerformance } = useQuery({
    queryKey: ['child-performance', childId],
    queryFn: () => parentApi.getChildPerformance(childId!),
    enabled: !!childId,
  });

  // Fetch child assignments
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['child-assignments', childId],
    queryFn: () => parentApi.getChildAssignments(childId!),
    enabled: !!childId,
  });

  // Fetch child attendance
  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['child-attendance', childId],
    queryFn: () => parentApi.getChildAttendance(childId!),
    enabled: !!childId,
  });

  const isLoading = loadingChild || loadingPerformance || loadingAssignments || loadingAttendance;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/children')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Children
        </button>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/children')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Children
        </button>
        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-muted-foreground">Child not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grades = performance?.grades || [];
  const avgGrade = grades.length > 0
    ? (grades.reduce((sum: number, grade: any) => sum + (grade.score || 0), 0) / grades.length).toFixed(1)
    : 'N/A';

  const completedAssignments = assignments.filter(
    (a: any) => a.status === 'submitted' || a.status === 'graded'
  ).length;
  const pendingAssignments = assignments.filter((a: any) => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/children')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Children
      </button>

      {/* Child Header */}
      <Card className="rounded-3xl border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-muted">
              <GraduationCap className="w-8 h-8 text-student" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {child.user?.first_name} {child.user?.last_name}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{child.student_number}</Badge>
                </div>
                {child.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {child.user.email}
                  </div>
                )}
                {child.class && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {child.class.name} • {child.class.level}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Grade
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {typeof avgGrade === 'number' ? `${avgGrade}%` : avgGrade}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Grades
            </CardTitle>
            <FileText className="w-5 h-5 text-super-admin" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{grades.length}</div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assignments
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-student" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedAssignments}/{assignments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attendance
            </CardTitle>
            <Calendar className="w-5 h-5 text-parent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {attendance?.summary?.percentage || '0'}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {attendance?.summary?.presentDays || 0} / {attendance?.summary?.totalDays || 0} days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Academic Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {grades.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No grades available yet</p>
              ) : (
                <div className="space-y-3">
                  {grades.map((grade: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-muted/50 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{grade.subject || 'Subject'}</p>
                        <p className="text-sm text-muted-foreground">
                          {grade.assessment_type || 'Assessment'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{grade.score}%</p>
                        <p className="text-xs text-muted-foreground">
                          {grade.date ? format(new Date(grade.date), 'MMM dd, yyyy') : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-student" />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No assignments yet</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((submission: any) => {
                    const assignment = submission.assignment;
                    const status = submission.status;
                    const isCompleted = status === 'submitted' || status === 'graded';
                    const isPending = status === 'pending';

                    return (
                      <div
                        key={submission.id}
                        className="p-4 rounded-2xl bg-muted/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">{assignment?.title || 'Assignment'}</h4>
                            <p className="text-sm text-muted-foreground">
                              {assignment?.subject?.name || 'Subject'}
                            </p>
                          </div>
                          {isCompleted && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                          {isPending && (
                            <Clock className="w-5 h-5 text-warning" />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Due: {assignment?.due_date ? format(new Date(assignment.due_date), 'MMM dd, yyyy') : 'N/A'}
                          </div>
                          {submission.marks_obtained !== null && submission.marks_obtained !== undefined && (
                            <div className="font-medium">
                              Score: {submission.marks_obtained}/{assignment?.total_marks || 0}
                            </div>
                          )}
                        </div>
                        <Badge variant={isCompleted ? 'default' : 'secondary'} className="mt-2">
                          {status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card className="rounded-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-parent" />
                Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendance?.records && attendance.records.length > 0 ? (
                <div className="space-y-3">
                  {attendance.records.slice(0, 10).map((record: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 rounded-2xl bg-muted/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">
                          {record.date ? format(new Date(record.date), 'EEEE, MMM dd, yyyy') : 'Date'}
                        </p>
                        <p className="text-sm text-muted-foreground">{record.class || 'Class'}</p>
                      </div>
                      {record.status === 'present' ? (
                        <Badge variant="default" className="bg-success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Present
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Absent
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No attendance records available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChildDetail;
