-- ============================================================================
-- seed.sql — real starter content for الأستاذ علي العباد
-- ============================================================================
-- Idempotent: courses/blog upsert on slug; the others only seed when their
-- table is still empty, so re-running won't create duplicates.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Courses (15) — cta_url points at the current academy until Phase 2 repoint.
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Site settings (single row) — copy filled later via the admin panel.
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Stats — owner adds متدربون / سنوات الخبرة via admin.
-- ----------------------------------------------------------------------------
insert into public.stats (label, value, sort_order, is_published)
select 'الدورات', '+15', 1, true
where not exists (select 1 from public.stats);

-- ----------------------------------------------------------------------------
-- How it works (3 steps)
-- ----------------------------------------------------------------------------
insert into public.how_it_works_steps (title, description, sort_order, is_published)
select * from (values
  ('اختر دورتك',            'تصفّح الدورات واختر ما يناسب وضعك', 1, true),
  ('سجّل وتعلّم على راحتك', 'ادخل إلى المنصة وتعلّم في أي وقت',  2, true),
  ('طبّق وحقّق نتائج',      'حوّل ما تعلمته إلى خطوات عملية',     3, true)
) as v(title, description, sort_order, is_published)
where not exists (select 1 from public.how_it_works_steps);

-- ----------------------------------------------------------------------------
-- FAQs (5) — answers are owner TODOs (depend on policies).
-- ----------------------------------------------------------------------------
insert into public.faqs (question, answer, sort_order, is_published)
select * from (values
  ('كيف أصل إلى الدورة بعد الشراء؟',          '> TODO: يكتبها المالك', 1, true),
  ('هل الوصول إلى الدورة مدى الحياة؟',        '> TODO: يكتبها المالك', 2, true),
  ('هل الدورات تناسب المبتدئين؟',             '> TODO: يكتبها المالك', 3, true),
  ('ما طرق الدفع المتاحة؟',                   '> TODO: يكتبها المالك', 4, true),
  ('هل أحصل على شهادة بعد إتمام الدورة؟',     '> TODO: يكتبها المالك', 5, true)
) as v(question, answer, sort_order, is_published)
where not exists (select 1 from public.faqs);

-- ----------------------------------------------------------------------------
-- Testimonials (3) — real people; quotes seeded verbatim.
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- Blog (3 stubs) — full text migrated later.
-- ----------------------------------------------------------------------------
insert into public.blog_posts (slug, title, body, is_published)
select * from (values
  ('stages-of-marital-choice-its-rules-and-premises',                       'مراحل الاختيار الزواجي.. قواعده ومنطلقاته',           '> TODO: migrate full text', true),
  ('marital-choice-and-decision-making',                                    'الاختيار الزواجي واتخاذ القرار',                     '> TODO: migrate full text', true),
  ('consulting-marital-relations-specialists-is-a-necessity-not-a-luxury',  'استشارة مختصي العلاقات الزوجية ضرورة وليست ترف!',    '> TODO: migrate full text', true)
) as v(slug, title, body, is_published)
on conflict (slug) do nothing;
