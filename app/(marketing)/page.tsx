import {
  asList,
  getCourseCategories,
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
import { TrustStrip } from "@/components/sections/trust-strip";
import { ProblemEmpathy } from "@/components/sections/problem-empathy";
import { MeetInstructor } from "@/components/sections/meet-instructor";
import { CourseShowcase } from "@/components/sections/course-showcase";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Outcomes } from "@/components/sections/outcomes";
import { Vision } from "@/components/sections/vision";
import { AiTeaser } from "@/components/sections/ai-teaser";
import { Testimonials } from "@/components/sections/testimonials";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { BlogTeaser } from "@/components/sections/blog-teaser";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, courses, categories, testimonials, faqs, stats, steps, posts] =
    await Promise.all([
      getSettings(),
      getPublishedCourses(),
      getCourseCategories(),
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
        stats={stats}
      />
      <TrustStrip stats={stats} />
      <ProblemEmpathy points={asList(settings?.problem_points)} />
      <MeetInstructor aboutBody={settings?.about_body} imageUrl={settings?.hero_image_url} />
      <CourseShowcase courses={courses} categories={categories} />
      <HowItWorks steps={steps} />
      <Outcomes points={asList(settings?.outcome_points)} />
      <Vision
        text={settings?.vision_text}
        ctaLabel={settings?.vision_cta_label}
        ctaUrl={settings?.vision_cta_url}
      />
      <AiTeaser
        headline={settings?.ai_headline}
        subhead={settings?.ai_subhead}
        points={asList(settings?.ai_points)}
      />
      <Testimonials testimonials={testimonials} />
      <Faq faqs={faqs} />
      <FinalCta
        heading={settings?.final_cta_heading}
        primaryLabel={settings?.final_cta_primary_label}
        primaryUrl={settings?.final_cta_primary_url}
        secondaryLabel={settings?.final_cta_secondary_label}
        waHref={wa}
      />
      <BlogTeaser posts={posts} />
    </>
  );
}
