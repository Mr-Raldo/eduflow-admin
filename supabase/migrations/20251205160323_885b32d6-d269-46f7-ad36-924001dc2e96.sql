-- Create role enum for the school management system
CREATE TYPE public.app_role AS ENUM ('admin', 'headmaster', 'hod', 'teacher', 'parent', 'student');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create schools table (for multi-school support)
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  current_term TEXT,
  term_start_date DATE,
  term_end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  hod_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  grade_level TEXT,
  class_teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create class_subjects junction table
CREATE TABLE public.class_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (class_id, subject_id)
);

-- Create student_classes table (student enrollment)
CREATE TABLE public.student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE (student_id, class_id)
);

-- Create parent_students table (parent-child relationship)
CREATE TABLE public.parent_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  relationship TEXT DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (parent_id, student_id)
);

-- Create learning_materials table
CREATE TABLE public.learning_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id UUID REFERENCES public.class_subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  external_link TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id UUID REFERENCES public.class_subjects(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  title TEXT NOT NULL,
  instructions TEXT,
  file_url TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  total_marks INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create assignment_submissions table
CREATE TABLE public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  submission_text TEXT,
  file_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  marks_obtained INTEGER,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (assignment_id, student_id)
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_roles app_role[] DEFAULT '{}',
  target_class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (class_id, student_id, date)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS app_role[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY_AGG(role) FROM public.user_roles WHERE user_id = _user_id
$$;

-- Create function to check if user is admin or headmaster
CREATE OR REPLACE FUNCTION public.is_admin_or_headmaster(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'headmaster')
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_learning_materials_updated_at BEFORE UPDATE ON public.learning_materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Profiles: Users can view all profiles, update their own
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- User roles: Only admins can manage, users can view their own
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Schools: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view schools" ON public.schools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage schools" ON public.schools FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Departments: Authenticated users can view, admins/HODs can manage
CREATE POLICY "Authenticated users can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments" ON public.departments FOR ALL TO authenticated USING (public.is_admin_or_headmaster(auth.uid()));

-- Subjects: Authenticated users can view, admins/HODs can manage
CREATE POLICY "Authenticated users can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and HODs can manage subjects" ON public.subjects FOR ALL TO authenticated 
  USING (public.is_admin_or_headmaster(auth.uid()) OR public.has_role(auth.uid(), 'hod'));

-- Classes: Authenticated users can view, admins can manage
CREATE POLICY "Authenticated users can view classes" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage classes" ON public.classes FOR ALL TO authenticated USING (public.is_admin_or_headmaster(auth.uid()));

-- Class subjects: Authenticated users can view, admins/teachers can manage
CREATE POLICY "Authenticated users can view class subjects" ON public.class_subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage class subjects" ON public.class_subjects FOR ALL TO authenticated USING (public.is_admin_or_headmaster(auth.uid()));

-- Student classes: Students can view own, teachers/admins can manage
CREATE POLICY "Students can view own enrollments" ON public.student_classes FOR SELECT TO authenticated USING (auth.uid() = student_id);
CREATE POLICY "Teachers and admins can view all enrollments" ON public.student_classes FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'teacher') OR public.is_admin_or_headmaster(auth.uid()));
CREATE POLICY "Teachers and admins can manage enrollments" ON public.student_classes FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'teacher') OR public.is_admin_or_headmaster(auth.uid()));

-- Parent students: Parents can view own children, admins can manage
CREATE POLICY "Parents can view own children" ON public.parent_students FOR SELECT TO authenticated USING (auth.uid() = parent_id);
CREATE POLICY "Admins can manage parent-student links" ON public.parent_students FOR ALL TO authenticated USING (public.is_admin_or_headmaster(auth.uid()));

-- Learning materials: Students/teachers can view, teachers can manage own
CREATE POLICY "Authenticated users can view approved materials" ON public.learning_materials FOR SELECT TO authenticated USING (is_approved = true OR teacher_id = auth.uid());
CREATE POLICY "Teachers can insert materials" ON public.learning_materials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Teachers can update own materials" ON public.learning_materials FOR UPDATE TO authenticated USING (teacher_id = auth.uid());
CREATE POLICY "HODs and admins can manage all materials" ON public.learning_materials FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'hod') OR public.is_admin_or_headmaster(auth.uid()));

-- Assignments: Students can view, teachers can manage own
CREATE POLICY "Students can view assignments for their classes" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can manage own assignments" ON public.assignments FOR ALL TO authenticated USING (teacher_id = auth.uid() OR public.is_admin_or_headmaster(auth.uid()));

-- Assignment submissions: Students can manage own, teachers can view/grade
CREATE POLICY "Students can view own submissions" ON public.assignment_submissions FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Students can submit assignments" ON public.assignment_submissions FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "Teachers can view and grade submissions" ON public.assignment_submissions FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'teacher') OR public.is_admin_or_headmaster(auth.uid()));

-- Announcements: All can view relevant, authorized can create
CREATE POLICY "Users can view announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authorized users can create announcements" ON public.announcements FOR INSERT TO authenticated 
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'headmaster') OR public.has_role(auth.uid(), 'hod') OR public.has_role(auth.uid(), 'teacher'));
CREATE POLICY "Authors and admins can manage announcements" ON public.announcements FOR UPDATE TO authenticated USING (author_id = auth.uid() OR public.is_admin_or_headmaster(auth.uid()));
CREATE POLICY "Admins can delete announcements" ON public.announcements FOR DELETE TO authenticated USING (public.is_admin_or_headmaster(auth.uid()));

-- Attendance: Teachers can manage, students/parents can view own
CREATE POLICY "Students can view own attendance" ON public.attendance FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Teachers and admins can manage attendance" ON public.attendance FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'teacher') OR public.is_admin_or_headmaster(auth.uid()));

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) VALUES ('school-files', 'school-files', true);

-- Storage policies with proper UUID casting
CREATE POLICY "Authenticated users can view files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'school-files');
CREATE POLICY "Teachers can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'school-files' AND (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'student') OR public.is_admin_or_headmaster(auth.uid())));
CREATE POLICY "Users can update own files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'school-files' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'school-files' AND (storage.foldername(name))[1] = auth.uid()::text);