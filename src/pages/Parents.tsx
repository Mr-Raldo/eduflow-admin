import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserCircle } from 'lucide-react';

const Parents = () => {
<<<<<<< HEAD
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

=======
  const { data: parents = [], isLoading } = useQuery({
    queryKey: ['parents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, profiles(id, email, first_name, last_name, phone, is_active)')
        .eq('role', 'parent');
      if (error) throw error;
      return data?.map(r => r.profiles).filter(Boolean) || [];
    },
  });

>>>>>>> 76f84c8f94dea8c713170403af83ef2e0423f5db
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <UserCircle className="w-8 h-8 text-parent" />
          Parents
        </h1>
        <p className="text-muted-foreground">View parents in the system</p>
      </div>

      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader><CardTitle>All Parents</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : parents.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No parents found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.first_name} {p.last_name}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.phone || '-'}</TableCell>
                    <TableCell><Badge variant={p.is_active ? 'default' : 'secondary'}>{p.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Parents;
