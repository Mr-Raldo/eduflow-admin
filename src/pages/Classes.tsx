import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolAdminApi, Class, CreateClassData } from '@/api/school-admin';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, School } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ACADEMIC_LEVELS = ['Primary', 'Secondary', 'A-Level', 'IB', 'Foundation', 'Undergraduate'];

const Classes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<CreateClassData>({
    teacher_in_charge: '',
    academic_level: '',
    subject_id: '',
  });

  // Fetch classes
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: schoolAdminApi.getClasses,
  });

  // Fetch subjects for dropdown
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', user?.school_id],
    queryFn: () => schoolAdminApi.getSubjects(user?.school_id || ''),
    enabled: !!user?.school_id,
  });

  // Fetch teachers for dropdown
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers', user?.school_id],
    queryFn: () => schoolAdminApi.getSchoolTeachers(user?.school_id || ''),
    enabled: !!user?.school_id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: schoolAdminApi.createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create class');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateClassData> }) =>
      schoolAdminApi.updateClass(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class updated successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update class');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: schoolAdminApi.deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted successfully');
      setIsDeleteOpen(false);
      setDeletingClass(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete class');
    },
  });

  const handleOpenCreate = () => {
    setEditingClass(null);
    setFormData({
      teacher_in_charge: '',
      academic_level: '',
      subject_id: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      teacher_in_charge: classItem.teacher_in_charge,
      academic_level: classItem.academic_level,
      subject_id: classItem.subject_id,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClass(null);
    setFormData({
      teacher_in_charge: '',
      academic_level: '',
      subject_id: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (classItem: Class) => {
    setDeletingClass(classItem);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingClass) {
      deleteMutation.mutate(deletingClass.id);
    }
  };

  const columns: Column<Class>[] = [
    {
      header: 'Academic Level',
      accessor: 'academic_level',
      sortable: true,
    },
    {
      header: 'Subject ID',
      accessor: 'subject_id',
    },
    {
      header: 'Teacher ID',
      accessor: 'teacher_in_charge',
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
            <School className="w-8 h-8 text-student" />
            Classes Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage classes in your school
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl bg-student hover:bg-student/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Class
        </Button>
      </div>

      <DataTable
        data={classes}
        columns={columns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search classes..."
        searchKeys={['academic_level']}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingClass ? 'Edit Class' : 'Create New Class'}
              </DialogTitle>
              <DialogDescription>
                {editingClass
                  ? 'Update class information below'
                  : 'Fill in the details to create a new class'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject_id}
                  onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                  required
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No subjects available
                      </SelectItem>
                    ) : (
                      subjects.map((subject: any) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher in Charge *</Label>
                <Select
                  value={formData.teacher_in_charge}
                  onValueChange={(value) => setFormData({ ...formData, teacher_in_charge: value })}
                  required
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No teachers available
                      </SelectItem>
                    ) : (
                      teachers.map((teacher: any) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.first_name} {teacher.last_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academic_level">Academic Level *</Label>
                <Select
                  value={formData.academic_level}
                  onValueChange={(value) => setFormData({ ...formData, academic_level: value })}
                  required
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseForm}
                className="rounded-2xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="rounded-2xl bg-student hover:bg-student/90"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingClass
                  ? 'Update'
                  : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this class. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="rounded-2xl bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Classes;
