import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getPortfolioItems,
  createPortfolioItem,
  type PortfolioItem,
} from "@/lib/portfolio";

const LIMIT = 50;

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || String(LIMIT), 10))
  );
  const category = searchParams.get("category") as
    | "domestic"
    | "overseas"
    | null;
  const search = searchParams.get("search") ?? undefined;
  const { items, total } = await getPortfolioItems({
    page,
    limit,
    category: category || undefined,
    search: search || undefined,
  });
  return Response.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

const MAX_ITEMS = 5000;

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const { items, total } = await getPortfolioItems();
  if (total >= MAX_ITEMS) {
    return Response.json(
      { error: `포트폴리오는 최대 ${MAX_ITEMS}개까지 등록 가능합니다.` },
      { status: 400 }
    );
  }
  const body = (await request.json()) as Partial<PortfolioItem>;
  const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const minOrder = items.length > 0
    ? Math.min(...items.map((i) => i.order ?? Infinity))
    : Infinity;
  const newOrder = minOrder === Infinity ? 0 : minOrder - 1;
  const newItem: PortfolioItem = {
    id,
    title: body.title ?? "",
    description: body.description ?? "",
    image: body.image ?? "",
    imageAlt: body.imageAlt,
    category: body.category ?? "domestic",
    address: body.address,
    createdAt: body.createdAt ?? new Date().toISOString(),
    order: newOrder,
  };
  await createPortfolioItem(newItem);
  return Response.json(newItem);
}
