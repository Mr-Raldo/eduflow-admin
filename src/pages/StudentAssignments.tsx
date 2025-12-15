import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi, Assignment, extractJoinData } from '@/api/students';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, ExternalLink, Upload, CheckCircle2, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const StudentAssignments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  console.log('[StudentAssignments] User:', user);

  const { data: assignments = [], isLoading, error: assignmentsError } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: async () => {
      console.log('[StudentAssignments] ========== START ==========');
      console.log('[StudentAssignments] Fetching assignments for student:', user?.id);

      const result = await studentsApi.getMyAssignments(user?.id || '');

      console.log('[StudentAssignments] API Response:', result);
      console.log('[StudentAssignments] Number of assignments:', result?.length || 0);

      if (result && result.length > 0) {
        console.log('[StudentAssignments] First assignment:', result[0]);
      }

      console.log('[StudentAssignments] ========== END ==========');
      return result;
    },
    enabled: !!user?.id,
  });

  const { data: subjects = [], error: subjectsError } = useQuery({
    queryKey: ['student-subjects'],
    queryFn: async () => {
      console.log('[StudentAssignments] Fetching subjects for student:', user?.id);
      const result = await studentsApi.getMySubjects(user?.id || '');
      console.log('[StudentAssignments] Subjects fetched:', result);
      return result;
    },
    enabled: !!user?.id,
  });

  // Log errors if any
  if (assignmentsError) console.error('[StudentAssignments] Assignments error:', assignmentsError);
  if (subjectsError) console.error('[StudentAssignments] Subjects error:', subjectsError);

  // Map subject IDs to subject names
  const subjectMap = subjects.reduce((acc: any, subject) => {
    acc[subject.id] = subject.name;
    return acc;
  }, {});

  // Separate assignments into pending and completed
  const now = new Date();
  const pendingAssignments = assignments.filter((a) => {
    if (!a.due_date) return false;
    const dueDate = new Date(a.due_date);
    return !isNaN(dueDate.getTime()) && dueDate > now;
  });
  const completedAssignments = assignments.filter((a) => {
    if (!a.due_date) return true;
    const dueDate = new Date(a.due_date);
    return isNaN(dueDate.getTime()) || dueDate <= now;
  });

  const handleSubmit = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmitDialogOpen(true);
  };

  const handleViewDetails = (assignment: Assignment) => {
    setViewingAssignment(assignment);
    setIsViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsSubmitDialogOpen(false);
    setSelectedAssignment(null);
    setSubmissionUrl('');
    setSubmissionNotes('');
  };

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: { submission_text?: string; file_url: string } }) =>
      studentsApi.submitAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      toast.success('Assignment submitted successfully!');
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit assignment');
    },
  });

  const handleSubmitAssignment = async () => {
    if (!submissionUrl.trim()) {
      toast.error('Please provide a submission URL');
      return;
    }

    if (!selectedAssignment) {
      toast.error('No assignment selected');
      return;
    }

    submitMutation.mutate({
      assignmentId: selectedAssignment.id,
      data: {
        file_url: submissionUrl,
        submission_text: submissionNotes || undefined,
      },
    });
  };

  const columns: Column<Assignment>[] = [
    {
      header: 'Assignment',
      accessor: (row) => (
        <span className="font-medium">{row.name}</span>
      ),
    },
    {
      header: 'Subject',
      accessor: (row) => {
        // Extract nested data safely (PostgREST returns joins as arrays)
        const classData = extractJoinData(row.classes);
        const subjectData = extractJoinData(row.subjects);
        const classSubjectData = extractJoinData(classData?.subjects);

        // Try to get subject from nested data first, fallback to subjectMap
        const subjectName = subjectData?.name ||
                           classSubjectData?.name ||
                           subjectMap[row.subject_id] ||
                           'Unknown Subject';
        const subjectCode = subjectData?.code || classSubjectData?.code;
        return subjectCode ? `${subjectName} (${subjectCode})` : subjectName;
      },
    },
    {
      header: 'Class',
      accessor: (row) => {
        const classData = extractJoinData(row.classes);
        return classData?.code || classData?.academic_level || '-';
      },
    },
    {
      header: 'Assigned Date',
      accessor: (row) => {
        if (!row.date_assigned) return '-';
        try {
          const date = new Date(row.date_assigned);
          return isNaN(date.getTime()) ? '-' : format(date, 'MMM dd, yyyy');
        } catch {
          return '-';
        }
      },
    },
    {
      header: 'Due Date',
      accessor: (row) => {
        if (!row.due_date) return '-';
        try {
          const dueDate = new Date(row.due_date);
          if (isNaN(dueDate.getTime())) return '-';
          const isPast = dueDate < now;
          return (
            <span className={isPast ? 'text-muted-foreground' : 'font-medium'}>
              {format(dueDate, 'MMM dd, yyyy')}
            </span>
          );
        } catch {
          return '-';
        }
      },
    },
    {
      header: 'Weight',
      accessor: (row) => `${row.percentage_of_coursework}%`,
    },
    {
      header: 'Status',
      accessor: (row) => {
        if (!row.due_date) {
          return (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-parent" />
              <span className="text-xs text-parent">Pending</span>
            </div>
          );
        }
        const dueDate = new Date(row.due_date);
        const isPast = !isNaN(dueDate.getTime()) && dueDate < now;
        return (
          <div className="flex items-center gap-2">
            {isPast ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs text-success">Completed</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-parent" />
                <span className="text-xs text-parent">Pending</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(row)}
            className="gap-2 rounded-2xl"
          >
            <Info className="w-4 h-4" />
            Details
          </Button>
          {row.publish_url && (
            <a
              href={row.publish_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="ghost" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                View
              </Button>
            </a>
          )}
          {(() => {
            if (!row.due_date) return null;
            const dueDate = new Date(row.due_date);
            if (isNaN(dueDate.getTime())) return null;
            if (dueDate <= now) return null;
            return (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSubmit(row)}
                className="gap-2 rounded-2xl"
              >
                <Upload className="w-4 h-4" />
                Submit
              </Button>
            );
          })()}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground">View and submit your assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
                <p className="text-3xl font-bold">{assignments.length}</p>
              </div>
              <FileText className="w-10 h-10 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{pendingAssignments.length}</p>
              </div>
              <Clock className="w-10 h-10 text-parent" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedAssignments.length}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <DataTable
        data={assignments}
        columns={columns}
        searchKeys={['name', 'description']}
      />

      {/* Submit Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="rounded-3xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              Submit your work for "{selectedAssignment?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="submission-url">Submission URL *</Label>
              <Input
                id="submission-url"
                type="url"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="rounded-2xl"
              />
              <p className="text-xs text-muted-foreground">
                Provide a link to your Google Drive, Dropbox, or other file sharing service
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Any additional notes or comments..."
                className="rounded-2xl min-h-[100px]"
              />
            </div>

            {selectedAssignment && (
              <div className="bg-muted p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Due: <span className="font-medium text-foreground">
                      {format(new Date(selectedAssignment.due_date), 'MMM dd, yyyy')}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Weight: <span className="font-medium text-foreground">
                      {selectedAssignment.percentage_of_coursework}%
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="rounded-2xl" disabled={submitMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAssignment} className="rounded-2xl" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="rounded-3xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewingAssignment?.name}</DialogTitle>
            <DialogDescription>
              Assignment details and requirements
            </DialogDescription>
          </DialogHeader>

          {viewingAssignment && (
            <div className="space-y-6 py-4">
              {/* Assignment Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">
                    {(() => {
                      const classData = extractJoinData(viewingAssignment.classes);
                      const subjectData = extractJoinData(viewingAssignment.subjects);
                      const classSubjectData = extractJoinData(classData?.subjects);
                      const subjectName = subjectData?.name || classSubjectData?.name || subjectMap[viewingAssignment.subject_id] || 'Unknown Subject';
                      const subjectCode = subjectData?.code || classSubjectData?.code;
                      return subjectCode ? `${subjectName} (${subjectCode})` : subjectName;
                    })()}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">
                    {(() => {
                      const classData = extractJoinData(viewingAssignment.classes);
                      return classData?.code || classData?.academic_level || '-';
                    })()}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Assigned Date</p>
                  <p className="font-medium">
                    {viewingAssignment.date_assigned
                      ? (() => {
                          try {
                            const date = new Date(viewingAssignment.date_assigned);
                            return !isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy') : '-';
                          } catch {
                            return '-';
                          }
                        })()
                      : '-'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium text-primary">
                    {viewingAssignment.due_date
                      ? (() => {
                          try {
                            const date = new Date(viewingAssignment.due_date);
                            return !isNaN(date.getTime()) ? format(date, 'MMM dd, yyyy') : '-';
                          } catch {
                            return '-';
                          }
                        })()
                      : '-'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{viewingAssignment.percentage_of_coursework}% of coursework</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      if (!viewingAssignment.due_date) {
                        return (
                          <>
                            <Clock className="w-4 h-4 text-parent" />
                            <span className="font-medium text-parent">Pending</span>
                          </>
                        );
                      }
                      const dueDate = new Date(viewingAssignment.due_date);
                      const isPast = !isNaN(dueDate.getTime()) && dueDate < now;
                      return isPast ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span className="font-medium text-success">Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-parent" />
                          <span className="font-medium text-parent">Pending</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewingAssignment.description && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Description</p>
                  <div className="bg-muted p-4 rounded-2xl">
                    <p className="text-sm whitespace-pre-wrap">{viewingAssignment.description}</p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {viewingAssignment.instructions && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Instructions</p>
                  <div className="bg-muted p-4 rounded-2xl">
                    <p className="text-sm whitespace-pre-wrap">{viewingAssignment.instructions}</p>
                  </div>
                </div>
              )}

              {/* Assignment URL */}
              {viewingAssignment.publish_url && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Assignment Materials</p>
                  <a
                    href={viewingAssignment.publish_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      View Assignment Materials
                    </span>
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {(() => {
                  if (!viewingAssignment.due_date) return null;
                  const dueDate = new Date(viewingAssignment.due_date);
                  if (isNaN(dueDate.getTime())) return null;
                  if (dueDate <= now) return null;
                  return (
                    <Button
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        handleSubmit(viewingAssignment);
                      }}
                      className="rounded-2xl gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Submit Assignment
                    </Button>
                  );
                })()}
                {viewingAssignment.publish_url && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(viewingAssignment.publish_url, '_blank')}
                    className="rounded-2xl gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Materials
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="rounded-2xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentAssignments;
