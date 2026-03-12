import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getNewsPostsPaginated,
  createNewsPost,
  type NewsPost,
} from "@/lib/news";

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
  const { posts, total } = await getNewsPostsPaginated({ page, limit });
  return Response.json({
    items: posts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const body = (await request.json()) as Partial<NewsPost>;
  const post = await createNewsPost({
    title: body.title ?? "",
    date: body.date ?? new Date().toISOString().slice(0, 10),
    author: body.author ?? "",
    summary: body.summary ?? "",
    image: body.image,
    notice: body.notice === true,
    attachments: body.attachments ?? [],
    content: body.content ?? "",
  });
  return Response.json(post);
}
