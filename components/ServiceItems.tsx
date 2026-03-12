"use client";

import ScrollAnimation from "./ScrollAnimation";

interface ServiceItem {
  title: string;
  description: string;
}

interface ServiceItemsProps {
  items: ServiceItem[];
}

export default function ServiceItems({ items }: ServiceItemsProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      {items.map((item, index) => (
        <ScrollAnimation
          key={index}
          animation="fadeInUp"
          delay={index * 100}
          threshold={0.1}
        >
          <div className="border-l-4 border-point pl-6 md:pl-8 py-2">
            <h3 className="text-xl md:text-2xl font-bold text-main mb-3">
              {item.title}
            </h3>
            <p className="text-base md:text-lg text-secondary leading-relaxed">
              {item.description}
            </p>
          </div>
        </ScrollAnimation>
      ))}
    </div>
  );
}
