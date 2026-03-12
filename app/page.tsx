import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import CardGrid from "@/components/CardGrid";
import Card from "@/components/Card";
import StatRow from "@/components/StatRow";
import CTAButton from "@/components/CTAButton";
import ScrollAnimation from "@/components/ScrollAnimation";
import homeContent from "@/content/pages/home.json";
import { siteInfo } from "@/content/site";
import { getPortfolioItems } from "@/lib/portfolio";
import { getAllNewsPosts } from "@/lib/news";

export const metadata: Metadata = {
  title: "대동메디칼컨설팅 | 의료기관 컨설팅 전문",
  description: "개원부터 운영, M&A까지 종합 컨설팅 서비스를 제공하는 대동메디칼컨설팅입니다.",
  openGraph: {
    title: "대동메디칼컨설팅",
    description: "의료기관 컨설팅 전문",
    type: "website",
  },
};

export default async function Home() {
  const { items: portfolioItems } = await getPortfolioItems({
    page: 1,
    limit: 6,
    orderBy: "newest",
  });
  const allNews = getAllNewsPosts();
  const latestNews = allNews[0] ?? null;
  const latestNewsDescription = latestNews
    ? latestNews.summary ||
      (() => {
        const d = latestNews.content.replace(/\n/g, " ").replace(/[#*[\]`]/g, "").trim();
        return d.slice(0, 120) + (d.length > 120 ? "…" : "");
      })()
    : "";

  return (
    <>
      <Hero
        title={homeContent.hero.title}
        subtitle={homeContent.hero.subtitle}
        showBreadcrumbs={false}
        showYearsText
        showCtaButton
      />

      {/* Solutions Section */}
      <Section animation="fadeInUp" delayFromLoad={800}>
        <div className="text-center mb-12">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-main">
              DMC의 <span className="text-point">맞춤형 솔루션</span>
            </h2>
          </ScrollAnimation>
        </div>
        <CardGrid columns={3} staggerDelay={40}>
          {homeContent.solutions.map((solution, index) => (
            <Card
              key={index}
              title={solution.title}
              description={solution.description}
              image={`/images/placeholder/product-${index + 1}.png`}
              imageAlt={solution.title}
              imagePosition="top"
              href={solution.href}
            >
              {index === 0 && (
                <ul className="mt-3 pt-3 border-t border-gray-200 text-[0.7rem] text-secondary leading-relaxed flex flex-wrap gap-x-3 gap-y-1">
                  <li>병원부지 및 입지 선정</li>
                  <li>병원 설계 및 인테리어</li>
                  <li>금융자문</li>
                  <li>의료정보 및 네트워크 시스템 지원</li>
                  <li>병원설계 및 인테리어</li>
                  <li>직원 채용 및 노무관리</li>
                </ul>
              )}
              {index === 1 && (
                <ul className="mt-3 pt-3 border-t border-gray-200 text-[0.7rem] text-secondary leading-relaxed flex flex-wrap gap-x-3 gap-y-1">
                  <li>경영진단</li>
                  <li>직원관리</li>
                  <li>의료장비 유지보수</li>
                </ul>
              )}
              {index === 2 && (
                <ul className="mt-3 pt-3 border-t border-gray-200 text-[0.7rem] text-secondary leading-relaxed flex flex-wrap gap-x-3 gap-y-1">
                  <li>M&A</li>
                  <li>양도양수</li>
                  <li>청산</li>
                </ul>
              )}
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* Stats Section */}
      <Section animation="fadeInUp" delayFromLoad={1600}>
        <div className="text-center mb-12">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">
              경험의 축적
            </h2>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <p className="text-secondary">
              30년 동안 병원의 다양한 선택을 함께해온 기록입니다.
            </p>
          </ScrollAnimation>
        </div>
        <StatRow stats={homeContent.stats} />
      </Section>

      {/* Main Copy Section */}
      <Section background="gray" animation="fadeInUp" className="!py-20 md:!py-28" delayFromLoad={2400}>
        <div className="relative flex flex-col items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08]" aria-hidden>
            <Image
              src="/images/logo.png"
              alt=""
              width={320}
              height={80}
              className="object-contain w-2/3 max-w-md"
              unoptimized
            />
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto w-full">
            <ScrollAnimation animation="fadeInUp" delay={100}>
              <h2 className="text-3xl md:text-4xl font-bold text-main mb-6">
                {homeContent.mainCopy.title}
              </h2>
            </ScrollAnimation>
            <ScrollAnimation animation="fadeInUp" delay={200}>
              <p className="text-lg text-secondary leading-relaxed">
                {homeContent.mainCopy.description}
              </p>
            </ScrollAnimation>
          </div>
        </div>
      </Section>

      {/* Portfolio Preview Section */}
      <Section animation="fadeInUp" delayFromLoad={3200}>
        <div className="text-center mb-12">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">
              DMC의 <span className="text-point">프로젝트</span>
            </h2>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <p className="text-secondary mb-8">
              {homeContent.portfolioPreview.description}
            </p>
          </ScrollAnimation>
        </div>
        <CardGrid columns={3} className="max-md:grid-cols-2" staggerDelay={40}>
          {portfolioItems.length > 0 ? (
            portfolioItems.map((item) => (
              <Card
                key={item.id}
                title={item.title}
                description={item.description}
                image={item.image}
                imageAlt={item.imageAlt ?? item.title}
              />
            ))
          ) : (
            [1, 2, 3, 4, 5, 6].map((n) => (
              <Card
                key={n}
                title={`프로젝트 ${n}`}
                description="의료기관 컨설팅 프로젝트 수행 실적입니다."
                image={`/images/placeholder/portfolio-${n}.png`}
                imageAlt={`프로젝트 ${n}`}
              />
            ))
          )}
        </CardGrid>
        <ScrollAnimation animation="fadeInUp" delay={300}>
          <div className="text-center mt-12">
            <Link
              href={homeContent.portfolioPreview.ctaHref}
              className="font-bold text-point underline underline-offset-4 transition-all duration-200 hover:opacity-80 hover:underline-offset-8"
            >
              more
            </Link>
          </div>
        </ScrollAnimation>
      </Section>

      {/* News Preview Section */}
      <Section animation="fadeInUp" delayFromLoad={4000}>
        <div className="text-center mb-12">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">
              DMC <span className="text-point">소식</span>
            </h2>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <p className="text-secondary mb-8">
              {homeContent.newsPreview.description}
            </p>
          </ScrollAnimation>
        </div>
        <div className="max-w-4xl mx-auto">
          {latestNews ? (
            <Card
              title={latestNews.title}
              description={latestNewsDescription}
              image={latestNews.image ?? "/images/placeholder/news-1.png"}
              imageAlt={latestNews.title}
              href={`/news/${latestNews.slug}`}
              className="[&_h3]:mb-4"
            />
          ) : (
            <Card
              title="최신 뉴스 제목"
              description="의료기관 컨설팅 관련 최신 소식과 인사이트를 확인하세요. 전문가의 관점에서 제공하는 유용한 정보입니다."
              image="/images/placeholder/news-1.png"
              imageAlt="최신 뉴스"
              href="/news"
              className="[&_h3]:mb-4"
            />
          )}
        </div>
        <ScrollAnimation animation="fadeInUp" delay={300}>
          <div className="text-center mt-8">
            <Link
              href={homeContent.newsPreview.ctaHref}
              className="font-bold text-point underline underline-offset-4 transition-all duration-200 hover:opacity-80 hover:underline-offset-8"
            >
              more
            </Link>
          </div>
        </ScrollAnimation>
      </Section>

      {/* CTA Section */}
      <Section background="gray" animation="fadeInUp" delayFromLoad={4800}>
        <div className="text-center max-w-2xl mx-auto">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h2 className="text-3xl md:text-4xl font-bold text-main mb-6">
              상담 요청
            </h2>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={200}>
            <p className="text-lg text-secondary mb-8">
              개원이나 운영 과정에서 마주한 고민, DMC의 전문가와 함께 검토하세요.
            </p>
          </ScrollAnimation>
          <ScrollAnimation animation="fadeInUp" delay={300}>
            <CTAButton
              href={siteInfo.kakaoLink}
              text="상담 신청하기"
              isExternal
              variant="primary"
            />
          </ScrollAnimation>
        </div>
      </Section>
    </>
  );
}
