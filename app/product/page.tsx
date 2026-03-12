import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import CTAButton from "@/components/CTAButton";
import ScrollAnimation from "@/components/ScrollAnimation";
import productContent from "@/content/pages/product.json";

export const metadata: Metadata = {
  title: "Product | 대동메디칼컨설팅",
  description: "의료기관 컨설팅 솔루션을 소개합니다.",
};

const subCategories = [
  { label: "개원 컨설팅", href: "/product/opening" },
  { label: "관리 컨설팅", href: "/product/management" },
  { label: "M&A·양도양수·청산", href: "/product/closing" },
];

export default function ProductPage() {
  return (
    <>
      <Hero
        title={productContent.hero.title}
        subtitle={productContent.hero.subtitle}
      />

      <Section animation="fadeInUp">
        <div className="overflow-x-auto mb-12 md:mb-20 lg:mb-24 max-w-3xl mx-auto">
          <table className="w-full border-collapse border border-gray-200 text-main table-fixed">
            <tbody>
              <tr>
                {subCategories.map((item) => (
                  <td key={item.href} className="w-1/3 border border-gray-200 px-4 py-3 text-center hover:bg-gray-50 transition-colors group">
                    <Link href={item.href} className="block text-main font-medium hover:text-point transition-colors">
                      {item.label}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-gray-200">
          {productContent.sections.map((section, index) => {
            const imageLeft = index !== 1; // 개원(0), 청산(2): 사진 좌측 / 관리(1): 사진 우측
            const textAlign = imageLeft ? "text-left" : "text-right";
            return (
              <div key={index} className="py-8 first:pt-0 last:pb-0">
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center ${!imageLeft ? "md:grid-flow-dense" : ""}`}>
                  {/* 이미지 - 클릭 시 해당 페이지로 이동 */}
                  <div className={`${imageLeft ? "md:flex md:justify-end w-full" : ""} ${!imageLeft ? "md:col-start-2 md:-ml-24 lg:-ml-32" : ""}`}>
                    <Link
                      href={section.href}
                      className={`block relative h-48 md:h-64 lg:h-72 bg-white shrink-0 overflow-hidden rounded-lg hover:opacity-95 transition-opacity ${imageLeft ? "w-full md:max-w-[72%]" : "w-full"}`}
                    >
                      <Image
                        src={"image" in section && section.image ? section.image : `/images/placeholder/product-${index + 1}.png`}
                        alt={section.title}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        unoptimized
                      />
                    </Link>
                  </div>
                  {/* 텍스트 */}
                  <div className={`flex flex-col ${textAlign} ${!imageLeft ? "md:col-start-1 md:row-start-1 md:relative md:z-10 min-w-0" : "min-w-0"}`}>
                    <h3 className="text-xl font-semibold text-point mb-2">{section.title}</h3>
                    <p className="text-secondary mb-4 whitespace-pre-line">{section.description}</p>
                    {"descriptionSmall" in section && section.descriptionSmall && (
                      <p className="text-secondary mb-4 whitespace-pre-line text-[0.7em]">{section.descriptionSmall}</p>
                    )}
                    {section.features && section.features.length > 0 && (
                      <ul className="space-y-2 mb-4">
                        {section.features.map((feature, fIndex) => (
                          <li key={fIndex} className="text-sm text-secondary flex items-start">
                            <span className="text-point mr-2 shrink-0">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
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
