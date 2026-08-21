import { createServerFn } from "@tanstack/react-start";
import type { Testimonial } from "@/db/schema";

export interface TestimonialInput {
  id?: number;
  name: string;
  message: string;
  rating: number;
  photo?: string | null;
  visible: boolean;
}

const defaultTestimonialsSeed = [
  {
    name: "Ahmad Muyasar",
    rating: 5,
    photo: null,
    message:
      "Tempatnya nyaman, dokter sama perawatnya baik2 attitude nya juga bagus pada ramah sangat dijaga demi kenyamanan pasien. Mau umum atau pasien BPJS gak dibedain pelayanannya sama. Best banget pokoknya 👍👍👍",
  },
  {
    name: "Chen Dhani",
    rating: 5,
    photo: null,
    message:
      "Alhamdulillah ya Allah telah lahir anak kami pada hari ini tepatnya tanggal 2 Agustus 2026 terima kasih BD Annisa terima kasih Harapan Sehat, sudah memberikan pelayanan dan tindakan begitu cepat, sehingga kami merasa nyaman dan aman memilih tempat di Harapan Sehat.",
  },
  {
    name: "Egi Shaa",
    rating: 5,
    photo: null,
    message:
      "Alhamdulillah ya Allah saya merasa seneng banget ada klinik bisa bayar sesuai kemampuan.. saya berobat sampe di tanya dulu.. mau berapa jadi saya ga takut mau berobat karna bisa sesuai sama saya, sistem ijab kabul ini sangat meringankan",
  },
  {
    name: "Putri Wulandari",
    rating: 5,
    photo: null,
    message:
      "Pelayanannya best banget, buat Bidan Anisa dan Bidan Anna makasih banyak ya, baik banget sabar banget 😭 best banget deh pelayanan KIA-nya ⭐1000😚🤩",
  },
  {
    name: "Evi Faidah",
    rating: 5,
    photo: null,
    message:
      "Best banget pelayanan ramah, rekomen banget buat kalian yang mau berobat kesini 🤩🤩 jangan khawatir soal biaya karena ada pengobatan bagi yang kurang mampu 🥰🫰🏻",
  },
];

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

export const getTestimonialsFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();

  const { db } = await import("@/db");
  const { testimonials } = await import("@/db/schema");
  const { desc } = await import("drizzle-orm");

  let list = await db
    .select()
    .from(testimonials)
    .orderBy(desc(testimonials.createdAt), desc(testimonials.id))
    .all();

  // If table is completely empty, auto-seed with default testimonials
  if (list.length === 0) {
    const now = new Date().toISOString();
    for (const item of defaultTestimonialsSeed) {
      await db.insert(testimonials).values({
        name: item.name,
        message: item.message,
        rating: item.rating,
        photo: item.photo,
        visible: true,
        createdAt: now,
      });
    }

    list = await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt), desc(testimonials.id))
      .all();
  }

  return { success: true as const, data: list };
});

export const createTestimonialFn = createServerFn({ method: "POST" })
  .validator((data: TestimonialInput) => {
    if (!data.name?.trim()) throw new Error("Nama pasien / pemberi testimoni wajib diisi.");
    if (!data.message?.trim()) throw new Error("Isi pesan testimoni wajib diisi.");
    const ratingNum = Number(data.rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new Error("Rating harus bernilai antara 1 sampai 5.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { testimonials } = await import("@/db/schema");

    const now = new Date().toISOString();
    const ratingNum = Math.max(1, Math.min(5, Math.round(Number(data.rating)) || 5));

    const inserted = await db
      .insert(testimonials)
      .values({
        name: data.name.trim(),
        message: data.message.trim(),
        rating: ratingNum,
        photo: data.photo?.trim() || null,
        visible: Boolean(data.visible),
        createdAt: now,
      })
      .returning()
      .get();

    return { success: true as const, data: inserted };
  });

export const updateTestimonialFn = createServerFn({ method: "POST" })
  .validator((data: TestimonialInput & { id: number }) => {
    if (!data.id) throw new Error("ID testimoni tidak valid.");
    if (!data.name?.trim()) throw new Error("Nama pasien / pemberi testimoni wajib diisi.");
    if (!data.message?.trim()) throw new Error("Isi pesan testimoni wajib diisi.");
    const ratingNum = Number(data.rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new Error("Rating harus bernilai antara 1 sampai 5.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { testimonials } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const ratingNum = Math.max(1, Math.min(5, Math.round(Number(data.rating)) || 5));

    await db
      .update(testimonials)
      .set({
        name: data.name.trim(),
        message: data.message.trim(),
        rating: ratingNum,
        photo: data.photo?.trim() || null,
        visible: Boolean(data.visible),
      })
      .where(eq(testimonials.id, data.id));

    return { success: true as const };
  });

export const toggleTestimonialVisibleFn = createServerFn({ method: "POST" })
  .validator((data: { id: number; visible?: boolean }) => {
    if (!data.id) throw new Error("ID testimoni tidak valid.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { testimonials } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const current = await db.select().from(testimonials).where(eq(testimonials.id, data.id)).get();
    if (!current) {
      return { success: false as const, error: "Testimoni tidak ditemukan." };
    }

    const nextVisible = data.visible !== undefined ? Boolean(data.visible) : !current.visible;

    await db
      .update(testimonials)
      .set({
        visible: nextVisible,
      })
      .where(eq(testimonials.id, data.id));

    return { success: true as const, visible: nextVisible };
  });

export const deleteTestimonialFn = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => {
    if (!data.id) throw new Error("ID testimoni tidak valid.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { testimonials } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db.delete(testimonials).where(eq(testimonials.id, data.id));

    return { success: true as const };
  });
