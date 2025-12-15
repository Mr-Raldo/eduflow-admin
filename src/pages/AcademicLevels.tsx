import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolAdminApi, AcademicLevel, CreateAcademicLevelData } from '@/api/school-admin';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, GraduationCap } from 'lucide-react';
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

const AcademicLevels = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<AcademicLevel | null>(null);
  const [deletingLevel, setDeletingLevel] = useState<AcademicLevel | null>(null);
  const [formData, setFormData] = useState<CreateAcademicLevelData>({
    name: '',
    description: '',
    display_order: 0,
  });

  // Fetch academic levels
  const { data: academicLevels = [], isLoading } = useQuery({
    queryKey: ['academicLevels'],
    queryFn: schoolAdminApi.getAcademicLevels,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: schoolAdminApi.createAcademicLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicLevels'] });
      toast.success('Academic level created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create academic level');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAcademicLevelData> }) =>
      schoolAdminApi.updateAcademicLevel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicLevels'] });
      toast.success('Academic level updated successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update academic level');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: schoolAdminApi.deleteAcademicLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicLevels'] });
      toast.success('Academic level deleted successfully');
      setIsDeleteOpen(false);
      setDeletingLevel(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete academic level');
    },
  });

  const handleOpenCreate = () => {
    setEditingLevel(null);
    setFormData({
      name: '',
      description: '',
      display_order: 0,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (level: AcademicLevel) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      description: level.description || '',
      display_order: level.display_order || 0,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLevel(null);
    setFormData({
      name: '',
      description: '',
      display_order: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLevel) {
      updateMutation.mutate({ id: editingLevel.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (level: AcademicLevel) => {
    setDeletingLevel(level);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingLevel) {
      deleteMutation.mutate(deletingLevel.id);
    }
  };

  const columns: Column<AcademicLevel>[] = [
    {
      header: 'Order',
      accessor: 'display_order',
      sortable: true,
    },
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
            <GraduationCap className="w-8 h-8 text-primary" />
            Academic Levels Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage academic levels (Forms/Grades) in your school
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Academic Level
        </Button>
      </div>

      <DataTable
        data={academicLevels}
        columns={columns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search academic levels..."
        searchKeys={['name', 'description']}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingLevel ? 'Edit Academic Level' : 'Create New Academic Level'}
              </DialogTitle>
              <DialogDescription>
                {editingLevel
                  ? 'Update academic level information below'
                  : 'Fill in the details to create a new academic level'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name (e.g., Form 1, Grade 9)"
                  required
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order">Display Order *</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  placeholder="Enter order (1, 2, 3...)"
                  required
                  min="0"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  className="rounded-2xl"
                  rows={3}
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
                className="rounded-2xl bg-primary hover:bg-primary/90"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingLevel
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
              This will permanently delete the academic level "{deletingLevel?.name}". This action cannot be undone.
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

export default AcademicLevels;
