import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getPortfolioItems,
  getPortfolioItem,
  writePortfolioItems,
  type PortfolioItem,
} from "@/lib/portfolio";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const item = await getPortfolioItem(params.id);
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(item);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const { items } = await getPortfolioItems();
  const idx = items.findIndex((i) => i.id === params.id);
  if (idx === -1) return Response.json({ error: "Not found" }, { status: 404 });
  const body = (await request.json()) as Partial<PortfolioItem>;
  const updated: PortfolioItem = { ...items[idx], ...body, id: params.id };
  items[idx] = updated;
  await writePortfolioItems(items);
  return Response.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const { items } = await getPortfolioItems();
  const filtered = items.filter((i) => i.id !== params.id);
  if (filtered.length === items.length) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  await writePortfolioItems(filtered);
  return Response.json({ ok: true });
}
