import { createServerFn } from "@tanstack/react-start";
import type { Service } from "@/db/schema";

export interface ServiceInput {
  id?: number;
  slug: string;
  title: string;
  description: string;
  points: string[];
  badge?: string | null;
  image: string;
  orderIndex: number;
}

async function verifyAdminAuth() {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { jwtVerify } = await import("jose");
  const { AUTH_COOKIE_NAME } = await import("./auth");

  const token = getCookie(AUTH_COOKIE_NAME);
  if (!token) {
    throw new Error("Unauthorized: Silakan login terlebih dahulu.");
  }

  try {
    const jwtSecret = process.env["JWT_SECRET"] || "default_super_secret_jwt_key_hs_2026";
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    const adminId = payload["adminId"];
    const email = payload["email"];

    if (!adminId || !email) {
      throw new Error("Unauthorized: Sesi tidak valid.");
    }

    return {
      adminId: Number(adminId),
      email: String(email),
    };
  } catch {
    throw new Error("Unauthorized: Sesi kedaluwarsa atau tidak valid.");
  }
}

export const getServicesFn = createServerFn({ method: "GET" }).handler(async () => {
  const { db } = await import("@/db");
  const { services } = await import("@/db/schema");
  const { asc } = await import("drizzle-orm");

  let list = await db
    .select()
    .from(services)
    .orderBy(asc(services.orderIndex), asc(services.id))
    .all();

  // Auto-seed if empty
  if (list.length === 0) {
    const { services: defaultServices } = await import("@/data/clinic");
    if (Array.isArray(defaultServices) && defaultServices.length > 0) {
      const now = new Date().toISOString();
      for (let i = 0; i < defaultServices.length; i++) {
        const s = defaultServices[i];
        if (!s) continue;
        await db.insert(services).values({
          slug: s.slug,
          title: s.title,
          description: s.description,
          points: s.points,
          badge: s.badge || null,
          image: s.image,
          orderIndex: i + 1,
          createdAt: now,
          updatedAt: now,
        });
      }
      list = await db
        .select()
        .from(services)
        .orderBy(asc(services.orderIndex), asc(services.id))
        .all();
    }
  }

  return { success: true as const, data: list };
});

export const getPublicServicesFn = getServicesFn;

export const createServiceFn = createServerFn({ method: "POST" })
  .validator((data: ServiceInput) => {
    if (!data.title?.trim()) throw new Error("Judul layanan wajib diisi.");
    if (!data.slug?.trim()) throw new Error("Slug layanan wajib diisi.");
    if (!data.description?.trim()) throw new Error("Deskripsi layanan wajib diisi.");
    if (!data.image?.trim()) throw new Error("Identifier / URL gambar wajib diisi.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { services } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const cleanSlug = data.slug.trim().toLowerCase();

    // Check slug uniqueness
    const existing = await db.select().from(services).where(eq(services.slug, cleanSlug)).get();

    if (existing) {
      return {
        success: false as const,
        error: `Slug "${cleanSlug}" sudah digunakan. Silakan gunakan slug lain.`,
      };
    }

    const points = Array.isArray(data.points)
      ? data.points.map((p) => p.trim()).filter(Boolean)
      : [];

    const now = new Date().toISOString();

    const inserted = await db
      .insert(services)
      .values({
        slug: cleanSlug,
        title: data.title.trim(),
        description: data.description.trim(),
        points,
        badge: data.badge?.trim() || null,
        image: data.image.trim(),
        orderIndex: Number(data.orderIndex) || 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    return { success: true as const, data: inserted };
  });

export const updateServiceFn = createServerFn({ method: "POST" })
  .validator((data: ServiceInput & { id: number }) => {
    if (!data.id) throw new Error("ID layanan tidak valid.");
    if (!data.title?.trim()) throw new Error("Judul layanan wajib diisi.");
    if (!data.slug?.trim()) throw new Error("Slug layanan wajib diisi.");
    if (!data.description?.trim()) throw new Error("Deskripsi layanan wajib diisi.");
    if (!data.image?.trim()) throw new Error("Identifier / URL gambar wajib diisi.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { services } = await import("@/db/schema");
    const { eq, and, ne } = await import("drizzle-orm");

    const cleanSlug = data.slug.trim().toLowerCase();

    // Check slug uniqueness for other services
    const duplicate = await db
      .select()
      .from(services)
      .where(and(eq(services.slug, cleanSlug), ne(services.id, data.id)))
      .get();

    if (duplicate) {
      return {
        success: false as const,
        error: `Slug "${cleanSlug}" sudah digunakan oleh layanan lain.`,
      };
    }

    const points = Array.isArray(data.points)
      ? data.points.map((p) => p.trim()).filter(Boolean)
      : [];

    const now = new Date().toISOString();

    await db
      .update(services)
      .set({
        slug: cleanSlug,
        title: data.title.trim(),
        description: data.description.trim(),
        points,
        badge: data.badge?.trim() || null,
        image: data.image.trim(),
        orderIndex: Number(data.orderIndex) || 0,
        updatedAt: now,
      })
      .where(eq(services.id, data.id));

    return { success: true as const };
  });

export const deleteServiceFn = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => {
    if (!data.id) throw new Error("ID layanan tidak valid.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { services } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db.delete(services).where(eq(services.id, data.id));

    return { success: true as const };
  });
