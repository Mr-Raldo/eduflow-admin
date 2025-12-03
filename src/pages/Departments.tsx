import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolAdminApi, Department, CreateDepartmentData } from '@/api/school-admin';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
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

const ACADEMIC_LEVELS = ['Primary', 'Secondary', 'A-Level', 'IB', 'Foundation', 'Undergraduate'];

const Departments = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<CreateDepartmentData>({
    name: '',
    description: '',
    phone: '',
    email: '',
    academic_levels: [],
    school_id: user?.school_id || '',
  });

  // Fetch departments for the school
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments', user?.school_id],
    queryFn: () => schoolAdminApi.getDepartments(user?.school_id || ''),
    enabled: !!user?.school_id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: schoolAdminApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create department');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDepartmentData> }) =>
      schoolAdminApi.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update department');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: schoolAdminApi.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted successfully');
      setIsDeleteOpen(false);
      setDeletingDepartment(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    },
  });

  const handleOpenCreate = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      phone: '',
      email: '',
      academic_levels: [],
      school_id: user?.school_id || '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      phone: department.phone || '',
      email: department.email || '',
      academic_levels: department.academic_levels || [],
      school_id: department.school_id,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      phone: '',
      email: '',
      academic_levels: [],
      school_id: user?.school_id || '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (department: Department) => {
    setDeletingDepartment(department);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingDepartment) {
      deleteMutation.mutate(deletingDepartment.id);
    }
  };

  const toggleAcademicLevel = (level: string) => {
    setFormData(prev => ({
      ...prev,
      academic_levels: prev.academic_levels?.includes(level)
        ? prev.academic_levels.filter(l => l !== level)
        : [...(prev.academic_levels || []), level],
    }));
  };

  const columns: Column<Department>[] = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Description',
      accessor: 'description',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Phone',
      accessor: 'phone',
    },
    {
      header: 'Academic Levels',
      accessor: (row) => row.academic_levels?.join(', ') || 'N/A',
    },
  ];

  if (!user?.school_id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No school context available. Please contact administrator.</p>
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
            <Building2 className="w-8 h-8 text-super-admin" />
            Departments Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage departments in your school
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl bg-super-admin hover:bg-super-admin/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Department
        </Button>
      </div>

      <DataTable
        data={departments}
        columns={columns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search departments..."
        searchKeys={['name', 'description', 'email']}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? 'Edit Department' : 'Create New Department'}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment
                  ? 'Update department information below'
                  : 'Fill in the details to create a new department'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter department name"
                  required
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter department description"
                  className="rounded-2xl"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="department@example.com"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1234567890"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Academic Levels</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ACADEMIC_LEVELS.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`level-${level}`}
                        checked={formData.academic_levels?.includes(level)}
                        onChange={() => toggleAcademicLevel(level)}
                        className="rounded"
                      />
                      <label htmlFor={`level-${level}`} className="text-sm">
                        {level}
                      </label>
                    </div>
                  ))}
                </div>
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
                className="rounded-2xl bg-super-admin hover:bg-super-admin/90"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingDepartment
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
              This will permanently delete the department "{deletingDepartment?.name}". This action cannot be undone.
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

export default Departments;
