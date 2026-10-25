-- UUID üretimi için pgcrypto eklentisini aç
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. KULLANICILAR TABLOSU
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    is_pro BOOLEAN DEFAULT FALSE,
    is_educator BOOLEAN DEFAULT FALSE,
    subscription_id TEXT,
    daily_ai_requests INT DEFAULT 0,
    last_request_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ÇALIŞMA SETLERİ (DESTELER)
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    source_lang TEXT DEFAULT 'tr',
    target_lang TEXT DEFAULT 'en',
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FLASHCARDLAR (SM-2 ALGORİTMASI & DİL DESTEKLİ)
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    phonetic TEXT,
    meanings JSONB DEFAULT '[]'::jsonb,
    grammar_notes TEXT,
    example_sentences JSONB DEFAULT '[]'::jsonb,
    collocations JSONB DEFAULT '[]'::jsonb,
    -- SuperMemo-2 (SM-2) Parametreleri
    ease_factor FLOAT DEFAULT 2.5,
    interval_days INT DEFAULT 0,
    repetitions INT DEFAULT 0,
    repetition_number INT DEFAULT 0,
    -- Zayıf Nokta Avcısı (Weak-Spot Hunter) Parametreleri
    mistake_count INT DEFAULT 0,
    consecutive_correct INT DEFAULT 0,
    needs_review BOOLEAN DEFAULT FALSE,
    next_review_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SINIFLAR (CLASSES)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    join_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SINIF ÜYELERİ (ÖĞRENCİLER)
CREATE TABLE IF NOT EXISTS public.class_members (
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (class_id, user_id)
);

-- 6. ÖDEVLER (ASSIGNMENTS)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    required_mastery_percent INT DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ÖDEV İLERLEME TAKİBİ
CREATE TABLE IF NOT EXISTS public.assignment_progress (
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    score NUMERIC DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (assignment_id, user_id)
);

-- 8. SINIF DUYURULARI (TEK YÖNLÜ GÜVENLİ İLETİŞİM)
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hızlı sorgular için indeksler
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON public.flashcards(next_review_date);
CREATE INDEX IF NOT EXISTS idx_decks_user_id ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_join_code ON public.classes(join_code);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.assignments(class_id);
