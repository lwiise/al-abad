-- ============================================================================
-- 0001_init — Marketing / CMS schema for الأستاذ علي العباد
-- ============================================================================
-- Scope: marketing site content only. The LMS (academy.al-abbad.com) is a
-- separate system. Future students/enrollments/payments tables can live in
-- THIS project later without touching anything below.
--
-- Conventions: snake_case; every table has id/created_at/updated_at; an
-- updated_at trigger keeps the timestamp fresh; RLS is enabled on every table.
-- Anonymous visitors may only read published content + settings and insert
-- leads. All admin writes happen server-side with the service-role key, which
-- bypasses RLS.
-- ============================================================================

-- gen_random_uuid() is in core Postgres (>= 13), which Supabase runs.

-- ----------------------------------------------------------------------------
-- updated_at trigger function
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- courses
-- ----------------------------------------------------------------------------
create table if not exists public.courses (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  subtitle       text,
  description    text,                      -- markdown
  hero_image_url text,
  price          numeric,
  currency       text not null default 'SAR',
  cta_url        text,                      -- enrol / buy destination
  category       text,
  sort_order     int not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists courses_sort_order_idx on public.courses (sort_order);

-- ----------------------------------------------------------------------------
-- blog_posts
-- ----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  body            text,                     -- markdown
  cover_image_url text,
  is_published    boolean not null default true,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc);

-- ----------------------------------------------------------------------------
-- testimonials
-- ----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  author_name  text not null,
  author_title text,
  quote        text not null,
  avatar_url   text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists testimonials_sort_order_idx on public.testimonials (sort_order);

-- ----------------------------------------------------------------------------
-- faqs
-- ----------------------------------------------------------------------------
create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists faqs_sort_order_idx on public.faqs (sort_order);

-- ----------------------------------------------------------------------------
-- stats
-- ----------------------------------------------------------------------------
create table if not exists public.stats (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,
  value        text not null,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists stats_sort_order_idx on public.stats (sort_order);

-- ----------------------------------------------------------------------------
-- how_it_works_steps
-- ----------------------------------------------------------------------------
create table if not exists public.how_it_works_steps (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  sort_order   int not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists how_it_works_steps_sort_order_idx on public.how_it_works_steps (sort_order);

-- ----------------------------------------------------------------------------
-- site_settings (single row, managed via the admin panel)
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id            uuid primary key default gen_random_uuid(),
  -- promo bar
  promo_enabled  boolean not null default false,
  promo_bar_text text,
  promo_code     text,
  -- hero
  hero_headline           text,
  hero_subhead            text,
  hero_image_url          text,
  hero_primary_cta_label  text,
  hero_primary_cta_url    text,
  hero_secondary_cta_label text,
  hero_secondary_cta_url  text,
  hero_microproof         text,
  -- AI block
  ai_headline text,
  ai_subhead  text,
  ai_points   jsonb,
  -- lists
  problem_points jsonb,
  outcome_points jsonb,
  -- vision
  vision_text      text,
  vision_cta_label text,
  vision_cta_url   text,
  -- final CTA
  final_cta_heading        text,
  final_cta_primary_label  text,
  final_cta_primary_url    text,
  final_cta_secondary_label text,
  final_cta_secondary_url  text,
  -- contact / social
  about_body      text,                     -- markdown
  whatsapp_number text,
  contact_email   text,
  social_links    jsonb,                     -- { facebook, tiktok, snapchat, telegram, youtube, twitter, instagram }
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- contact_submissions (lead)
-- ----------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  message    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);

-- ----------------------------------------------------------------------------
-- ai_waitlist (lead)
-- ----------------------------------------------------------------------------
create table if not exists public.ai_waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- admin_users (owner / staff auth allowlist)
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  role       text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- updated_at triggers (one per table)
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'courses','blog_posts','testimonials','faqs','stats','how_it_works_steps',
    'site_settings','contact_submissions','ai_waitlist','admin_users'
  ]
  loop
    execute format(
      'drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t
    );
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
       for each row execute function public.set_updated_at();', t
    );
  end loop;
end $$;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.courses             enable row level security;
alter table public.blog_posts          enable row level security;
alter table public.testimonials        enable row level security;
alter table public.faqs                enable row level security;
alter table public.stats               enable row level security;
alter table public.how_it_works_steps  enable row level security;
alter table public.site_settings       enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.ai_waitlist         enable row level security;
alter table public.admin_users         enable row level security;

-- Public read of PUBLISHED content (anon + signed-in visitors).
create policy "read published courses"      on public.courses            for select to anon, authenticated using (is_published = true);
create policy "read published blog_posts"   on public.blog_posts         for select to anon, authenticated using (is_published = true);
create policy "read published testimonials" on public.testimonials       for select to anon, authenticated using (is_published = true);
create policy "read published faqs"         on public.faqs               for select to anon, authenticated using (is_published = true);
create policy "read published stats"        on public.stats              for select to anon, authenticated using (is_published = true);
create policy "read published steps"        on public.how_it_works_steps for select to anon, authenticated using (is_published = true);

-- Site settings are public (footer/hero/contact content).
create policy "read site_settings" on public.site_settings for select to anon, authenticated using (true);

-- Leads: anyone may submit, nobody may read (admin reads via service-role).
create policy "insert contact" on public.contact_submissions for insert to anon, authenticated with check (true);
create policy "insert waitlist" on public.ai_waitlist          for insert to anon, authenticated with check (true);

-- admin_users: RLS enabled with ZERO policies → unreadable by any client role.
-- Membership is resolved server-side with the service-role key.

-- ============================================================================
-- Storage: public `media` bucket for uploaded images
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Public read of objects in the media bucket (uploads go through service-role).
drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');
