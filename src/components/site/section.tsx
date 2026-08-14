import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Page section wrapper with consistent max width and vertical rhythm. */
export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-20", className)}>
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

/** Eyebrow + title + optional description block. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
      )}
      <h2 className={cn("mt-3 text-3xl font-bold sm:text-4xl", titleClassName)}>{title}</h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

/** Small pill used for statuses and categories. */
export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Shared page hero for inner pages. */
export function PageHero({
  eyebrow,
  title,
  description,
  backgroundImage,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden surface-hero border-b border-border",
        className
      )}
    >
      {backgroundImage && (
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover object-right md:object-right-top opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent sm:from-background/90 sm:via-background/50" />
        </div>
      )}
      <div className="relative mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
        )}
        <h1 className="mt-3 max-w-2xl text-4xl sm:text-5xl">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}