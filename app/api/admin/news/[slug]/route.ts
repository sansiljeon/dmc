import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getNewsPost,
  updateNewsPost,
  deleteNewsPost,
  type NewsPost,
} from "@/lib/news";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const post = await getNewsPost(params.slug);
  if (!post) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const body = (await request.json()) as Partial<NewsPost> & { slug?: string };
  const post = await updateNewsPost(params.slug, { ...body, attachments: body.attachments ?? undefined });
  return Response.json(post);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  await deleteNewsPost(params.slug);
  return Response.json({ ok: true });
}
