"use client";

import ScrollAnimation from "./ScrollAnimation";

interface Stat {
  value: string;
  unit: string;
  label: string;
}

interface OverviewStatsProps {
  stats: Stat[];
}

export default function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-0 border border-gray-300 rounded-lg overflow-hidden">
      {stats.map((stat, index) => {
        const isRightColumn = index % 2 === 1;
        const isBottomRow = index >= 2;
        
        return (
          <ScrollAnimation
            key={index}
            animation="fadeInUp"
            delay={index * 100}
            threshold={0.1}
          >
            <div
              className={`p-6 md:p-8 ${
                isRightColumn ? "border-l border-gray-300" : ""
              } ${
                isBottomRow ? "border-t border-gray-300" : ""
              }`}
            >
              <div className="mb-2">
                <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-point">
                  {stat.value}
                </span>
                <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-point ml-1">
                  {stat.unit}
                </span>
              </div>
              <div className="text-sm md:text-base text-secondary">
                {stat.label}
              </div>
            </div>
          </ScrollAnimation>
        );
      })}
    </div>
  );
}
