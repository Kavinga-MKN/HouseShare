-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  current_house_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create houses table
CREATE TABLE public.houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for current_house_id after houses table exists
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_current_house 
FOREIGN KEY (current_house_id) REFERENCES public.houses(id) ON DELETE SET NULL;

-- Create house_members table
CREATE TABLE public.house_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(house_id, user_id)
);

-- Create indexes
CREATE INDEX idx_houses_invite_code ON public.houses(invite_code);
CREATE INDEX idx_house_members_house_id ON public.house_members(house_id);
CREATE INDEX idx_house_members_user_id ON public.house_members(user_id);

-- Helper function: Check if user is a member of a house
CREATE OR REPLACE FUNCTION public.is_house_member(house_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.house_members
    WHERE house_id = house_uuid AND user_id = auth.uid()
  );
$$;

-- Helper function: Check if user is admin of a house
CREATE OR REPLACE FUNCTION public.is_house_admin(house_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.house_members
    WHERE house_id = house_uuid AND user_id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper function: Generate random 6-digit invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.houses WHERE invite_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Function to handle new user signup - creates profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_houses_updated_at
  BEFORE UPDATE ON public.houses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.house_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for houses
CREATE POLICY "House members can view their houses"
  ON public.houses FOR SELECT
  USING (public.is_house_member(id));

CREATE POLICY "Authenticated users can create houses"
  ON public.houses FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "House admins can update their house"
  ON public.houses FOR UPDATE
  USING (public.is_house_admin(id));

-- RLS Policies for house_members
CREATE POLICY "House members can view members"
  ON public.house_members FOR SELECT
  USING (public.is_house_member(house_id));

CREATE POLICY "Users can join houses"
  ON public.house_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "House admins can update members"
  ON public.house_members FOR UPDATE
  USING (public.is_house_admin(house_id));

CREATE POLICY "Users can leave houses or admins can remove members"
  ON public.house_members FOR DELETE
  USING (auth.uid() = user_id OR public.is_house_admin(house_id));