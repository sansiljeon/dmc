import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
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
  const body = (await request.json()) as Partial<PortfolioItem>;
  const updated = await updatePortfolioItem(params.id, body);
  if (!updated) return Response.json({ error: "Not found" }, { status: 404 });
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
  const ok = await deletePortfolioItem(params.id);
  if (!ok) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
