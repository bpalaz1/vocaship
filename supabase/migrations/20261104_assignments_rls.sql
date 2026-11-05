-- =========================================================================
-- SUPABASE MIGRATION: Ödev Yönetim Sistemi Veri İzolasyonu & RLS Politikaları
-- =========================================================================

-- 1. Sınıf Üyelikleri Tablosu (class_members)
CREATE TABLE IF NOT EXISTS public.class_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    class_code VARCHAR(20) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'assistant', 'auditor')),
    joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (class_id, user_id)
);

-- Hızlı sorgulama için indeksler
CREATE INDEX IF NOT EXISTS idx_class_members_user_id ON public.class_members(user_id);
CREATE INDEX IF NOT EXISTS idx_class_members_class_id ON public.class_members(class_id);

-- 2. Ödevler Tablosunda RLS Aktifleştirme (assignments)
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_assignments ENABLE ROW LEVEL SECURITY;

-- 3. ÖĞRENCİ ERİŞİM POLİTİKASI (VERİ İZOLASYONU GÜVENCESİ):
-- Bir öğrenci yalnızca kayıtlı/üye olduğu sınıflara atanmış ödevleri görebilir.
-- Yetkisiz sınıfların ödevleri RLS seviyesinde kesinlikle sorgu sonucuna dahil edilmez.
DROP POLICY IF EXISTS "student_view_assigned_homework" ON public.assignments;
CREATE POLICY "student_view_assigned_homework" ON public.assignments
FOR SELECT USING (
  class_id IN (
    SELECT class_id FROM public.class_members 
    WHERE user_id = auth.uid()
  )
  OR teacher_id = auth.uid()
);

-- classroom_assignments tablosu için de aynı izolasyon kuralı:
DROP POLICY IF EXISTS "student_view_classroom_assignments" ON public.classroom_assignments;
CREATE POLICY "student_view_classroom_assignments" ON public.classroom_assignments
FOR SELECT USING (
  classroom_id IN (
    SELECT class_id::text FROM public.class_members 
    WHERE user_id = auth.uid()
  )
  OR class_code IN (
    SELECT class_code FROM public.class_members 
    WHERE user_id = auth.uid()
  )
  OR teacher_id = auth.uid()
);

-- 4. ÖĞRETMEN YÖNETİM POLİTİKASI:
-- Öğretmenler yalnızca kendi oluşturdukları sınıflara ödev ekleyebilir, güncelleyebilir ve silebilir.
DROP POLICY IF EXISTS "teacher_manage_assigned_homework" ON public.assignments;
CREATE POLICY "teacher_manage_assigned_homework" ON public.assignments
FOR ALL USING (
  teacher_id = auth.uid()
);

DROP POLICY IF EXISTS "teacher_manage_classroom_assignments" ON public.classroom_assignments;
CREATE POLICY "teacher_manage_classroom_assignments" ON public.classroom_assignments
FOR ALL USING (
  teacher_id = auth.uid()
);

-- 5. ÖDEV TESLİM VE İLERLEME TABLOSU (assignment_progress):
CREATE TABLE IF NOT EXISTS public.assignment_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    score INTEGER DEFAULT 0,
    answers JSONB DEFAULT '[]'::jsonb,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (assignment_id, user_id)
);

ALTER TABLE public.assignment_progress ENABLE ROW LEVEL SECURITY;

-- Öğrenci kendi ilerlemesini görebilir ve güncelleyebilir, öğretmen inceleyebilir:
DROP POLICY IF EXISTS "student_manage_own_progress" ON public.assignment_progress;
CREATE POLICY "student_manage_own_progress" ON public.assignment_progress
FOR ALL USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.assignments a 
    WHERE a.id = assignment_progress.assignment_id 
    AND a.teacher_id = auth.uid()
  )
);

