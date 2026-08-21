import { createServerFn } from "@tanstack/react-start";

export const AUTH_COOKIE_NAME = "hs_admin_session";

export interface SessionPayload {
  adminId: number;
  email: string;
}

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { jwtVerify } = await import("jose");

  const token = getCookie(AUTH_COOKIE_NAME);
  if (!token) {
    return { isAuthenticated: false as const, user: null };
  }

  try {
    const jwtSecret = process.env["JWT_SECRET"] || "default_super_secret_jwt_key_hs_2026";
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    const adminId = payload["adminId"];
    const email = payload["email"];

    if (adminId && email) {
      return {
        isAuthenticated: true as const,
        user: { adminId: Number(adminId), email: String(email) },
      };
    }
  } catch {
    // token invalid or expired — fall through
  }

  return { isAuthenticated: false as const, user: null };
});

export const loginFn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => {
    if (!data.email || !data.password) {
      throw new Error("Email dan password wajib diisi");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { SignJWT } = await import("jose");
    const bcrypt = (await import("bcryptjs")).default;
    const { eq } = await import("drizzle-orm");
    const { setCookie } = await import("@tanstack/react-start/server");
    const { db } = await import("@/db");
    const { admins } = await import("@/db/schema");

    const { email, password } = data;

    const admin = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email.trim().toLowerCase()))
      .get();

    if (!admin) {
      return { success: false as const, error: "Email atau password salah." };
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return { success: false as const, error: "Email atau password salah." };
    }

    const jwtSecret = process.env["JWT_SECRET"] || "default_super_secret_jwt_key_hs_2026";
    const secret = new TextEncoder().encode(jwtSecret);

    const token = await new SignJWT({ adminId: admin.id, email: admin.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    setCookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env["NODE_ENV"] === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true as const,
      user: { id: admin.id, email: admin.email },
    };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteCookie } = await import("@tanstack/react-start/server");

  deleteCookie(AUTH_COOKIE_NAME, {
    path: "/",
  });

  return { success: true };
});
