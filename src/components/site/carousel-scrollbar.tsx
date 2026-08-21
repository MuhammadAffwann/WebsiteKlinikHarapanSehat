import { useState, useEffect, useRef, useCallback, type RefObject } from "react";
import { cn } from "@/lib/utils";

interface CarouselScrollbarProps {
  targetRef: RefObject<HTMLDivElement | null>;
  className?: string;
}

export function CarouselScrollbar({ targetRef, className }: CarouselScrollbarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbRatio, setThumbRatio] = useState(0.3); // Visible proportion (0-1)
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startDragXRef = useRef(0);
  const startScrollLeftRef = useRef(0);

  const updateScrollState = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    if (maxScroll > 0) {
      const progress = Math.max(0, Math.min(1, scrollLeft / maxScroll));
      setScrollProgress(progress);
      setThumbRatio(Math.max(0.12, Math.min(1, clientWidth / scrollWidth)));
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft < maxScroll - 2);
    } else {
      setScrollProgress(0);
      setThumbRatio(1);
      setCanScrollLeft(false);
      setCanScrollRight(false);
    }
  }, [targetRef]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    updateScrollState();

    const handleScroll = () => {
      updateScrollState();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [targetRef, updateScrollState]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = targetRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    const el = targetRef.current;
    if (!track || !el) return;

    const rect = track.getBoundingClientRect();
    const trackWidth = rect.width;
    const thumbWidth = trackWidth * thumbRatio;
    const availableTrack = trackWidth - thumbWidth;
    const clickX = e.clientX - rect.left;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (availableTrack > 0 && maxScroll > 0) {
      const targetRatio = Math.max(0, Math.min(1, (clickX - thumbWidth / 2) / availableTrack));
      el.scrollTo({
        left: targetRatio * maxScroll,
        behavior: "smooth",
      });
    }
  };

  const handleThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const el = targetRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    startDragXRef.current = e.clientX;
    startScrollLeftRef.current = el.scrollLeft;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingRef.current || !trackRef.current || !targetRef.current) return;
      const deltaX = moveEvent.clientX - startDragXRef.current;
      const trackWidth = trackRef.current.clientWidth;
      const thumbWidth = trackWidth * thumbRatio;
      const target = targetRef.current;
      const maxScroll = target.scrollWidth - target.clientWidth;
      const availableTrack = trackWidth - thumbWidth;

      if (availableTrack > 0) {
        const scrollDelta = (deltaX / availableTrack) * maxScroll;
        target.scrollLeft = Math.max(0, Math.min(maxScroll, startScrollLeftRef.current + scrollDelta));
      }
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const thumbWidthPercent = thumbRatio * 100;
  const thumbLeftPercent = scrollProgress * (100 - thumbWidthPercent);

  return (
    <div className={cn("flex items-center gap-1.5 w-full select-none pt-3", className)}>
      {/* Left Triangle Button */}
      <button
        type="button"
        onClick={() => scrollByAmount("left")}
        disabled={!canScrollLeft}
        aria-label="Scroll ke kiri"
        className="flex size-5 items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
      >
        <svg className="size-2.5 fill-current" viewBox="0 0 24 24">
          <path d="M15 5L6 12L15 19Z" />
        </svg>
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={handleTrackPointerDown}
        className="relative flex-1 h-[7px] bg-zinc-200/90 dark:bg-zinc-700/60 rounded-full cursor-pointer overflow-hidden"
      >
        {/* Thumb */}
        <div
          onPointerDown={handleThumbPointerDown}
          style={{
            width: `${thumbWidthPercent}%`,
            left: `${thumbLeftPercent}%`,
          }}
          className="absolute top-0 bottom-0 rounded-full bg-zinc-500 hover:bg-zinc-600 active:bg-zinc-700 dark:bg-zinc-400 dark:hover:bg-zinc-300 cursor-grab active:cursor-grabbing transition-colors"
        />
      </div>

      {/* Right Triangle Button */}
      <button
        type="button"
        onClick={() => scrollByAmount("right")}
        disabled={!canScrollRight}
        aria-label="Scroll ke kanan"
        className="flex size-5 items-center justify-center text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
      >
        <svg className="size-2.5 fill-current" viewBox="0 0 24 24">
          <path d="M9 5L18 12L9 19Z" />
        </svg>
      </button>
    </div>
  );
}
