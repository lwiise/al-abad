-- ============================================================================
-- FULL SETUP — schema + seed for الأستاذ علي العباد marketing/CMS
-- Paste this ENTIRE file into the Supabase SQL Editor and run once.
-- Safe to re-run (idempotent).
-- ============================================================================

-- updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- courses
create table if not exists public.courses (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  subtitle       text,
  description    text,
  hero_image_url text,
  price          numeric,
  currency       text not null default 'SAR',
  cta_url        text,
  category       text,
  sort_order     int not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists courses_sort_order_idx on public.courses (sort_order);

-- blog_posts
create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  excerpt         text,
  body            text,
  cover_image_url text,
  is_published    boolean not null default true,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists blog_posts_published_at_idx on public.blog_posts (published_at desc);

-- testimonials
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

-- faqs
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

-- stats
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

-- how_it_works_steps
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

-- site_settings (single row)
create table if not exists public.site_settings (
  id            uuid primary key default gen_random_uuid(),
  promo_enabled  boolean not null default false,
  promo_bar_text text,
  promo_code     text,
  hero_headline           text,
  hero_subhead            text,
  hero_image_url          text,
  hero_primary_cta_label  text,
  hero_primary_cta_url    text,
  hero_secondary_cta_label text,
  hero_secondary_cta_url  text,
  hero_microproof         text,
  ai_headline text,
  ai_subhead  text,
  ai_points   jsonb,
  problem_points jsonb,
  outcome_points jsonb,
  vision_text      text,
  vision_cta_label text,
  vision_cta_url   text,
  final_cta_heading        text,
  final_cta_primary_label  text,
  final_cta_primary_url    text,
  final_cta_secondary_label text,
  final_cta_secondary_url  text,
  about_body      text,
  whatsapp_number text,
  contact_email   text,
  social_links    jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- contact_submissions (lead)
create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  message    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_submissions_created_at_idx on public.contact_submissions (created_at desc);

-- ai_waitlist (lead)
create table if not exists public.ai_waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- admin_users (owner / staff auth allowlist)
create table if not exists public.admin_users (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  role       text not null default 'owner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at triggers (one per table)
do $$
declare t text;
begin
  foreach t in array array[
    'courses','blog_posts','testimonials','faqs','stats','how_it_works_steps',
    'site_settings','contact_submissions','ai_waitlist','admin_users'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
       for each row execute function public.set_updated_at();', t
    );
  end loop;
end $$;

-- Row Level Security
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

drop policy if exists "read published courses"      on public.courses;
drop policy if exists "read published blog_posts"   on public.blog_posts;
drop policy if exists "read published testimonials" on public.testimonials;
drop policy if exists "read published faqs"         on public.faqs;
drop policy if exists "read published stats"        on public.stats;
drop policy if exists "read published steps"        on public.how_it_works_steps;
drop policy if exists "read site_settings"          on public.site_settings;
drop policy if exists "insert contact"              on public.contact_submissions;
drop policy if exists "insert waitlist"             on public.ai_waitlist;

create policy "read published courses"      on public.courses            for select to anon, authenticated using (is_published = true);
create policy "read published blog_posts"   on public.blog_posts         for select to anon, authenticated using (is_published = true);
create policy "read published testimonials" on public.testimonials       for select to anon, authenticated using (is_published = true);
create policy "read published faqs"         on public.faqs               for select to anon, authenticated using (is_published = true);
create policy "read published stats"        on public.stats              for select to anon, authenticated using (is_published = true);
create policy "read published steps"        on public.how_it_works_steps for select to anon, authenticated using (is_published = true);
create policy "read site_settings"          on public.site_settings      for select to anon, authenticated using (true);
create policy "insert contact"  on public.contact_submissions for insert to anon, authenticated with check (true);
create policy "insert waitlist" on public.ai_waitlist          for insert to anon, authenticated with check (true);

-- Storage: public media bucket
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

-- ============================================================================
-- SEED — real starter content
-- ============================================================================

-- Courses (15)
insert into public.courses (slug, title, cta_url, sort_order, is_published)
select slug, title, 'https://www.al-abbad.com/academy-courses/' || slug, sort_order, true
from (values
  (1,  'comprehensive-marriage-guide-in-8-parts',                 'الموجه الزواجي'),
  (2,  'characteristics-of-the-marriage-guide',                   'خصائص الموجه الزواجي'),
  (3,  'marital-compatibility',                                   'دورة التوافق الزواجي'),
  (4,  'love-cycle-and-attachment-patterns',                      'الحب وأنماط التعلق'),
  (5,  'emotion-management',                                      'إدارة الانفعالات'),
  (6,  'stress-management',                                       'إدارة الضغوطات'),
  (7,  'understanding-the-drivers-of-behavior',                   'فهم دوافع السلوك'),
  (8,  'practical-steps-to-deal-with-marital-problems',           'الخطوات العملية للتعامل مع المشاكل الزوجية'),
  (9,  'windows-to-marriage',                                     'النوافذ الزوجية'),
  (10, 'anxiety-management-course',                               'دورة إدارة القلق'),
  (11, 'body-language-course',                                    'دورة لغة الجسد'),
  (12, 'marriage-choice-course',                                  'دورة الاختيار الزواجي'),
  (13, 'power-balance-cycle-between-spouses',                     'دورة توازن القوى بين الزوجين'),
  (14, 'secrets-of-the-sexual-relationship-between-spouses',      'أسرار العلاقة الجنسية بين الزوجين'),
  (15, 'gps-marital-relationship',                                'GPS العلاقة الزوجية')
) as v(sort_order, slug, title)
on conflict (slug) do nothing;

-- Site settings (single row)
insert into public.site_settings (
  promo_enabled, promo_bar_text, promo_code,
  whatsapp_number, vision_text, social_links
)
select
  false,
  'فرصة عيد الفطر · أي دورة بنصف السعر · استخدم الكود EID26',
  'EID26',
  '966501763435',
  'تدريب وإعداد 100 ألف موجه زواجي محترف بطريقة عملية ومهنية بهدف نشر الوعي الزواجي والأسري وتطوير مجتمع واعٍ وسعيد يتجاوز كل المشاكل الأسرية والزواجية والنفسية',
  jsonb_build_object(
    'facebook',  'https://www.facebook.com/alabbadali.a',
    'tiktok',    'https://www.tiktok.com/@alabbadali_a',
    'snapchat',  'https://www.snapchat.com/add/alabbadali_a',
    'telegram',  'https://t.me/alabbadali',
    'youtube',   'https://www.youtube.com/c/AliAlabbad1',
    'twitter',   'https://twitter.com/alabbadali_a',
    'instagram', 'https://www.instagram.com/alabbadali_a/'
  )
where not exists (select 1 from public.site_settings);

-- Stats
insert into public.stats (label, value, sort_order, is_published)
select 'الدورات', '+15', 1, true
where not exists (select 1 from public.stats);

-- How it works (3 steps)
insert into public.how_it_works_steps (title, description, sort_order, is_published)
select * from (values
  ('اختر دورتك',            'تصفّح الدورات واختر ما يناسب وضعك', 1, true),
  ('سجّل وتعلّم على راحتك', 'ادخل إلى المنصة وتعلّم في أي وقت',  2, true),
  ('طبّق وحقّق نتائج',      'حوّل ما تعلمته إلى خطوات عملية',     3, true)
) as v(title, description, sort_order, is_published)
where not exists (select 1 from public.how_it_works_steps);

-- FAQs (5)
insert into public.faqs (question, answer, sort_order, is_published)
select * from (values
  ('كيف أصل إلى الدورة بعد الشراء؟',          '> TODO: يكتبها المالك', 1, true),
  ('هل الوصول إلى الدورة مدى الحياة؟',        '> TODO: يكتبها المالك', 2, true),
  ('هل الدورات تناسب المبتدئين؟',             '> TODO: يكتبها المالك', 3, true),
  ('ما طرق الدفع المتاحة؟',                   '> TODO: يكتبها المالك', 4, true),
  ('هل أحصل على شهادة بعد إتمام الدورة؟',     '> TODO: يكتبها المالك', 5, true)
) as v(question, answer, sort_order, is_published)
where not exists (select 1 from public.faqs);

-- Testimonials (3, verbatim)
insert into public.testimonials (author_name, author_title, quote, sort_order, is_published)
select * from (values
  (
    'خديجة العتيبي',
    'كوتش ممارس ومدربة معتمدة',
    'أولاً أشكر الأستاذ علي العباد على هذه الدورة الرائعة التي زادت لدينا الوعي والإدراك لعمق مفهوم الحياة الزوجية ودور الموجه فيها، والقواعد والمهارات التي تعين الموجه الزواجي على حل مشكلات العملاء بطريقة علمية ومنطقية. الدورة جداً رائعة، والمحتوى رائع وبسيط، وأداء المدرب رائع ومبسط وقمة في عطاء المعلومات المفيدة.',
    1, true
  ),
  (
    'رقية المكي',
    'مدربة في مجال تطوير الذات، حاصلة على شهادة المرأة القيادية الناجحة',
    'أن تعي وتفهم ما يُقدَّم وتصحح مفاهيمك من منظور شخص ذي خبرة وإبداع في عالم الحياة الزوجية المقدسة — هو المكسب الحقيقي. التحاقي بهذه الدورة كان حلماً تمنيته وتحقق، والأفضل من ذلك اكتسابي مهارات وتغيير قناعات نحن في حاجة لها. والجميل فيها طرح مبدع ومتألق مع الأستاذ علي.',
    2, true
  ),
  (
    'فاطمة النعمي',
    'أستاذة معيدة في كلية التصاميم — جامعة الإمام عبد الرحمن بن فيصل',
    'المحتوى في الحقيبة كان جداً مفيداً، وإلى الآن أرجع له بين الحين والآخر. المحتوى خلال الورش والنصائح والإرشاد من أ. علي العباد كان شيقاً ومثرياً، وواضح أن الأمثلة والنصائح نبعت عن تجربة ودراسة وخبرة، مما جعل الورشة ذات قيمة عالية. أسلوب أ. علي أكثر من رائع، وقدرته على التواصل مع أكثر من فئة عمرية تستحق الاحترام والتقدير.',
    3, true
  )
) as v(author_name, author_title, quote, sort_order, is_published)
where not exists (select 1 from public.testimonials);

-- Blog (3 stubs)
insert into public.blog_posts (slug, title, body, is_published)
select * from (values
  ('stages-of-marital-choice-its-rules-and-premises',                       'مراحل الاختيار الزواجي.. قواعده ومنطلقاته',           '> TODO: migrate full text', true),
  ('marital-choice-and-decision-making',                                    'الاختيار الزواجي واتخاذ القرار',                     '> TODO: migrate full text', true),
  ('consulting-marital-relations-specialists-is-a-necessity-not-a-luxury',  'استشارة مختصي العلاقات الزوجية ضرورة وليست ترف!',    '> TODO: migrate full text', true)
) as v(slug, title, body, is_published)
on conflict (slug) do nothing;
