-- ============================================================================
-- 0003_course_landing.sql — course detail "sales page" schema
-- ============================================================================
-- Phase 2 turns the course detail page into a conversion-focused landing page.
-- Adds a few sales fields to `courses` and a `course_modules` table for the
-- curriculum accordion. Same conventions as 0001: updated_at trigger + RLS with
-- public read of published rows; admin writes go through the service-role key.
-- Idempotent: add-if-not-exists / create-if-not-exists / drop-then-create.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- courses: sales-page fields
-- ----------------------------------------------------------------------------
alter table public.courses
  add column if not exists price_original   numeric,   -- anchor price (struck through)
  add column if not exists video_preview_url text,     -- YouTube preview (optional)
  add column if not exists guarantee_text    text,     -- risk-reversal line
  add column if not exists outcomes          jsonb;    -- ["...","..."] — "ماذا ستتعلّم"

-- ----------------------------------------------------------------------------
-- course_modules: curriculum rows for the accordion (one course → many modules)
-- ----------------------------------------------------------------------------
create table if not exists public.course_modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses (id) on delete cascade,
  title        text not null,
  lessons      int,
  duration     text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists course_modules_course_sort_idx
  on public.course_modules (course_id, sort_order);

-- ----------------------------------------------------------------------------
-- updated_at trigger (mirrors the per-table triggers in 0001)
-- ----------------------------------------------------------------------------
drop trigger if exists trg_course_modules_updated_at on public.course_modules;
create trigger trg_course_modules_updated_at
  before update on public.course_modules
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security: public read of published modules (same pattern as courses)
-- ----------------------------------------------------------------------------
alter table public.course_modules enable row level security;

drop policy if exists "read published course_modules" on public.course_modules;
create policy "read published course_modules"
  on public.course_modules
  for select to anon, authenticated
  using (is_published = true);
