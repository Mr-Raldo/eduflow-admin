import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { teacherApi, Syllabus, CreateSyllabusData } from '@/api/teacher';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Trash2, FileText, Download, Eye } from 'lucide-react';
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

const CURRENT_ACADEMIC_YEAR = '2024/2025';

const Syllabi = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSyllabus, setDeletingSyllabus] = useState<Syllabus | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<CreateSyllabusData>({
    subject_id: '',
    name: '',
    description: '',
    file_url: '',
    file_size_mb: 0,
    academic_year: CURRENT_ACADEMIC_YEAR,
    status: 'published',
  });

  // Fetch my subjects for dropdown
  const { data: subjects = [] } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: () => teacherApi.getMySubjects(),
    enabled: !!user?.id,
  });

  // Fetch my syllabi
  const { data: syllabi = [], isLoading } = useQuery({
    queryKey: ['my-syllabi'],
    queryFn: () => teacherApi.getMySyllabi(),
    enabled: !!user?.id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: teacherApi.createSyllabus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-syllabi'] });
      toast.success('Syllabus uploaded successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload syllabus');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: teacherApi.deleteSyllabus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-syllabi'] });
      toast.success('Syllabus deleted successfully');
      setIsDeleteOpen(false);
      setDeletingSyllabus(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete syllabus');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      const sizeMB = file.size / (1024 * 1024);

      // Auto-fill name if empty
      const fileName = file.name.replace('.pdf', '');
      setFormData({
        ...formData,
        name: formData.name || fileName,
        file_size_mb: parseFloat(sizeMB.toFixed(2)),
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedFile(null);
    setFormData({
      subject_id: '',
      name: '',
      description: '',
      file_url: '',
      file_size_mb: 0,
      academic_year: CURRENT_ACADEMIC_YEAR,
      status: 'published',
    });
  };

  const handleSubmit = async () => {
    if (!formData.subject_id || !formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedFile && !formData.file_url) {
      toast.error('Please upload a PDF file');
      return;
    }

    try {
      let syllabusData = { ...formData };

      // Upload file to Supabase Storage if a file is selected
      if (selectedFile) {
        toast.info('Uploading PDF file...');

        const uploadResult = await teacherApi.uploadFile(selectedFile, 'syllabi', 'course-outlines');

        // Update syllabusData with the public URL from storage
        syllabusData = {
          ...syllabusData,
          file_url: uploadResult.publicUrl,
        };

        toast.success('File uploaded successfully!');
      }

      // Create syllabus record in database
      createMutation.mutate(syllabusData);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleDelete = (syllabus: Syllabus) => {
    setDeletingSyllabus(syllabus);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingSyllabus) {
      deleteMutation.mutate(deletingSyllabus.id);
    }
  };

  const columns: Column<Syllabus>[] = [
    {
      header: 'Subject',
      accessor: (row) => {
        // Use the subject from the backend join if available, otherwise find it
        return row.subject?.name || subjects.find((s: any) => s.id === row.subject_id)?.name || 'Unknown Subject';
      },
    },
    {
      header: 'Syllabus Name',
      accessor: 'title',
    },
    {
      header: 'Academic Year',
      accessor: 'academic_year',
    },
    {
      header: 'File Size',
      accessor: (row) => {
        // Convert bytes to MB for display
        const sizeMB = row.file_size ? (row.file_size / (1024 * 1024)).toFixed(2) : '0.00';
        return `${sizeMB} MB`;
      },
    },
    {
      header: 'Status',
      accessor: (row) => {
        // Capitalize first letter for display
        return row.status.charAt(0).toUpperCase() + row.status.slice(1);
      },
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <a
            href={row.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            <Button variant="ghost" size="sm" className="gap-2">
              <Eye className="w-4 h-4" />
              View
            </Button>
          </a>
          <a
            href={row.file_url}
            download
            className="text-primary hover:underline"
          >
            <Button variant="ghost" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </a>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Syllabi</h1>
          <p className="text-muted-foreground">Upload and manage course outline PDFs for your subjects</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="rounded-2xl">
          <Plus className="w-4 h-4 mr-2" />
          Upload Syllabus
        </Button>
      </div>

      <DataTable
        data={syllabi}
        columns={columns}
        isLoading={isLoading}
        icon={FileText}
        emptyMessage="No syllabi found. Upload your first course syllabus!"
        searchKeys={['name', 'academic_year']}
      />

      {/* Create Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="rounded-3xl max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Course Syllabus</DialogTitle>
            <DialogDescription>
              Upload a PDF course outline for one of your subjects
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject_id">Subject *</Label>
              <Select
                value={formData.subject_id}
                onValueChange={(value) => setFormData({ ...formData, subject_id: value })}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select subject" />
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
              <Label htmlFor="file">Upload PDF File * (Max 10MB)</Label>
              <div className="space-y-2">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="rounded-2xl"
                />
                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-2xl">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">
                      {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Syllabus Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mathematics Form 4 Syllabus"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the course outline..."
                className="rounded-2xl min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academic_year">Academic Year *</Label>
                <Input
                  id="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="e.g., 2024/2025"
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Info:</strong> PDF files will be uploaded to Supabase Storage in the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">syllabi/course-outlines</code> bucket.
                Max file size: 10MB.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm} className="rounded-2xl">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="rounded-2xl" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Uploading...' : 'Upload Syllabus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the syllabus "{deletingSyllabus?.name}". This action cannot be undone.
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

export default Syllabi;
