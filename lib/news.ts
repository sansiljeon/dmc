import fs from "fs";
import path from "path";
import matter from "gray-matter";

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

export function getAllNewsPosts(): NewsPost[] {
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

export function getNewsPost(slug: string): NewsPost | null {
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

export function getNewsPostsPaginated(options: {
  page: number;
  limit: number;
}): { posts: NewsPost[]; total: number } {
  const all = getAllNewsPosts();
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

export function createNewsPost(post: Omit<NewsPost, "slug">): NewsPost {
  const slug = slugify(post.title) || `post-${Date.now()}`;
  writeNewsPostToFile(slug, post);
  return { ...post, slug };
}

/** 백업 복원 시 지정 slug로 뉴스 글 생성 */
export function createNewsPostWithSlug(slug: string, post: Omit<NewsPost, "slug">): NewsPost {
  const safeSlug = slug || slugify(post.title) || `post-${Date.now()}`;
  writeNewsPostToFile(safeSlug, post);
  return { ...post, slug: safeSlug };
}

export function updateNewsPost(
  oldSlug: string,
  post: Partial<NewsPost> & { slug?: string }
): NewsPost {
  const existing = getNewsPost(oldSlug);
  if (!existing) throw new Error("Post not found");
  const slug = post.slug ?? oldSlug;
  const merged = { ...existing, ...post, slug };
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

export function deleteNewsPost(slug: string): void {
  const fullPath = path.join(newsDirectory, `${slug}.mdx`);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}
