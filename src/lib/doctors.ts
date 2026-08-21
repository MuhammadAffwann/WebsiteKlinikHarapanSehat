import { createServerFn } from "@tanstack/react-start";
import type { Doctor } from "@/db/schema";

export interface DoctorInput {
  id?: number;
  slug: string;
  name: string;
  specialty: string;
  days: string;
  time: string;
  image?: string | null;
  active: boolean;
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

export const getDoctorsFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();

  const { db } = await import("@/db");
  const { doctors } = await import("@/db/schema");
  const { asc } = await import("drizzle-orm");

  let list = await db
    .select()
    .from(doctors)
    .orderBy(asc(doctors.orderIndex), asc(doctors.id))
    .all();

  // If table is completely empty, auto-seed with default doctors from clinic.ts
  if (list.length === 0) {
    const { doctors: defaultDoctors } = await import("@/data/clinic");

    if (Array.isArray(defaultDoctors) && defaultDoctors.length > 0) {
      const now = new Date().toISOString();
      for (let i = 0; i < defaultDoctors.length; i++) {
        const d = defaultDoctors[i];
        await db.insert(doctors).values({
          slug: d.slug,
          name: d.name,
          specialty: d.specialty,
          days: d.days,
          time: d.time,
          image: d.image || d.slug,
          active: true,
          orderIndex: i + 1,
          createdAt: now,
          updatedAt: now,
        });
      }

      list = await db
        .select()
        .from(doctors)
        .orderBy(asc(doctors.orderIndex), asc(doctors.id))
        .all();
    }
  }

  return { success: true as const, data: list };
});

export const createDoctorFn = createServerFn({ method: "POST" })
  .validator((data: DoctorInput) => {
    if (!data.name?.trim()) throw new Error("Nama dokter wajib diisi.");
    if (!data.slug?.trim()) throw new Error("Slug dokter wajib diisi.");
    if (!data.specialty?.trim()) throw new Error("Spesialisasi dokter wajib diisi.");
    if (!data.days?.trim()) throw new Error("Hari praktik wajib diisi.");
    if (!data.time?.trim()) throw new Error("Jam praktik wajib diisi.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { doctors } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const cleanSlug = data.slug.trim().toLowerCase();

    // Check slug uniqueness
    const existing = await db.select().from(doctors).where(eq(doctors.slug, cleanSlug)).get();

    if (existing) {
      return {
        success: false as const,
        error: `Slug "${cleanSlug}" sudah digunakan. Silakan gunakan slug lain.`,
      };
    }

    const now = new Date().toISOString();

    const inserted = await db
      .insert(doctors)
      .values({
        slug: cleanSlug,
        name: data.name.trim(),
        specialty: data.specialty.trim(),
        days: data.days.trim(),
        time: data.time.trim(),
        image: data.image?.trim() || null,
        active: Boolean(data.active),
        orderIndex: Number(data.orderIndex) || 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    return { success: true as const, data: inserted };
  });

export const updateDoctorFn = createServerFn({ method: "POST" })
  .validator((data: DoctorInput & { id: number }) => {
    if (!data.id) throw new Error("ID dokter tidak valid.");
    if (!data.name?.trim()) throw new Error("Nama dokter wajib diisi.");
    if (!data.slug?.trim()) throw new Error("Slug dokter wajib diisi.");
    if (!data.specialty?.trim()) throw new Error("Spesialisasi dokter wajib diisi.");
    if (!data.days?.trim()) throw new Error("Hari praktik wajib diisi.");
    if (!data.time?.trim()) throw new Error("Jam praktik wajib diisi.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { doctors } = await import("@/db/schema");
    const { eq, and, ne } = await import("drizzle-orm");

    const cleanSlug = data.slug.trim().toLowerCase();

    // Check slug uniqueness for other doctors
    const duplicate = await db
      .select()
      .from(doctors)
      .where(and(eq(doctors.slug, cleanSlug), ne(doctors.id, data.id)))
      .get();

    if (duplicate) {
      return {
        success: false as const,
        error: `Slug "${cleanSlug}" sudah digunakan oleh dokter lain.`,
      };
    }

    const now = new Date().toISOString();

    await db
      .update(doctors)
      .set({
        slug: cleanSlug,
        name: data.name.trim(),
        specialty: data.specialty.trim(),
        days: data.days.trim(),
        time: data.time.trim(),
        image: data.image?.trim() || null,
        active: Boolean(data.active),
        orderIndex: Number(data.orderIndex) || 0,
        updatedAt: now,
      })
      .where(eq(doctors.id, data.id));

    return { success: true as const };
  });

export const toggleDoctorActiveFn = createServerFn({ method: "POST" })
  .validator((data: { id: number; active?: boolean }) => {
    if (!data.id) throw new Error("ID dokter tidak valid.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { doctors } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const current = await db.select().from(doctors).where(eq(doctors.id, data.id)).get();
    if (!current) {
      return { success: false as const, error: "Dokter tidak ditemukan." };
    }

    const nextActive = data.active !== undefined ? Boolean(data.active) : !current.active;
    const now = new Date().toISOString();

    await db
      .update(doctors)
      .set({
        active: nextActive,
        updatedAt: now,
      })
      .where(eq(doctors.id, data.id));

    return { success: true as const, active: nextActive };
  });

export const deleteDoctorFn = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => {
    if (!data.id) throw new Error("ID dokter tidak valid.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { doctors } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db.delete(doctors).where(eq(doctors.id, data.id));

    return { success: true as const };
  });
