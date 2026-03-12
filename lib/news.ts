import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { list, put } from "@vercel/blob";

export interface NewsAttachment {
  url: string;
  name: string;
}

export interface NewsPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  image?: string;
  /** 공지 여부 */
  notice?: boolean;
  /** 첨부파일 목록 */
  attachments?: NewsAttachment[];
  content: string;
}

const newsDirectory = path.join(process.cwd(), "content/news");
const BLOB_NEWS_PATH = "news-posts.json";

type NewsStore = { posts: NewsPost[] };

let cachedNewsBlobUrl: string | null = null;

function getAllNewsPostsFromFs(): NewsPost[] {
  if (!fs.existsSync(newsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(newsDirectory);
  const allPostsData = fileNames
    .filter((name) => name.endsWith(".mdx") && !name.startsWith("._"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, "");
      const fullPath = path.join(newsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      const attachments = parseAttachments(data.attachments);
      return {
        slug,
        title: data.title || "",
        date: data.date || "",
        author: data.author || "",
        summary: data.summary || "",
        image: data.image,
        notice: !!data.notice,
        attachments,
        content,
      };
    });

  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

function getNewsPostFromFs(slug: string): NewsPost | null {
  try {
    const fullPath = path.join(newsDirectory, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const attachments = parseAttachments(data.attachments);
    return {
      slug,
      title: data.title || "",
      date: data.date || "",
      author: data.author || "",
      summary: data.summary || "",
      image: data.image,
      notice: !!data.notice,
      attachments,
      content,
    };
  } catch (error) {
    return null;
  }
}

function parseAttachments(value: unknown): NewsAttachment[] {
  if (Array.isArray(value)) {
    return value.filter((x) => x && typeof x.url === "string" && typeof x.name === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.filter((x: unknown) => x && typeof (x as NewsAttachment).url === "string" && typeof (x as NewsAttachment).name === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

async function readNewsStoreFromBlob(): Promise<NewsStore | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    if (cachedNewsBlobUrl) {
      const res = await fetch(cachedNewsBlobUrl, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as NewsStore;
        return Array.isArray(data.posts) ? data : { posts: [] };
      }
      cachedNewsBlobUrl = null;
    }
    const { blobs } = await list({ prefix: BLOB_NEWS_PATH, limit: 5 });
    const blob = blobs.find((b) => b.pathname === BLOB_NEWS_PATH);
    if (!blob?.url) return { posts: [] };
    cachedNewsBlobUrl = blob.url;
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return { posts: [] };
    const data = (await res.json()) as NewsStore;
    return Array.isArray(data.posts) ? data : { posts: [] };
  } catch {
    cachedNewsBlobUrl = null;
    return null;
  }
}

async function writeNewsStoreToBlob(store: NewsStore): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  const payload = JSON.stringify(store);
  const result = await put(BLOB_NEWS_PATH, payload, {
    access: "public",
    addRandomSuffix: false,
    cacheControlMaxAge: 0,
    contentType: "application/json",
  });
  cachedNewsBlobUrl = result.url;
}

function sortNewsPosts(posts: NewsPost[]): NewsPost[] {
  return [...posts].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return b.slug.localeCompare(a.slug);
  });
}

export async function getAllNewsPosts(): Promise<NewsPost[]> {
  const blobStore = await readNewsStoreFromBlob();
  if (blobStore) return sortNewsPosts(blobStore.posts);
  return getAllNewsPostsFromFs();
}

export async function getNewsPost(slug: string): Promise<NewsPost | null> {
  const blobStore = await readNewsStoreFromBlob();
  if (blobStore) return blobStore.posts.find((p) => p.slug === slug) ?? null;
  return getNewsPostFromFs(slug);
}

export async function getNewsPostsPaginated(options: {
  page: number;
  limit: number;
}): Promise<{ posts: NewsPost[]; total: number }> {
  const all = await getAllNewsPosts();
  const total = all.length;
  const start = (options.page - 1) * options.limit;
  const posts = all.slice(start, start + options.limit);
  return { posts, total };
}

function slugify(text: string): string {
  return text
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .toLowerCase();
}

function writeNewsPostToFile(slug: string, post: Omit<NewsPost, "slug">): void {
  const fullPath = path.join(newsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(newsDirectory)) {
    fs.mkdirSync(newsDirectory, { recursive: true });
  }
  const attachmentsJson = JSON.stringify(post.attachments || []).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const frontmatter = `---
title: "${(post.title || "").replace(/"/g, '\\"')}"
date: "${post.date || new Date().toISOString().slice(0, 10)}"
author: "${(post.author || "").replace(/"/g, '\\"')}"
summary: "${(post.summary || "").replace(/"/g, '\\"')}"
${post.image ? `image: "${post.image}"` : ""}
notice: ${post.notice === true}
${(post.attachments?.length ?? 0) > 0 ? `attachments: "${attachmentsJson}"` : ""}
---

${post.content || ""}`;
  fs.writeFileSync(fullPath, frontmatter, "utf8");
}

async function readNewsStore(): Promise<NewsStore> {
  const blobStore = await readNewsStoreFromBlob();
  if (blobStore) return { posts: Array.isArray(blobStore.posts) ? blobStore.posts : [] };
  // filesystem fallback (로컬 개발용)
  return { posts: getAllNewsPostsFromFs() };
}

async function writeNewsStore(store: NewsStore): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await writeNewsStoreToBlob(store);
    return;
  }
  // filesystem fallback은 기존 방식대로 파일 단위로 저장되므로 여기서는 noop
}

export async function createNewsPost(post: Omit<NewsPost, "slug">): Promise<NewsPost> {
  const slug = slugify(post.title) || `post-${Date.now()}`;
  const created: NewsPost = { ...post, slug };

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const store = await readNewsStore();
    const posts = store.posts.filter((p) => p.slug !== slug);
    posts.push(created);
    await writeNewsStore({ posts });
    return created;
  }

  writeNewsPostToFile(slug, post);
  return created;
}

/** 백업 복원 시 지정 slug로 뉴스 글 생성 */
export async function createNewsPostWithSlug(slug: string, post: Omit<NewsPost, "slug">): Promise<NewsPost> {
  const safeSlug = slug || slugify(post.title) || `post-${Date.now()}`;
  const created: NewsPost = { ...post, slug: safeSlug };

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const store = await readNewsStore();
    const posts = store.posts.filter((p) => p.slug !== safeSlug);
    posts.push(created);
    await writeNewsStore({ posts });
    return created;
  }

  writeNewsPostToFile(safeSlug, post);
  return created;
}

export async function updateNewsPost(
  oldSlug: string,
  post: Partial<NewsPost> & { slug?: string }
): Promise<NewsPost> {
  const existing = await getNewsPost(oldSlug);
  if (!existing) throw new Error("Post not found");
  const slug = post.slug ?? oldSlug;
  const merged = { ...existing, ...post, slug };

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const store = await readNewsStore();
    const posts = store.posts.filter((p) => p.slug !== oldSlug && p.slug !== slug);
    posts.push(merged);
    await writeNewsStore({ posts });
    return merged;
  }

  if (oldSlug !== slug) {
    const oldPath = path.join(newsDirectory, `${oldSlug}.mdx`);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  const fullPath = path.join(newsDirectory, `${slug}.mdx`);
  const attachmentsJson = JSON.stringify(merged.attachments || []).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const frontmatter = `---
title: "${(merged.title || "").replace(/"/g, '\\"')}"
date: "${merged.date || ""}"
author: "${(merged.author || "").replace(/"/g, '\\"')}"
summary: "${(merged.summary || "").replace(/"/g, '\\"')}"
${merged.image ? `image: "${merged.image}"` : ""}
notice: ${merged.notice === true}
${(merged.attachments?.length ?? 0) > 0 ? `attachments: "${attachmentsJson}"` : ""}
---

${merged.content || ""}`;
  fs.writeFileSync(fullPath, frontmatter, "utf8");
  return merged;
}

export async function deleteNewsPost(slug: string): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const store = await readNewsStore();
    const posts = store.posts.filter((p) => p.slug !== slug);
    await writeNewsStore({ posts });
    return;
  }
  const fullPath = path.join(newsDirectory, `${slug}.mdx`);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}
