"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { adminGet, adminPut, adminUpload } from "@/lib/admin-api";

const MAX_IMAGES = 10;

type ImageItem = string | File;

export default function AdminPortfolioEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "domestic" as "domestic" | "overseas",
    address: "",
  });
  const [images, setImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    adminGet(`/api/admin/portfolio/${encodeURIComponent(id)}`)
      .then(
        (data: {
          title: string;
          image: string;
          images?: string[];
          category: "domestic" | "overseas";
          address?: string;
        }) => {
          setForm({
            title: data.title,
            category: data.category,
            address: data.address ?? "",
          });
          const imgs = data.images?.length
            ? data.images
            : data.image
              ? [data.image]
              : [];
          setImages(imgs);
        }
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(
      (f) => f.type.startsWith("image/")
    );
    setImages((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, MAX_IMAGES);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("이미지를 1장 이상 유지해 주세요.");
      return;
    }
    setSaving(true);
    try {
      setUploading(true);
      const urls: string[] = [];
      for (const item of images) {
        if (typeof item === "string") {
          urls.push(item);
        } else {
          const { url } = await adminUpload(item);
          urls.push(url);
        }
      }
      setUploading(false);
      const [image, ...rest] = urls;
      await adminPut(`/api/admin/portfolio/${encodeURIComponent(id)}`, {
        title: form.title,
        description: "",
        image,
        images: urls.length > 1 ? urls : undefined,
        category: form.category,
        address: form.address || undefined,
      });
      router.push("/admin/portfolio");
    } catch (err) {
      alert((err as Error).message);
      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">로딩 중...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/portfolio" className="text-secondary hover:text-main">
          ← 목록
        </Link>
        <h1 className="text-2xl font-bold text-main">포트폴리오 수정</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4 max-w-2xl"
      >
        <div>
          <label className="block text-sm font-medium text-main mb-1">
            ID (수정 불가)
          </label>
          <input
            type="text"
            value={id}
            readOnly
            className="w-full border border-gray-200 rounded px-3 py-2 bg-gray-50"
          />
        </div>
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
            이미지 * (최대 {MAX_IMAGES}장)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={(e) => addImages(e.target.files)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <p className="text-xs text-secondary mt-1">
            첫 번째 이미지가 대표 이미지(썸네일)로 사용됩니다.
          </p>
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((item, i) => (
                <div key={i} className="relative group">
                  <img
                    src={
                      typeof item === "string"
                        ? item
                        : URL.createObjectURL(item)
                    }
                    alt=""
                    className="w-20 h-20 object-cover rounded border border-gray-200"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">
                      대표
                    </span>
                  )}
                </div>
              ))}
            </div>
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
        <div>
          <label className="block text-sm font-medium text-main mb-1">
            {form.category === "domestic" ? "주소 (국내)" : "지역 (해외)"}
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
            placeholder={
              form.category === "domestic"
                ? "예: 서울 강남구, 경기 성남시"
                : "예: 몽골 울란바토르, 베트남 벤째"
            }
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {form.category === "domestic" && (
            <p className="text-xs text-secondary mt-1">
              서울·광역시·특별시: 시+구·군·동 / 그 외: 도+시·군
            </p>
          )}
        </div>
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
