-- ============================================================================
-- 0004_instructor_image.sql — give the "meet the instructor" (قسم المدرّب)
-- homepage section its own coach photo, editable from /admin/settings.
-- ============================================================================
-- Until now the coach section reused hero_image_url. This adds a dedicated
-- instructor_image_url so the owner can set the coach photo independently of
-- the hero. Left null: the section falls back to the hero image, so the public
-- site is unchanged until a photo is uploaded.
-- Idempotent: add-if-not-exists.
-- ============================================================================

alter table public.site_settings
  add column if not exists instructor_image_url text;
