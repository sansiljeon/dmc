import { Metadata } from "next";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import CardGrid from "@/components/CardGrid";
import Card from "@/components/Card";
import ScrollAnimation from "@/components/ScrollAnimation";
import { getAllNewsPosts } from "@/lib/news";
import newsContent from "@/content/pages/news.json";

/** 관리자에서 추가/수정/삭제한 뉴스가 바로 반영되도록 매 요청 시 데이터 조회 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News | 대동메디칼컨설팅",
  description: "의료기관 컨설팅 관련 최신 소식과 인사이트를 확인하세요.",
};

export default async function NewsPage() {
  const posts = await getAllNewsPosts();

  return (
    <>
      <Hero
        title={newsContent.hero.title}
        subtitle={newsContent.hero.subtitle}
      />

      <Section animation="fadeInUp">
        <div className="text-center mb-12">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              {newsContent.description}
            </p>
          </ScrollAnimation>
        </div>

        {posts.length > 0 ? (
          <CardGrid columns={3}>
            {posts.map((post) => (
              <Card
                key={post.slug}
                title={post.title}
                description={post.summary}
                image={post.image}
                imageAlt={post.title}
                href={`/news/${post.slug}`}
              />
            ))}
          </CardGrid>
        ) : (
          <div className="text-center py-12">
            <p className="text-secondary">뉴스가 없습니다.</p>
          </div>
        )}
      </Section>
    </>
  );
}
