import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolAdminApi, Subject, CreateSubjectData } from '@/api/school-admin';
import { schoolsApi } from '@/api/schools';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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

const Subjects = () => {
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
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [selectedAcademicLevels, setSelectedAcademicLevels] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateSubjectData>({
    name: '',
    code: '',
    department_id: '',
    description: '',
  });

  // Fetch subjects
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects', schoolId],
    queryFn: () => schoolAdminApi.getSubjects(schoolId || ''),
    enabled: !!schoolId,
  });

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', schoolId],
    queryFn: () => schoolAdminApi.getDepartments(schoolId || ''),
    enabled: !!schoolId,
  });

  // Fetch academic levels for assignment
  const { data: academicLevels = [] } = useQuery({
    queryKey: ['academicLevels'],
    queryFn: schoolAdminApi.getAcademicLevels,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: schoolAdminApi.createSubject,
    onSuccess: async (createdSubject) => {
      // Assign subject to selected academic levels
      if (selectedAcademicLevels.length > 0) {
        try {
          await Promise.all(
            selectedAcademicLevels.map((levelId) =>
              schoolAdminApi.assignSubjectToAcademicLevel({
                academic_level_id: levelId,
                subject_id: createdSubject.id,
                is_required: true,
              })
            )
          );
          toast.success('Subject created and assigned to academic levels successfully');
        } catch (error) {
          toast.warning('Subject created but failed to assign to some academic levels');
        }
      } else {
        toast.success('Subject created successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
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
    setSelectedAcademicLevels([]);
    setFormData({
      name: '',
      code: '',
      department_id: '',
      description: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setSelectedAcademicLevels([]);
    setFormData({
      name: subject.name,
      code: subject.code,
      department_id: subject.department_id || '',
      description: subject.description || '',
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSubject(null);
    setSelectedAcademicLevels([]);
    setFormData({
      name: '',
      code: '',
      department_id: '',
      description: '',
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
      header: 'Code',
      accessor: 'code',
      sortable: true,
    },
    {
      header: 'Department',
      accessor: (row) => row.department?.name || 'Not Assigned',
    },
    {
      header: 'Description',
      accessor: 'description',
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
                  placeholder="Enter subject name (e.g., Mathematics)"
                  required
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Subject Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Enter subject code (e.g., MATH101)"
                  required
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
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter subject description"
                  className="rounded-2xl"
                  rows={3}
                />
              </div>

              {!editingSubject && (
                <div className="space-y-3">
                  <Label>Assign to Academic Levels (Optional)</Label>
                  <div className="space-y-2 border rounded-2xl p-4 max-h-48 overflow-y-auto">
                    {academicLevels.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No academic levels available. Create them first.</p>
                    ) : (
                      academicLevels.map((level: any) => (
                        <div key={level.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`level-${level.id}`}
                            checked={selectedAcademicLevels.includes(level.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAcademicLevels([...selectedAcademicLevels, level.id]);
                              } else {
                                setSelectedAcademicLevels(selectedAcademicLevels.filter(id => id !== level.id));
                              }
                            }}
                          />
                          <label
                            htmlFor={`level-${level.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {level.name} {level.description && `- ${level.description}`}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select which academic levels this subject will be taught in
                  </p>
                </div>
              )}
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
