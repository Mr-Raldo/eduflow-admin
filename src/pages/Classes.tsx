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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <School className="w-8 h-8 text-student" />
          Classes
        </h1>
        <p className="text-muted-foreground">View classes in the system</p>
      </div>

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
    </div>
  );
};

export default Classes;
