import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import ScrollAnimation from "@/components/ScrollAnimation";
import openingContent from "@/content/pages/product-opening.json";

const subCategories = [
  { label: "개원 컨설팅", href: "/product/opening" },
  { label: "관리 컨설팅", href: "/product/management" },
  { label: "M&A·양도양수·청산", href: "/product/closing" },
];

export const metadata: Metadata = {
  title: "개원 컨설팅 | 대동메디칼컨설팅",
  description: "DMC의 Development Consulting은 병원의 새로운 가치를 만드는 것에 집중합니다.",
};

export default function OpeningPage() {
  const {
    consultingProcess,
    step01Detail,
    step02Detail,
    step03Detail,
    step04Detail,
    step05Detail,
    step06Detail,
  } = openingContent as any;

  const steps = consultingProcess.items.map((raw: string, index: number) => {
    const match = raw.match(/^(\d{2})\s*(.*)$/);
    const number = match ? match[1] : String(index + 1).padStart(2, "0");
    const label = match ? match[2].trim() : raw;

    const detailByNumber: Record<string, any> = {
      "01": step01Detail,
      "02": step02Detail,
      "03": step03Detail,
      "04": step04Detail,
      "05": step05Detail,
      "06": step06Detail,
    };

    return {
      number,
      label,
      detail: detailByNumber[number],
    };
  });

  const renderDetail = (number: string, detail: any) => {
    if (!detail) return null;

    // 공통: intro(문단) 렌더
    const intro = Array.isArray(detail.intro) ? detail.intro : [];

    // step01/03: items(카드) 렌더 / step05/06: items(하이라이트) 렌더
    const items = Array.isArray(detail.items) ? detail.items : [];

    return (
      <div className="mt-2 pt-6 md:pt-10 pb-6 md:pb-10 border-t border-gray-200">
        {detail.subtitle && (
          <p className="text-main font-medium text-base md:text-lg mb-6">
            {detail.subtitle}
          </p>
        )}

        {intro.length > 0 && (
          <div className={`mb-10 ${detail.image ? (number === "04" ? "flex flex-col gap-6 md:gap-8" : "flex flex-col md:flex-row gap-6 md:gap-8 items-stretch") : ""}`}>
            {detail.image && number === "04" && (
              <div className="relative w-full md:w-[35.1rem] shrink-0 aspect-[4/3] rounded-lg overflow-hidden bg-white">
                <Image
                  src={detail.image}
                  alt={detail.title || ""}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 562px"
                  unoptimized={typeof detail.image === "string" && detail.image.startsWith("/")}
                />
              </div>
            )}
            {detail.image && number !== "04" && (
              <div className="relative w-full md:w-[23.4rem] shrink-0 aspect-[4/3] md:aspect-auto md:min-h-0 rounded-lg overflow-hidden bg-white">
                <Image
                  src={detail.image}
                  alt={detail.title || ""}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 375px"
                  unoptimized={typeof detail.image === "string" && detail.image.startsWith("/")}
                />
              </div>
            )}
            <div className="space-y-6 flex-1 min-w-0">
              {intro.map((paragraph: string, i: number) => (
                <p
                  key={`${number}-intro-${i}`}
                  className="text-secondary leading-relaxed text-base md:text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <>
            {/* step05: 3개 강조 카드, step06: 2개 강조 카드 */}
            {number === "05" || number === "06" ? (
              <div
                className={`grid grid-cols-1 ${
                  number === "05" ? "sm:grid-cols-3" : "sm:grid-cols-2"
                } gap-6`}
              >
                {items.map((item: any, i: number) => (
                  <div
                    key={`${number}-item-${i}`}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow text-center flex flex-col"
                  >
                    {item.image && (
                      <div className="relative w-full aspect-[4/3] bg-white shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title || ""}
                          fill
                          className={number === "05" ? "object-cover" : "object-contain"}
                          sizes={number === "05" ? "(max-width: 640px) 100vw, 33vw" : "(max-width: 640px) 100vw, 50vw"}
                          unoptimized={typeof item.image === "string" && item.image.startsWith("/")}
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <h4
                        className={`text-main font-semibold text-lg ${
                          number === "06" ? "tracking-wide" : ""
                        }`}
                      >
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-secondary text-sm md:text-base leading-relaxed mt-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((item: any, i: number) => (
                  <div
                    key={`${number}-item-${i}`}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  >
                    {item.image && (
                      <div className="relative w-full aspect-[16/10] bg-white shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title || ""}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          unoptimized={typeof item.image === "string" && item.image.startsWith("/")}
                        />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="text-main font-semibold text-lg mb-3 pb-0.5 border-b border-point/30">
                        {number === "03" ? `${i + 1}. ` : ""}
                        {item.title}
                      </h4>
                      <p className="text-secondary text-sm md:text-base leading-relaxed flex-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };
  return (
    <>
      <Hero
        title={openingContent.hero.title}
        subtitle={openingContent.hero.subtitle}
      />

      <Section animation="fadeInUp">
        <div className="overflow-x-auto mb-12 md:mb-20 lg:mb-24 max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation animation="fadeInUp" delay={100}>
            <h2 className="text-2xl md:text-3xl font-bold text-main mb-3 text-center">
              {consultingProcess.title}
            </h2>
            <p className="text-secondary text-base md:text-lg text-center mb-8">
              체계적인 단계로 진행되는 DMC의 개원 컨설팅 프로세스를 확인해 보세요
            </p>
          </ScrollAnimation>
          <div className="relative">
            {/* 01→07 연결선 (요약 영역에서만 보이도록) */}
            <span
              className="absolute left-[1.05rem] top-[1.05rem] bottom-[1.05rem] w-1 bg-point -translate-x-1/2"
              aria-hidden
            />
            <div className="space-y-10 md:space-y-12">
              {steps.map((step: any, index: number) => (
                <ScrollAnimation
                  key={step.number}
                  animation="fadeInUp"
                  delay={150 + index * 80}
                >
                  {step.number === "07" ? (
                    /* 07 병원 개원: 펼침 없음, 호버 효과만 */
                    <div className="group rounded-lg -mx-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200">
                      <div className="relative flex items-center gap-4">
                        <div className="relative z-10 flex h-[2.1rem] w-[2.1rem] shrink-0 items-center justify-center rounded-full border-2 border-point bg-white text-point font-bold text-[0.7rem] group-hover:bg-point group-hover:text-white transition-colors duration-200">
                          {step.number}
                        </div>
                        <span className="text-secondary text-xl md:text-2xl group-hover:text-point transition-colors duration-200">
                          {step.label}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <details className="group">
                      <summary className="list-none cursor-pointer select-none rounded-lg -mx-2 px-2 py-2 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200">
                        <div className="relative flex items-center gap-4">
                          <div className="relative z-10 flex h-[2.1rem] w-[2.1rem] shrink-0 items-center justify-center rounded-full border-2 border-point bg-white text-point font-bold text-[0.7rem] group-hover:bg-point group-hover:text-white transition-colors duration-200">
                            {step.number}
                          </div>
                          <div className="flex-1 flex items-center justify-between gap-4">
                            <span className="text-secondary text-xl md:text-2xl group-hover:text-point group-open:text-point transition-colors duration-200">
                              {step.label}
                            </span>
                            <span
                              className="text-secondary/70 group-open:rotate-180 transition-transform"
                              aria-hidden
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </summary>

                      {/* 상세: 해당 단계 클릭 시 펼쳐짐 (높이 + 페이드인 애니메이션) */}
                      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
                        <div className="min-h-0 overflow-hidden">
                          <div className="pl-[3.1rem] pt-0.5 opacity-0 transition-opacity duration-300 delay-75 ease-out group-open:opacity-100">
                            {renderDetail(step.number, step.detail)}
                          </div>
                        </div>
                      </div>
                    </details>
                  )}
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
