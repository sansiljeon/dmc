"use client";

import { useState } from "react";
import Card from "@/components/Card";
import CardGrid from "@/components/CardGrid";
import ImageLightbox from "@/components/ImageLightbox";
import type { PortfolioItem } from "@/lib/portfolio";

interface PortfolioGridWithLightboxProps {
  items: PortfolioItem[];
  columns?: number;
  className?: string;
  staggerDelay?: number;
  duration?: number;
}

export default function PortfolioGridWithLightbox({
  items,
  columns = 3,
  className,
  staggerDelay = 50,
  duration = 350,
}: PortfolioGridWithLightboxProps) {
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  const getImages = (item: PortfolioItem): string[] => {
    if (item.images && item.images.length > 0) return item.images;
    return item.image ? [item.image] : [];
  };

  return (
    <>
      <CardGrid columns={columns} className={className} staggerDelay={staggerDelay} duration={duration}>
        {items.map((item) => {
          const images = getImages(item);
          const hasImages = images.length > 0;
          return (
            <div
              key={item.id}
              role={hasImages ? "button" : undefined}
              tabIndex={hasImages ? 0 : undefined}
              onClick={hasImages ? () => setLightboxItem(item) : undefined}
              onKeyDown={
                hasImages
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLightboxItem(item);
                      }
                    }
                  : undefined
              }
              className={hasImages ? "cursor-pointer h-full" : "h-full"}
            >
              <Card
                title={item.title}
                description={item.description}
                address={item.address}
                image={item.image}
                imageAlt={item.imageAlt || item.title}
                className="h-full"
              />
            </div>
          );
        })}
      </CardGrid>

      {lightboxItem && (
        <ImageLightbox
          images={getImages(lightboxItem)}
          title={lightboxItem.title}
          onClose={() => setLightboxItem(null)}
        />
      )}
    </>
  );
}
