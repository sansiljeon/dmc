import { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import ScrollAnimation from "@/components/ScrollAnimation";
import closingContent from "@/content/pages/product-closing.json";

const subCategories = [
  { label: "개원 컨설팅", href: "/product/opening" },
  { label: "관리 컨설팅", href: "/product/management" },
  { label: "M&A·양도양수·청산", href: "/product/closing" },
];

export const metadata: Metadata = {
  title: "청산 컨설팅 | 대동메디칼컨설팅",
  description: "M&A 및 양도양수 전문 지원 서비스를 제공합니다.",
};

export default function ClosingPage() {
  return (
    <>
      <Hero
        title={closingContent.hero.title}
        subtitle={closingContent.hero.subtitle}
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

        {(closingContent as any).gridSections?.length > 0 && (
          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            {(closingContent as any).gridSections.map((section: any, index: number) => (
              <ScrollAnimation key={index} animation="fadeInUp" delay={index * 100}>
                <div className="py-6 flex flex-col border-b border-gray-200 last:border-b-0">
                  <h3 className="text-xl font-semibold text-point mb-4 pb-1 border-b border-point/30">
                    {section.title}
                  </h3>
                  <div className="space-y-3 mb-4 flex-1">
                    {Array.isArray(section.intro) &&
                      section.intro.map((p: string, i: number) => (
                        <p key={i} className="text-secondary text-sm leading-relaxed">
                          {p}
                        </p>
                      ))}
                  </div>
                  {Array.isArray(section.steps) && section.steps.length > 0 && (
                    <div className="flex flex-col items-center gap-2 mt-auto w-full">
                      {section.steps.map((step: any, i: number) => {
                        const num = step?.step ?? i + 1;
                        const label = step?.label ?? "";
                        const isLast = i === section.steps.length - 1;
                        return (
                          <div key={i} className="flex flex-col items-center gap-2 w-full">
                            <div className="rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-4 text-main text-sm w-full max-w-xl flex flex-row items-center justify-center min-w-0">
                              <span className="text-point font-semibold text-sm shrink-0 w-16 text-center">Step .{num}</span>
                              <p className="break-keep font-medium text-left flex-1 pl-10 md:pl-12">{label}</p>
                            </div>
                            {!isLast && (
                              <span className="flex-shrink-0 text-gray-300 text-lg font-light" aria-hidden>↓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {Array.isArray(section.items) && section.items.length > 0 && (
                    <div className="relative mt-auto w-full py-4 overflow-x-auto">
                      <div className="relative w-full min-w-0 py-2">
                        <div
                          className="absolute left-0 right-0 top-1/2 -translate-y-px border-t-2 border-point z-0"
                          aria-hidden
                        />
                        <div className="grid grid-cols-4 gap-2 sm:gap-3 relative z-10 w-full">
                          {section.items.map((item: string, i: number) => (
                            <div
                              key={i}
                              className="rounded-lg border border-gray-200 bg-white px-2 sm:px-3 py-4 text-main text-sm text-center min-w-0 break-keep flex items-center justify-center"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
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
