
-- Create app roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles: users can read their own roles, admins can read all
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create doctors table
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    experience INTEGER NOT NULL DEFAULT 0,
    bio TEXT,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Admins can manage doctors" ON public.doctors FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    service TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    address TEXT NOT NULL,
    problem TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    assigned_doctor TEXT NOT NULL DEFAULT 'Not Assigned',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all appointments" ON public.appointments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update appointments" ON public.appointments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete appointments" ON public.appointments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create contact_messages table
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert sample doctors
INSERT INTO public.doctors (name, specialization, experience, bio, image) VALUES
('Dr. Sarah Johnson', 'General Physician', 12, 'Experienced general physician specializing in homecare for elderly patients and chronic disease management.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop'),
('Dr. Michael Chen', 'Cardiologist', 15, 'Board-certified cardiologist with expertise in home-based cardiac rehabilitation and monitoring.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop'),
('Dr. Priya Patel', 'Physiotherapist', 8, 'Skilled physiotherapist providing in-home rehabilitation for post-surgery and injury recovery.', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop'),
('Dr. James Wilson', 'Pediatrician', 10, 'Compassionate pediatrician offering home visits for newborn care, vaccinations, and childhood illnesses.', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop'),
('Dr. Aisha Rahman', 'Geriatric Specialist', 14, 'Dedicated geriatric specialist focused on comprehensive homecare for aging adults.', 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop'),
('Dr. David Martinez', 'Neurologist', 11, 'Expert neurologist providing home-based consultations for neurological conditions and stroke recovery.', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop');
