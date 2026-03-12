import { sql } from "@vercel/postgres";

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  category: "domestic" | "overseas";
  /** 국내: 주소 표기. 서울·광역시·특별시는 시+구·군·동, 이외는 도+시·군 (예: 서울 강남구, 경기 성남시) */
  address?: string;
  createdAt: string;
  /** 표시 순서 (작을수록 먼저). 없으면 createdAt 기준 */
  order?: number;
}

let schemaReadyPromise: Promise<void> | null = null;

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

function rowToItem(row: any): PortfolioItem {
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    image: String(row.image ?? ""),
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
              select id, title, description, image, image_alt, category, address, created_at, "order"
              from portfolio_items
              where category = ${category} and title ilike ${ilike}
              order by "order" asc nulls last, created_at desc, id asc
              limit ${limit} offset ${offset};
            `
          : sql`
              select id, title, description, image, image_alt, category, address, created_at, "order"
              from portfolio_items
              where category = ${category} and title ilike ${ilike}
              order by "order" asc nulls last, created_at asc, id asc
              limit ${limit} offset ${offset};
            `;
      }
      if (category) {
        return newest
          ? sql`
              select id, title, description, image, image_alt, category, address, created_at, "order"
              from portfolio_items
              where category = ${category}
              order by "order" asc nulls last, created_at desc, id asc
              limit ${limit} offset ${offset};
            `
          : sql`
              select id, title, description, image, image_alt, category, address, created_at, "order"
              from portfolio_items
              where category = ${category}
              order by "order" asc nulls last, created_at asc, id asc
              limit ${limit} offset ${offset};
            `;
      }
      if (ilike) {
        return newest
          ? sql`
              select id, title, description, image, image_alt, category, address, created_at, "order"
              from portfolio_items
              where title ilike ${ilike}
              order by "order" asc nulls last, created_at desc, id asc
              limit ${limit} offset ${offset};
            `
          : sql`
              select id, title, description, image, image_alt, category, address, created_at, "order"
              from portfolio_items
              where title ilike ${ilike}
              order by "order" asc nulls last, created_at asc, id asc
              limit ${limit} offset ${offset};
            `;
      }
      return newest
        ? sql`
            select id, title, description, image, image_alt, category, address, created_at, "order"
            from portfolio_items
            order by "order" asc nulls last, created_at desc, id asc
            limit ${limit} offset ${offset};
          `
        : sql`
            select id, title, description, image, image_alt, category, address, created_at, "order"
            from portfolio_items
            order by "order" asc nulls last, created_at asc, id asc
            limit ${limit} offset ${offset};
          `;
    }

    if (category && ilike) {
      return newest
        ? sql`
            select id, title, description, image, image_alt, category, address, created_at, "order"
            from portfolio_items
            where category = ${category} and title ilike ${ilike}
            order by "order" asc nulls last, created_at desc, id asc;
          `
        : sql`
            select id, title, description, image, image_alt, category, address, created_at, "order"
            from portfolio_items
            where category = ${category} and title ilike ${ilike}
            order by "order" asc nulls last, created_at asc, id asc;
          `;
    }
    if (category) {
      return newest
        ? sql`
            select id, title, description, image, image_alt, category, address, created_at, "order"
            from portfolio_items
            where category = ${category}
            order by "order" asc nulls last, created_at desc, id asc;
          `
        : sql`
            select id, title, description, image, image_alt, category, address, created_at, "order"
            from portfolio_items
            where category = ${category}
            order by "order" asc nulls last, created_at asc, id asc;
          `;
    }
    if (ilike) {
      return newest
        ? sql`
            select id, title, description, image, image_alt, category, address, created_at, "order"
            from portfolio_items
            where title ilike ${ilike}
            order by "order" asc nulls last, created_at desc, id asc;
          `
        : sql`
            select id, title, description, image, image_alt, category, address, created_at, "order"
            from portfolio_items
            where title ilike ${ilike}
            order by "order" asc nulls last, created_at asc, id asc;
          `;
    }
    return newest
      ? sql`
          select id, title, description, image, image_alt, category, address, created_at, "order"
          from portfolio_items
          order by "order" asc nulls last, created_at desc, id asc;
        `
      : sql`
          select id, title, description, image, image_alt, category, address, created_at, "order"
          from portfolio_items
          order by "order" asc nulls last, created_at asc, id asc;
        `;
  })();

  const rows = await rowsRes;
  return { items: rows.rows.map(rowToItem), total };
}

export async function getPortfolioItem(id: string): Promise<PortfolioItem | null> {
  await ensurePortfolioSchema();
  const r = await sql`
    select id, title, description, image, image_alt, category, address, created_at, "order"
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
        await client.sql`
          insert into portfolio_items
            (id, title, description, image, image_alt, category, address, created_at, "order")
          values
            (
              ${item.id},
              ${item.title},
              ${item.description},
              ${item.image},
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
}

export async function createPortfolioItem(item: PortfolioItem): Promise<void> {
  await ensurePortfolioSchema();
  await sql`
    insert into portfolio_items
      (id, title, description, image, image_alt, category, address, created_at, "order")
    values
      (
        ${item.id},
        ${item.title},
        ${item.description},
        ${item.image},
        ${item.imageAlt ?? null},
        ${item.category},
        ${item.address ?? null},
        ${item.createdAt}::timestamptz,
        ${item.order ?? null}
      );
  `;
}

export async function updatePortfolioItem(
  id: string,
  patch: Partial<PortfolioItem>
): Promise<PortfolioItem | null> {
  await ensurePortfolioSchema();
  const existing = await getPortfolioItem(id);
  if (!existing) return null;
  const merged: PortfolioItem = { ...existing, ...patch, id };
  await sql`
    update portfolio_items
    set
      title = ${merged.title},
      description = ${merged.description},
      image = ${merged.image},
      image_alt = ${merged.imageAlt ?? null},
      category = ${merged.category},
      address = ${merged.address ?? null},
      created_at = ${merged.createdAt}::timestamptz,
      "order" = ${merged.order ?? null}
    where id = ${id};
  `;
  return merged;
}

export async function deletePortfolioItem(id: string): Promise<boolean> {
  await ensurePortfolioSchema();
  const r = await sql`delete from portfolio_items where id = ${id};`;
  return (r as any).rowCount ? (r as any).rowCount > 0 : true;
}
