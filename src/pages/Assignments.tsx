import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { teacherApi, Assignment, CreateAssignmentData } from '@/api/teacher';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Eye, Trash2, ExternalLink, Edit } from 'lucide-react';
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

const Assignments = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<any>(null);
  const [deletingAssignment, setDeletingAssignment] = useState<any>(null);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [formData, setFormData] = useState<any>({
    subject_id: '',
    class_id: '',
    title: '',
    description: '',
    instructions: '',
    attachment_url: '',
    due_date: '',
    total_marks: 100,
    is_published: false,
  });

  // Fetch my subjects for dropdown
  const { data: subjects = [] } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: teacherApi.getMySubjects,
  });

  // Fetch my assigned classes
  const { data: allClasses = [] } = useQuery({
    queryKey: ['my-classes'],
    queryFn: teacherApi.getMyClasses,
  });

  // Filter classes by selected subject
  const classes = selectedSubjectId
    ? allClasses.filter((c: any) => c.subject?.id === selectedSubjectId)
    : [];

  // Fetch assignments for selected class
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['assignments', selectedClassId],
    queryFn: () => teacherApi.getAssignmentsForClass(selectedClassId),
    enabled: !!selectedClassId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: teacherApi.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment created successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: teacherApi.deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment deleted successfully');
      setIsDeleteOpen(false);
      setDeletingAssignment(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => teacherApi.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment updated successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update assignment');
    },
  });

  const handleView = (assignment: any) => {
    setViewingAssignment(assignment);
    setIsViewOpen(true);
  };

  const handleEdit = (assignment: any) => {
    setEditingAssignment(assignment);
    setFormData({
      subject_id: assignment.subject_id,
      class_id: assignment.class_id,
      title: assignment.title,
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      attachment_url: assignment.attachment_url || '',
      due_date: assignment.due_date?.split('T')[0] || '', // Format date for input
      total_marks: assignment.total_marks || 100,
      is_published: assignment.is_published || false,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (assignment: any) => {
    setDeletingAssignment(assignment);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingAssignment) {
      deleteMutation.mutate(deletingAssignment.id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
    setFormData({
      subject_id: selectedSubjectId || '',
      class_id: selectedClassId || '',
      title: '',
      description: '',
      instructions: '',
      attachment_url: '',
      due_date: '',
      total_marks: 100,
      is_published: false,
    });
  };

  const handleSubmit = () => {
    if (!formData.subject_id || !formData.class_id || !formData.title || !formData.due_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingAssignment) {
      // Update existing assignment
      updateMutation.mutate({
        id: editingAssignment.id,
        data: formData,
      });
    } else {
      // Create new assignment
      createMutation.mutate(formData);
    }
  };

  const handleOpenForm = () => {
    setEditingAssignment(null); // Ensure we're in create mode
    setFormData({
      ...formData,
      subject_id: selectedSubjectId,
      class_id: selectedClassId,
    });
    setIsFormOpen(true);
  };

  const columns: Column<any>[] = [
    {
      header: 'Title',
      accessor: 'title',
      sortable: true,
    },
    {
      header: 'Description',
      accessor: (row) => {
        const desc = row.description || '';
        return desc.length > 50 ? desc.substring(0, 50) + '...' : desc;
      },
    },
    {
      header: 'Due Date',
      accessor: (row) => new Date(row.due_date).toLocaleDateString(),
      sortable: true,
    },
    {
      header: 'Total Marks',
      accessor: (row) => row.total_marks || '-',
    },
    {
      header: 'Status',
      accessor: (row) => row.is_published ? 'Published' : 'Draft',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row)}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);
  const selectedClass = classes.find((c: any) => c.class?.id === selectedClassId || c.id === selectedClassId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Create and manage assignments for your classes</p>
        </div>
        <Button
          onClick={handleOpenForm}
          className="rounded-2xl"
          disabled={!selectedSubjectId || !selectedClassId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Select Subject</Label>
          <Select value={selectedSubjectId} onValueChange={(value) => {
            setSelectedSubjectId(value);
            setSelectedClassId(''); // Reset class selection when subject changes
          }}>
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject: any) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Select Class</Label>
          <Select
            value={selectedClassId}
            onValueChange={setSelectedClassId}
            disabled={!selectedSubjectId}
          >
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classes.length === 0 ? (
                <SelectItem value="no-classes" disabled>
                  No classes available
                </SelectItem>
              ) : (
                classes.map((classItem: any) => (
                  <SelectItem key={classItem.id} value={classItem.class?.id || classItem.id}>
                    {classItem.class?.name || 'Unknown Class'} - {classItem.class?.level || ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedClassId && (
        <DataTable
          data={assignments}
          columns={columns}
          isLoading={isLoading}
          icon={FileText}
          emptyMessage="No assignments found. Create your first assignment!"
          searchKeys={['name', 'description']}
        />
      )}

      {/* Create/Edit Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</DialogTitle>
            <DialogDescription>
              {editingAssignment
                ? `Editing "${editingAssignment.title}"`
                : `Add a new assignment for ${selectedSubject?.name} - ${selectedClass?.class?.name || 'Selected Class'}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Chapter 5 Exercises"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_marks">Total Marks</Label>
                <Input
                  id="total_marks"
                  type="number"
                  min="0"
                  value={formData.total_marks}
                  onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                  placeholder="e.g., 100"
                  className="rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the assignment..."
                className="rounded-2xl min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Detailed instructions for students..."
                className="rounded-2xl min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date *</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment_url">Assignment File URL (optional)</Label>
              <Input
                id="attachment_url"
                type="url"
                value={formData.attachment_url}
                onChange={(e) => setFormData({ ...formData, attachment_url: e.target.value })}
                placeholder="https://example.com/assignment.pdf"
                className="rounded-2xl"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_published" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm} className="rounded-2xl">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="rounded-2xl"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingAssignment
                ? (updateMutation.isPending ? 'Updating...' : 'Update Assignment')
                : (createMutation.isPending ? 'Creating...' : 'Create Assignment')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignment Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="rounded-3xl max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewingAssignment?.title}</DialogTitle>
            <DialogDescription>
              Assignment details and information
            </DialogDescription>
          </DialogHeader>

          {viewingAssignment && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <p className="font-medium">{viewingAssignment.subject?.name || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Class</Label>
                  <p className="font-medium">{viewingAssignment.class?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <p className="font-medium">{new Date(viewingAssignment.due_date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Total Marks</Label>
                  <p className="font-medium">{viewingAssignment.total_marks || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className="font-medium">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      viewingAssignment.is_published
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100'
                    }`}>
                      {viewingAssignment.is_published ? 'Published' : 'Draft'}
                    </span>
                  </p>
                </div>
              </div>

              {viewingAssignment.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Description</Label>
                  <div className="bg-muted p-4 rounded-2xl">
                    <p className="whitespace-pre-wrap">{viewingAssignment.description}</p>
                  </div>
                </div>
              )}

              {viewingAssignment.instructions && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Instructions</Label>
                  <div className="bg-muted p-4 rounded-2xl">
                    <p className="whitespace-pre-wrap">{viewingAssignment.instructions}</p>
                  </div>
                </div>
              )}

              {viewingAssignment.attachment_url && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Attachment</Label>
                  <a
                    href={viewingAssignment.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Assignment File
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <p className="text-sm">{new Date(viewingAssignment.created_at).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Last Updated</Label>
                  <p className="text-sm">{new Date(viewingAssignment.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)} className="rounded-2xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingAssignment?.title}"?
              This action cannot be undone and all student submissions will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Assignments;
