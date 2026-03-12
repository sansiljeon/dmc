"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const ADMIN_KEY = "dmc_admin_secret";

function getStoredSecret(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_KEY);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [keyInput, setKeyInput] = useState("");

  useEffect(() => {
    setAuthorized(!!getStoredSecret());
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem(ADMIN_KEY, keyInput.trim());
    setAuthorized(true);
    setKeyInput("");
  };

  const handleLock = () => {
    sessionStorage.removeItem(ADMIN_KEY);
    setAuthorized(false);
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-secondary">로딩 중...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form
          onSubmit={handleUnlock}
          className="bg-white rounded-lg shadow-md p-8 max-w-sm w-full"
        >
          <h1 className="text-xl font-bold text-main mb-4">
            관리자 인증
          </h1>
          <p className="text-sm text-secondary mb-4">
            관리자 비밀키를 입력하세요. (환경변수 ADMIN_SECRET)
          </p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="비밀키"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-point text-white py-2 rounded hover:opacity-90"
          >
            확인
          </button>
        </form>
      </div>
    );
  }

  const nav = [
    { href: "/admin", label: "대시보드" },
    { href: "/admin/news", label: "뉴스 관리" },
    { href: "/admin/portfolio", label: "포트폴리오 관리" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <nav className="flex gap-6">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  pathname === href || (href !== "/admin" && pathname.startsWith(href))
                    ? "text-point font-medium"
                    : "text-secondary hover:text-main"
                }
              >
                {label}
              </Link>
            ))}
          </nav>
          <button
            onClick={handleLock}
            className="text-sm text-secondary hover:text-main"
          >
            로그아웃
          </button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
