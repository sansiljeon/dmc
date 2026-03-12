"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { adminGet, adminDelete, adminFetch, adminPost } from "@/lib/admin-api";

const PAGE_SIZE = 50;
const MAX_ITEMS = 5000;

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  category: "domestic" | "overseas";
  createdAt: string;
}

type CategoryFilter = "" | "domestic" | "overseas";

export default function AdminPortfolioPage() {
  const [data, setData] = useState<{
    items: PortfolioItem[];
    total: number;
    page: number;
    totalPages: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<File | null>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const r = await adminFetch("/api/admin/portfolio/backup");
      if (!r.ok) throw new Error(r.statusText);
      const blob = await r.blob();
      const filename =
        r.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/)?.[1] ??
        `portfolio-items-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
    if (!confirm("백업 데이터를 업로드하면 현재 포트폴리오 데이터가 모두 교체됩니다. 계속할까요?")) return;
    setRestoring(true);
    try {
      const form = new FormData();
      form.append("file", selectedBackupFile);
      const r = await adminFetch("/api/admin/portfolio/backup", { method: "POST", body: form });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || r.statusText);
      }
      const result = (await r.json()) as { count?: number };
      alert(`복원 완료: ${result.count ?? 0}건`);
      setSelectedBackupFile(null);
      backupInputRef.current && (backupInputRef.current.value = "");
      setData(null);
      setLoading(true);
      const isFiltered = categoryFilter !== "";
      const params = new URLSearchParams();
      params.set("page", isFiltered ? "1" : String(page));
      params.set("limit", isFiltered ? String(MAX_ITEMS) : String(PAGE_SIZE));
      if (categoryFilter) params.set("category", categoryFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      adminGet(`/api/admin/portfolio?${params.toString()}`)
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
    const isFiltered = categoryFilter !== "";
    const params = new URLSearchParams();
    params.set("page", isFiltered ? "1" : String(page));
    params.set("limit", isFiltered ? String(MAX_ITEMS) : String(PAGE_SIZE));
    if (categoryFilter) params.set("category", categoryFilter);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    adminGet(`/api/admin/portfolio?${params.toString()}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, categoryFilter, searchQuery]);

  const applySearch = () => {
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleMoveOrder = async (newItems: PortfolioItem[]) => {
    if (!categoryFilter) return;
    const orderedIds = newItems.map((i) => i.id);
    setReordering(orderedIds[0]);
    try {
      await adminPost("/api/admin/portfolio/reorder", {
        category: categoryFilter,
        orderedIds,
      });
      setData((prev) => (prev ? { ...prev, items: newItems } : null));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setReordering(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragFromIndex(index);
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(null);
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (fromIndex === toIndex || !data?.items.length) {
      setDragFromIndex(null);
      return;
    }
    const newItems = [...data.items];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    setDragFromIndex(null);
    handleMoveOrder(newItems);
  };

  const handleDragEnd = () => {
    setDragFromIndex(null);
    setDropTargetIndex(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 포트폴리오 항목을 삭제하시겠습니까?")) return;
    setDeleting(id);
    try {
      await adminDelete(`/api/admin/portfolio/${encodeURIComponent(id)}`);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((i) => i.id !== id),
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
        <h1 className="text-2xl font-bold text-main">포트폴리오 관리</h1>
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
            href="/admin/portfolio/new"
            className={`px-4 py-2 rounded ${
              (data?.total ?? 0) >= MAX_ITEMS
                ? "bg-gray-300 text-gray-500 cursor-not-allowed pointer-events-none"
                : "bg-point text-white hover:opacity-90"
            }`}
          >
            새 항목 추가
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary">구분:</span>
          <button
            type="button"
            onClick={() => setCategoryFilter("")}
            className={`px-3 py-1.5 rounded text-sm ${categoryFilter === "" ? "bg-point text-white" : "bg-gray-100 text-main hover:bg-gray-200"}`}
          >
            전체
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("domestic")}
            className={`px-3 py-1.5 rounded text-sm ${categoryFilter === "domestic" ? "bg-point text-white" : "bg-gray-100 text-main hover:bg-gray-200"}`}
          >
            국내
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("overseas")}
            className={`px-3 py-1.5 rounded text-sm ${categoryFilter === "overseas" ? "bg-point text-white" : "bg-gray-100 text-main hover:bg-gray-200"}`}
          >
            해외
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="제목 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-40"
          />
          <button
            type="button"
            onClick={applySearch}
            className="px-3 py-1.5 rounded text-sm bg-gray-100 text-main hover:bg-gray-200"
          >
            검색
          </button>
        </div>
      </div>

      <p className="text-sm text-secondary mb-4">
        {categoryFilter === ""
          ? `전체 ${data?.total ?? 0}건 / 최대 ${MAX_ITEMS}건 (페이지당 ${PAGE_SIZE}건)`
          : `${categoryFilter === "domestic" ? "국내" : "해외"} ${data?.total ?? 0}건 (드래그로 순서 변경)`}
        {searchQuery.trim() && (
          <span className="ml-2 text-point">· 제목 검색: &quot;{searchQuery.trim()}&quot;</span>
        )}
      </p>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {categoryFilter !== "" && (
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-12">
                  순서
                </th>
              )}
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                제목
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                구분
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                등록일
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(data?.items ?? []).map((item, index) => (
              <tr
                key={item.id}
                onDragOver={(e) => categoryFilter !== "" && handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => categoryFilter !== "" && handleDrop(e, index)}
                className={`${dragFromIndex === index ? "opacity-50" : ""} ${dropTargetIndex === index ? "bg-point/10 border-y-2 border-point" : ""}`}
              >
                {categoryFilter !== "" && (
                  <td
                    className="px-4 py-3 text-sm text-gray-400 cursor-grab active:cursor-grabbing"
                    draggable={reordering === null}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    title="드래그하여 순서 변경"
                  >
                    ⋮⋮
                  </td>
                )}
                <td className="px-4 py-3 text-sm text-main">{item.title}</td>
                <td className="px-4 py-3 text-sm text-secondary">
                  {item.category === "domestic" ? "국내" : "해외"}
                </td>
                <td className="px-4 py-3 text-sm text-secondary">
                  {item.createdAt.slice(0, 10)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/portfolio/${encodeURIComponent(item.id)}/edit`}
                    className="text-point hover:underline mr-3"
                  >
                    수정
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deleting === item.id ? "삭제 중..." : "삭제"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categoryFilter === "" && data && data.totalPages > 1 && (
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
