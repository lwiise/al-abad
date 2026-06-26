-- ============================================================================
-- seed_homepage.sql — Phase 2 homepage copy fill (idempotent)
-- ============================================================================
-- Locked marketing copy for the single site_settings row + two trust-strip
-- stats. Everything stays editable in /admin afterwards. Re-runnable.
-- ============================================================================

update public.site_settings set
  hero_headline           = 'زواج أكثر وعياً… وعلاقة تدوم',
  hero_subhead            = 'تعلّم — مع الأستاذ علي العباد — كيف تفهم نفسك وشريكك، وتبني علاقةً زوجيةً متوازنةً وسعيدة، عبر دوراتٍ عمليّة تأخذ بيدك خطوة بخطوة.',
  hero_microproof         = 'أكثر من 15 دورة متخصصة · آلاف المتدربين · خبرة عملية موثوقة',
  hero_primary_cta_label  = 'ابدأ رحلتك',
  hero_primary_cta_url    = '#courses',
  hero_secondary_cta_label = 'تعرّف على الأستاذ علي',
  hero_secondary_cta_url  = '/نبذة',
  ai_headline             = 'مساعدك الذكي للتعلّم',
  ai_subhead              = 'مساعدٌ ذكيّ مدرَّب على محتوى الأكاديمية، يجيب أسئلتك ويرشدك خطوة بخطوة — متاحٌ على مدار الساعة.',
  ai_points               = '["إجاباتٌ فورية من الدورات","إرشادٌ بين الدروس","متاحٌ دائماً"]'::jsonb,
  problem_points          = '["ضعف التواصل","تكرار الخلافات","حيرة الاختيار الزواجي","فتور العلاقة","القلق والضغوط الأسرية"]'::jsonb,
  outcome_points          = '["مهارات تواصل أعمق","فهمٌ لدوافع السلوك","أدوات عملية لحل الخلافات","ثقة في قراراتك الزوجية"]'::jsonb,
  vision_cta_label        = 'كن جزءاً من الرؤية',
  vision_cta_url          = '/الدورات',
  final_cta_heading       = 'ابدأ رحلتك نحو علاقةٍ أفضل اليوم',
  final_cta_primary_label = 'تصفح الدورات',
  final_cta_primary_url   = '/الدورات',
  final_cta_secondary_label = 'تحدث معنا على واتساب';

-- Section framing copy (eyebrows / titles / subheads / labels). Requires
-- migration 0002. Re-running resets these to the locked copy below.
update public.site_settings set
  hero_trust_badge        = 'موثوق من آلاف المتدربين',
  problem_heading         = 'هل تواجه أياً من هذه التحديات؟',
  problem_subhead         = 'معظم العلاقات لا تتعثّر لقلة الحب، بل لغياب الأدوات. أنت لست وحدك — وهذه نقطة البداية.',
  instructor_eyebrow      = 'تعرّف على مدرّبك',
  instructor_name         = 'الأستاذ علي العباد',
  instructor_markers      = '["منهج علميّ","أدوات عملية","خبرة ميدانية"]'::jsonb,
  instructor_cta_label    = 'نبذة عن الأستاذ',
  courses_eyebrow         = 'الدورات',
  courses_heading         = 'دوراتٌ تأخذ بيدك خطوة بخطوة',
  courses_subhead         = 'محتوى عمليّ مصمّم لتطبّقه في حياتك — اختر ما يناسب وضعك وابدأ اليوم.',
  courses_view_all_label  = 'عرض جميع الدورات',
  how_heading             = 'كيف تبدأ؟',
  how_subhead             = 'ثلاث خطوات بسيطة من التصفّح إلى التطبيق.',
  outcomes_heading        = 'ماذا ستكتسب؟',
  outcomes_subhead        = 'ليست معلومات تُنسى، بل تغييرٌ تعيشه في علاقتك.',
  ai_badge                = 'قريباً',
  testimonials_ribbon     = 'قصص نجاح حقيقية',
  testimonials_eyebrow    = 'آراء المتدربين',
  testimonials_heading    = 'بعضٌ مما قاله الأحباب',
  faq_eyebrow             = 'الأسئلة الشائعة',
  faq_heading             = 'إجاباتٌ عن أكثر ما يُسأل',
  faq_help_text           = 'لم تجد إجابتك؟',
  faq_help_cta_label      = 'تواصل معنا',
  blog_heading            = 'أحدث المقالات',
  blog_subhead            = 'مقالاتٌ تثري وعيك حول العلاقة الزوجية.',
  blog_view_all_label     = 'عرض جميع المقالات';

-- Trust-strip stats (الدورات/+15 already seeded in seed.sql).
insert into public.stats (label, value, sort_order, is_published)
select 'متدربون', 'آلاف', 2, true
where not exists (select 1 from public.stats where label = 'متدربون');

insert into public.stats (label, value, sort_order, is_published)
select 'هدف الرؤية', '100 ألف', 3, true
where not exists (select 1 from public.stats where label = 'هدف الرؤية');
