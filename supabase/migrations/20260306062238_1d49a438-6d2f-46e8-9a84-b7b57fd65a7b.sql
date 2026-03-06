
-- Drop ALL existing bookings policies to start clean
DROP POLICY IF EXISTS "Customers can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Customers can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Karigars can update booking status" ON public.bookings;
DROP POLICY IF EXISTS "Karigars can view their bookings" ON public.bookings;

-- Recreate as PERMISSIVE (default) policies
CREATE POLICY "Customers can view own bookings"
ON public.bookings FOR SELECT TO authenticated
USING (auth.uid() = customer_id);

CREATE POLICY "Karigars can view their bookings"
ON public.bookings FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM karigars
  WHERE karigars.id = bookings.karigar_id
  AND karigars.user_id = auth.uid()
));

CREATE POLICY "Customers can create bookings"
ON public.bookings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own bookings"
ON public.bookings FOR UPDATE TO authenticated
USING (auth.uid() = customer_id);

CREATE POLICY "Karigars can update booking status"
ON public.bookings FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM karigars
  WHERE karigars.id = bookings.karigar_id
  AND karigars.user_id = auth.uid()
));
