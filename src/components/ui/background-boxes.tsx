"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Aceternity "Background Boxes", lightly adapted for Undo:
 * - grid size, hover colours and line colour are props (defaults match the original component);
 * - decorative only, so it is hidden from assistive tech.
 */
const DEFAULT_COLORS = [
  "rgb(125 211 252)", // sky-300
  "rgb(249 168 212)", // pink-300
  "rgb(134 239 172)", // green-300
  "rgb(253 224 71)", // yellow-300
  "rgb(252 165 165)", // red-300
  "rgb(216 180 254)", // purple-300
  "rgb(147 197 253)", // blue-300
  "rgb(165 180 252)", // indigo-300
  "rgb(196 181 253)", // violet-300
];

type BoxesProps = {
  className?: string;
  rows?: number;
  cols?: number;
  colors?: string[];
  /** Tailwind border + text colour for the grid lines and plus marks. */
  lineClassName?: string;
};

export const BoxesCore = ({
  className,
  rows: rowCount = 150,
  cols: colCount = 100,
  colors = DEFAULT_COLORS,
  lineClassName = "border-slate-700 text-slate-700",
  ...rest
}: BoxesProps) => {
  const rows = new Array(rowCount).fill(1);
  const cols = new Array(colCount).fill(1);

  const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

  return (
    <div
      aria-hidden
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn("absolute left-1/4 p-4 -top-1/4 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0", className)}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div key={`row` + i} className={cn("w-16 h-8 border-l relative", lineClassName)}>
          {cols.map((_, j) => (
            <motion.div
              // Variant as a function: the colour is picked when the hover starts, not during render
              // (Math.random() in render breaks prerendering under cacheComponents).
              variants={{ hover: () => ({ backgroundColor: getRandomColor(), transition: { duration: 0 } }) }}
              whileHover="hover"
              animate={{
                transition: { duration: 2 },
              }}
              key={`col` + j}
              className={cn("w-16 h-8 border-r border-t relative", lineClassName)}
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="absolute h-6 w-10 -top-[14px] -left-[22px] stroke-[1px] pointer-events-none"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
