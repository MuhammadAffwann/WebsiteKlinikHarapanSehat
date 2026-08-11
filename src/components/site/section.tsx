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
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>
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
export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="surface-hero border-b border-border">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{eyebrow}</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
