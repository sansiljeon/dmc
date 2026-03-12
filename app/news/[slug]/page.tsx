import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsPost, getAllNewsPosts } from "@/lib/news";
import { markdownToHtml } from "@/lib/markdown";

interface NewsPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllNewsPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: NewsPostPageProps): Promise<Metadata> {
  const post = getNewsPost(params.slug);

  if (!post) {
    return {
      title: "뉴스를 찾을 수 없습니다",
    };
  }

  return {
    title: `${post.title} | 대동메디칼컨설팅`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function NewsPostPage({ params }: NewsPostPageProps) {
  const post = getNewsPost(params.slug);

  if (!post) {
    notFound();
  }

  const contentHtml = await markdownToHtml(post.content);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <article className="max-w-4xl mx-auto bg-white">
        <div>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-point hover:opacity-80 text-sm mb-6"
          >
            <span aria-hidden>←</span>
            뉴스 목록
          </Link>

          <h1 className="text-2xl md:text-3xl font-bold text-main text-left mb-4">
            {post.title}
          </h1>

          <div className="flex items-center space-x-4 text-sm text-secondary mb-6 pb-6 border-b border-gray-200">
            <span>작성자: {post.author}</span>
            <span>•</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          {post.image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-auto max-w-full block"
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none prose-headings:text-main prose-p:text-secondary prose-a:text-point prose-strong:text-main"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-main mb-3">첨부파일</h2>
              <ul className="space-y-2">
                {post.attachments.map((att, i) => (
                  <li key={i}>
                    <a
                      href={att.url}
                      download={att.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-main rounded border border-gray-200 text-sm"
                    >
                      <span aria-hidden>↓</span>
                      {att.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-gray-200 text-center">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-point text-white rounded hover:opacity-90 text-sm font-medium"
            >
              <span aria-hidden>←</span>
              목록으로 가기
            </Link>
          </div>
        </div>
      </article>
      </div>
    </section>
  );
}
