const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function isAdminAuthorized(request: Request): boolean {
  if (!ADMIN_SECRET) return true; // dev: no secret set
  const key = request.headers.get("x-admin-secret");
  return key === ADMIN_SECRET;
}

export function requireAdmin(request: Request): void {
  if (!isAdminAuthorized(request)) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
