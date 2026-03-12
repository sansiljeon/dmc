"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import Link from "next/link";
import { adminFetch, adminUpload } from "@/lib/admin-api";

export default function AdminPortfolioNewPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    category: "domestic" as "domestic" | "overseas",
    address: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("이미지를 선택해 주세요.");
      return;
    }
    setSaving(true);
    try {
      setUploading(true);
      const { url } = await adminUpload(imageFile);
      setUploading(false);
      const r = await adminFetch("/api/admin/portfolio", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: "",
          image: url,
          category: form.category,
          address: form.category === "domestic" ? form.address : undefined,
        }),
      });
      if (!r.ok) {
        const body = await r.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || r.statusText);
      }
      router.push("/admin/portfolio");
    } catch (err) {
      alert((err as Error).message);
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/portfolio" className="text-secondary hover:text-main">
          ← 목록
        </Link>
        <h1 className="text-2xl font-bold text-main">새 포트폴리오 추가</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4 max-w-2xl"
      >
        <div>
          <label className="block text-sm font-medium text-main mb-1">
            제목 *
          </label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-main mb-1">
            이미지 *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            required
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          {imageFile && (
            <p className="text-xs text-secondary mt-1">
              선택: {imageFile.name} (저장 시 업로드됩니다)
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-main mb-1">
            구분 *
          </label>
          <select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                category: e.target.value as "domestic" | "overseas",
              }))
            }
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="domestic">국내</option>
            <option value="overseas">해외</option>
          </select>
        </div>
        {form.category === "domestic" && (
          <div>
            <label className="block text-sm font-medium text-main mb-1">
              주소 (국내)
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              placeholder="예: 서울 강남구, 경기 성남시"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <p className="text-xs text-secondary mt-1">
              서울·광역시·특별시: 시+구·군·동 / 그 외: 도+시·군
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-4 py-2 bg-point text-white rounded hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "이미지 업로드 중..." : saving ? "저장 중..." : "저장"}
          </button>
          <Link
            href="/admin/portfolio"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
