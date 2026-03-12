const ADMIN_KEY = "dmc_admin_secret";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const secret = sessionStorage.getItem(ADMIN_KEY);
    if (secret) (headers as Record<string, string>)["x-admin-secret"] = secret;
  }
  return headers;
}

const base = "";

export async function adminFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  let headers: HeadersInit = { ...getHeaders(), ...options?.headers };
  if (options?.body instanceof FormData) {
    headers = { ...headers };
    delete (headers as Record<string, string>)["Content-Type"];
  }
  return fetch(`${base}${url}`, {
    ...options,
    headers,
  });
}

/** 이미지 파일 업로드. 반환: { url: string } */
export async function adminUpload(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const r = await adminFetch("/api/admin/upload", {
    method: "POST",
    body: form,
  });
  if (!r.ok) {
    const body = await r.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || r.statusText);
  }
  return r.json();
}

export function adminGet(url: string) {
  return adminFetch(url).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });
}

export function adminPost(url: string, body: unknown) {
  return adminFetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  }).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });
}

export function adminPut(url: string, body: unknown) {
  return adminFetch(url, {
    method: "PUT",
    body: JSON.stringify(body),
  }).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });
}

export function adminDelete(url: string) {
  return adminFetch(url, { method: "DELETE" }).then((r) => {
    if (!r.ok) throw new Error(r.statusText);
    return r.json();
  });
}
