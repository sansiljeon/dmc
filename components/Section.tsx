"use client";

import { ReactNode } from "react";
import ScrollAnimation from "./ScrollAnimation";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "gray";
  animation?: "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "zoomIn";
  delay?: number;
  duration?: number;
  delayFromLoad?: number;
}

export default function Section({
  children,
  className = "",
  id,
  background = "white",
  animation = "fadeInUp",
  delay = 0,
  duration,
  delayFromLoad,
}: SectionProps) {
  const bgClass = background === "gray" ? "bg-gray-50" : "bg-white";

  return (
    <section
      id={id}
      className={`py-16 md:py-24 ${bgClass} ${className}`}
    >
      <ScrollAnimation animation={animation} delay={delay} duration={duration} delayFromLoad={delayFromLoad}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </ScrollAnimation>
    </section>
  );
}
