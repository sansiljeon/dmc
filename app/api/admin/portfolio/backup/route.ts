import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getPortfolioItems, writePortfolioItems, type PortfolioItem } from "@/lib/portfolio";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const { items } = await getPortfolioItems();
  const json = JSON.stringify({ items }, null, 2);
  const filename = `portfolio-items-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function isValidItem(x: unknown): x is PortfolioItem {
  return (
    typeof x === "object" &&
    x != null &&
    "id" in x &&
    "title" in x &&
    "description" in x &&
    "image" in x &&
    "category" in x &&
    "createdAt" in x &&
    typeof (x as PortfolioItem).id === "string" &&
    typeof (x as PortfolioItem).title === "string" &&
    typeof (x as PortfolioItem).description === "string" &&
    typeof (x as PortfolioItem).image === "string" &&
    ((x as PortfolioItem).category === "domestic" || (x as PortfolioItem).category === "overseas") &&
    typeof (x as PortfolioItem).createdAt === "string"
  );
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "백업 파일을 선택해 주세요." }, { status: 400 });
  }
  let body: { items?: unknown[] };
  try {
    const text = await file.text();
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "유효한 JSON 파일이 아닙니다." }, { status: 400 });
  }
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items: PortfolioItem[] = rawItems.filter(isValidItem).map((x) => ({
    id: x.id,
    title: x.title,
    description: x.description,
    image: x.image,
    imageAlt: x.imageAlt,
    category: x.category,
    address: x.address,
    createdAt: x.createdAt,
    order: (x as PortfolioItem).order,
  }));
  await writePortfolioItems(items);
  return Response.json({ ok: true, count: items.length });
}
