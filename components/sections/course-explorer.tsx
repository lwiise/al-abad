"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CourseRow } from "@/lib/database.types";
import { CourseCard } from "./course-card";

/** Filterable grid of image-overlay course cards. Pills only show when categories exist. */
export function CourseExplorer({
  courses,
  categories,
}: {
  courses: CourseRow[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("");
  const shown = active ? courses.filter((c) => c.category === active) : courses;

  return (
    <div>
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Chip label="الكل" active={!active} onClick={() => setActive("")} />
          {categories.map((cat) => (
            <Chip key={cat} label={cat} active={active === cat} onClick={() => setActive(cat)} />
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((course, i) => (
          <CourseCard key={course.id} course={course} index={i + 1} />
        ))}
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-on-primary"
          : "border-border bg-background text-foreground-muted hover:border-border-strong hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
