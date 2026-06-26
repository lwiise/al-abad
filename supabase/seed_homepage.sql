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

-- Trust-strip stats (الدورات/+15 already seeded in seed.sql).
insert into public.stats (label, value, sort_order, is_published)
select 'متدربون', 'آلاف', 2, true
where not exists (select 1 from public.stats where label = 'متدربون');

insert into public.stats (label, value, sort_order, is_published)
select 'هدف الرؤية', '100 ألف', 3, true
where not exists (select 1 from public.stats where label = 'هدف الرؤية');
