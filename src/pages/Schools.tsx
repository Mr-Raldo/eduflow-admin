import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolsApi, School, CreateSchoolData } from '@/api/schools';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, School as SchoolIcon } from 'lucide-react';
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);
  const [formData, setFormData] = useState<CreateSchoolData>({
    school_name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    current_term: '',
    term_start_date: '',
    term_end_date: '',
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
      toast.success('School information saved successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save school information');
    },
  });

  // Update school mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSchoolData> }) =>
      schoolsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School information updated successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update school information');
    },
  });

  // Delete school mutation (not used, but kept for compatibility)
  const deleteMutation = useMutation({
    mutationFn: schoolsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] });
      toast.success('School information deleted');
      setIsDeleteOpen(false);
      setDeletingSchool(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Cannot delete school information');
    },
  });

  const handleOpenCreate = () => {
    setEditingSchool(null);
    setFormData({
      school_name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      current_term: '',
      term_start_date: '',
      term_end_date: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (school: School) => {
    setEditingSchool(school);
    setFormData({
      school_name: school.school_name,
      address: school.address || '',
      phone: school.phone || '',
      email: school.email || '',
      website: school.website || '',
      current_term: school.current_term || '',
      term_start_date: school.term_start_date || '',
      term_end_date: school.term_end_date || '',
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSchool(null);
    setFormData({
      school_name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      current_term: '',
      term_start_date: '',
      term_end_date: '',
    });
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
      header: 'School Name',
      accessor: 'school_name',
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
      header: 'Current Term',
      accessor: 'current_term',
    },
    {
      header: 'Updated',
      accessor: (row) => new Date(row.updated_at).toLocaleDateString(),
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
            School Information
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your school's information and settings
          </p>
        </div>
        {schools.length === 0 && (
          <Button
            onClick={handleOpenCreate}
            className="rounded-2xl bg-super-admin hover:bg-super-admin/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Setup School Info
          </Button>
        )}
      </div>

      {/* Table */}
      <DataTable
        data={schools}
        columns={columns}
        onEdit={handleOpenEdit}
        onDelete={undefined}
        searchPlaceholder="Search school information..."
        searchKeys={['school_name', 'email', 'address']}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingSchool ? 'Edit School Information' : 'Setup School Information'}
              </DialogTitle>
              <DialogDescription>
                {editingSchool
                  ? 'Update your school information below'
                  : 'Fill in your school details'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="school_name">School Name *</Label>
                <Input
                  id="school_name"
                  value={formData.school_name}
                  onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
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

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://www.example.com"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_term">Current Term</Label>
                <Input
                  id="current_term"
                  value={formData.current_term}
                  onChange={(e) => setFormData({ ...formData, current_term: e.target.value })}
                  placeholder="Term 1"
                  className="rounded-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="term_start_date">Term Start Date</Label>
                  <Input
                    id="term_start_date"
                    type="date"
                    value={formData.term_start_date}
                    onChange={(e) => setFormData({ ...formData, term_start_date: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term_end_date">Term End Date</Label>
                  <Input
                    id="term_end_date"
                    type="date"
                    value={formData.term_end_date}
                    onChange={(e) => setFormData({ ...formData, term_end_date: e.target.value })}
                    className="rounded-2xl"
                  />
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
                  : editingSchool
                  ? 'Update'
                  : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation - Not used since backend doesn't support delete */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Not Supported</AlertDialogTitle>
            <AlertDialogDescription>
              School information cannot be deleted. You can only edit the existing information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Schools;
