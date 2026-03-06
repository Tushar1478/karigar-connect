
-- Drop the restrictive policies
DROP POLICY IF EXISTS "Karigars can update booking status" ON public.bookings;
DROP POLICY IF EXISTS "Customers can update own bookings" ON public.bookings;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Karigars can update booking status"
ON public.bookings
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM karigars
  WHERE karigars.id = bookings.karigar_id
  AND karigars.user_id = auth.uid()
));

CREATE POLICY "Customers can update own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = customer_id);
