-- ============================================================================
-- 0007_ai_waitlist_section.sql — the waiting-list section's two owner-facing
-- strings: the submit button's label and the reassurance note under the form.
-- ============================================================================
-- Both were hardcoded in components/sections/ai-waitlist-form.tsx. They are the
-- strings an owner actually wants to tune (the note in particular is a promise
-- about their data), so they move into site_settings. The rest of the form —
-- the email placeholder, the pending label, and the success/error messages —
-- stays in code: those are interface states, not marketing copy.
--
-- Idempotent: add-if-not-exists + coalesce backfill (never clobbers edits).
-- ============================================================================

alter table public.site_settings
  add column if not exists ai_cta_label text,
  add column if not exists ai_note      text;

update public.site_settings set
  ai_cta_label = coalesce(ai_cta_label, 'انضم لقائمة الانتظار'),
  ai_note      = coalesce(ai_note,      'لن نشارك بريدك مع أحد، ويمكنك إلغاء الاشتراك في أي وقت.');

-- The rebuilt section splits the headline at the ellipsis and sets the tail in
-- violet — the same device the hero uses for its Ruqʿah line. Upgrade ONLY the
-- value 0002/seed_homepage wrote: an owner's own headline is never touched, and
-- one without an ellipsis simply renders as a single line with no accent.
update public.site_settings set
  ai_headline = 'سؤالك لا ينتظر موعد الدرس… مساعدك الذكي يجيب فوراً'
where ai_headline is null or ai_headline = 'مساعدك الذكي للتعلّم';
