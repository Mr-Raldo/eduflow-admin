import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolAdminApi, Subject, CreateSubjectData } from '@/api/school-admin';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
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

const Subjects = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<CreateSubjectData>({
    name: '',
    academic_level: '',
    department: '',
    teacher_in_charge: '',
    school_id: user?.school_id || '',
    department_id: '',
  });

  // Fetch subjects
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', user?.school_id],
    queryFn: () => schoolAdminApi.getSubjects(user?.school_id || ''),
    enabled: !!user?.school_id,
  });

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', user?.school_id],
    queryFn: () => schoolAdminApi.getDepartments(user?.school_id || ''),
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
    mutationFn: schoolAdminApi.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create subject');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSubjectData> }) =>
      schoolAdminApi.updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject updated successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update subject');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: schoolAdminApi.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      toast.success('Subject deleted successfully');
      setIsDeleteOpen(false);
      setDeletingSubject(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    },
  });

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setFormData({
      name: '',
      academic_level: '',
      department: '',
      teacher_in_charge: '',
      school_id: user?.school_id || '',
      department_id: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      academic_level: subject.academic_level,
      department: subject.department || '',
      teacher_in_charge: subject.teacher_in_charge || '',
      school_id: subject.school_id,
      department_id: subject.department_id,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      academic_level: '',
      department: '',
      teacher_in_charge: '',
      school_id: user?.school_id || '',
      department_id: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (subject: Subject) => {
    setDeletingSubject(subject);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingSubject) {
      deleteMutation.mutate(deletingSubject.id);
    }
  };

  const columns: Column<Subject>[] = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Academic Level',
      accessor: 'academic_level',
      sortable: true,
    },
    {
      header: 'Code',
      accessor: 'code',
    },
  ];

  if (!user?.school_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No school context available.</p>
      </div>
    );
  }

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
            <BookOpen className="w-8 h-8 text-parent" />
            Subjects Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage subjects in your school
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl bg-parent hover:bg-parent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Subject
        </Button>
      </div>

      <DataTable
        data={subjects}
        columns={columns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search subjects..."
        searchKeys={['name', 'code']}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? 'Edit Subject' : 'Create New Subject'}
              </DialogTitle>
              <DialogDescription>
                {editingSubject
                  ? 'Update subject information below'
                  : 'Fill in the details to create a new subject'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter subject name"
                  required
                  className="rounded-2xl"
                />
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

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value, department: value })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No departments available
                      </SelectItem>
                    ) : (
                      departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher in Charge</Label>
                <Select
                  value={formData.teacher_in_charge}
                  onValueChange={(value) => setFormData({ ...formData, teacher_in_charge: value })}
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
                className="rounded-2xl bg-parent hover:bg-parent/90"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingSubject
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
              This will permanently delete the subject "{deletingSubject?.name}". This action cannot be undone.
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

export default Subjects;
