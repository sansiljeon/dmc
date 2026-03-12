"use client";
// vercel deploy check · commit verification

import ScrollAnimation from "./ScrollAnimation";

interface HistoryPeriod {
  year: string;
  items: string[];
}

interface HistoryTimelineProps {
  periods: HistoryPeriod[];
}

export default function HistoryTimeline({ periods }: HistoryTimelineProps) {
  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Timeline line */}
      <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
      
      <div className="space-y-6 md:space-y-8">
        {periods.map((period, periodIndex) => (
          <ScrollAnimation
            key={periodIndex}
            animation="fadeInUp"
            delay={periodIndex * 100}
            threshold={0.1}
          >
            <div className="relative pl-12 md:pl-16">
              {/* Year marker */}
              <div className="absolute left-0 md:left-2 top-0">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-point border-2 border-white shadow-md flex items-center justify-center z-10">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white"></div>
                </div>
              </div>
              
              {/* Year */}
              <div className="mb-3">
                <h3 className="text-xl md:text-2xl font-bold text-point text-left">
                  {period.year}
                </h3>
              </div>
              
              {/* Items - 2 columns on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 md:gap-y-2">
                {period.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="text-sm md:text-base text-secondary leading-relaxed flex items-start text-left"
                  >
                    <span className="text-point mr-2 mt-1 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimation>
        ))}
      </div>
    </div>
  );
}
