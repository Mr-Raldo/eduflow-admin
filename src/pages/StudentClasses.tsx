import { useQuery } from '@tanstack/react-query';
import { studentsApi, extractJoinData } from '@/api/students';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { School, BookOpen, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const StudentClasses = () => {
  const { user } = useAuth();

  console.log('[StudentClasses] User:', user);

  const { data: classes = [], isLoading, error: classesError } = useQuery({
    queryKey: ['student-classes'],
    queryFn: async () => {
      console.log('[StudentClasses] ========== START ==========');
      console.log('[StudentClasses] Fetching classes for student:', user?.id);

      const result = await studentsApi.getMyClasses(user?.id || '');

      console.log('[StudentClasses] API Response:', result);
      console.log('[StudentClasses] Number of classes:', result?.length || 0);

      if (result && result.length > 0) {
        console.log('[StudentClasses] First class structure:', JSON.stringify(result[0], null, 2));
      }

      console.log('[StudentClasses] ========== END ==========');
      return result;
    },
    enabled: !!user?.id,
  });

  const { data: subjects = [], error: subjectsError } = useQuery({
    queryKey: ['student-subjects'],
    queryFn: async () => {
      console.log('[StudentClasses] Fetching subjects for student:', user?.id);
      const result = await studentsApi.getMySubjects(user?.id || '');
      console.log('[StudentClasses] Subjects fetched:', result);
      return result;
    },
    enabled: !!user?.id,
  });

  // Log errors if any
  if (classesError) console.error('[StudentClasses] Classes error:', classesError);
  if (subjectsError) console.error('[StudentClasses] Subjects error:', subjectsError);

  // Map subject IDs to subject names
  const subjectMap = subjects.reduce((acc: any, subject) => {
    acc[subject.id] = subject.name;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Classes</h1>
        <p className="text-muted-foreground">View all your enrolled classes</p>
      </div>

      {isLoading ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">Loading classes...</p>
          </CardContent>
        </Card>
      ) : classes.length === 0 ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8">
            <div className="text-center">
              <School className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
              <p className="text-sm text-muted-foreground">
                You are not enrolled in any classes yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((enrollment: any, index) => {
            console.log(`[StudentClasses] Rendering class ${index + 1}:`, enrollment);

            // Extract nested data safely (PostgREST returns joins as arrays)
            const classData = extractJoinData(enrollment.classes);
            const teacherData = extractJoinData(enrollment.teacher);
            const subjectData = extractJoinData(classData?.subjects);

            const subjectName = subjectData?.name || 'Unknown Subject';
            const subjectCode = subjectData?.code;
            const subjectDescription = subjectData?.description;
            const academicLevel = classData?.academic_level;
            const classCode = classData?.code;
            const teacherName = teacherData
              ? `${teacherData.first_name} ${teacherData.last_name}`
              : null;
            const teacherEmail = teacherData?.email;
            const enrollmentStatus = enrollment.status;
            const enrollmentDate = enrollment.created_at;

            return (
              <Card key={enrollment.id || index} className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-student" />
                      {subjectName}
                    </CardTitle>
                    {enrollmentStatus && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        enrollmentStatus === 'Enrolled' || enrollmentStatus === 'Active' || enrollmentStatus === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {enrollmentStatus}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {subjectCode && (
                      <div className="text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        {subjectCode}
                      </div>
                    )}
                    {classCode && (
                      <div className="text-xs font-mono bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                        Class: {classCode}
                      </div>
                    )}
                  </div>

                  {subjectDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {subjectDescription}
                    </p>
                  )}

                  {academicLevel && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Level: <span className="font-medium text-foreground">{academicLevel}</span>
                      </span>
                    </div>
                  )}

                  {teacherName && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Teacher: <span className="font-medium text-foreground">{teacherName}</span>
                        </span>
                      </div>
                      {teacherEmail && (
                        <p className="text-xs text-muted-foreground ml-6">{teacherEmail}</p>
                      )}
                    </div>
                  )}

                  {enrollmentDate && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Enrolled: {format(new Date(enrollmentDate), 'MMM dd, yyyy')}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentClasses;
