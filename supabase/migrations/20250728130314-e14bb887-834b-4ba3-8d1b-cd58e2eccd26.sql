-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room_members table
CREATE TABLE IF NOT EXISTS public.room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create habits table
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'mind',
  habit_type TEXT NOT NULL DEFAULT 'daily',
  target_count INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create habit_memberships table
CREATE TABLE IF NOT EXISTS public.habit_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(habit_id, user_id)
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID NOT NULL,
  user_id UUID NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  habit_id UUID NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nudges table
CREATE TABLE IF NOT EXISTS public.nudges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  habit_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nudges ENABLE ROW LEVEL SECURITY;

-- Create helper function
CREATE OR REPLACE FUNCTION public.user_is_room_member(room_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.room_members 
    WHERE room_id = room_uuid AND user_id = user_uuid
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Create function to get room member count
CREATE OR REPLACE FUNCTION public.get_room_member_count(room_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM public.room_members 
  WHERE room_id = room_uuid;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Create invite code generator
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(encode(gen_random_bytes(4), 'base64') from 1 for 6));
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Authenticated users can view all profiles" 
ON public.profiles FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- RLS Policies for rooms
CREATE POLICY "Insert rooms only by creator" 
ON public.rooms FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Select rooms user created or joined" 
ON public.rooms FOR SELECT 
USING (auth.uid() IS NOT NULL AND (created_by = auth.uid() OR id IN (
  SELECT room_id FROM room_members WHERE user_id = auth.uid()
)));

CREATE POLICY "Room creators can update their rooms" 
ON public.rooms FOR UPDATE 
USING (auth.uid() = created_by);

-- RLS Policies for room_members
CREATE POLICY "Authenticated users can join rooms" 
ON public.room_members FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can leave rooms" 
ON public.room_members FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can view room members in their rooms" 
ON public.room_members FOR SELECT 
USING (auth.uid() IS NOT NULL AND (
  auth.uid() = user_id OR user_is_room_member(room_id, auth.uid())
));

-- RLS Policies for habits
CREATE POLICY "Authenticated users can view habits in their rooms" 
ON public.habits FOR SELECT 
USING (auth.uid() IS NOT NULL AND user_is_room_member(room_id, auth.uid()));

CREATE POLICY "Authenticated users can create habits in their rooms" 
ON public.habits FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by AND user_is_room_member(room_id, auth.uid()));

CREATE POLICY "Authenticated users can update habits they created" 
ON public.habits FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete habits they created" 
ON public.habits FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- RLS Policies for habit_memberships
CREATE POLICY "Authenticated users can view habit memberships in their rooms" 
ON public.habit_memberships FOR SELECT 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM habits h 
  JOIN room_members rm ON h.room_id = rm.room_id 
  WHERE h.id = habit_memberships.habit_id AND rm.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can join habits in their rooms" 
ON public.habit_memberships FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM habits h 
  JOIN room_members rm ON h.room_id = rm.room_id 
  WHERE h.id = habit_memberships.habit_id AND rm.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can leave habits they joined" 
ON public.habit_memberships FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- RLS Policies for habit_completions
CREATE POLICY "Authenticated users can view completions for habits in their rooms" 
ON public.habit_completions FOR SELECT 
USING (auth.uid() IS NOT NULL AND EXISTS (
  SELECT 1 FROM habits h 
  JOIN room_members rm ON h.room_id = rm.room_id 
  WHERE h.id = habit_completions.habit_id AND rm.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can create their own completions" 
ON public.habit_completions FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own completions" 
ON public.habit_completions FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Authenticated users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = to_user_id);

CREATE POLICY "Authenticated users can create notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = from_user_id);

CREATE POLICY "Authenticated users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = to_user_id);

CREATE POLICY "Authenticated users can delete their own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = to_user_id);

-- RLS Policies for nudges
CREATE POLICY "Authenticated users can view nudges they send or receive" 
ON public.nudges FOR SELECT 
USING (auth.uid() IS NOT NULL AND (auth.uid() = from_user_id OR auth.uid() = to_user_id));

CREATE POLICY "Authenticated users can create nudges they send" 
ON public.nudges FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = from_user_id);

CREATE POLICY "Authenticated users can update nudges they sent" 
ON public.nudges FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = from_user_id);

CREATE POLICY "Authenticated users can delete nudges they sent" 
ON public.nudges FOR DELETE 
USING (auth.uid() IS NOT NULL AND auth.uid() = from_user_id);