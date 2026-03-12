"use client";

import { useEffect, useState } from "react";
import ScrollAnimation from "./ScrollAnimation";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

interface StatRowProps {
  stats: Stat[];
  className?: string;
}

export default function StatRow({ stats, className = "" }: StatRowProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("stats-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div
      id="stats-section"
      className={`grid grid-cols-2 md:grid-cols-4 gap-8 ${className}`}
    >
      {stats.map((stat, index) => (
        <ScrollAnimation
          key={index}
          animation="fadeInUp"
          delay={index * 100}
          threshold={0.1}
        >
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-point mb-2">
              {isVisible ? (
                <CountUpAnimation target={stat.value} suffix={stat.suffix} />
              ) : (
                "0"
              )}
            </div>
            <div className="text-secondary text-sm md:text-base">{stat.label}</div>
          </div>
        </ScrollAnimation>
      ))}
    </div>
  );
}

function CountUpAnimation({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
