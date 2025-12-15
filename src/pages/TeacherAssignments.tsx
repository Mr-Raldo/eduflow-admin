import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolAdminApi } from '@/api/school-admin';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Users, BookOpen, School } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TeacherAssignments = () => {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [deletingAssignment, setDeletingAssignment] = useState<any>(null);

  // Fetch all classes
  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['classes'],
    queryFn: schoolAdminApi.getClasses,
  });

  // Fetch all teachers
  const { data: teachers = [], isLoading: loadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => schoolAdminApi.getSchoolTeachers(''),
  });

  // Fetch all subjects
  const { data: subjects = [], isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => schoolAdminApi.getSubjects(''),
  });

  // Fetch assignments for selected class
  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['class-subjects', selectedClassId],
    queryFn: () => schoolAdminApi.getClassSubjects(selectedClassId),
    enabled: !!selectedClassId,
  });

  // Create assignment mutation
  const assignMutation = useMutation({
    mutationFn: schoolAdminApi.assignTeacherToSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects', selectedClassId] });
      toast.success('Teacher assigned successfully');
      handleCloseAssignDialog();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to assign teacher');
    },
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: schoolAdminApi.removeTeacherAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-subjects', selectedClassId] });
      toast.success('Assignment removed successfully');
      setIsDeleteDialogOpen(false);
      setDeletingAssignment(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to remove assignment');
    },
  });

  const handleOpenAssignDialog = () => {
    if (!selectedClassId) {
      toast.error('Please select a class first');
      return;
    }
    setSelectedTeacherId('');
    setSelectedSubjectId('');
    setIsAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setIsAssignDialogOpen(false);
    setSelectedTeacherId('');
    setSelectedSubjectId('');
  };

  const handleAssign = () => {
    if (!selectedTeacherId || !selectedSubjectId) {
      toast.error('Please select both teacher and subject');
      return;
    }

    assignMutation.mutate({
      teacher_id: selectedTeacherId,
      subject_id: selectedSubjectId,
      class_id: selectedClassId,
    });
  };

  const handleDelete = (assignment: any) => {
    setDeletingAssignment(assignment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingAssignment) {
      deleteMutation.mutate(deletingAssignment.id);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Subject',
      accessor: (row) => row.subject?.name || 'Unknown',
      sortable: true,
    },
    {
      header: 'Code',
      accessor: (row) => row.subject?.code || '-',
    },
    {
      header: 'Department',
      accessor: (row) => row.subject?.department?.name || '-',
    },
    {
      header: 'Teacher',
      accessor: (row) => {
        const teacher = row.teacher;
        return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unassigned';
      },
      sortable: true,
    },
    {
      header: 'Email',
      accessor: (row) => row.teacher?.email || '-',
    },
  ];

  const selectedClass = classes.find((c: any) => c.id === selectedClassId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-teacher" />
            Teacher Assignments
          </h1>
          <p className="text-muted-foreground mt-1">
            Assign teachers to teach subjects in classes
          </p>
        </div>
      </div>

      {/* Class Selection Card */}
      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-5 h-5 text-super-admin" />
            Select Class
          </CardTitle>
          <CardDescription>
            Choose a class to manage its subject-teacher assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="class">Class</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="rounded-2xl mt-2">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {loadingClasses ? (
                    <SelectItem value="loading" disabled>
                      Loading classes...
                    </SelectItem>
                  ) : classes.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No classes available
                    </SelectItem>
                  ) : (
                    classes.map((classItem: any) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name} {classItem.level && `- ${classItem.level}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleOpenAssignDialog}
              disabled={!selectedClassId}
              className="rounded-2xl bg-teacher hover:bg-teacher/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign Teacher
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignments Table */}
      {selectedClassId && (
        <Card className="rounded-3xl border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-super-admin" />
              Subject Assignments for {selectedClass?.name}
            </CardTitle>
            <CardDescription>
              {assignments.length} subject(s) assigned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAssignments ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No subjects assigned to this class yet.
                </p>
                <Button
                  onClick={handleOpenAssignDialog}
                  variant="outline"
                  className="mt-4 rounded-2xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Assign First Subject
                </Button>
              </div>
            ) : (
              <DataTable
                data={assignments}
                columns={columns}
                onDelete={handleDelete}
                searchPlaceholder="Search assignments..."
                searchKeys={['subject.name', 'subject.code', 'teacher.first_name', 'teacher.last_name']}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Assign Teacher to Subject</DialogTitle>
            <DialogDescription>
              Assign a teacher to teach a subject in {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {loadingSubjects ? (
                    <SelectItem value="loading" disabled>
                      Loading subjects...
                    </SelectItem>
                  ) : subjects.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No subjects available
                    </SelectItem>
                  ) : (
                    subjects.map((subject: any) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher *</Label>
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {loadingTeachers ? (
                    <SelectItem value="loading" disabled>
                      Loading teachers...
                    </SelectItem>
                  ) : teachers.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No teachers available
                    </SelectItem>
                  ) : (
                    teachers.map((teacher: any) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name} ({teacher.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseAssignDialog}
              className="rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assignMutation.isPending || !selectedTeacherId || !selectedSubjectId}
              className="rounded-2xl bg-teacher hover:bg-teacher/90"
            >
              {assignMutation.isPending ? 'Assigning...' : 'Assign Teacher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the assignment of{' '}
              <strong>
                {deletingAssignment?.teacher?.first_name} {deletingAssignment?.teacher?.last_name}
              </strong>{' '}
              from teaching{' '}
              <strong>{deletingAssignment?.subject?.name}</strong> in{' '}
              <strong>{selectedClass?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-2xl bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherAssignments;
