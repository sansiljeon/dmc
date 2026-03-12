"use client";

import Image from "next/image";
import { useState } from "react";
import ScrollAnimation from "./ScrollAnimation";

interface CertificationGridProps {
  images: string[];
}

export default function CertificationGrid({ images }: CertificationGridProps) {
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
      {images.map((image, index) => (
        <ScrollAnimation
          key={index}
          animation="fadeInUp"
          delay={index * 100}
          threshold={0.1}
        >
          <div className="relative w-full bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow min-h-[120px] flex items-center justify-center">
            {imageErrors[index] ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <span className="text-gray-400 text-sm text-center">
                  이미지 준비중
                </span>
              </div>
            ) : (
              <Image
                src={image}
                alt={`인증서 ${index + 1}`}
                width={200}
                height={200}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                onError={() => handleImageError(index)}
                unoptimized
              />
            )}
          </div>
        </ScrollAnimation>
      ))}
    </div>
  );
}
