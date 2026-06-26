-- ============================================================================
-- 0002_homepage_section_labels.sql — make every homepage section's framing
-- copy (eyebrows / titles / subheads / labels) editable from /admin/settings.
-- ============================================================================
-- Adds per-section label columns to the single site_settings row and backfills
-- them with the copy that was previously hardcoded in the section components,
-- so the admin form shows the current text and the public site is unchanged.
-- Idempotent: add-if-not-exists + coalesce backfill (never clobbers edits).
-- ============================================================================

alter table public.site_settings
  -- hero
  add column if not exists hero_trust_badge        text,
  -- problem / challenges
  add column if not exists problem_heading          text,
  add column if not exists problem_subhead          text,
  -- meet the instructor
  add column if not exists instructor_eyebrow       text,
  add column if not exists instructor_name          text,
  add column if not exists instructor_markers       jsonb,
  add column if not exists instructor_cta_label     text,
  -- courses showcase
  add column if not exists courses_eyebrow          text,
  add column if not exists courses_heading          text,
  add column if not exists courses_subhead          text,
  add column if not exists courses_view_all_label   text,
  -- how it works
  add column if not exists how_heading              text,
  add column if not exists how_subhead              text,
  -- outcomes
  add column if not exists outcomes_heading         text,
  add column if not exists outcomes_subhead         text,
  -- AI teaser
  add column if not exists ai_badge                 text,
  -- testimonials
  add column if not exists testimonials_ribbon      text,
  add column if not exists testimonials_eyebrow     text,
  add column if not exists testimonials_heading     text,
  -- faq
  add column if not exists faq_eyebrow              text,
  add column if not exists faq_heading              text,
  add column if not exists faq_help_text            text,
  add column if not exists faq_help_cta_label       text,
  -- blog teaser
  add column if not exists blog_heading             text,
  add column if not exists blog_subhead             text,
  add column if not exists blog_view_all_label      text;

-- Backfill the previously-hardcoded copy onto the single settings row. coalesce
-- keeps any value the owner has already saved, so this stays safe to re-run.
update public.site_settings set
  hero_trust_badge      = coalesce(hero_trust_badge,      'موثوق من آلاف المتدربين'),
  problem_heading       = coalesce(problem_heading,       'هل تواجه أياً من هذه التحديات؟'),
  problem_subhead       = coalesce(problem_subhead,       'معظم العلاقات لا تتعثّر لقلة الحب، بل لغياب الأدوات. أنت لست وحدك — وهذه نقطة البداية.'),
  instructor_eyebrow    = coalesce(instructor_eyebrow,    'تعرّف على مدرّبك'),
  instructor_name       = coalesce(instructor_name,       'الأستاذ علي العباد'),
  instructor_markers    = coalesce(instructor_markers,    '["منهج علميّ","أدوات عملية","خبرة ميدانية"]'::jsonb),
  instructor_cta_label  = coalesce(instructor_cta_label,  'نبذة عن الأستاذ'),
  courses_eyebrow       = coalesce(courses_eyebrow,       'الدورات'),
  courses_heading       = coalesce(courses_heading,       'دوراتٌ تأخذ بيدك خطوة بخطوة'),
  courses_subhead       = coalesce(courses_subhead,       'محتوى عمليّ مصمّم لتطبّقه في حياتك — اختر ما يناسب وضعك وابدأ اليوم.'),
  courses_view_all_label = coalesce(courses_view_all_label, 'عرض جميع الدورات'),
  how_heading           = coalesce(how_heading,           'كيف تبدأ؟'),
  how_subhead           = coalesce(how_subhead,           'ثلاث خطوات بسيطة من التصفّح إلى التطبيق.'),
  outcomes_heading      = coalesce(outcomes_heading,      'ماذا ستكتسب؟'),
  outcomes_subhead      = coalesce(outcomes_subhead,      'ليست معلومات تُنسى، بل تغييرٌ تعيشه في علاقتك.'),
  ai_badge              = coalesce(ai_badge,              'قريباً'),
  testimonials_ribbon   = coalesce(testimonials_ribbon,   'قصص نجاح حقيقية'),
  testimonials_eyebrow  = coalesce(testimonials_eyebrow,  'آراء المتدربين'),
  testimonials_heading  = coalesce(testimonials_heading,  'بعضٌ مما قاله الأحباب'),
  faq_eyebrow           = coalesce(faq_eyebrow,           'الأسئلة الشائعة'),
  faq_heading           = coalesce(faq_heading,           'إجاباتٌ عن أكثر ما يُسأل'),
  faq_help_text         = coalesce(faq_help_text,         'لم تجد إجابتك؟'),
  faq_help_cta_label    = coalesce(faq_help_cta_label,    'تواصل معنا'),
  blog_heading          = coalesce(blog_heading,          'أحدث المقالات'),
  blog_subhead          = coalesce(blog_subhead,          'مقالاتٌ تثري وعيك حول العلاقة الزوجية.'),
  blog_view_all_label   = coalesce(blog_view_all_label,   'عرض جميع المقالات');
