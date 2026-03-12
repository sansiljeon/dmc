"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteInfo } from "@/content/site";

export default function FloatingKakaoWidget() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <Link
      href={siteInfo.kakaoLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-8 z-40 flex items-center gap-2 bg-[#FEE500] text-[#191919] px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
      aria-label="카카오톡 채널로 문의하기"
    >
      <svg
        className="w-7 h-7 shrink-0"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
      </svg>
      <span className="font-semibold text-sm whitespace-nowrap">카카오톡 문의</span>
    </Link>
  );
}
