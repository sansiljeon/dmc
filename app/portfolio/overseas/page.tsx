import { Metadata } from "next";
import Link from "next/link";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import CardGrid from "@/components/CardGrid";
import Card from "@/components/Card";
import { getPortfolioItems } from "@/lib/portfolio";

/** 관리자에서 추가/삭제한 포트폴리오가 바로 반영되도록 매 요청 시 데이터 조회 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "해외 포트폴리오 | 대동메디칼컨설팅",
  description: "해외 의료기관 컨설팅 프로젝트 수행 실적입니다.",
};

const PER_PAGE = 18; // 3열 x 6행
const subCategories = [
  { label: "국내 포트폴리오", href: "/portfolio/domestic" },
  { label: "해외 포트폴리오", href: "/portfolio/overseas" },
];

type Props = { searchParams?: Promise<{ page?: string }> | { page?: string } };

export default async function PortfolioOverseasPage(props: Props) {
  const searchParams = await Promise.resolve(props.searchParams ?? {});
  const page = Math.max(1, parseInt(String(searchParams?.page ?? "1"), 10) || 1);
  const { items, total } = await getPortfolioItems({
    category: "overseas",
    page,
    limit: PER_PAGE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <>
      <Hero title="해외 포트폴리오" />

      <Section animation="fadeInUp" duration={350}>
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

        <CardGrid columns={3} className="max-md:grid-cols-2" staggerDelay={50} duration={350}>
          {items.length > 0 ? (
            items.map((item) => (
              <Card
                key={item.id}
                title={item.title}
                description={item.description}
                image={item.image}
                imageAlt={item.imageAlt || item.title}
              />
            ))
          ) : (
            <p className="text-secondary col-span-full text-center py-8">
              등록된 해외 프로젝트가 없습니다.
            </p>
          )}
        </CardGrid>

        {totalPages > 1 && (
          <nav className="flex justify-center gap-2 mt-12 flex-wrap" aria-label="페이지 이동">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={p === 1 ? "/portfolio/overseas" : `/portfolio/overseas?page=${p}`}
                className={`min-w-[2.25rem] h-9 flex items-center justify-center rounded border text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-point text-white border-point"
                    : "bg-white text-main border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </Section>
    </>
  );
}
