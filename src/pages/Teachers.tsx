import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';

const Teachers = () => {
  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, profiles(id, email, first_name, last_name, phone, is_active)')
        .eq('role', 'teacher');
      if (error) throw error;
      return data?.map(r => r.profiles).filter(Boolean) || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-teacher" />
          Teachers
        </h1>
        <p className="text-muted-foreground">View teachers in the system</p>
      </div>

      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader><CardTitle>All Teachers</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : teachers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No teachers found</p>
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
                {teachers.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.first_name} {t.last_name}</TableCell>
                    <TableCell>{t.email}</TableCell>
                    <TableCell>{t.phone || '-'}</TableCell>
                    <TableCell><Badge variant={t.is_active ? 'default' : 'secondary'}>{t.is_active ? 'Active' : 'Inactive'}</Badge></TableCell>
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

export default Teachers;
