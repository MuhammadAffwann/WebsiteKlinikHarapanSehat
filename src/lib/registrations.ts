import { createServerFn } from "@tanstack/react-start";
import type { Registration } from "@/db/schema";

export interface RegistrationInput {
  patientName: string;
  fatherName?: string | null;
  phone: string;
  service: string;
  doctor: string;
  visitDate: string;
  complaint?: string | null;
  paymentType: string;
  patientType?: string | null;
  address?: string | null;
  medicalRecordNo?: string | null;
}

export type RegistrationStatus = "menunggu" | "dipanggil" | "selesai" | "batal";

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

/**
 * Public Endpoint: Buat pendaftaran baru dari form publik (daftar-online.tsx)
 * Tidak memerlukan login admin.
 */
export const createRegistrationFn = createServerFn({ method: "POST" })
  .validator((data: RegistrationInput) => {
    if (!data.patientName?.trim()) throw new Error("Nama pasien wajib diisi.");
    if (!data.phone?.trim()) throw new Error("Nomor telepon/WA wajib diisi.");
    if (!data.service?.trim()) throw new Error("Poli layanan wajib dipilih.");
    if (!data.doctor?.trim()) throw new Error("Dokter wajib dipilih.");
    if (!data.visitDate?.trim()) throw new Error("Tanggal kunjungan wajib dipilih.");
    if (!data.paymentType?.trim()) throw new Error("Jenis pembayaran wajib dipilih.");
    return data;
  })
  .handler(async ({ data }) => {
    const { db } = await import("@/db");
    const { registrations } = await import("@/db/schema");
    const { count, eq } = await import("drizzle-orm");

    const cleanVisitDate = data.visitDate.trim();
    const dateFormatted = cleanVisitDate.replace(/-/g, "");

    // Hitung jumlah pendaftaran yang sudah ada untuk tanggal kunjungan tersebut
    const existingCount = await db
      .select({ value: count() })
      .from(registrations)
      .where(eq(registrations.visitDate, cleanVisitDate))
      .get();

    let seq = (existingCount?.value ?? 0) + 1;
    let queueCode = `HS-${dateFormatted}-${String(seq).padStart(3, "0")}`;

    // Pastikan kode antrean unik
    let collision = await db
      .select()
      .from(registrations)
      .where(eq(registrations.queueCode, queueCode))
      .get();

    while (collision) {
      seq += 1;
      queueCode = `HS-${dateFormatted}-${String(seq).padStart(3, "0")}`;
      collision = await db
        .select()
        .from(registrations)
        .where(eq(registrations.queueCode, queueCode))
        .get();
    }

    const now = new Date().toISOString();

    const inserted = await db
      .insert(registrations)
      .values({
        queueCode,
        patientName: data.patientName.trim(),
        fatherName: data.fatherName?.trim() || "-",
        phone: data.phone.trim(),
        service: data.service.trim(),
        doctor: data.doctor.trim(),
        visitDate: cleanVisitDate,
        complaint: data.complaint?.trim() || "-",
        paymentType: data.paymentType.trim(),
        patientType: data.patientType?.trim() || null,
        address: data.address?.trim() || null,
        medicalRecordNo: data.medicalRecordNo?.trim() || null,
        status: "menunggu",
        createdAt: now,
      })
      .returning()
      .get();

    return { success: true as const, data: inserted };
  });

/**
 * Admin Endpoint: Ambil semua data pendaftaran dengan filter opsional
 */
export const getRegistrationsFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();

  const { db } = await import("@/db");
  const { registrations } = await import("@/db/schema");
  const { desc } = await import("drizzle-orm");

  const list = await db
    .select()
    .from(registrations)
    .orderBy(desc(registrations.createdAt), desc(registrations.id))
    .all();

  return { success: true as const, data: list };
});

/**
 * Admin Endpoint: Update status pendaftaran (menunggu, dipanggil, selesai, batal)
 */
export const updateRegistrationStatusFn = createServerFn({ method: "POST" })
  .validator((data: { id: number; status: RegistrationStatus }) => {
    if (!data.id) throw new Error("ID pendaftaran tidak valid.");
    const validStatuses: RegistrationStatus[] = ["menunggu", "dipanggil", "selesai", "batal"];
    if (!validStatuses.includes(data.status)) {
      throw new Error("Status pendaftaran tidak valid.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { registrations } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(registrations)
      .set({
        status: data.status,
      })
      .where(eq(registrations.id, data.id));

    return { success: true as const, status: data.status };
  });

/**
 * Admin Endpoint: Hapus data pendaftaran
 */
export const deleteRegistrationFn = createServerFn({ method: "POST" })
  .validator((data: { id: number }) => {
    if (!data.id) throw new Error("ID pendaftaran tidak valid.");
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    const { db } = await import("@/db");
    const { registrations } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    await db.delete(registrations).where(eq(registrations.id, data.id));

    return { success: true as const };
  });
