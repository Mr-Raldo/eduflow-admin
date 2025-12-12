import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, LogOut, User, School } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { administratorsApi } from '@/api/administrators';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  const { profile, logout, getRoleColor, getPrimaryRole } = useAuth();

  // Fetch school information for school admins
  const { data: schools = [] } = useQuery({
    queryKey: ['admin-schools', user?.id],
    queryFn: () => administratorsApi.getSchools(user?.id || ''),
    enabled: !!user?.id && user.account_type === 'school_admin',
  });

  const getInitials = () => {
    if (!profile) return 'U';
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const getRoleName = () => {
    const role = getPrimaryRole();
    if (!role) return '';
    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      headmaster: 'Headmaster',
      hod: 'Head of Department',
      teacher: 'Teacher',
      student: 'Student',
      parent: 'Parent',
    };
    return roleNames[role] || role;
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 rounded-2xl px-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback
                    className="font-semibold text-white"
                    style={{ backgroundColor: getRoleColor() }}
                  >
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{getRoleName()}</p>
                  {user?.account_type === 'school_admin' && schools.length > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <School className="w-3 h-3" />
                      {schools[0].school?.name || 'School'}
                    </p>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="rounded-xl cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
