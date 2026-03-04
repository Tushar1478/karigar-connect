
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table (for customers)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'karigar')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Karigars table (extends profile for workers)
CREATE TABLE public.karigars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  skill TEXT NOT NULL,
  experience INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face',
  rating NUMERIC NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  completed_jobs INTEGER NOT NULL DEFAULT 0,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.karigars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view karigars" ON public.karigars FOR SELECT USING (true);
CREATE POLICY "Karigars can insert own record" ON public.karigars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Karigars can update own record" ON public.karigars FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_karigars_updated_at BEFORE UPDATE ON public.karigars
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  karigar_id UUID NOT NULL REFERENCES public.karigars(id) ON DELETE CASCADE,
  karigar_name TEXT NOT NULL,
  skill TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'rejected')),
  description TEXT,
  rating INTEGER,
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Karigars can view their bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.karigars WHERE karigars.id = bookings.karigar_id AND karigars.user_id = auth.uid())
);
CREATE POLICY "Customers can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Karigars can update booking status" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.karigars WHERE karigars.id = bookings.karigar_id AND karigars.user_id = auth.uid())
);
CREATE POLICY "Customers can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = customer_id);

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  karigar_id UUID NOT NULL REFERENCES public.karigars(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Function to update karigar stats after a review
CREATE OR REPLACE FUNCTION public.update_karigar_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.karigars SET
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE karigar_id = NEW.karigar_id),
    rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE karigar_id = NEW.karigar_id)
  WHERE id = NEW.karigar_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_karigar_stats_on_review
AFTER INSERT ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_karigar_stats();

-- Function to update karigar completed_jobs and earnings on booking completion
CREATE OR REPLACE FUNCTION public.update_karigar_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.karigars SET
      completed_jobs = completed_jobs + 1,
      total_earnings = total_earnings + price
    WHERE id = NEW.karigar_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_karigar_on_booking_completion
AFTER UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_karigar_on_completion();
