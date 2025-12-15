import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { teacherApi, Resource, CreateResourceData } from '@/api/teacher';
import { DataTable, Column } from '@/components/tables/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, BookMarked, Upload, Book, FileText, Video, Presentation } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RESOURCE_TYPES = ['PDF', 'Video', 'Document', 'Link', 'Image', 'Other'];

const Resources = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({
    subject_id: '',
    name: '',
    description: '',
    publish_url: '',
    size_mb: 0,
    type: 'PDF',
  });

  // Fetch my subjects for dropdown
  const { data: subjects = [] } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: () => teacherApi.getMySubjects(),
    enabled: !!user?.id,
  });

  // Fetch resources for selected subject
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources', selectedSubjectId],
    queryFn: () => teacherApi.getResourcesForSubject(selectedSubjectId),
    enabled: !!selectedSubjectId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: teacherApi.createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource added successfully');
      handleCloseForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add resource');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Calculate file size in MB
      const sizeMB = file.size / (1024 * 1024);
      setFormData({
        ...formData,
        name: formData.name || file.name,
        size_mb: parseFloat(sizeMB.toFixed(2)),
        type: file.type.includes('pdf') ? 'PDF' : file.type.includes('video') ? 'Video' : 'Document',
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedFile(null);
    setFormData({
      subject_id: selectedSubjectId || '',
      name: '',
      description: '',
      publish_url: '',
      size_mb: 0,
      type: 'PDF',
    });
  };

  const handleSubmit = async () => {
    if (!formData.subject_id || !formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!selectedFile && !formData.publish_url) {
      toast.error('Please upload a file');
      return;
    }

    try {
      let resourceData = { ...formData };

      // Upload file to Supabase Storage if a file is selected
      if (selectedFile) {
        toast.info('Uploading file...');

        const uploadResult = await teacherApi.uploadFile(selectedFile, 'syllabi', 'learning-resources');

        // Update resourceData with the public URL from storage
        resourceData = {
          ...resourceData,
          publish_url: uploadResult.publicUrl,
        };

        toast.success('File uploaded successfully!');
      }

      // Create resource record in database
      createMutation.mutate(resourceData);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleOpenForm = () => {
    setFormData({
      ...formData,
      subject_id: selectedSubjectId,
    });
    setIsFormOpen(true);
  };

  const columns: Column<Resource>[] = [
    {
      header: 'Name',
      accessor: 'title',
    },
    {
      header: 'Description',
      accessor: 'description',
    },
    {
      header: 'Type',
      accessor: (row) => {
        // Capitalize material_type for display
        return row.material_type.charAt(0).toUpperCase() + row.material_type.slice(1);
      },
    },
    {
      header: 'Size (MB)',
      accessor: (row) => {
        // Convert bytes to MB for display
        const sizeMB = row.file_size ? (row.file_size / (1024 * 1024)).toFixed(2) : '0.00';
        return sizeMB;
      },
    },
    {
      header: 'URL',
      accessor: (row) => (
        <a
          href={row.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          View
        </a>
      ),
    },
  ];

  const selectedSubject = subjects.find((s: any) => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground">Upload and manage learning resources organized by category</p>
        </div>
        <Button
          onClick={handleOpenForm}
          className="rounded-2xl"
          disabled={!selectedSubjectId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Select Subject</Label>
        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
          <SelectTrigger className="rounded-2xl max-w-md">
            <SelectValue placeholder="Select a subject to view resources" />
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

      {selectedSubjectId && (
        <DataTable
          data={resources}
          columns={columns}
          isLoading={isLoading}
          icon={BookMarked}
          emptyMessage="No resources found. Upload your first resource!"
          searchKeys={['title', 'description', 'material_type']}
        />
      )}

      {/* Create Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="rounded-3xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>
              Upload a file or provide a link to learning materials for {selectedSubject?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Upload File (PDF, Video, Document)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi"
                  className="rounded-2xl"
                />
                {selectedFile && (
                  <span className="text-sm text-muted-foreground">
                    {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Or provide a URL below instead of uploading a file</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Resource Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chapter 3 Study Notes"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the resource content..."
                className="rounded-2xl min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Resource Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size (MB)</Label>
                <Input
                  id="size"
                  type="number"
                  step="0.01"
                  value={formData.size_mb}
                  onChange={(e) => setFormData({ ...formData, size_mb: parseFloat(e.target.value) })}
                  placeholder="e.g., 15.5"
                  className="rounded-2xl"
                  disabled={!!selectedFile}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="publish_url">Resource URL (if not uploading file)</Label>
              <Input
                id="publish_url"
                type="url"
                value={formData.publish_url}
                onChange={(e) => setFormData({ ...formData, publish_url: e.target.value })}
                placeholder="https://example.com/resource.pdf"
                className="rounded-2xl"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Info:</strong> Files will be uploaded to Supabase Storage in the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">syllabi/learning-resources</code> folder.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm} className="rounded-2xl">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="rounded-2xl" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resources;
