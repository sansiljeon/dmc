import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { reorderPortfolioItems } from "@/lib/portfolio";

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const body = (await request.json()) as {
    category?: string;
    orderedIds?: unknown;
  };
  const category = body.category as "domestic" | "overseas" | undefined;
  if (category !== "domestic" && category !== "overseas") {
    return Response.json(
      { error: "category는 domestic 또는 overseas여야 합니다." },
      { status: 400 }
    );
  }
  const orderedIds = Array.isArray(body.orderedIds)
    ? (body.orderedIds as string[]).filter((id) => typeof id === "string")
    : [];
  await reorderPortfolioItems(category, orderedIds);
  return Response.json({ ok: true });
}
