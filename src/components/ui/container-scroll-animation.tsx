"use client";
import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Adapted from Aceternity's "Container Scroll Animation". What Undo keeps: a card that starts tipped back in 3D and
 * settles flat as it scrolls into place (rotateX 20° → 0°, a slight scale). What it drops: the fixed 60–80rem
 * section heights, the grey device frame and the hard-coded shadow stack — the card keeps the design system's own
 * surface, radius and single shadow. Progress is tied to where the card is on screen, not to a timer.
 */
export function ScrollTilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // 0 when the card's top reaches the bottom of the screen, 1 when its centre reaches the centre.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rotateX = useTransform(scrollYProgress, [0, 1], [20, 0]);
  // Phones get a smaller tilt-in scale so the card never pokes past the screen edges.
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.92, 1] : [1.05, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className={cn("[perspective:1000px]", className)}>
      <motion.div style={{ rotateX, scale, y, transformOrigin: "50% 0%" }}>{children}</motion.div>
    </div>
  );
}
