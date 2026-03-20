-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Fix Members Policy (Allow All Actions, including Delete)
DROP POLICY IF EXISTS "Authenticated users can manage members" ON public.members;
CREATE POLICY "Authenticated users can manage members" 
ON public.members 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Fix Expenses Policy (Allow All Actions, including Delete)
DROP POLICY IF EXISTS "Authenticated users can manage expenses" ON public.expenses;
CREATE POLICY "Authenticated users can manage expenses" 
ON public.expenses 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Ensure Attendance and Payments also allow deletions (cascading)
DROP POLICY IF EXISTS "Authenticated users can manage attendance" ON public.attendance;
CREATE POLICY "Authenticated users can manage attendance" 
ON public.attendance 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can manage payments" ON public.payments;
CREATE POLICY "Authenticated users can manage payments" 
ON public.payments 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);
