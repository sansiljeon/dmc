import fs from "fs";
import path from "path";

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

function readPortfolio(): { items: PortfolioItem[] } {
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

export function getPortfolioItems(options?: {
  page?: number;
  limit?: number;
  category?: "domestic" | "overseas";
  orderBy?: "newest" | "oldest";
  search?: string;
}): { items: PortfolioItem[]; total: number } {
  const data = readPortfolio();
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

export function getPortfolioItem(id: string): PortfolioItem | null {
  const data = readPortfolio();
  return data.items.find((i) => i.id === id) ?? null;
}

export function writePortfolioItems(items: PortfolioItem[]): void {
  const dir = path.dirname(portfolioPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(
    portfolioPath,
    JSON.stringify({ items }, null, 2),
    "utf8"
  );
}

/** 해당 카테고리 내 표시 순서를 orderedIds 순서로 저장 */
export function reorderPortfolioItems(
  category: "domestic" | "overseas",
  orderedIds: string[]
): void {
  const data = readPortfolio();
  const idToOrder = new Map(orderedIds.map((id, i) => [id, i]));
  const items = data.items.map((item) => {
    if (item.category !== category) return item;
    return { ...item, order: idToOrder.get(item.id) ?? 999999 };
  });
  writePortfolioItems(items);
}
