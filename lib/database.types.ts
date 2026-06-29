/**
 * Hand-authored Supabase schema types for the marketing/CMS database.
 *
 * Kept in sync with `supabase/migrations/0001_init.sql`. Once a hosted project
 * is linked you can regenerate this file with:
 *   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Social links blob stored on site_settings.social_links */
export interface SocialLinks {
  facebook?: string;
  tiktok?: string;
  snapchat?: string;
  telegram?: string;
  youtube?: string;
  twitter?: string;
  instagram?: string;
}

type Timestamps = {
  id: string;
  created_at: string;
  updated_at: string;
};

export interface CourseRow extends Timestamps {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  hero_image_url: string | null;
  price: number | null;
  price_original: number | null;
  currency: string;
  cta_url: string | null;
  video_preview_url: string | null;
  guarantee_text: string | null;
  outcomes: string[] | null;
  category: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface CourseModuleRow extends Timestamps {
  course_id: string;
  title: string;
  lessons: number | null;
  duration: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface BlogPostRow extends Timestamps {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
}

export interface TestimonialRow extends Timestamps {
  author_name: string;
  author_title: string | null;
  quote: string;
  avatar_url: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface FaqRow extends Timestamps {
  question: string;
  answer: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface StatRow extends Timestamps {
  label: string;
  value: string;
  sort_order: number;
  is_published: boolean;
}

export interface HowItWorksStepRow extends Timestamps {
  title: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface SiteSettingsRow extends Timestamps {
  // promo
  promo_enabled: boolean;
  promo_bar_text: string | null;
  promo_code: string | null;
  // hero
  hero_headline: string | null;
  hero_subhead: string | null;
  hero_image_url: string | null;
  hero_primary_cta_label: string | null;
  hero_primary_cta_url: string | null;
  hero_secondary_cta_label: string | null;
  hero_secondary_cta_url: string | null;
  hero_microproof: string | null;
  // AI block
  ai_headline: string | null;
  ai_subhead: string | null;
  ai_points: Json | null;
  // lists
  problem_points: Json | null;
  outcome_points: Json | null;
  // vision
  vision_text: string | null;
  vision_cta_label: string | null;
  vision_cta_url: string | null;
  // final CTA
  final_cta_heading: string | null;
  final_cta_primary_label: string | null;
  final_cta_primary_url: string | null;
  final_cta_secondary_label: string | null;
  final_cta_secondary_url: string | null;
  // contact / social
  about_body: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  social_links: Json | null;
  // homepage section labels (eyebrows / titles / subheads / labels)
  hero_trust_badge: string | null;
  problem_heading: string | null;
  problem_subhead: string | null;
  instructor_eyebrow: string | null;
  instructor_name: string | null;
  instructor_markers: Json | null;
  instructor_cta_label: string | null;
  instructor_image_url: string | null;
  courses_eyebrow: string | null;
  courses_heading: string | null;
  courses_subhead: string | null;
  courses_view_all_label: string | null;
  how_heading: string | null;
  how_subhead: string | null;
  outcomes_heading: string | null;
  outcomes_subhead: string | null;
  ai_badge: string | null;
  testimonials_ribbon: string | null;
  testimonials_eyebrow: string | null;
  testimonials_heading: string | null;
  faq_eyebrow: string | null;
  faq_heading: string | null;
  faq_help_text: string | null;
  faq_help_cta_label: string | null;
  blog_heading: string | null;
  blog_subhead: string | null;
  blog_view_all_label: string | null;
}

export interface ContactSubmissionRow extends Timestamps {
  name: string | null;
  email: string | null;
  message: string | null;
}

export interface AiWaitlistRow extends Timestamps {
  email: string;
}

export interface AdminUserRow extends Timestamps {
  user_id: string;
  role: string;
}

/** Generic helper: every column optional on update; pk/timestamps optional on insert. */
type InsertOf<T extends Timestamps> = Partial<Pick<T, "id" | "created_at" | "updated_at">> &
  Omit<T, "id" | "created_at" | "updated_at">;
type UpdateOf<T extends Timestamps> = Partial<T>;

type TableShape<Row extends Timestamps> = {
  Row: Row;
  Insert: InsertOf<Row>;
  Update: UpdateOf<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      courses: TableShape<CourseRow>;
      course_modules: TableShape<CourseModuleRow>;
      blog_posts: TableShape<BlogPostRow>;
      testimonials: TableShape<TestimonialRow>;
      faqs: TableShape<FaqRow>;
      stats: TableShape<StatRow>;
      how_it_works_steps: TableShape<HowItWorksStepRow>;
      site_settings: TableShape<SiteSettingsRow>;
      contact_submissions: TableShape<ContactSubmissionRow>;
      ai_waitlist: TableShape<AiWaitlistRow>;
      admin_users: TableShape<AdminUserRow>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
