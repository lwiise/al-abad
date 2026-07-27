"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { CourseRow } from "@/lib/database.types";
import { Stagger } from "@/components/motion/stagger";
import { CourseCard } from "./course-card";

/** Filterable grid of cover-led course cards. Filter pills carry per-category
 *  counts and only appear when there's at least one category to filter by. */
export function CourseExplorer({
  courses,
  categories,
}: {
  courses: CourseRow[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("");
  const shown = active ? courses.filter((c) => c.category === active) : courses;

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of courses) {
      if (c.category) m.set(c.category, (m.get(c.category) ?? 0) + 1);
    }
    return m;
  }, [courses]);

  return (
    <div>
      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          <Chip label="الكل" count={courses.length} active={!active} onClick={() => setActive("")} />
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              count={counts.get(cat) ?? 0}
              active={active === cat}
              onClick={() => setActive(cat)}
            />
          ))}
        </div>
      )}

      <Stagger className="grid gap-6 sm:grid-cols-2">
        {shown.map((course, i) => (
          <CourseCard key={course.id} course={course} index={i + 1} />
        ))}
      </Stagger>
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-on-primary"
          : "border-border bg-background text-foreground-muted hover:border-border-strong hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 text-xs tabular-nums",
          active ? "bg-white/20 text-on-primary" : "bg-surface-strong text-foreground-subtle",
        )}
      >
        {count}
      </span>
    </button>
  );
}
