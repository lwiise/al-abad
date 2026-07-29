-- ============================================================================
-- 0006_final_cta_copy.sql — the closing CTA card gained three pieces of copy
-- in its redesign (eyebrow badge, subhead, social-proof line). They were
-- component defaults; this makes them editable from the admin panel like every
-- other line on the homepage.
-- ============================================================================
-- Idempotent: add-if-not-exists + coalesce backfill (never clobbers edits).
-- ============================================================================

alter table public.site_settings
  add column if not exists final_cta_eyebrow text,
  add column if not exists final_cta_subhead text,
  add column if not exists final_cta_proof   text;

-- Backfill the component defaults onto the single settings row. coalesce keeps
-- any value the owner has already saved, so this stays safe to re-run.
update public.site_settings set
  final_cta_eyebrow = coalesce(final_cta_eyebrow, 'لا تؤجّل البداية'),
  final_cta_subhead = coalesce(
    final_cta_subhead,
    'اختر الدورة التي تناسب مرحلتك، أو راسلنا على واتساب وسنساعدك في اختيار الأنسب لك.'
  ),
  final_cta_proof   = coalesce(final_cta_proof, 'انضم إلى آلاف المتدربين والمتدربات');
