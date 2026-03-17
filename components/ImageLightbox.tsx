"use client";

import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
}

export default function ImageLightbox({
  images,
  initialIndex = 0,
  title,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  const lightbox = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 슬라이드"
    >
      {/* 어두운 반투명 배경 - 뷰포트 전체 */}
      <div
        className="absolute inset-0 bg-black/80"
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={onClose}
        aria-hidden
      />

      {/* 슬라이드 영역 - 뷰포트 기준 중앙, 높이 제한 */}
      <div
        className="relative z-10 w-full max-w-5xl flex flex-col overflow-hidden"
        style={{
          maxHeight: "calc(100dvh - 2rem)",
        }}
      >
        {/* 좌측 화살표 */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          aria-label="이전 이미지"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 우측 화살표 */}
        <button
          type="button"
          onClick={goNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          aria-label="다음 이미지"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          aria-label="닫기"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col items-center w-full min-h-0 overflow-hidden gap-2">
          {/* 제목 */}
          {title && (
            <h3 className="text-white text-lg font-semibold text-center px-12">
              {title}
            </h3>
          )}

          {/* 메인 이미지 */}
          <div className="min-h-0 flex items-center justify-center w-full">
            <img
              src={currentImage}
              alt={`${title ?? ""} ${currentIndex + 1} / ${images.length}`}
              className="max-w-full max-h-[70dvh] object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* 하단 미리보기 */}
          <div className="w-full">
            <div className="flex gap-2 overflow-x-auto pb-2 max-w-full justify-center">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                    i === currentIndex
                      ? "border-point ring-2 ring-point/50"
                      : "border-gray-500/50 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(lightbox, document.body);
  }
  return lightbox;
}
