"use client";

import Link from "next/link";
import { useId } from "react";
import Breadcrumbs from "./Breadcrumbs";
import ScrollAnimation from "./ScrollAnimation";
import { siteInfo } from "@/content/site";

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  showBreadcrumbs?: boolean;
  textAlign?: "left" | "center";
  showYearsText?: boolean;
  /** 홈에서만 true, 나머지 페이지 Hero에는 버튼 미노출 */
  showCtaButton?: boolean;
}

export default function Hero({
  title,
  subtitle,
  backgroundImage,
  showBreadcrumbs = true,
  textAlign = "center",
  showYearsText = false,
  showCtaButton = false,
}: HeroProps) {
  const alignClass = textAlign === "left" ? "text-left" : "text-center";
  const noiseId = useId();
  return (
    <div
      className="relative bg-cover bg-center bg-white overflow-hidden"
      style={
        backgroundImage
          ? { backgroundImage: `url(${backgroundImage})` }
          : undefined
      }
    >
      {/* 홈화면과 동일 강도 노이즈 (opacity 0.15) - 모든 페이지 Hero 공통 */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-multiply"
        aria-hidden
      >
        <svg className="w-full h-full">
          <filter id={noiseId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${noiseId})`} />
        </svg>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        {showYearsText && (
          <ScrollAnimation animation="fadeInUp" delay={0} duration={600} delayFromLoad={0}>
            <p className={`text-xs font-normal tracking-[0.25em] uppercase text-[#6E6E6E] mb-6 ${alignClass}`}>
              30 YEARS OF MEDICAL CONSULTING
            </p>
          </ScrollAnimation>
        )}
        {showBreadcrumbs && <Breadcrumbs />}
        <div className={`mt-8 ${alignClass}`}>
          <ScrollAnimation animation="fadeInUp" delay={0} duration={500} delayFromLoad={200}>
            <h1 className="text-[1.575rem] md:text-[2.1rem] lg:text-[2.625rem] font-bold text-main mb-4 whitespace-pre-line font-myeongjo">
              {title}
            </h1>
          </ScrollAnimation>
          {subtitle && (
            <ScrollAnimation animation="fadeInUp" delay={0} duration={500} delayFromLoad={450}>
              <p className="text-[0.875rem] md:text-[1.05rem] text-secondary whitespace-pre-line font-myeongjo">{subtitle}</p>
            </ScrollAnimation>
          )}
          {showCtaButton && (
            <ScrollAnimation animation="fadeInUp" delay={0} duration={500} delayFromLoad={550}>
              <Link
                href={siteInfo.kakaoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-8 px-6 py-3 bg-white text-[#C92B2A] border border-[#C92B2A] rounded-xl font-medium hover:bg-[#C92B2A] hover:text-white transition-colors shadow-lg hover:shadow-xl"
              >
                컨설팅 문의하기
              </Link>
            </ScrollAnimation>
          )}
        </div>
      </div>
    </div>
  );
}
