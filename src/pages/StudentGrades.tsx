import { useQuery } from '@tanstack/react-query';
import { studentsApi } from '@/api/students';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Award, TrendingUp, Target, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  assignment_id?: string;
  assessment_type: string;
  assessment_name: string;
  marks_obtained: number;
  total_marks: number;
  grade_letter?: string;
  remarks?: string;
  recorded_by: string;
  created_at: string;
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  recorded_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

const StudentGrades = () => {
  const { user } = useAuth();

  console.log('[StudentGrades] User:', user);

  const { data: grades = [], isLoading, error } = useQuery({
    queryKey: ['student-grades'],
    queryFn: async () => {
      console.log('[StudentGrades] ========== START ==========');
      console.log('[StudentGrades] Fetching grades for student:', user?.id);

      const result = await studentsApi.getMyGrades(user?.id || '');

      console.log('[StudentGrades] API Response:', result);
      console.log('[StudentGrades] Number of grades:', result?.length || 0);

      if (result && result.length > 0) {
        console.log('[StudentGrades] First grade:', result[0]);
      }

      console.log('[StudentGrades] ========== END ==========');
      return result;
    },
    enabled: !!user?.id,
  });

  if (error) console.error('[StudentGrades] Error:', error);

  // Calculate statistics
  const totalGrades = grades.length;
  const averagePercentage = totalGrades > 0
    ? grades.reduce((sum, g) => sum + (g.marks_obtained / g.total_marks) * 100, 0) / totalGrades
    : 0;
  const highestPercentage = totalGrades > 0
    ? Math.max(...grades.map(g => (g.marks_obtained / g.total_marks) * 100))
    : 0;
  const passedCount = grades.filter(g => (g.marks_obtained / g.total_marks) * 100 >= 50).length;

  const columns: Column<Grade>[] = [
    {
      header: 'Subject',
      accessor: (row) => {
        const subjectData = Array.isArray(row.subject) ? row.subject[0] : row.subject;
        const subjectName = subjectData?.name || 'Unknown Subject';
        const subjectCode = subjectData?.code;
        return subjectCode ? `${subjectName} (${subjectCode})` : subjectName;
      },
    },
    {
      header: 'Assessment',
      accessor: (row) => (
        <div>
          <p className="font-medium">{row.assessment_name}</p>
          <p className="text-xs text-muted-foreground capitalize">{row.assessment_type}</p>
        </div>
      ),
    },
    {
      header: 'Score',
      accessor: (row) => (
        <div className="font-medium">
          {row.marks_obtained} / {row.total_marks}
        </div>
      ),
    },
    {
      header: 'Percentage',
      accessor: (row) => {
        const percentage = (row.marks_obtained / row.total_marks) * 100;
        const isPassing = percentage >= 50;
        return (
          <span className={isPassing ? 'text-success font-medium' : 'text-destructive font-medium'}>
            {percentage.toFixed(1)}%
          </span>
        );
      },
    },
    {
      header: 'Grade',
      accessor: (row) => {
        const percentage = (row.marks_obtained / row.total_marks) * 100;
        let grade = row.grade_letter;

        // Auto-calculate grade if not provided
        if (!grade) {
          if (percentage >= 90) grade = 'A+';
          else if (percentage >= 80) grade = 'A';
          else if (percentage >= 70) grade = 'B';
          else if (percentage >= 60) grade = 'C';
          else if (percentage >= 50) grade = 'D';
          else grade = 'F';
        }

        const isGood = percentage >= 70;
        return (
          <span className={`font-bold ${isGood ? 'text-success' : percentage >= 50 ? 'text-parent' : 'text-destructive'}`}>
            {grade}
          </span>
        );
      },
    },
    {
      header: 'Remarks',
      accessor: (row) => row.remarks || '-',
    },
    {
      header: 'Recorded By',
      accessor: (row) => {
        const recordedBy = Array.isArray(row.recorded_by_user) ? row.recorded_by_user[0] : row.recorded_by_user;
        return recordedBy
          ? `${recordedBy.first_name} ${recordedBy.last_name}`
          : '-';
      },
    },
    {
      header: 'Date',
      accessor: (row) => format(new Date(row.created_at), 'MMM dd, yyyy'),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Grades</h1>
        <p className="text-muted-foreground">View your academic performance and grades</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessments</p>
                <p className="text-3xl font-bold">{totalGrades}</p>
              </div>
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-3xl font-bold">{averagePercentage.toFixed(1)}%</p>
              </div>
              <Target className="w-10 h-10 text-student" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highest Score</p>
                <p className="text-3xl font-bold">{highestPercentage.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-3xl font-bold">{passedCount}/{totalGrades}</p>
              </div>
              <Award className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <DataTable
        data={grades}
        columns={columns}
        isLoading={isLoading}
        icon={Award}
        emptyMessage="No grades recorded yet"
        searchKeys={['assessment_name', 'assessment_type']}
      />
    </div>
  );
};

export default StudentGrades;
