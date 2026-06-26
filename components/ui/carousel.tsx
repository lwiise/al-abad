"use client";

import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type EmblaOptions = Parameters<typeof useEmblaCarousel>[0];

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) throw new Error("useCarousel must be used within <Carousel>");
  return ctx;
}

export function Carousel({
  opts,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { opts?: EmblaOptions }) {
  const [carouselRef, api] = useEmblaCarousel({
    direction: "rtl",
    align: "start",
    containScroll: "trimSnaps",
    ...opts,
  });
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((a: CarouselApi) => {
    if (!a) return;
    setCanScrollPrev(a.canScrollPrev());
    setCanScrollNext(a.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  React.useEffect(() => {
    if (!api) return;
    // Defer initial sync out of the effect body (avoids sync setState-in-effect).
    queueMicrotask(() => onSelect(api));
    api.on("reInit", onSelect).on("select", onSelect);
    return () => {
      api.off("reInit", onSelect).off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{ carouselRef, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}
    >
      <div className={cn("relative", className)} role="region" aria-roledescription="carousel" {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { carouselRef } = useCarousel();
  return (
    <div ref={carouselRef} className="overflow-hidden">
      <div className={cn("flex gap-6", className)} {...props} />
    </div>
  );
}

export function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={cn("min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 lg:basis-1/3", className)}
      {...props}
    />
  );
}

export function CarouselPrevious({ className }: { className?: string }) {
  const { scrollPrev, canScrollPrev } = useCarousel();
  return (
    <button
      type="button"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      aria-label="السابق"
      className={cn(
        "flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-surface disabled:opacity-40",
        className,
      )}
    >
      <ChevronRight className="size-5" />
    </button>
  );
}

export function CarouselNext({ className }: { className?: string }) {
  const { scrollNext, canScrollNext } = useCarousel();
  return (
    <button
      type="button"
      onClick={scrollNext}
      disabled={!canScrollNext}
      aria-label="التالي"
      className={cn(
        "flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition-colors hover:bg-surface disabled:opacity-40",
        className,
      )}
    >
      <ChevronLeft className="size-5" />
    </button>
  );
}
