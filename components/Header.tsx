"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/content/nav";
import { siteInfo } from "@/content/site";
import CTAButton from "./CTAButton";

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center shrink-0 h-8 md:h-10">
            {logoError ? (
              <span className="text-xl md:text-2xl font-bold text-point">DMC</span>
            ) : (
              <Image
                src="/images/logo.png"
                alt="대동메디칼컨설팅"
                width={160}
                height={40}
                className="h-8 w-auto md:h-10 object-contain object-left"
                priority
                unoptimized
                onError={() => setLogoError(true)}
              />
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={`transition-colors ${isActive(item.href) ? "text-point" : "text-main hover:text-point"}`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-main hover:bg-gray-50 hover:text-point"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden md:block">
            <CTAButton
              href={siteInfo.kakaoLink}
              text="1:1 문의"
              isExternal
              variant="primary"
              className="!bg-point !text-white border border-point hover:!bg-white hover:!text-point px-[0.9rem] py-[0.45rem] text-[0.864rem] rounded-xl"
            />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="메뉴 열기"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            {navigation.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`block py-2 ${isActive(item.href) ? "text-point" : "text-main hover:text-point"}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block py-2 text-sm ${isActive(child.href) ? "text-point" : "text-secondary hover:text-point"}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="mt-4">
              <CTAButton
                href={siteInfo.kakaoLink}
                text="1:1 문의"
                isExternal
                variant="primary"
                className="!bg-point !text-white border border-point hover:!bg-white hover:!text-point px-[0.9rem] py-[0.45rem] text-[0.864rem] rounded-xl"
              />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
