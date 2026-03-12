import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-main mb-6">관리자 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/news"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-main mb-2">뉴스 관리</h2>
          <p className="text-secondary text-sm">
            뉴스 글을 업로드·수정·삭제합니다.
          </p>
        </Link>
        <Link
          href="/admin/portfolio"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-main mb-2">
            포트폴리오 관리
          </h2>
          <p className="text-secondary text-sm">
            포트폴리오 항목을 업로드·수정·삭제합니다.
          </p>
        </Link>
      </div>
    </div>
  );
}
