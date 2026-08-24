import { createServerFn } from "@tanstack/react-start";
import path from "node:path";
import fs from "node:fs/promises";

export interface UploadInput {
  fileBase64: string;
  fileName: string;
  contentType: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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

export const uploadImageFn = createServerFn({ method: "POST" })
  .validator((data: UploadInput) => {
    if (!data.fileBase64?.trim()) {
      throw new Error("Data file tidak boleh kosong.");
    }
    if (!data.fileName?.trim()) {
      throw new Error("Nama file tidak boleh kosong.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    await verifyAdminAuth();

    // Clean base64 string
    const rawBase64 = data.fileBase64.includes(",")
      ? data.fileBase64.split(",")[1] || ""
      : data.fileBase64;

    const buffer = Buffer.from(rawBase64, "base64");

    if (buffer.length > MAX_FILE_SIZE) {
      return {
        success: false as const,
        error: `Ukuran file terlalu besar (${(buffer.length / (1024 * 1024)).toFixed(1)}MB). Maksimal ukuran file adalah 5MB.`,
      };
    }

    // Determine extension
    const ext = path.extname(data.fileName).toLowerCase() || ".jpg";
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        success: false as const,
        error: `Format file "${ext}" tidak didukung. Harap upload gambar berformat JPG, PNG, atau WEBP.`,
      };
    }

    if (data.contentType && !ALLOWED_MIME_TYPES.has(data.contentType.toLowerCase())) {
      return {
        success: false as const,
        error: `Tipe file "${data.contentType}" tidak didukung. Harap upload file gambar.`,
      };
    }

    // Generate unique name
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 9);
    const safeBaseName = path
      .basename(data.fileName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_")
      .substring(0, 30);
    const uniqueFileName = `${safeBaseName}_${timestamp}_${randomStr}${ext}`;

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const targetFilePath = path.join(uploadsDir, uniqueFileName);
    await fs.writeFile(targetFilePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return {
      success: true as const,
      url: publicUrl,
    };
  });
