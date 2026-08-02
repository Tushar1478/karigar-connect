DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Signed-in users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.profiles FROM anon;

DROP POLICY IF EXISTS "Anyone can view karigars" ON public.karigars;
CREATE POLICY "Signed-in users can view karigars" ON public.karigars FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.karigars FROM anon;