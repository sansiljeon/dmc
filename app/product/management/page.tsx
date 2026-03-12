import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import ScrollAnimation from "@/components/ScrollAnimation";
import managementContent from "@/content/pages/product-management.json";

const subCategories = [
  { label: "개원 컨설팅", href: "/product/opening" },
  { label: "관리 컨설팅", href: "/product/management" },
  { label: "M&A·양도양수·청산", href: "/product/closing" },
];

export const metadata: Metadata = {
  title: "관리 컨설팅 | 대동메디칼컨설팅",
  description: "효율적인 의료기관 운영 지원 서비스를 제공합니다.",
};

export default function ManagementPage() {
  const gridSections = (managementContent as any).gridSections ?? [];
  return (
    <>
      <Hero
        title={managementContent.hero.title}
        subtitle={managementContent.hero.subtitle}
      />

      <Section animation="fadeInUp">
        <div className="overflow-x-auto mb-12 md:mb-20 lg:mb-24 max-w-3xl mx-auto">
          <table className="w-full border-collapse border border-gray-200 text-main table-fixed">
            <tbody>
              <tr>
                {subCategories.map((item) => (
                  <td key={item.href} className="w-1/3 border border-gray-200 px-4 py-3 text-center hover:bg-gray-50 transition-colors">
                    <Link href={item.href} className="block text-main font-medium hover:text-point transition-colors">
                      {item.label}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3열 그리드: 경영진단 / 직원관리 / 의료장비 유지보수 */}
        {gridSections.length > 0 && (
          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {gridSections.map((section: any, index: number) => (
              <ScrollAnimation key={index} animation="fadeInUp" delay={index * 100}>
                <div className="py-6 flex flex-col border-b border-gray-200 last:border-b-0">
                  <h3 className="text-xl font-semibold text-point mb-4 pb-1 border-b border-point/30">
                    {section.title}
                  </h3>
                  <div className="space-y-3 mb-4 flex-1">
                    {Array.isArray(section.intro) && section.intro.map((p: string, i: number) => (
                      <p key={i} className="text-secondary text-sm leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>
                  {Array.isArray(section.steps) && section.steps.length > 0 && (
                    <div className="grid grid-cols-6 md:grid-cols-5 gap-3 mt-auto w-full [grid-template-columns:repeat(6,minmax(0,1fr))] md:[grid-template-columns:repeat(5,minmax(0,1fr))]">
                      {section.steps.map((step: any, i: number) => {
                        const label = typeof step === "string" ? step : step?.label ?? "";
                        const emoji = typeof step === "object" && step?.emoji ? step.emoji : "";
                        const image = typeof step === "object" && step?.image ? step.image : "";
                        return (
                          <div
                            key={i}
                            className={`flex flex-col rounded-lg border border-gray-200 bg-gray-50/50 text-main text-sm text-center w-full min-w-0 overflow-hidden md:col-span-1 md:col-start-auto ${i < 3 ? "col-span-2" : ""} ${i === 3 ? "col-span-2 col-start-2" : ""} ${i === 4 ? "col-span-2 col-start-4" : ""}`}
                          >
                            <div className="relative w-full aspect-[4/3] bg-white shrink-0">
                              {image ? (
                                <Image
                                  src={image}
                                  alt={label}
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 768px) 20vw, 160px"
                                  unoptimized
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-white text-gray-400 text-xs">
                                  이미지
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-center gap-2 px-3 py-3">
                              {emoji && <span className="text-base shrink-0">{emoji}</span>}
                              {label === "실행결과보고" ? (
                                <span className="break-keep">
                                  실행결과
                                  <br className="md:hidden" />
                                  보고
                                </span>
                              ) : label.includes("/") ? (
                                <span className="break-keep">
                                  {label.split("/")[0]}
                                  <br className="md:hidden" />
                                  {"/" + label.split("/").slice(1).join("/")}
                                </span>
                              ) : (
                                <span className="break-keep">{label}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {Array.isArray(section.items) && section.items.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto w-full">
                      {section.items.map((item: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-lg border border-gray-200 bg-gray-50/50 text-left min-w-0 flex overflow-hidden"
                        >
                          {item.image && (
                            <div className="relative w-24 sm:w-28 shrink-0 self-stretch min-h-[6rem] rounded-l-lg overflow-hidden bg-white">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                sizes="112px"
                                unoptimized
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1 p-4">
                            <h4 className="text-main font-semibold text-sm mb-2">{item.title}</h4>
                            <p className="text-secondary text-xs leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {section.image && (
                    <div className="w-full mt-6">
                      <div className="relative w-full aspect-[21/11.7] sm:aspect-[3/1.3] rounded-lg overflow-hidden bg-white">
                        <Image
                          src={section.image}
                          alt={section.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 896px) 100vw, 896px"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollAnimation>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
