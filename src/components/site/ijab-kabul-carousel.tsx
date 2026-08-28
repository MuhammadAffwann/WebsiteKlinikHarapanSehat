import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import slide1 from "@/assets/ijab-kabul/slide1.png";
import slide2 from "@/assets/ijab-kabul/slide2.png";
import slide3 from "@/assets/ijab-kabul/slide3.png";
import slide4 from "@/assets/ijab-kabul/slide4.png";

const slides = [
  { src: slide1, alt: "Prosedur Ijab Kabul — Slide 1" },
  { src: slide2, alt: "Prosedur Ijab Kabul — Slide 2" },
  { src: slide3, alt: "Prosedur Ijab Kabul — Slide 3" },
  { src: slide4, alt: "Prosedur Ijab Kabul — Slide 4" },
];

export function IjabKabulCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track active slide via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) {
              setActiveIndex(idx);
            }
          }
        }
      },
      {
        root: container,
        threshold: 0.6,
      },
    );

    for (const slide of slideRefs.current) {
      if (slide) observer.observe(slide);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSlide = useCallback((index: number) => {
    const slide = slideRefs.current[index];
    if (slide) {
      slide.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === slides.length - 1;

  return (
    <div className="relative">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded-2xl [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            className="w-full shrink-0 snap-center"
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="aspect-[3/4] w-full rounded-2xl border border-border/40 object-cover shadow-card"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Arrow buttons (desktop only - positioned neatly at the sides) */}
      <button
        type="button"
        aria-label="Slide sebelumnya"
        onClick={() => scrollToSlide(activeIndex - 1)}
        disabled={isFirst}
        className={cn(
          "absolute -left-4 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-md backdrop-blur-xs transition-all hover:scale-105 hover:bg-white active:scale-95 sm:flex",
          isFirst && "pointer-events-none opacity-0",
        )}
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Slide berikutnya"
        onClick={() => scrollToSlide(activeIndex + 1)}
        disabled={isLast}
        className={cn(
          "absolute -right-4 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white/95 text-foreground shadow-md backdrop-blur-xs transition-all hover:scale-105 hover:bg-white active:scale-95 sm:flex",
          isLast && "pointer-events-none opacity-0",
        )}
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Dots indicator */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ke slide ${i + 1}`}
            onClick={() => scrollToSlide(i)}
            className={cn(
              "cursor-pointer rounded-full transition-all duration-300",
              i === activeIndex
                ? "h-2.5 w-6 bg-primary"
                : "size-2.5 bg-border hover:bg-muted-foreground/50",
            )}
          />
        ))}
      </div>
    </div>
  );
}
