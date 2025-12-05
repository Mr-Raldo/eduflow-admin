import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  FileText,
  FolderOpen,
  Building2,
  GraduationCap,
  UserCircle,
  ChevronRight,
  Bell,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const { hasRole, getPrimaryRole } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ];

    const items: any[] = [...baseItems];

    // Admin routes
    if (hasRole('admin')) {
      items.push(
        { label: 'Schools', href: '/schools', icon: School },
        { label: 'Administrators', href: '/administrators', icon: Users }
      );
    }

    // Admin & Headmaster routes
    if (hasRole('admin') || hasRole('headmaster')) {
      items.push(
        { label: 'Departments', href: '/departments', icon: Building2 },
        { label: 'Subjects', href: '/subjects', icon: BookOpen },
        { label: 'Teachers', href: '/teachers', icon: GraduationCap },
        { label: 'Students', href: '/students', icon: Users },
        { label: 'Parents', href: '/parents', icon: UserCircle },
        { label: 'Classes', href: '/classes', icon: School }
      );
    }

    // HOD routes
    if (hasRole('hod')) {
      items.push(
        { label: 'My Department', href: '/departments', icon: Building2 },
        { label: 'Subjects', href: '/subjects', icon: BookOpen }
      );
    }

    // Teacher routes
    if (hasRole('teacher')) {
      items.push(
        { label: 'My Classes', href: '/classes', icon: School },
        { label: 'Assignments', href: '/assignments', icon: ClipboardList },
        { label: 'Resources', href: '/resources', icon: FolderOpen }
      );
    }

    // Student routes
    if (hasRole('student')) {
      items.push(
        { label: 'My Classes', href: '/my-classes', icon: School },
        { label: 'Assignments', href: '/my-assignments', icon: ClipboardList },
        { label: 'Grades', href: '/grades', icon: FileText }
      );
    }

    // Parent routes
    if (hasRole('parent')) {
      items.push(
        { label: 'My Children', href: '/children', icon: Users },
        { label: 'Performance', href: '/performance', icon: FileText }
      );
    }

    // Remove duplicates based on href
    const uniqueItems = items.filter((item, index, self) => 
      index === self.findIndex(t => t.href === item.href)
    );

    return uniqueItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <aside
      className={cn(
        'bg-card border-r border-border h-screen sticky top-0 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {!isCollapsed && (
              <>
                <GraduationCap className="w-8 h-8 text-primary" />
                <span className="font-bold text-lg">Education 5.0</span>
              </>
            )}
            {isCollapsed && <GraduationCap className="w-8 h-8 text-primary mx-auto" />}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200',
                  'hover:bg-accent/50',
                  isActive && 'bg-accent text-accent-foreground font-semibold',
                  !isActive && 'text-muted-foreground'
                )
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="flex-1">{item.label}</span>}
              {!isCollapsed && <ChevronRight className="w-4 h-4" />}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
