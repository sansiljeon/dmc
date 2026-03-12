import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "uploads");

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/plain",
  "application/hwp",
  "application/x-hwp",
];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...FILE_TYPES];

const DEFAULT_EXT: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/zip": ".zip",
  "text/plain": ".txt",
  "application/hwp": ".hwp",
  "application/x-hwp": ".hwp",
};

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);
  } catch (e) {
    return e as Response;
  }
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return Response.json(
      { error: "파일이 없습니다." },
      { status: 400 }
    );
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json(
      { error: "지원하지 않는 파일 형식입니다. (이미지: jpg, png, gif, webp / 문서: pdf, doc, docx, xls, xlsx, hwp, zip, txt)" },
      { status: 400 }
    );
  }
  const ext = path.extname(file.name) || DEFAULT_EXT[file.type] || ".bin";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  const filePath = path.join(UPLOAD_DIR, name);
  const bytes = await file.arrayBuffer();
  fs.writeFileSync(filePath, Buffer.from(bytes));
  const url = `/images/uploads/${name}`;
  return Response.json({ url });
}
