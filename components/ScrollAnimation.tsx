"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  animation?: "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "zoomIn";
  threshold?: number;
  once?: boolean; // 애니메이션이 한 번만 실행될지 여부
  delayFromLoad?: number; // 페이지 로드 후 이 시간(ms) 뒤에 애니메이션 실행 (설정 시 스크롤 무시)
}

export default function ScrollAnimation({
  children,
  className = "",
  delay = 0,
  duration = 600,
  animation = "fadeInUp",
  threshold = 0.1,
  once = true,
  delayFromLoad,
}: ScrollAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // 페이지 로드 후 순차 실행 (delayFromLoad 사용 시)
  useEffect(() => {
    if (delayFromLoad == null) return;
    const t = setTimeout(() => {
      setIsVisible(true);
      setHasAnimated(true);
    }, delayFromLoad);
    return () => clearTimeout(t);
  }, [delayFromLoad]);

  useEffect(() => {
    if (delayFromLoad != null) return; // delayFromLoad 사용 시 observer 미사용
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) {
              setHasAnimated(true);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px", // 요소가 약간 보이기 시작할 때 트리거
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, once, delayFromLoad]);

  const getAnimationClasses = () => {
    const baseClasses = isVisible || hasAnimated 
      ? "opacity-100 translate-x-0 translate-y-0 scale-100" 
      : "";

    if (!isVisible && !hasAnimated) {
      switch (animation) {
        case "fadeIn":
          return "opacity-0";
        case "fadeInUp":
          return "opacity-0 translate-y-8";
        case "fadeInDown":
          return "opacity-0 -translate-y-8";
        case "fadeInLeft":
          return "opacity-0 -translate-x-8";
        case "fadeInRight":
          return "opacity-0 translate-x-8";
        case "slideUp":
          return "translate-y-12 opacity-0";
        case "slideDown":
          return "-translate-y-12 opacity-0";
        case "slideLeft":
          return "translate-x-12 opacity-0";
        case "slideRight":
          return "-translate-x-12 opacity-0";
        case "zoomIn":
          return "opacity-0 scale-95";
        default:
          return "opacity-0 translate-y-8";
      }
    }
    return baseClasses;
  };

  const getTransitionStyle = () => {
    return {
      transition: `all ${duration}ms ease-out ${delay}ms`,
    };
  };

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClasses()} ${className}`}
      style={getTransitionStyle()}
    >
      {children}
    </div>
  );
}
