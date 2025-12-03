import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolsApi, School, CreateSchoolData } from '@/api/schools';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, School as SchoolIcon } from 'lucide-react';
import { toast } from 'sonner';
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

const Schools = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState<CreateSchoolData>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  // Fetch schools
  const { data: schools = [], isLoading } = useQuery({
    queryKey: ['schools'],
    queryFn: schoolsApi.getAll,
  });

  // Create school mutation
  const createMutation = useMutation({
    mutationFn: schoolsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create school');
    },
  });

  // Update school mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSchoolData> }) =>
      schoolsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School updated successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update school');
    },
  });

  // Delete school mutation
  const deleteMutation = useMutation({
    mutationFn: schoolsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School deleted successfully');
      setIsDeleteOpen(false);
      setDeletingSchool(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete school');
    },
  });

  const handleOpenCreate = () => {
    setEditingSchool(null);
    setFormData({ name: '', address: '', phone: '', email: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSchool(null);
    setFormData({ name: '', address: '', phone: '', email: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSchool) {
      updateMutation.mutate({ id: editingSchool.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (school: School) => {
    setDeletingSchool(school);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingSchool) {
      deleteMutation.mutate(deletingSchool.id);
    }
  };

  const columns: Column<School>[] = [
    {
      header: 'Name',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
    },
    {
      header: 'Phone',
      accessor: 'phone',
    },
    {
      header: 'Address',
      accessor: 'address',
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <SchoolIcon className="w-8 h-8 text-super-admin" />
            Schools Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all schools in the system
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl bg-super-admin hover:bg-super-admin/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create School
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={schools}
        columns={columns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search schools..."
        searchKeys={['name', 'email', 'address']}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingSchool ? 'Edit School' : 'Create New School'}
              </DialogTitle>
              <DialogDescription>
                {editingSchool
                  ? 'Update school information below'
                  : 'Fill in the details to create a new school'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">School Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter school name"
                  required
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="school@example.com"
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
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter school address"
                  className="rounded-2xl"
                />
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
                  : editingSchool
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
              This will permanently delete the school "{deletingSchool?.name}". This action cannot be undone.
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

export default Schools;
