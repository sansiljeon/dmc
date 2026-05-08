import { sql } from "@vercel/postgres";

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  /** 추가 이미지 (최대 10장). image는 대표 이미지(썸네일) */
  images?: string[];
  imageAlt?: string;
  category: "domestic" | "overseas";
  /** 국내: 주소 (예: 서울 강남구). 해외: 지역 (예: 몽골 울란바토르) */
  address?: string;
  createdAt: string;
  /** 표시 순서 (작을수록 먼저). 없으면 createdAt 기준 */
  order?: number;
}

let schemaReadyPromise: Promise<void> | null = null;

/**
 * Portfolio 목록 조회 결과의 메모리 캐시.
 * - 동일 Lambda 인스턴스 내에서 짧은 시간(TTL) 동안 read 결과를 재사용해
 *   public 페이지 트래픽에서 발생하는 DB 쿼리를 최소화합니다.
 * - mutation(create/update/delete/reorder/write)이 발생하면 즉시 무효화하여
 *   stale 데이터가 노출되지 않도록 합니다.
 * - 캐시는 "읽기 결과의 사본"만 들고 있으며, DB의 실제 데이터에는
 *   어떤 영향도 주지 않습니다(쓰기는 항상 DB로 직접 진행).
 */
const PORTFOLIO_LIST_TTL_MS = 5_000;
type ListResult = { items: PortfolioItem[]; total: number };
const listCache = new Map<string, { value: ListResult; expiresAt: number }>();

function makeListCacheKey(options?: {
  page?: number;
  limit?: number;
  category?: "domestic" | "overseas";
  orderBy?: "newest" | "oldest";
  search?: string;
}): string {
  const o = options ?? {};
  return JSON.stringify({
    page: o.page ?? null,
    limit: o.limit ?? null,
    category: o.category ?? null,
    orderBy: o.orderBy ?? "newest",
    search: o.search?.trim() ? o.search.trim() : null,
  });
}

function getCachedList(key: string): ListResult | null {
  const entry = listCache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    listCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCachedList(key: string, value: ListResult): void {
  listCache.set(key, {
    value,
    expiresAt: Date.now() + PORTFOLIO_LIST_TTL_MS,
  });
}

/** 모든 portfolio 관련 메모리 캐시 무효화 (mutation 후 호출) */
export function invalidatePortfolioCache(): void {
  listCache.clear();
}

async function ensurePortfolioSchema(): Promise<void> {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await sql`
        create table if not exists portfolio_items (
          id text primary key,
          title text not null,
          description text not null,
          image text not null,
          image_alt text,
          category text not null check (category in ('domestic','overseas')),
          address text,
          created_at timestamptz not null,
          "order" integer
        );
      `;
      await sql`
        create index if not exists portfolio_items_category_order_idx
          on portfolio_items (category, "order" nulls last, created_at desc);
      `;
      await sql`ALTER TABLE portfolio_items ADD COLUMN IF NOT EXISTS images text`;
    })();
  }
  await schemaReadyPromise;
}

async function withPgClient<T>(fn: (client: any) => Promise<T>): Promise<T> {
  const connect = (sql as any).connect as undefined | (() => Promise<any>);
  if (!connect) {
    // Fallback: no explicit client API available; run function with sql proxy.
    return await fn(sql as any);
  }
  const client = await connect();
  try {
    return await fn(client);
  } finally {
    try {
      client.release?.();
    } catch {
      // ignore
    }
  }
}

function parseImages(val: unknown): string[] | undefined {
  if (Array.isArray(val)) return val.filter((x) => typeof x === "string");
  if (typeof val === "string") {
    try {
      const arr = JSON.parse(val) as unknown;
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function rowToItem(row: any): PortfolioItem {
  const image = String(row.image ?? "");
  const imagesRaw = parseImages(row.images);
  const images = imagesRaw && imagesRaw.length > 0 ? imagesRaw : undefined;
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    image,
    images,
    imageAlt: row.image_alt ?? undefined,
    category: row.category as "domestic" | "overseas",
    address: row.address ?? undefined,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? new Date().toISOString()),
    order: row.order ?? undefined,
  };
}

export async function getPortfolioItems(options?: {
  page?: number;
  limit?: number;
  category?: "domestic" | "overseas";
  orderBy?: "newest" | "oldest";
  search?: string;
}): Promise<{ items: PortfolioItem[]; total: number }> {
  await ensurePortfolioSchema();

  const cacheKey = makeListCacheKey(options);
  const cached = getCachedList(cacheKey);
  if (cached) return cached;

  const page = options?.page;
  const limit = options?.limit;
  const category = options?.category;
  const search = options?.search?.trim() ? options.search.trim() : null;
  const orderBy = options?.orderBy ?? "newest";
  const offset = page != null && limit != null ? (page - 1) * limit : null;

  const ilike = search ? `%${search}%` : null;
  const newest = orderBy === "newest";

  const countRes = category && ilike
    ? await sql`select count(*)::int as count from portfolio_items where category = ${category} and title ilike ${ilike};`
    : category
      ? await sql`select count(*)::int as count from portfolio_items where category = ${category};`
      : ilike
        ? await sql`select count(*)::int as count from portfolio_items where title ilike ${ilike};`
        : await sql`select count(*)::int as count from portfolio_items;`;

  const total = countRes.rows[0]?.count ?? 0;

  // list rows (with optional pagination)
  const rowsRes = (() => {
    if (offset != null && limit != null) {
      if (category && ilike) {
        return newest
          ? sql`
              select id, title, description, image, images, image_alt, category, address, created_at, "order"
              from portfolio_items
              where category = ${category} and title ilike ${ilike}
              order by "order" asc nulls last, created_at desc, id asc
              limit ${limit} offset ${offset};
            `
          : sql`
              select id, title, description, image, images, image_alt, category, address, created_at, "order"
              from portfolio_items
              where category = ${category} and title ilike ${ilike}
              order by "order" asc nulls last, created_at asc, id asc
              limit ${limit} offset ${offset};
            `;
      }
      if (category) {
        return newest
          ? sql`
              select id, title, description, image, images, image_alt, category, address, created_at, "order"
              from portfolio_items
              where category = ${category}
              order by "order" asc nulls last, created_at desc, id asc
              limit ${limit} offset ${offset};
            `
          : sql`
              select id, title, description, image, images, image_alt, category, address, created_at, "order"
              from portfolio_items
              where category = ${category}
              order by "order" asc nulls last, created_at asc, id asc
              limit ${limit} offset ${offset};
            `;
      }
      if (ilike) {
        return newest
          ? sql`
              select id, title, description, image, images, image_alt, category, address, created_at, "order"
              from portfolio_items
              where title ilike ${ilike}
              order by "order" asc nulls last, created_at desc, id asc
              limit ${limit} offset ${offset};
            `
          : sql`
              select id, title, description, image, images, image_alt, category, address, created_at, "order"
              from portfolio_items
              where title ilike ${ilike}
              order by "order" asc nulls last, created_at asc, id asc
              limit ${limit} offset ${offset};
            `;
      }
      return newest
        ? sql`
            select id, title, description, image, images, image_alt, category, address, created_at, "order"
            from portfolio_items
            order by "order" asc nulls last, created_at desc, id asc
            limit ${limit} offset ${offset};
          `
        : sql`
            select id, title, description, image, images, image_alt, category, address, created_at, "order"
            from portfolio_items
            order by "order" asc nulls last, created_at asc, id asc
            limit ${limit} offset ${offset};
          `;
    }

    if (category && ilike) {
      return newest
        ? sql`
            select id, title, description, image, images, image_alt, category, address, created_at, "order"
            from portfolio_items
            where category = ${category} and title ilike ${ilike}
            order by "order" asc nulls last, created_at desc, id asc;
          `
        : sql`
            select id, title, description, image, images, image_alt, category, address, created_at, "order"
            from portfolio_items
            where category = ${category} and title ilike ${ilike}
            order by "order" asc nulls last, created_at asc, id asc;
          `;
    }
    if (category) {
      return newest
        ? sql`
            select id, title, description, image, images, image_alt, category, address, created_at, "order"
            from portfolio_items
            where category = ${category}
            order by "order" asc nulls last, created_at desc, id asc;
          `
        : sql`
            select id, title, description, image, images, image_alt, category, address, created_at, "order"
            from portfolio_items
            where category = ${category}
            order by "order" asc nulls last, created_at asc, id asc;
          `;
    }
    if (ilike) {
      return newest
        ? sql`
            select id, title, description, image, images, image_alt, category, address, created_at, "order"
            from portfolio_items
            where title ilike ${ilike}
            order by "order" asc nulls last, created_at desc, id asc;
          `
        : sql`
            select id, title, description, image, images, image_alt, category, address, created_at, "order"
            from portfolio_items
            where title ilike ${ilike}
            order by "order" asc nulls last, created_at asc, id asc;
          `;
    }
    return newest
      ? sql`
          select id, title, description, image, images, image_alt, category, address, created_at, "order"
          from portfolio_items
          order by "order" asc nulls last, created_at desc, id asc;
        `
      : sql`
          select id, title, description, image, images, image_alt, category, address, created_at, "order"
          from portfolio_items
          order by "order" asc nulls last, created_at asc, id asc;
        `;
  })();

  const rows = await rowsRes;
  const result: ListResult = { items: rows.rows.map(rowToItem), total };
  setCachedList(cacheKey, result);
  return result;
}

/**
 * 작은 통계 조회: 전체 항목 수와 최소 order 값을 반환합니다.
 * - "새 글 추가 시 minOrder 계산" 같은 용도에서 전체 SELECT 없이 사용 가능.
 * - 데이터에는 영향 없음(read-only aggregate).
 */
export async function getPortfolioStats(): Promise<{
  total: number;
  minOrder: number | null;
}> {
  await ensurePortfolioSchema();
  const r = await sql`
    select count(*)::int as total, min("order")::int as min_order
    from portfolio_items;
  `;
  const row = r.rows[0] ?? {};
  const total = typeof row.total === "number" ? row.total : 0;
  const minOrder =
    row.min_order === null || row.min_order === undefined
      ? null
      : typeof row.min_order === "number"
        ? row.min_order
        : Number(row.min_order);
  return { total, minOrder: Number.isFinite(minOrder as number) ? (minOrder as number) : null };
}

export async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
  await ensurePortfolioSchema();
  const r = await sql`
    select id, title, description, image, images, image_alt, category, address, created_at, "order"
    from portfolio_items
    where id = ${id}
    limit 1;
  `;
  const row = r.rows[0];
  return row ? rowToItem(row) : null;
}

export async function writePortfolioItems(items: PortfolioItem[]): Promise<void> {
  await ensurePortfolioSchema();
  await withPgClient(async (client) => {
    await client.sql`begin;`;
    try {
      await client.sql`delete from portfolio_items;`;
      for (const item of items) {
        const imagesJson = item.images?.length ? JSON.stringify(item.images) : null;
        await client.sql`
          insert into portfolio_items
            (id, title, description, image, images, image_alt, category, address, created_at, "order")
          values
            (
              ${item.id},
              ${item.title},
              ${item.description},
              ${item.image},
              ${imagesJson},
              ${item.imageAlt ?? null},
              ${item.category},
              ${item.address ?? null},
              ${item.createdAt}::timestamptz,
              ${item.order ?? null}
            );
        `;
      }
      await client.sql`commit;`;
    } catch (e) {
      await client.sql`rollback;`;
      throw e;
    }
  });
  invalidatePortfolioCache();
}

/** 해당 카테고리 내 표시 순서를 orderedIds 순서로 저장 */
export async function reorderPortfolioItems(
  category: "domestic" | "overseas",
  orderedIds: string[]
): Promise<void> {
  await ensurePortfolioSchema();
  await withPgClient(async (client) => {
    await client.sql`begin;`;
    try {
      // reset all to bottom, then assign explicit order to provided ids
      await client.sql`
        update portfolio_items
        set "order" = 999999
        where category = ${category};
      `;
      for (let i = 0; i < orderedIds.length; i += 1) {
        const id = orderedIds[i];
        await client.sql`
          update portfolio_items
          set "order" = ${i}
          where id = ${id} and category = ${category};
        `;
      }
      await client.sql`commit;`;
    } catch (e) {
      await client.sql`rollback;`;
      throw e;
    }
  });
  invalidatePortfolioCache();
}

export async function createPortfolioItem(item: PortfolioItem): Promise<void> {
  await ensurePortfolioSchema();
  const imagesJson = item.images?.length ? JSON.stringify(item.images) : null;
  await sql`
    insert into portfolio_items
      (id, title, description, image, images, image_alt, category, address, created_at, "order")
    values
      (
        ${item.id},
        ${item.title},
        ${item.description},
        ${item.image},
        ${imagesJson},
        ${item.imageAlt ?? null},
        ${item.category},
        ${item.address ?? null},
        ${item.createdAt}::timestamptz,
        ${item.order ?? null}
      );
  `;
  invalidatePortfolioCache();
}

export async function updatePortfolioItem(
  id: string,
  patch: Partial<PortfolioItem>
): Promise<PortfolioItem | null> {
  await ensurePortfolioSchema();
  const existing = await getPortfolioItem(id);
  if (!existing) return null;
  const merged: PortfolioItem = { ...existing, ...patch, id };
  const imagesToSave = merged.images !== undefined ? merged.images : existing.images;
  const imagesJson = imagesToSave?.length ? JSON.stringify(imagesToSave) : null;
  await sql`
    update portfolio_items
    set
      title = ${merged.title},
      description = ${merged.description},
      image = ${merged.image},
      images = ${imagesJson},
      image_alt = ${merged.imageAlt ?? null},
      category = ${merged.category},
      address = ${merged.address ?? null},
      created_at = ${merged.createdAt}::timestamptz,
      "order" = ${merged.order ?? null}
    where id = ${id};
  `;
  invalidatePortfolioCache();
  return merged;
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  await ensurePortfolioSchema();
  const r = await sql`delete from portfolio_items where id = ${id};`;
  invalidatePortfolioCache();
  return (r as any).rowCount ? (r as any).rowCount > 0 : true;
}
