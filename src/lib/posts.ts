import { createServerFn } from "@tanstack/react-start";
import type { Post } from "@/db/schema";

export interface PostInput {
  id?: number;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
  coverImage?: string | null;
  status: "draft" | "published";
  publishedAt?: string | null;
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

export const getPostsFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();

  const { db } = await import("@/db");
  const { posts } = await import("@/db/schema");
  const { desc } = await import("drizzle-orm");

  const list = await db.select().from(posts).orderBy(desc(posts.createdAt)).all();

  return { success: true as const, data: list };
});

export const createPostFn = createServerFn({ method: "POST" })
  .validator((data: PostInput) => {
    if (!data.title?.trim()) throw new Error("Judul postingan wajib diisi.");
    if (!data.slug?.trim()) throw new Error("Slug postingan wajib diisi.");
    if (!data.category?.trim()) throw new Error("Kategori postingan wajib diisi.");
    if (!data.excerpt?.trim()) throw new Error("Ringkasan (excerpt) postingan wajib diisi.");
    if (!Array.isArray(data.body) || data.body.filter((p) => p.trim()).length === 0) {
      throw new Error("Konten postingan wajib diisi minimal 1 paragraf.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { posts } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const cleanSlug = data.slug.trim().toLowerCase();

    // Check slug uniqueness
    const existing = await db.select().from(posts).where(eq(posts.slug, cleanSlug)).get();

    if (existing) {
      return {
        success: false as const,
        error: `Slug "${cleanSlug}" sudah digunakan. Silakan gunakan slug lain.`,
      };
    }

    const cleanBody = data.body.map((p) => p.trim()).filter(Boolean);
    const now = new Date().toISOString();
    const publishedAt = data.status === "published" ? now : null;

    const inserted = await db
      .insert(posts)
      .values({
        slug: cleanSlug,
        title: data.title.trim(),
        category: data.category.trim(),
        excerpt: data.excerpt.trim(),
        body: cleanBody,
        coverImage: data.coverImage?.trim() || null,
        status: data.status,
        publishedAt,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    return { success: true as const, data: inserted };
  });

export const updatePostFn = createServerFn({ method: "POST" })
  .validator((data: PostInput & { id: number }) => {
    if (!data.id) throw new Error("ID postingan tidak valid.");
    if (!data.title?.trim()) throw new Error("Judul postingan wajib diisi.");
    if (!data.slug?.trim()) throw new Error("Slug postingan wajib diisi.");
    if (!data.category?.trim()) throw new Error("Kategori postingan wajib diisi.");
    if (!data.excerpt?.trim()) throw new Error("Ringkasan (excerpt) postingan wajib diisi.");
    if (!Array.isArray(data.body) || data.body.filter((p) => p.trim()).length === 0) {
      throw new Error("Konten postingan wajib diisi minimal 1 paragraf.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { posts } = await import("@/db/schema");
    const { eq, and, ne } = await import("drizzle-orm");

    const cleanSlug = data.slug.trim().toLowerCase();

    // Check slug uniqueness for other posts
    const duplicate = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, cleanSlug), ne(posts.id, data.id)))
      .get();

    if (duplicate) {
      return {
        success: false as const,
        error: `Slug "${cleanSlug}" sudah digunakan oleh postingan lain.`,
      };
    }

    // Get current post to see if publishedAt was set
    const current = await db.select().from(posts).where(eq(posts.id, data.id)).get();

    const cleanBody = data.body.map((p) => p.trim()).filter(Boolean);
    const now = new Date().toISOString();

    let publishedAt = current?.publishedAt || null;
    if (data.status === "published" && !publishedAt) {
      publishedAt = now;
    } else if (data.status === "draft") {
      publishedAt = null;
    }

    await db
      .update(posts)
      .set({
        slug: cleanSlug,
        title: data.title.trim(),
        category: data.category.trim(),
        excerpt: data.excerpt.trim(),
        body: cleanBody,
        coverImage: data.coverImage?.trim() || null,
        status: data.status,
        publishedAt,
        updatedAt: now,
      })
      .where(eq(posts.id, data.id));

    return { success: true as const };
  });

export const deletePostFn = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => {
    if (!data.id) throw new Error("ID postingan tidak valid.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { posts } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db.delete(posts).where(eq(posts.id, data.id));

    return { success: true as const };
  });
