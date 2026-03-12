import fs from "fs";
import path from "path";
import { list, put } from "@vercel/blob";

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  category: "domestic" | "overseas";
  /** 국내: 주소 표기. 서울·광역시·특별시는 시+구·군·동, 이외는 도+시·군 (예: 서울 강남구, 경기 성남시) */
  address?: string;
  createdAt: string;
  /** 표시 순서 (작을수록 먼저). 없으면 createdAt 기준 */
  order?: number;
}

const portfolioPath = path.join(process.cwd(), "content/portfolio-items.json");
const BLOB_PORTFOLIO_PATH = "portfolio-items.json";

/** Blob URL 캐시: list() 생략으로 읽기 1회 절약 (서버리스 인스턴스 내에서만 유효) */
let cachedBlobUrl: string | null = null;

function readPortfolioSync(): { items: PortfolioItem[] } {
  if (!fs.existsSync(portfolioPath)) {
    return { items: [] };
  }
  const raw = fs.readFileSync(portfolioPath, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return { items: [] };
  }
}

/** Vercel Blob 또는 로컬 파일에서 포트폴리오 읽기 (캐시된 URL이 있으면 list 생략) */
async function readPortfolioAsync(): Promise<{ items: PortfolioItem[] }> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      if (cachedBlobUrl) {
        const res = await fetch(cachedBlobUrl, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { items: PortfolioItem[] };
          return Array.isArray(data.items) ? data : { items: [] };
        }
        cachedBlobUrl = null;
      }
      const { blobs } = await list({ prefix: BLOB_PORTFOLIO_PATH, limit: 5 });
      const blob = blobs.find((b) => b.pathname === BLOB_PORTFOLIO_PATH);
      if (blob?.url) {
        cachedBlobUrl = blob.url;
        const res = await fetch(blob.url, { cache: "no-store" });
        if (res.ok) {
          const data = (await res.json()) as { items: PortfolioItem[] };
          return Array.isArray(data.items) ? data : { items: [] };
        }
      }
    } catch {
      cachedBlobUrl = null;
    }
  }
  return readPortfolioSync();
}

/** Vercel Blob 또는 로컬 파일에 포트폴리오 쓰기 (쓰기 후 URL 캐시 갱신으로 다음 읽기 가속) */
async function writePortfolioItemsAsync(items: PortfolioItem[]): Promise<void> {
  const payload = JSON.stringify({ items });
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const result = await put(BLOB_PORTFOLIO_PATH, payload, {
      access: "public",
      addRandomSuffix: false,
      cacheControlMaxAge: 0,
    });
    cachedBlobUrl = result.url;
    return;
  }
  const dir = path.dirname(portfolioPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(portfolioPath, payload, "utf8");
}

export async function getPortfolioItems(options?: {
  page?: number;
  limit?: number;
  category?: "domestic" | "overseas";
  orderBy?: "newest" | "oldest";
  search?: string;
}): Promise<{ items: PortfolioItem[]; total: number }> {
  const data = await readPortfolioAsync();
  let items = [...data.items];
  if (options?.category) {
    items = items.filter((i) => i.category === options.category);
  }
  if (options?.search?.trim()) {
    const q = options.search.trim().toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(q));
  }
  const orderBy = options?.orderBy ?? "newest";
  items.sort((a, b) => {
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    const t = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return orderBy === "newest" ? -t : t;
  });
  const total = items.length;
  if (options?.page != null && options?.limit != null) {
    const start = (options.page - 1) * options.limit;
    items = items.slice(start, start + options.limit);
  }
  return { items, total };
}

export async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
  const data = await readPortfolioAsync();
  return data.items.find((i) => i.id === id) ?? null;
}

export async function writePortfolioItems(items: PortfolioItem[]): Promise<void> {
  await writePortfolioItemsAsync(items);
}

/** 해당 카테고리 내 표시 순서를 orderedIds 순서로 저장 */
export async function reorderPortfolioItems(
  category: "domestic" | "overseas",
  orderedIds: string[]
): Promise<void> {
  const data = await readPortfolioAsync();
  const idToOrder = new Map(orderedIds.map((id, i) => [id, i]));
  const items = data.items.map((item) => {
    if (item.category !== category) return item;
    return { ...item, order: idToOrder.get(item.id) ?? 999999 };
  });
  await writePortfolioItemsAsync(items);
}
