import type { ReactNode } from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

import { cn } from "@/lib/utils";

type AnimationVariant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "fade";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

const variantsMap = {
  "fade-up": (d: number) => ({ initial: { opacity: 0, y: d }, animate: { opacity: 1, y: 0 } }),
  "fade-down": (d: number) => ({ initial: { opacity: 0, y: -d }, animate: { opacity: 1, y: 0 } }),
  "fade-left": (d: number) => ({ initial: { opacity: 0, x: d }, animate: { opacity: 1, x: 0 } }),
  "fade-right": (d: number) => ({ initial: { opacity: 0, x: -d }, animate: { opacity: 1, x: 0 } }),
  "zoom-in": (_d: number) => ({
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
  }),
  fade: (_d: number) => ({ initial: { opacity: 0 }, animate: { opacity: 1 } }),
};

const EASE_BEZIER = [0.21, 0.47, 0.32, 0.98] as const;

/** Smooth, subtle scroll reveal wrapper using framer-motion. */
export function ScrollReveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.5,
  distance = 24,
  className,
  once = true,
  ...props
}: ScrollRevealProps) {
  const { initial, animate } = variantsMap[variant](distance);

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: EASE_BEZIER,
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Container that animates its children sequentially when entering viewport. */
export function StaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  className,
  once = true,
  ...props
}: {
  children: ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  className?: string;
  once?: boolean;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-40px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Child item inside a StaggerContainer. */
export function StaggerItem({
  children,
  variant = "fade-up",
  distance = 20,
  className,
  ...props
}: {
  children: ReactNode;
  variant?: AnimationVariant;
  distance?: number;
  className?: string;
} & HTMLMotionProps<"div">) {
  const itemVariants: Variants = {
    hidden:
      variant === "fade-up"
        ? { opacity: 0, y: distance }
        : variant === "fade-left"
          ? { opacity: 0, x: distance }
          : variant === "fade-right"
            ? { opacity: 0, x: -distance }
            : variant === "zoom-in"
              ? { opacity: 0, scale: 0.94 }
              : { opacity: 0 },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: EASE_BEZIER,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={cn(className)} {...props}>
      {children}
    </motion.div>
  );
}
