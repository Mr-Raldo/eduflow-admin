import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { administratorsApi, Administrator, CreateAdministratorData } from '@/api/administrators';
import { schoolsApi } from '@/api/schools';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { handleError, handleSuccess } from '@/lib/errorHandler';
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

const Administrators = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<Administrator | null>(null);
  const [formData, setFormData] = useState<CreateAdministratorData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const { data: administrators = [], isLoading } = useQuery({
    queryKey: ['administrators'],
    queryFn: administratorsApi.getAll,
  });

  // Fetch schools for dropdown
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: schoolsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateAdministratorData) => {
      // Create the administrator account
      const admin = await administratorsApi.create(data);
      console.log('Administrator created:', admin);
      return admin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administrators'] });
      handleSuccess('Administrator created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      handleError(error, 'Failed to create administrator');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: administratorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['administrators'] });
      handleSuccess('Administrator deleted successfully');
      setIsDeleteOpen(false);
      setDeletingAdmin(null);
    },
    onError: (error: any) => {
      handleError(error, 'Failed to delete administrator');
    },
  });

  const handleOpenCreate = () => {
    setFormData({ email: '', password: '', first_name: '', last_name: '', phone: '' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setFormData({ email: '', password: '', first_name: '', last_name: '', phone: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (admin: Administrator) => {
    setDeletingAdmin(admin);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingAdmin) {
      deleteMutation.mutate(deletingAdmin.id);
    }
  };

  const columns: Column<Administrator>[] = [
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
      header: 'Phone',
      accessor: 'phone',
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
            <Users className="w-8 h-8 text-super-admin" />
            School Administrators
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage school administrator accounts
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl bg-super-admin hover:bg-super-admin/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Administrator
        </Button>
      </div>

      <DataTable
        data={administrators}
        columns={columns}
        onDelete={handleDelete}
        searchPlaceholder="Search administrators..."
        searchKeys={['first_name', 'last_name', 'email']}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create New Administrator</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new administrator account
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {schools.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    value={schools[0]?.school_name || 'No school configured'}
                    disabled
                    className="rounded-2xl bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    This administrator will manage: {schools[0]?.school_name}
                  </p>
                </div>
              )}

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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                disabled={createMutation.isPending}
                className="rounded-2xl bg-super-admin hover:bg-super-admin/90"
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
              This will permanently delete the administrator "{deletingAdmin?.first_name} {deletingAdmin?.last_name}".
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

export default Administrators;
