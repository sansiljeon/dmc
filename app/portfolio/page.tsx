import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import CTAButton from "@/components/CTAButton";
import portfolioContent from "@/content/pages/portfolio.json";

export const metadata: Metadata = {
  title: "포트폴리오 | 대동메디칼컨설팅",
  description: "국내외 다양한 의료기관 컨설팅 프로젝트 수행 실적을 소개합니다.",
};

const subCategories = [
  { label: "국내 포트폴리오", href: "/portfolio/domestic" },
  { label: "해외 포트폴리오", href: "/portfolio/overseas" },
];

export default function PortfolioPage() {
  const content = portfolioContent as {
    hero: { title: string; subtitle: string };
    sections: Array<{ title: string; description: string; href: string; image: string }>;
  };
  const sections = content.sections ?? [];

  return (
    <>
      <Hero title={content.hero.title} />

      <Section animation="fadeInUp">
        <div className="overflow-x-auto mb-12 md:mb-20 lg:mb-24 max-w-3xl mx-auto">
          <table className="w-full border-collapse border border-gray-200 text-main table-fixed">
            <tbody>
              <tr>
                {subCategories.map((item) => (
                  <td
                    key={item.href}
                    className="w-1/2 border border-gray-200 px-4 py-4 text-center hover:bg-gray-50 transition-colors"
                  >
                    <Link
                      href={item.href}
                      className="block text-main font-medium hover:text-point transition-colors"
                    >
                      {item.label}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-gray-200">
          {sections.map((section, index) => {
            const imageLeft = index === 0; // 국내: 왼쪽, 해외: 오른쪽
            const textAlign = imageLeft ? "text-left" : "text-right";
            return (
              <div key={index} className="py-8 first:pt-0 last:pb-0">
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center ${!imageLeft ? "md:grid-flow-dense" : ""}`}
                >
                  {/* 이미지 - 클릭 시 해당 페이지로 이동 */}
                  <div
                    className={`${imageLeft ? "md:flex md:justify-end w-full" : ""} ${!imageLeft ? "md:col-start-2 md:-ml-24 lg:-ml-32" : ""}`}
                  >
                    <Link
                      href={section.href}
                      className={`block relative h-48 md:h-64 lg:h-72 bg-white shrink-0 overflow-hidden rounded-lg hover:opacity-95 transition-opacity ${imageLeft ? "w-full md:max-w-[72%]" : "w-full"}`}
                    >
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized
                      />
                    </Link>
                  </div>
                  {/* 텍스트 */}
                  <div
                    className={`flex flex-col ${textAlign} ${!imageLeft ? "md:col-start-1 md:row-start-1 md:relative md:z-10 min-w-0" : "min-w-0"}`}
                  >
                    <h3 className="text-xl font-semibold text-point mb-2">{section.title}</h3>
                    <p className="text-secondary mb-4 whitespace-pre-line">{section.description}</p>
                    <div className={imageLeft ? "self-start" : "self-end"}>
                      <CTAButton
                        href={section.href}
                        text="더 알아보기"
                        variant="secondary"
                        size="sm"
                        className={imageLeft ? "origin-left" : "origin-right"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
