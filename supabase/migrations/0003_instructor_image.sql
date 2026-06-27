-- ============================================================================
-- 0003_instructor_image.sql — give the "تعرّف على مدرّبك" section its own image,
-- separate from the hero portrait (previously both used hero_image_url).
-- ============================================================================
-- Editable from /admin/settings → قسم المدرّب. When left empty, the section
-- falls back to the hero image, so nothing looks broken before it's set.
-- Idempotent: add-if-not-exists.
-- ============================================================================

alter table public.site_settings
  add column if not exists instructor_image_url text;
