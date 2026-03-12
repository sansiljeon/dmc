"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { adminGet, adminDelete, adminFetch } from "@/lib/admin-api";

const PAGE_SIZE = 50;

interface NewsItem {
  slug: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  image?: string;
  notice?: boolean;
}

export default function AdminNewsPage() {
  const [data, setData] = useState<{
    items: NewsItem[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const r = await adminFetch("/api/admin/news/backup");
      if (!r.ok) throw new Error(r.statusText);
      const blob = await r.blob();
      const filename =
        r.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/)?.[1] ??
        `news-backup-${new Date().toISOString().slice(0, 10)}.json`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBackingUp(false);
    }
  };

  const openFileSelect = () => {
    backupInputRef.current?.click();
  };

  const handleBackupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedBackupFile(file ?? null);
  };

  const handleRestore = async () => {
    if (!selectedBackupFile) {
      alert("백업 JSON 파일을 선택해 주세요.");
      return;
    }
    if (!confirm("백업 데이터를 업로드하면 기존 뉴스와 병합됩니다. 계속할까요?")) return;
    setRestoring(true);
    try {
      const form = new FormData();
      form.append("file", selectedBackupFile);
      const r = await adminFetch("/api/admin/news/backup", { method: "POST", body: form });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || r.statusText);
      }
      const result = (await r.json()) as { created?: number; updated?: number };
      alert(`복원 완료: 신규 ${result.created ?? 0}건, 수정 ${result.updated ?? 0}건`);
      setSelectedBackupFile(null);
      backupInputRef.current && (backupInputRef.current.value = "");
      setData(null);
      setLoading(true);
      adminGet(`/api/admin/news?page=${page}&limit=${PAGE_SIZE}`)
        .then(setData)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setRestoring(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminGet(
      `/api/admin/news?page=${page}&limit=${PAGE_SIZE}`
    )
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  const handleDelete = async (slug: string) => {
    if (!confirm(`"${slug}" 뉴스를 삭제하시겠습니까?`)) return;
    setDeleting(slug);
    try {
      await adminDelete(`/api/admin/news/${encodeURIComponent(slug)}`);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((i) => i.slug !== slug),
              total: prev.total - 1,
            }
          : null
      );
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading && !data) {
    return <div className="text-gray-500">로딩 중...</div>;
  }
  if (error) {
    return (
      <div className="text-red-600">
        오류: {error}. 관리자 비밀키를 확인하세요.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-main">뉴스 관리</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleBackup}
            disabled={backingUp}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            {backingUp ? "백업 중..." : "데이터 백업"}
          </button>
          <input
            ref={backupInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleBackupFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={openFileSelect}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            파일 선택
          </button>
          <Link
            href="/admin/news/new"
            className="px-4 py-2 bg-point text-white rounded hover:opacity-90"
          >
            새 뉴스 작성
          </Link>
        </div>
      </div>

      <p className="text-sm text-secondary mb-4">
        전체 {data?.total ?? 0}건 (페이지당 {PAGE_SIZE}건)
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                제목
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                날짜
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                작성자
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(data?.items ?? []).map((item) => (
              <tr key={item.slug}>
                <td className="px-4 py-3 text-sm text-main">
                {item.notice && (
                  <span className="inline-block px-1.5 py-0.5 text-xs font-medium bg-point/20 text-point rounded mr-2">
                    공지
                  </span>
                )}
                {item.title}
              </td>
                <td className="px-4 py-3 text-sm text-secondary">{item.date}</td>
                <td className="px-4 py-3 text-sm text-secondary">
                  {item.author}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/news/${encodeURIComponent(item.slug)}/edit`}
                    className="text-point hover:underline mr-3"
                  >
                    수정
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.slug)}
                    disabled={deleting === item.slug}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deleting === item.slug ? "삭제 중..." : "삭제"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-3">
            {page} / {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            다음
          </button>
        </div>
      )}

      {selectedBackupFile && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-secondary mb-2">
            선택된 파일: <span className="font-medium text-main">{selectedBackupFile.name}</span>
          </p>
          <button
            type="button"
            onClick={handleRestore}
            disabled={restoring}
            className="px-4 py-2 bg-point text-white rounded hover:opacity-90 disabled:opacity-50"
          >
            {restoring ? "업로드 중..." : "백업 업로드"}
          </button>
        </div>
      )}
    </div>
  );
}
