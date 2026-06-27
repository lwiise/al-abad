import {
  asList,
  getPublishedCourses,
  getPublishedFaqs,
  getPublishedPosts,
  getPublishedStats,
  getPublishedSteps,
  getPublishedTestimonials,
  getSettings,
  waLink,
} from "@/lib/data";
import { Hero } from "@/components/sections/hero";
import { ProblemEmpathy } from "@/components/sections/problem-empathy";
import { MeetInstructor } from "@/components/sections/meet-instructor";
import { CourseShowcase } from "@/components/sections/course-showcase";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Outcomes } from "@/components/sections/outcomes";
import { AiTeaser } from "@/components/sections/ai-teaser";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { BlogTeaser } from "@/components/sections/blog-teaser";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, courses, testimonials, faqs, stats, steps, posts] = await Promise.all([
    getSettings(),
    getPublishedCourses(),
    getPublishedTestimonials(),
    getPublishedFaqs(),
    getPublishedStats(),
    getPublishedSteps(),
    getPublishedPosts(3),
  ]);

  const wa = waLink(settings?.whatsapp_number, "السلام عليكم، لدي استفسار عن الدورات");

  return (
    <>
      <Hero
        headline={settings?.hero_headline}
        subhead={settings?.hero_subhead}
        primaryLabel={settings?.hero_primary_cta_label}
        primaryUrl={settings?.hero_primary_cta_url}
        secondaryLabel={settings?.hero_secondary_cta_label}
        secondaryUrl={settings?.hero_secondary_cta_url}
        imageUrl={settings?.hero_image_url}
        trustBadge={settings?.hero_trust_badge}
        stats={stats}
      />
      <ProblemEmpathy
        points={asList(settings?.problem_points)}
        heading={settings?.problem_heading}
        subhead={settings?.problem_subhead}
      />
      <MeetInstructor
        aboutBody={settings?.about_body}
        imageUrl={settings?.instructor_image_url || settings?.hero_image_url}
        eyebrow={settings?.instructor_eyebrow}
        name={settings?.instructor_name}
        markers={asList(settings?.instructor_markers)}
        ctaLabel={settings?.instructor_cta_label}
      />
      <CourseShowcase
        courses={courses}
        eyebrow={settings?.courses_eyebrow}
        heading={settings?.courses_heading}
        subhead={settings?.courses_subhead}
        viewAllLabel={settings?.courses_view_all_label}
      />
      <HowItWorks
        steps={steps}
        heading={settings?.how_heading}
        subhead={settings?.how_subhead}
      />
      <Outcomes
        points={asList(settings?.outcome_points)}
        heading={settings?.outcomes_heading}
        subhead={settings?.outcomes_subhead}
      />
      <AiTeaser
        headline={settings?.ai_headline}
        subhead={settings?.ai_subhead}
        points={asList(settings?.ai_points)}
        badge={settings?.ai_badge}
      />
      <Testimonials
        testimonials={testimonials}
        eyebrow={settings?.testimonials_eyebrow}
        heading={settings?.testimonials_heading}
      />
      <Faq
        faqs={faqs}
        eyebrow={settings?.faq_eyebrow}
        heading={settings?.faq_heading}
        helpText={settings?.faq_help_text}
        helpCtaLabel={settings?.faq_help_cta_label}
      />
      <FinalCta
        heading={settings?.final_cta_heading}
        primaryLabel={settings?.final_cta_primary_label}
        primaryUrl={settings?.final_cta_primary_url}
        secondaryLabel={settings?.final_cta_secondary_label}
        waHref={wa}
      />
      <BlogTeaser
        posts={posts}
        heading={settings?.blog_heading}
        subhead={settings?.blog_subhead}
        viewAllLabel={settings?.blog_view_all_label}
      />
    </>
  );
}
