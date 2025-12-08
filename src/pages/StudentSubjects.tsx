import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentsApi, Subject } from '@/api/students';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Download, ExternalLink, Video, Image, File } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const StudentSubjects = () => {
  const { user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  console.log('[StudentSubjects] User:', user);

  const { data: subjects = [], isLoading: loadingSubjects, error: subjectsError } = useQuery({
    queryKey: ['student-subjects', user?.id],
    queryFn: async () => {
      console.log('[StudentSubjects] Fetching subjects for student:', user?.id);
      const result = await studentsApi.getMySubjects(user?.id || '');
      console.log('[StudentSubjects] Subjects fetched:', result);
      return result;
    },
    enabled: !!user?.id,
  });

  // Select first subject by default
  const activeSubject = selectedSubject || subjects[0];

  console.log('[StudentSubjects] Active subject:', activeSubject);

  const { data: resources = [], isLoading: loadingResources, error: resourcesError } = useQuery({
    queryKey: ['subject-resources', activeSubject?.id],
    queryFn: async () => {
      console.log('[StudentSubjects] Fetching resources for subject:', activeSubject?.id);
      const result = await studentsApi.getResourcesForSubject(activeSubject?.id || '');
      console.log('[StudentSubjects] Resources fetched:', result);
      return result;
    },
    enabled: !!activeSubject?.id,
  });

  const { data: syllabi = [], isLoading: loadingSyllabi, error: syllabiError } = useQuery({
    queryKey: ['subject-syllabi', activeSubject?.id],
    queryFn: async () => {
      console.log('[StudentSubjects] Fetching syllabi for subject:', activeSubject?.id);
      const result = await studentsApi.getSyllabiForSubject(activeSubject?.id || '');
      console.log('[StudentSubjects] Syllabi fetched:', result);
      return result;
    },
    enabled: !!activeSubject?.id,
  });

  // Log errors if any
  if (subjectsError) console.error('[StudentSubjects] Subjects error:', subjectsError);
  if (resourcesError) console.error('[StudentSubjects] Resources error:', resourcesError);
  if (syllabiError) console.error('[StudentSubjects] Syllabi error:', syllabiError);

  // Group resources by category
  const resourcesByCategory = resources.reduce((acc: any, resource) => {
    const category = resource.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(resource);
    return acc;
  }, {});

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'document':
        return FileText;
      case 'video':
        return Video;
      case 'image':
        return Image;
      default:
        return File;
    }
  };

  const getResourceIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'document':
        return 'text-parent';
      case 'video':
        return 'text-student';
      case 'image':
        return 'text-super-admin';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Subjects</h1>
        <p className="text-muted-foreground">
          Access resources, syllabi, and notes for your subjects
        </p>
      </div>

      {loadingSubjects ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">Loading subjects...</p>
          </CardContent>
        </Card>
      ) : subjects.length === 0 ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Subjects Found</h3>
              <p className="text-sm text-muted-foreground">
                You don't have any subjects assigned yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Subject Selector */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Select Subject</h3>
            {subjects.map((subject) => (
              <Card
                key={subject.id}
                className={`rounded-2xl cursor-pointer transition-all ${
                  activeSubject?.id === subject.id
                    ? 'border-student shadow-md'
                    : 'border-none shadow-sm hover:shadow-md'
                }`}
                onClick={() => setSelectedSubject(subject)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-student flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{subject.name}</p>
                      {subject.code && (
                        <p className="text-xs text-muted-foreground">{subject.code}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Subject Details */}
          {activeSubject && (
            <div className="space-y-6">
              {/* Subject Header */}
              <Card className="rounded-3xl border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-student" />
                    {activeSubject.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeSubject.description && (
                    <p className="text-muted-foreground">{activeSubject.description}</p>
                  )}
                  {activeSubject.code && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Subject Code: {activeSubject.code}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Resources and Syllabi */}
              <Tabs defaultValue="resources" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-2xl">
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="syllabi">Syllabi</TabsTrigger>
                  <TabsTrigger value="grades">Grades</TabsTrigger>
                </TabsList>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-4 mt-6">
                  {loadingResources ? (
                    <Card className="rounded-3xl">
                      <CardContent className="p-8">
                        <p className="text-center text-muted-foreground">Loading resources...</p>
                      </CardContent>
                    </Card>
                  ) : resources.length === 0 ? (
                    <Card className="rounded-3xl">
                      <CardContent className="p-8">
                        <p className="text-center text-muted-foreground">
                          No resources available for this subject.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    Object.entries(resourcesByCategory).map(([category, categoryResources]: [string, any]) => (
                      <Card key={category} className="rounded-3xl border-none shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg">{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3 md:grid-cols-2">
                            {categoryResources.map((resource: any) => {
                              const Icon = getResourceIcon(resource.type);
                              const iconColor = getResourceIconColor(resource.type);

                              return (
                                <div
                                  key={resource.id}
                                  className="flex items-start gap-3 p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                                >
                                  <Icon className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium mb-1 truncate">{resource.name}</p>
                                    {resource.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                        {resource.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        {resource.size_mb} MB
                                      </span>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <span className="text-xs text-muted-foreground">{resource.type}</span>
                                    </div>
                                  </div>
                                  <a
                                    href={resource.publish_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0"
                                  >
                                    <Button variant="ghost" size="sm" className="gap-2">
                                      <ExternalLink className="w-4 h-4" />
                                    </Button>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* Syllabi Tab */}
                <TabsContent value="syllabi" className="space-y-4 mt-6">
                  {loadingSyllabi ? (
                    <Card className="rounded-3xl">
                      <CardContent className="p-8">
                        <p className="text-center text-muted-foreground">Loading syllabi...</p>
                      </CardContent>
                    </Card>
                  ) : syllabi.length === 0 ? (
                    <Card className="rounded-3xl">
                      <CardContent className="p-8">
                        <p className="text-center text-muted-foreground">
                          No syllabi available for this subject.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {syllabi.map((syllabus) => (
                        <Card key={syllabus.id} className="rounded-3xl border-none shadow-sm">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1">
                                <FileText className="w-6 h-6 text-parent flex-shrink-0 mt-1" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold mb-1">{syllabus.name}</h4>
                                  {syllabus.description && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {syllabus.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{syllabus.academic_year}</span>
                                    <span>•</span>
                                    <span>{syllabus.file_size_mb} MB</span>
                                    <span>•</span>
                                    <span className="capitalize">{syllabus.status}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <a
                                  href={syllabus.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" size="sm" className="gap-2 rounded-2xl">
                                    <ExternalLink className="w-4 h-4" />
                                    View
                                  </Button>
                                </a>
                                <a href={syllabus.file_url} download>
                                  <Button variant="default" size="sm" className="gap-2 rounded-2xl">
                                    <Download className="w-4 h-4" />
                                    Download
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Grades Tab */}
                <TabsContent value="grades" className="space-y-4 mt-6">
                  <Card className="rounded-3xl">
                    <CardContent className="p-8">
                      <p className="text-center text-muted-foreground">
                        Grades functionality coming soon...
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentSubjects;
