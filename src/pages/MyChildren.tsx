import { useQuery } from '@tanstack/react-query';
import { parentApi, Child } from '@/api/parent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Mail, Phone, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const MyChildren = () => {
  const { data: children = [], isLoading, error } = useQuery({
    queryKey: ['parent-children'],
    queryFn: parentApi.getMyChildren,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-parent" />
            My Children
          </h1>
          <p className="text-muted-foreground">View and manage your children's information</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-parent" />
            My Children
          </h1>
          <p className="text-muted-foreground">View and manage your children's information</p>
        </div>
        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Error loading children. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Users className="w-8 h-8 text-parent" />
          My Children
        </h1>
        <p className="text-muted-foreground">View and manage your children's information</p>
      </div>

      {children.length === 0 ? (
        <Card className="rounded-3xl border-none shadow-sm">
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Children Found</h3>
              <p className="text-muted-foreground">
                You don't have any children registered in the system yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {children.map((child: Child) => (
            <Link key={child.id} to={`/children/${child.id}`}>
              <Card className="rounded-3xl border-none shadow-sm hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">
                        {child.user?.first_name} {child.user?.last_name}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {child.student_number}
                      </Badge>
                    </div>
                    <GraduationCap className="w-8 h-8 text-student" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Email */}
                  {child.user?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{child.user.email}</span>
                    </div>
                  )}

                  {/* Class Information */}
                  {child.class && (
                    <div className="p-3 rounded-2xl bg-muted/50">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-parent mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{child.class.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {child.class.level}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="pt-2">
                    <div className="text-sm text-primary font-medium hover:underline">
                      View Details →
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChildren;
