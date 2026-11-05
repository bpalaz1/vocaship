-- Migration: speaking_archives
-- Speaking Lounge oturumlarının transkriptini, karne skorlarını ve tarihini saklayan arşiv tablosu

CREATE TABLE IF NOT EXISTS speaking_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_title TEXT NOT NULL,
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index on user_id and created_at
CREATE INDEX IF NOT EXISTS idx_speaking_archives_user_created ON speaking_archives(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE speaking_archives ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'speaking_archives' AND policyname = 'Users can view own speaking archives'
    ) THEN
        CREATE POLICY "Users can view own speaking archives"
        ON speaking_archives FOR SELECT
        USING (auth.uid() = user_id OR auth.uid() IS NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'speaking_archives' AND policyname = 'Users can insert own speaking archives'
    ) THEN
        CREATE POLICY "Users can insert own speaking archives"
        ON speaking_archives FOR INSERT
        WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);
    END IF;
END $$;

