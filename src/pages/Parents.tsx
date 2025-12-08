import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolAdminApi, Parent, CreateParentData } from '@/api/school-admin';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, UserCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const Parents = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [deletingParent, setDeletingParent] = useState<Parent | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateParentData>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    school_id: user?.school_id || '',  // From logged-in school admin
  });

  // Fetch parents
  const { data: parents = [], isLoading } = useQuery({
    queryKey: ['parents'],
    queryFn: schoolAdminApi.getParents,
  });

  // Fetch students for linking
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => schoolAdminApi.getSchoolStudents(''),
  });

  console.log('Available students for parent linking:', students);

  // Create mutation with student linking
  const createMutation = useMutation({
    mutationFn: async (data: CreateParentData) => {
      try {
        // Create parent account
        const createResponse = await schoolAdminApi.createParent(data);
        console.log('Create parent response:', createResponse);

        // Get the parent ID from response or fetch by email
        let parentId = createResponse?.id || createResponse?.data?.id;

        // If no ID in response, fetch parent by email to get the ID
        if (!parentId) {
          const parents = await schoolAdminApi.getParents();
          const createdParent = parents.find((p: any) => p.email === data.email);
          parentId = createdParent?.id;
          console.log('Fetched parent ID:', parentId);
        }

        // Link parent to selected students
        if (selectedStudents.length > 0 && parentId) {
          console.log('Linking parent', parentId, 'to students:', selectedStudents);
          await schoolAdminApi.linkParentToStudents(parentId, selectedStudents);
          console.log('Successfully linked parent to students');
        } else {
          console.warn('No parent ID found or no students selected');
        }

        return createResponse;
      } catch (error) {
        console.error('Error in create mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent created and linked to students successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      console.error('Create mutation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create parent account');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<CreateParentData, 'password'>> }) =>
      schoolAdminApi.updateParent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent updated successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update parent');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: schoolAdminApi.deleteParent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      toast.success('Parent deleted successfully');
      setIsDeleteOpen(false);
      setDeletingParent(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete parent');
    },
  });

  const handleOpenCreate = () => {
    setEditingParent(null);
    setSelectedStudents([]);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      school_id: user?.school_id || '',  // From logged-in school admin
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (parent: Parent) => {
    setEditingParent(parent);
    setFormData({
      email: parent.email,
      password: '', // Don't show password
      first_name: parent.first_name,
      last_name: parent.last_name,
      phone: parent.phone || '',
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingParent(null);
    setSelectedStudents([]);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      school_id: user?.school_id || '',  // From logged-in school admin
    });
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingParent) {
      // For update, don't send password
      const { password, ...updateData } = formData;
      updateMutation.mutate({ id: editingParent.id, data: updateData });
    } else {
      // Validate that at least one student is selected
      if (selectedStudents.length === 0) {
        toast.error('Please select at least one student to link to this parent');
        return;
      }
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (parent: Parent) => {
    setDeletingParent(parent);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingParent) {
      deleteMutation.mutate(deletingParent.id);
    }
  };

  const columns: Column<Parent>[] = [
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
      header: 'Code',
      accessor: 'code',
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
            <UserCircle className="w-8 h-8 text-parent" />
            Parents & Guardians
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage parent and guardian accounts
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-2xl bg-parent hover:bg-parent/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Parent Account
        </Button>
      </div>

      <DataTable
        data={parents}
        columns={columns}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        searchPlaceholder="Search parents..."
        searchKeys={['first_name', 'last_name', 'email']}
      />

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingParent ? 'Edit Parent' : 'Create Parent Account'}
              </DialogTitle>
              <DialogDescription>
                {editingParent
                  ? 'Update parent information below'
                  : 'Fill in the details to create a new parent account'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter first name"
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
                  placeholder="Enter last name"
                  required
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="parent@example.com"
                  required
                  className="rounded-2xl"
                />
              </div>

              {!editingParent && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="rounded-2xl"
                  />
                </div>
              )}

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

              {!editingParent && (
                <div className="space-y-2">
                  <Label>Link to Students *</Label>
                  <div className="border rounded-2xl p-4 max-h-48 overflow-y-auto space-y-2">
                    {students.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No students available</p>
                    ) : (
                      students.map((student: any) => (
                        <div key={student.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={student.id}
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <label
                            htmlFor={student.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {student.first_name} {student.last_name} ({student.email})
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  {selectedStudents.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedStudents.length} student(s) selected
                    </p>
                  )}
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
                  : editingParent
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
              This will permanently delete the parent account for "{deletingParent?.first_name} {deletingParent?.last_name}". This action cannot be undone.
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

export default Parents;
