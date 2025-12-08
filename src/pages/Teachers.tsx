import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolAdminApi } from '@/api/school-admin';
import { schoolsApi } from '@/api/schools';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Teacher {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  department_id?: string;
  department?: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface CreateTeacherData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  department_id?: string;
  subject_id?: string;
}
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Teachers = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<CreateTeacherData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    department_id: '',
    subject_id: '',
  });

  // Fetch the school info to get school_id
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: schoolsApi.getAll,
  });

  const schoolId = schools[0]?.id;

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: () => schoolAdminApi.getSchoolTeachers(schoolId || ''),
    enabled: !!schoolId,
  });

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', schoolId],
    queryFn: () => schoolAdminApi.getDepartments(schoolId || ''),
    enabled: !!schoolId,
  });

  // Fetch subjects for dropdown
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => schoolAdminApi.getSubjects(schoolId || ''),
    enabled: !!schoolId,
  });

  const createMutation = useMutation({
    mutationFn: schoolAdminApi.createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create teacher');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: schoolAdminApi.deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher deleted successfully');
      setIsDeleteOpen(false);
      setDeletingTeacher(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete teacher');
    },
  });

  const handleOpenCreate = () => {
    setFormData({ email: '', password: '', first_name: '', last_name: '', department_id: '', subject_id: '' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData({ email: '', password: '', first_name: '', last_name: '', department_id: '', subject_id: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (teacher: Teacher) => {
    setDeletingTeacher(teacher);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTeacher) {
      deleteMutation.mutate(deletingTeacher.id);
    }
  };

  const columns: Column<Teacher>[] = [
    {
      header: 'Name',
      accessor: (row) => `${row.first_name} ${row.last_name}`,
      sortable: true,
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
    },
    {
      header: 'Department',
      accessor: (row) => row.department?.name || 'Not Assigned',
    },
    {
      header: 'Created',
      accessor: (row) => new Date(row.created_at).toLocaleDateString(),
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
            <GraduationCap className="w-8 h-8 text-teacher" />
            Teachers Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage teachers in your school
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl bg-teacher hover:bg-teacher/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Teacher
        </Button>
      </div>

      <DataTable
        data={teachers}
        columns={columns}
        onDelete={handleDelete}
        searchPlaceholder="Search teachers..."
        searchKeys={['first_name', 'last_name', 'email']}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Teacher</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new teacher account
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Select
                  value={formData.department_id || undefined}
                  onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select department (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept: any) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject of Teaching (Optional)</Label>
                <Select
                  value={formData.subject_id || undefined}
                  onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select subject (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject: any) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
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
                disabled={createMutation.isPending}
                className="rounded-2xl bg-teacher hover:bg-teacher/90"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the teacher "{deletingTeacher?.first_name} {deletingTeacher?.last_name}".
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

export default Teachers;
