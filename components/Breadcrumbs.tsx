"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-main">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link href="/" className="hover:underline">
            Home
          </Link>
        </li>
        {paths.map((path, index) => {
          const href = "/" + paths.slice(0, index + 1).join("/");
          const isLast = index === paths.length - 1;
          const label = path.charAt(0).toUpperCase() + path.slice(1);

          return (
            <li key={href} className="flex items-center">
              <span className="mx-2">/</span>
              {isLast ? (
                <span className="text-secondary" aria-current="page">
                  {label}
                </span>
              ) : (
                <Link href={href} className="hover:underline">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
