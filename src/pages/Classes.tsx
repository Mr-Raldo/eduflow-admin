<<<<<<< HEAD
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
import { Input } from '@/components/ui/input';
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

const Classes = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<CreateClassData>({
    name: '',
    academic_level_id: '',
    class_teacher_id: '',
    capacity: 40,
  });

  // Fetch classes
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: schoolAdminApi.getClasses,
  });

  // Fetch academic levels for dropdown
  const { data: academicLevels = [] } = useQuery({
    queryKey: ['academicLevels'],
    queryFn: schoolAdminApi.getAcademicLevels,
  });

  // Fetch teachers for dropdown
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => schoolAdminApi.getSchoolTeachers(''),
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
      name: '',
      academic_level_id: '',
      class_teacher_id: '',
      capacity: 40,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      academic_level_id: classItem.academic_level_id || '',
      class_teacher_id: classItem.class_teacher_id || '',
      capacity: classItem.capacity,
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingClass(null);
    setFormData({
      name: '',
      academic_level_id: '',
      class_teacher_id: '',
      capacity: 40,
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
      header: 'Class Name',
      accessor: 'name',
      sortable: true,
    },
    {
      header: 'Academic Level',
      accessor: (row) => row.academic_level?.name || 'Not Assigned',
      sortable: true,
    },
    {
      header: 'Capacity',
      accessor: 'capacity',
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
import { School } from 'lucide-react';

const Classes = () => {
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('classes').select('*, schools(name)').order('name');
      if (error) throw error;
      return data;
    },
  });

>>>>>>> 76f84c8f94dea8c713170403af83ef2e0423f5db
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <School className="w-8 h-8 text-student" />
          Classes
        </h1>
        <p className="text-muted-foreground">View classes in the system</p>
      </div>

<<<<<<< HEAD
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
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter class name (e.g., Form 1A)"
                  required
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academic_level">Academic Level *</Label>
                <Select
                  value={formData.academic_level_id || undefined}
                  onValueChange={(value) => setFormData({ ...formData, academic_level_id: value })}
                  required
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select academic level" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicLevels.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No academic levels available. Create them first.
                      </SelectItem>
                    ) : (
                      academicLevels.map((level: any) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Students will inherit subjects from this academic level
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">Class Teacher (Optional)</Label>
                <Select
                  value={formData.class_teacher_id || undefined}
                  onValueChange={(value) => setFormData({ ...formData, class_teacher_id: value })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select class teacher (optional)" />
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
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 40 })}
                  placeholder="Enter class capacity"
                  required
                  min="1"
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
=======
      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader><CardTitle>All Classes</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : classes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No classes found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>School</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.grade_level || '-'}</TableCell>
                    <TableCell>{c.schools?.name || '-'}</TableCell>
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

export default Classes;
