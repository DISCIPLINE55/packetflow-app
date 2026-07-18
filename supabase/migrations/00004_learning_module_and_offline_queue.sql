-- ─── Learning Module ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.lessons (
  id          TEXT PRIMARY KEY,
  category    TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  content     JSONB NOT NULL DEFAULT '[]',   -- array of {type, body, code?}
  order_index INTEGER NOT NULL DEFAULT 0,
  difficulty  TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')) DEFAULT 'beginner',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flashcard_decks (
  id          TEXT PRIMARY KEY,
  lesson_id   TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.flashcards (
  id        TEXT PRIMARY KEY,
  deck_id   TEXT REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front     TEXT NOT NULL,
  back      TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id          TEXT PRIMARY KEY,
  lesson_id   TEXT REFERENCES public.lessons(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id            TEXT PRIMARY KEY,
  quiz_id       TEXT REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  options       JSONB NOT NULL,  -- array of strings
  correct_index INTEGER NOT NULL,
  explanation   TEXT,
  order_index   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed    BOOLEAN DEFAULT FALSE,
  quiz_score   INTEGER,  -- 0-100
  last_viewed  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, lesson_id)
);

-- ─── Offline Queue (tracked in Supabase for conflict resolution metadata) ──

CREATE TABLE IF NOT EXISTS public.offline_sync_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id   TEXT NOT NULL,
  payload      JSONB NOT NULL,
  synced_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── RLS ─────────────────────────────────────────────────────────────────

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_sync_log ENABLE ROW LEVEL SECURITY;

-- Public read for lesson content
CREATE POLICY "lessons_public_read" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "decks_public_read"   ON public.flashcard_decks FOR SELECT USING (true);
CREATE POLICY "cards_public_read"   ON public.flashcards FOR SELECT USING (true);
CREATE POLICY "quizzes_public_read" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "questions_public_read" ON public.quiz_questions FOR SELECT USING (true);

-- User progress: own rows only
CREATE POLICY "progress_select" ON public.user_lesson_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "progress_insert" ON public.user_lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "progress_update" ON public.user_lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- Offline sync log: own rows only
CREATE POLICY "sync_log_select" ON public.offline_sync_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sync_log_insert" ON public.offline_sync_log FOR INSERT WITH CHECK (auth.uid() = user_id);
