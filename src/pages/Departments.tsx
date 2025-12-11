<<<<<<< HEAD
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolAdminApi, Department, CreateDepartmentData } from '@/api/school-admin';
import { schoolsApi } from '@/api/schools';
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

const Departments = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch the school info to get school_id
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: schoolsApi.getAll,
  });

  const schoolId = schools[0]?.id;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<CreateDepartmentData>({
    name: '',
    description: '',
    hod_id: '',
  });

  // Fetch departments for the school
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments', schoolId],
    queryFn: () => schoolAdminApi.getDepartments(schoolId || ''),
    enabled: !!schoolId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentData) => {
      console.log('🔵 [Department Create] Starting mutation with data:', data);
      console.log('🔵 [Department Create] User context:', {
        userId: user?.id,
        schoolId: schoolId,
        role: user?.role
      });
      return schoolAdminApi.createDepartment(data);
    },
    onSuccess: (response) => {
      console.log('✅ [Department Create] Success! Response:', response);
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('❌ [Department Create] Error:', error);
      console.error('❌ [Department Create] Error response:', error.response);
      console.error('❌ [Department Create] Error data:', error.response?.data);
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
      hod_id: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      hod_id: department.hod_id || '',
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      hod_id: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 [Department Submit] Form submitted');
    console.log('📤 [Department Submit] Form data:', formData);
    console.log('📤 [Department Submit] Editing department:', editingDepartment);

    if (editingDepartment) {
      console.log('📤 [Department Submit] Updating existing department:', editingDepartment.id);
      updateMutation.mutate({ id: editingDepartment.id, data: formData });
    } else {
      console.log('📤 [Department Submit] Creating new department');
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
      header: 'Head of Department',
      accessor: (row) => row.hod ? `${row.hod.first_name} ${row.hod.last_name}` : 'Not Assigned',
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

=======
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2 } from 'lucide-react';

const Departments = () => {
  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('departments').select('*, schools(name)').order('name');
      if (error) throw error;
      return data;
    },
  });

>>>>>>> 76f84c8f94dea8c713170403af83ef2e0423f5db
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Building2 className="w-8 h-8 text-super-admin" />
          Departments
        </h1>
        <p className="text-muted-foreground">View departments in the system</p>
      </div>

<<<<<<< HEAD
      <DataTable
        data={departments}
        columns={columns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search departments..."
        searchKeys={['name', 'description']}
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
                <Label htmlFor="hod_id">Head of Department (Optional)</Label>
                <Input
                  id="hod_id"
                  value={formData.hod_id}
                  onChange={(e) => setFormData({ ...formData, hod_id: e.target.value })}
                  placeholder="Enter teacher ID (optional)"
                  className="rounded-2xl"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank if no HOD assigned yet
                </p>
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
=======
      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader><CardTitle>All Departments</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : departments.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No departments found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>School</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.description || '-'}</TableCell>
                    <TableCell>{d.schools?.name || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
>>>>>>> 76f84c8f94dea8c713170403af83ef2e0423f5db
    </div>
  );
};

export default Departments;
