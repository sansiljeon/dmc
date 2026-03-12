import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAllNewsPosts,
  getNewsPost,
  updateNewsPost,
  createNewsPostWithSlug,
  type NewsPost,
} from "@/lib/news";

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const posts = getAllNewsPosts();
  const json = JSON.stringify({ posts }, null, 2);
  const filename = `news-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function isNewsPost(x: unknown): x is NewsPost {
  return (
    typeof x === "object" &&
    x != null &&
    "slug" in x &&
    "title" in x &&
    "content" in x &&
    typeof (x as NewsPost).slug === "string" &&
    typeof (x as NewsPost).title === "string" &&
    typeof (x as NewsPost).content === "string"
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
  let body: { posts?: unknown[] };
  try {
    const text = await file.text();
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "유효한 JSON 파일이 아닙니다." }, { status: 400 });
  }
  const posts = Array.isArray(body.posts) ? body.posts : [];
  let created = 0;
  let updated = 0;
  for (const raw of posts) {
    if (!isNewsPost(raw)) continue;
    const post: NewsPost = {
      slug: raw.slug,
      title: raw.title ?? "",
      date: raw.date ?? new Date().toISOString().slice(0, 10),
      author: raw.author ?? "",
      summary: raw.summary ?? "",
      image: raw.image,
      notice: raw.notice === true,
      attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
      content: raw.content ?? "",
    };
    const { slug: postSlug, ...rest } = post;
    if (getNewsPost(postSlug)) {
      updateNewsPost(postSlug, post);
      updated += 1;
    } else {
      createNewsPostWithSlug(postSlug, rest);
      created += 1;
    }
  }
  return Response.json({ ok: true, created, updated });
}
