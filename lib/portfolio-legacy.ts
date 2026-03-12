import fs from "fs";
import path from "path";
import { list } from "@vercel/blob";
import type { PortfolioItem } from "./portfolio";

const portfolioPath = path.join(process.cwd(), "content/portfolio-items.json");
const BLOB_PORTFOLIO_PATH = "portfolio-items.json";

/** 기존(Blob/파일)에서 포트폴리오 읽기 - 마이그레이션 1회용 */
export async function readLegacyPortfolioItems(): Promise<PortfolioItem[]> {
  // Vercel: Blob 우선
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: BLOB_PORTFOLIO_PATH, limit: 5 });
      const blob = blobs.find((b) => b.pathname === BLOB_PORTFOLIO_PATH);
      if (blob?.url) {
        const res = await fetch(blob.url, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { items?: PortfolioItem[] };
          return Array.isArray(data.items) ? data.items : [];
        }
      }
    } catch {
      // ignore
    }
  }

  // 로컬: 파일 폴백
  if (!fs.existsSync(portfolioPath)) return [];
  const raw = fs.readFileSync(portfolioPath, "utf8");
  try {
    const parsed = JSON.parse(raw) as { items?: PortfolioItem[] };
    return Array.isArray(parsed.items) ? parsed.items : [];
  } catch {
    return [];
  }
}

