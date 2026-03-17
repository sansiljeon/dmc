"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import ScrollAnimation from "./ScrollAnimation";

interface CardProps {
  title: string;
  description?: string;
  /** 국내: 주소 / 해외: 지역 (병원명 아래 표시) */
  address?: string;
  image?: string;
  imageAlt?: string;
  /** 이미지 정렬: "top"이면 이미지 위쪽을 박스에 맞추고 아래쪽은 잘림 */
  imagePosition?: "center" | "top";
  href?: string;
  children?: ReactNode;
  className?: string;
  animation?: "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "zoomIn";
  delay?: number;
  duration?: number;
}

export default function Card({
  title,
  description,
  address,
  image,
  imageAlt,
  imagePosition = "center",
  href,
  children,
  className = "",
  animation = "fadeInUp",
  delay = 0,
  duration,
}: CardProps) {
  const imageClass = imagePosition === "top" ? "object-cover object-[50%_-0.75rem]" : "object-cover";
  const content = (
    <ScrollAnimation animation={animation} delay={delay} duration={duration} className="h-full">
      <div
        className={`h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow ${className}`}
      >
      {image ? (
        <div className="relative h-48 shrink-0 bg-gray-200 overflow-hidden">
          {image.startsWith("http://") || image.startsWith("https://") ? (
            <img
              src={image}
              alt={imageAlt || title}
              className={`w-full h-full ${imageClass}`}
              referrerPolicy="no-referrer"
            />
          ) : (
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              className={imageClass}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          )}
        </div>
      ) : (
        <div className="h-48 shrink-0 bg-gray-100 flex items-center justify-center px-6 text-center border-b border-gray-200">
          <span className="text-main font-semibold text-lg leading-snug">
            {title}
          </span>
        </div>
      )}
      <div className="px-6 pt-6 pb-4 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-main mb-2">{title}</h3>
        {address && (
          <p className="text-secondary text-sm mb-2">{address}</p>
        )}
        {description && (
          <p className="text-secondary mb-2">{description}</p>
        )}
        {children}
      </div>
    </div>
    </ScrollAnimation>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
