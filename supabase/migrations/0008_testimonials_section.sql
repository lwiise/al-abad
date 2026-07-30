-- ============================================================================
-- 0008_testimonials_section.sql — the four strings the rebuilt الآراء section
-- adds: a subhead, a social-proof line, and a CTA label + url.
-- ============================================================================
-- The section used to be an eyebrow, a heading and a carousel of cards, so two
-- strings covered it. The rebuild is a full composition — badge, headline,
-- subhead, the card deck, a proof line and a button — and every part of it that
-- is marketing copy belongs to the owner rather than to the component.
--
-- What deliberately stays in code: the "السابق / التالي" arrow labels and the
-- "اقرأ المزيد / عرض أقل" toggle. Those are interface states, the same split
-- 0007 drew across the waiting-list form.
--
-- `testimonials_ribbon` (0002) is left alone. Nothing has rendered it since the
-- section was first built and this migration does not start; dropping a column
-- an owner may have typed into is not worth the tidiness.
--
-- Idempotent: add-if-not-exists + coalesce backfill (never clobbers edits).
-- ============================================================================

alter table public.site_settings
  add column if not exists testimonials_subhead   text,
  add column if not exists testimonials_proof     text,
  add column if not exists testimonials_cta_label text,
  add column if not exists testimonials_cta_url   text;

update public.site_settings set
  testimonials_subhead   = coalesce(
    testimonials_subhead,
    'كلماتٌ من أزواجٍ وزوجاتٍ ساروا في الطريق نفسه، وكتبوا ما تغيّر في بيوتهم بعد التطبيق.'
  ),
  testimonials_proof     = coalesce(
    testimonials_proof,
    'انضم إلى آلاف المتدربين والمتدربات الذين بدأوا من حيث أنت الآن.'
  ),
  testimonials_cta_label = coalesce(testimonials_cta_label, 'ابدأ رحلتك'),
  testimonials_cta_url   = coalesce(testimonials_cta_url,   '/الدورات');

-- The rebuilt heading splits at the ellipsis and sets the tail on its own line
-- in lilac — the device sections 7 and 10 already use. Upgrade ONLY the value
-- 0002/seed_homepage wrote: an owner's own heading is never touched, and one
-- without an ellipsis simply renders as a single line with no accent.
update public.site_settings set
  testimonials_heading = 'بعضٌ مما قاله الأحباب… بكلماتهم هم'
where testimonials_heading is null or testimonials_heading = 'بعضٌ مما قاله الأحباب';
