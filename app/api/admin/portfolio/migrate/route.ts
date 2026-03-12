import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { readLegacyPortfolioItems } from "@/lib/portfolio-legacy";
import { writePortfolioItems } from "@/lib/portfolio";

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }

  const legacyItems = await readLegacyPortfolioItems();
  await writePortfolioItems(legacyItems);

  return Response.json({ ok: true, count: legacyItems.length });
}

