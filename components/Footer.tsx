"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { siteInfo } from "@/content/site";

const sitemapItems = [
  { label: "홈", href: "/" },
  { label: "DMC 소개", href: "/about" },
  {
    label: "Product",
    href: "/product",
    children: [
      { label: "개원 컨설팅", href: "/product/opening" },
      { label: "관리 컨설팅", href: "/product/management" },
      { label: "청산 컨설팅", href: "/product/closing" },
    ],
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    children: [
      { label: "국내 프로젝트", href: "/portfolio#domestic" },
      { label: "해외 프로젝트", href: "/portfolio#overseas" },
    ],
  },
  { label: "News", href: "/news" },
];

export default function Footer() {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-emphasis text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 로고 최상단 */}
        <div className="text-left mb-4">
          {logoError ? (
            <p className="text-2xl font-bold">DMC</p>
          ) : (
            <Image
              src="/images/logo.png"
              alt="대동메디칼컨설팅"
              width={160}
              height={40}
              className="h-10 w-auto object-contain object-left"
              unoptimized
              onError={() => setLogoError(true)}
            />
          )}
        </div>

        {/* 사이트맵 */}
        <nav className="flex flex-wrap gap-x-12 gap-y-4 mb-10">
          {sitemapItems.map((item) => (
            <div key={item.href} className="flex flex-col gap-1">
              <Link
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                {item.label}
              </Link>
              {"children" in item &&
                item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm pl-0"
                  >
                    {child.label}
                  </Link>
                ))}
            </div>
          ))}
        </nav>

        {/* 사업자 정보 */}
        <div className="text-left">
          <h3 className="text-sm font-bold mb-4">{siteInfo.companyName}</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>대표이사: {siteInfo.ceo}</p>
            <p>주소: {siteInfo.address}</p>
            <p>
              연락처: {siteInfo.phone} | FAX: {siteInfo.fax}
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-left text-gray-300 text-sm">
          <p>{siteInfo.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
