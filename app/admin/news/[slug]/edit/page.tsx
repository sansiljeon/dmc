"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { adminGet, adminPut, adminUpload } from "@/lib/admin-api";

type AttachmentItem = { url: string; name: string };

export default function AdminNewsEditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    author: "",
    image: "",
    notice: false,
    content: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [attaching, setAttaching] = useState(false);

  useEffect(() => {
    adminGet(`/api/admin/news/${encodeURIComponent(slug)}`)
      .then((data: { title: string; date: string; author: string; image: string; notice?: boolean; content: string; attachments?: AttachmentItem[] }) => {
        setForm({
          title: data.title,
          date: data.date,
          author: data.author,
          image: data.image ?? "",
          notice: !!data.notice,
          content: data.content,
        });
        setAttachments(Array.isArray(data.attachments) ? data.attachments : []);
      })
      .catch(() => setForm((f) => f))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAttachChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setAttaching(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { url } = await adminUpload(file);
        setAttachments((prev) => [...prev, { url, name: file.name }]);
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setAttaching(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = form.image;
      if (imageFile) {
        setUploading(true);
        const { url } = await adminUpload(imageFile);
        imageUrl = url;
        setUploading(false);
      }
      await adminPut(`/api/admin/news/${encodeURIComponent(slug)}`, {
        ...form,
        summary: "",
        image: imageUrl,
        notice: form.notice,
        attachments,
      });
      router.push("/admin/news");
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
        <Link href="/admin/news" className="text-secondary hover:text-main">
          ← 목록
        </Link>
        <h1 className="text-2xl font-bold text-main">뉴스 수정</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4 max-w-3xl"
      >
        <div>
          <label className="block text-sm font-medium text-main mb-1">
            slug (수정 불가)
          </label>
          <input
            type="text"
            value={slug}
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-main mb-1">
              날짜 *
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-main mb-1">
              작성자
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) =>
                setForm((f) => ({ ...f, author: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="notice"
            checked={form.notice}
            onChange={(e) =>
              setForm((f) => ({ ...f, notice: e.target.checked }))
            }
            className="rounded border-gray-300"
          />
          <label htmlFor="notice" className="text-sm font-medium text-main">
            공지로 설정
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-main mb-1">
            이미지
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setImageFile(f ?? null);
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          {form.image && !imageFile && (
            <p className="text-xs text-secondary mt-1">
              현재 이미지: {form.image}
            </p>
          )}
          {imageFile && (
            <p className="text-xs text-secondary mt-1">
              새로 선택: {imageFile.name} (저장 시 업로드됩니다)
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-main mb-1">
            첨부파일
          </label>
          <input
            ref={attachInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.hwp,.zip,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,text/plain"
            onChange={handleAttachChange}
            disabled={attaching}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          {attaching && <p className="text-xs text-secondary mt-1">업로드 중...</p>}
          {attachments.length > 0 && (
            <ul className="mt-2 space-y-1">
              {attachments.map((a, i) => (
                <li key={`${a.url}-${i}`} className="flex items-center gap-2 text-sm">
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-point hover:underline truncate flex-1">
                    {a.name}
                  </a>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                    className="text-red-600 hover:underline shrink-0"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-main mb-1">
            본문 (마크다운) *
          </label>
          <textarea
            required
            value={form.content}
            onChange={(e) =>
              setForm((f) => ({ ...f, content: e.target.value }))
            }
            rows={12}
            className="w-full border border-gray-300 rounded px-3 py-2 font-mono text-sm"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading || attaching}
            className="px-4 py-2 bg-point text-white rounded hover:opacity-90 disabled:opacity-50"
          >
            {uploading || attaching ? "업로드 중..." : saving ? "저장 중..." : "저장"}
          </button>
          <Link
            href="/admin/news"
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
