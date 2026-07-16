-- ============================================================================
-- 0005_page_headers.sql — make the /blog and /contact page headers editable
-- from the admin panel (previously hardcoded in the page components).
-- ============================================================================
-- Idempotent: add-if-not-exists + coalesce backfill (never clobbers edits).
-- ============================================================================

alter table public.site_settings
  -- /blog index page header
  add column if not exists blog_page_heading  text,
  add column if not exists blog_page_subhead  text,
  -- /contact page header
  add column if not exists contact_heading    text,
  add column if not exists contact_subhead    text;

-- Backfill the previously-hardcoded copy onto the single settings row. coalesce
-- keeps any value the owner has already saved, so this stays safe to re-run.
update public.site_settings set
  blog_page_heading = coalesce(blog_page_heading, 'المدونة'),
  blog_page_subhead = coalesce(blog_page_subhead, 'مقالاتٌ تثري وعيك حول العلاقة الزوجية.'),
  contact_heading   = coalesce(contact_heading,   'تواصل معنا'),
  contact_subhead   = coalesce(contact_subhead,   'سؤال عن دورة؟ أو رغبة في التسجيل؟ نحن هنا لمساعدتك.');
