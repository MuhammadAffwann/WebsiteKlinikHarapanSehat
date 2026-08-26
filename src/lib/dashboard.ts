import { createServerFn } from "@tanstack/react-start";

async function verifyAdminAuth() {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { jwtVerify } = await import("jose");
  const { AUTH_COOKIE_NAME } = await import("./auth");

  const token = getCookie(AUTH_COOKIE_NAME);
  if (!token) throw new Error("Unauthorized");

  try {
    const jwtSecret = process.env["JWT_SECRET"] || "default_super_secret_jwt_key_hs_2026";
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    if (!payload["adminId"] || !payload["email"]) throw new Error("Unauthorized");
  } catch {
    throw new Error("Unauthorized");
  }
}

/**
 * Increment page view counter — called from public homepage loader.
 * Does NOT require auth. Fire-and-forget safe.
 */
export const incrementPageViewFn = createServerFn({ method: "POST" }).handler(async () => {
  const { db } = await import("@/db");
  const { pageViews } = await import("@/db/schema");
  const { eq, sql } = await import("drizzle-orm");

  // Upsert: increment existing row with id=1, or create if missing
  const existing = await db.select().from(pageViews).where(eq(pageViews.id, 1)).get();
  if (existing) {
    await db
      .update(pageViews)
      .set({
        count: sql`${pageViews.count} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pageViews.id, 1));
  } else {
    await db.insert(pageViews).values({
      count: 1,
      updatedAt: new Date().toISOString(),
    });
  }

  return { success: true };
});

/**
 * Get all dashboard stats in one call. Requires admin auth.
 */
export const getDashboardStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  await verifyAdminAuth();

  const { db } = await import("@/db");
  const { services, doctors, posts, testimonials, registrations, pageViews } = await import("@/db/schema");
  const { count, eq, desc } = await import("drizzle-orm");

  const todayStr = new Date().toISOString().split("T")[0] ?? "";

  const [
    servicesCount,
    doctorsCount,
    postsCount,
    testimonialsCount,
    registrationsCount,
    todayRegistrationsCount,
    viewsRow,
    allServices,
    allDoctors,
    allPosts,
    allTestimonials,
    allRegistrations,
  ] = await Promise.all([
    db.select({ value: count() }).from(services).get(),
    db.select({ value: count() }).from(doctors).get(),
    db.select({ value: count() }).from(posts).get(),
    db.select({ value: count() }).from(testimonials).get(),
    db.select({ value: count() }).from(registrations).get(),
    db.select({ value: count() }).from(registrations).where(eq(registrations.visitDate, todayStr)).get(),
    db.select().from(pageViews).where(eq(pageViews.id, 1)).get(),
    db.select({
      id: services.id,
      title: services.title,
      slug: services.slug,
      badge: services.badge,
      description: services.description,
      image: services.image,
      createdAt: services.createdAt,
      updatedAt: services.updatedAt,
    })
      .from(services)
      .orderBy(desc(services.createdAt))
      .all(),
    db.select({
      id: doctors.id,
      name: doctors.name,
      specialty: doctors.specialty,
      active: doctors.active,
      createdAt: doctors.createdAt,
      updatedAt: doctors.updatedAt,
    })
      .from(doctors)
      .orderBy(desc(doctors.createdAt))
      .all(),
    db.select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      category: posts.category,
      status: posts.status,
      createdAt: posts.createdAt,
      publishedAt: posts.publishedAt,
    })
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .all(),
    db.select({
      id: testimonials.id,
      name: testimonials.name,
      rating: testimonials.rating,
      message: testimonials.message,
      visible: testimonials.visible,
      createdAt: testimonials.createdAt,
    })
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt))
      .all(),
    db.select({
      id: registrations.id,
      queueCode: registrations.queueCode,
      patientName: registrations.patientName,
      service: registrations.service,
      status: registrations.status,
      createdAt: registrations.createdAt,
    })
      .from(registrations)
      .orderBy(desc(registrations.createdAt))
      .all(),
  ]);

  const recentServices = allServices.slice(0, 5);
  const recentDoctors = allDoctors.slice(0, 5);
  const recentPosts = allPosts.slice(0, 5);
  const recentTestimonials = allTestimonials.slice(0, 5);
  const recentRegistrations = allRegistrations.slice(0, 5);

  // Merge and sort recent activity (menambahkan/mengedit)
  const recentActivity = [
    ...recentServices.map((s) => ({
      id: `service-${s.id}`,
      type: "layanan" as const,
      action: "menambahkan",
      title: s.title,
      createdAt: s.createdAt,
      author: "Admin Harapan Sehat",
    })),
    ...recentDoctors.map((d) => ({
      id: `doctor-${d.id}`,
      type: "dokter" as const,
      action: "menambahkan",
      title: d.name,
      createdAt: d.createdAt,
      author: "Admin Harapan Sehat",
    })),
    ...recentPosts.map((p) => ({
      id: `post-${p.id}`,
      type: "blog" as const,
      action: p.status === "published" ? "mempublikasikan" : "menyimpan draft",
      title: p.title,
      createdAt: p.createdAt,
      author: "Admin Harapan Sehat",
    })),
    ...recentTestimonials.map((t) => ({
      id: `testi-${t.id}`,
      type: "testimoni" as const,
      action: "menambahkan testimoni",
      title: t.name,
      createdAt: t.createdAt,
      author: "Admin Harapan Sehat",
    })),
    ...recentRegistrations.map((r) => ({
      id: `reg-${r.id}`,
      type: "pendaftaran" as const,
      action: "mendaftar online",
      title: `${r.patientName} (${r.queueCode})`,
      createdAt: r.createdAt,
      author: "Pasien",
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Recent content items for the table list
  const recentItems = [
    ...recentServices.map((s) => ({
      id: `srv-${s.id}`,
      title: s.title,
      type: "Layanan",
      category: s.badge || "Umum",
      date: s.createdAt,
      status: "Aktif",
      statusColor: "emerald",
      href: "/dashboardpanel/layanan",
    })),
    ...recentDoctors.map((d) => ({
      id: `doc-${d.id}`,
      title: d.name,
      type: "Dokter",
      category: d.specialty,
      date: d.createdAt,
      status: d.active ? "Aktif" : "Cuti",
      statusColor: d.active ? "emerald" : "amber",
      href: "/dashboardpanel/dokter",
    })),
    ...recentPosts.map((p) => ({
      id: `pst-${p.id}`,
      title: p.title,
      type: "Blog",
      category: p.category,
      date: p.publishedAt || p.createdAt,
      status: p.status === "published" ? "Terbit" : "Draft",
      statusColor: p.status === "published" ? "blue" : "amber",
      href: "/dashboardpanel/blog",
    })),
    ...recentTestimonials.map((t) => ({
      id: `tst-${t.id}`,
      title: t.name,
      type: "Testimoni",
      category: `${t.rating || 5} Bintang`,
      date: t.createdAt,
      status: t.visible ? "Tampil" : "Sembunyi",
      statusColor: t.visible ? "emerald" : "zinc",
      href: "/dashboardpanel/testimonial",
    })),
    ...recentRegistrations.map((r) => ({
      id: `reg-${r.id}`,
      title: `${r.patientName} (${r.queueCode})`,
      type: "Pendaftaran",
      category: r.service,
      date: r.createdAt,
      status: r.status === "selesai" ? "Selesai" : r.status === "dipanggil" ? "Dipanggil" : "Menunggu",
      statusColor: r.status === "selesai" ? "emerald" : r.status === "dipanggil" ? "blue" : "amber",
      href: "/dashboardpanel/pendaftaran",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Global search items index
  const searchItems = [
    {
      id: "nav-layanan",
      title: "Kelola Layanan",
      subtitle: "Manajemen data poli & layanan klinik",
      type: "Modul",
      href: "/dashboardpanel/layanan",
    },
    {
      id: "nav-dokter",
      title: "Kelola Dokter",
      subtitle: "Jadwal dan daftar spesialis dokter",
      type: "Modul",
      href: "/dashboardpanel/dokter",
    },
    {
      id: "nav-blog",
      title: "Kelola Blog & Artikel",
      subtitle: "Publikasi edukasi kesehatan",
      type: "Modul",
      href: "/dashboardpanel/blog",
    },
    {
      id: "nav-testi",
      title: "Kelola Testimoni",
      subtitle: "Ulasan dan pengalaman pasien",
      type: "Modul",
      href: "/dashboardpanel/testimonial",
    },
    {
      id: "nav-reg",
      title: "Kelola Pendaftaran Antrean",
      subtitle: "Daftar antrean dan pasien berobat",
      type: "Modul",
      href: "/dashboardpanel/pendaftaran",
    },
    ...allServices.map((s) => ({
      id: `search-srv-${s.id}`,
      title: s.title,
      subtitle: s.badge ? `Layanan • ${s.badge}` : (s.description || "Layanan Medis Klinik"),
      type: "Layanan",
      href: "/dashboardpanel/layanan",
    })),
    ...allDoctors.map((d) => ({
      id: `search-doc-${d.id}`,
      title: d.name,
      subtitle: `Dokter • ${d.specialty} ${d.active ? "(Aktif)" : "(Cuti)"}`,
      type: "Dokter",
      href: "/dashboardpanel/dokter",
    })),
    ...allPosts.map((p) => ({
      id: `search-pst-${p.id}`,
      title: p.title,
      subtitle: `Blog • ${p.category} (${p.status === "published" ? "Terbit" : "Draft"})`,
      type: "Blog",
      href: "/dashboardpanel/blog",
    })),
    ...allTestimonials.map((t) => ({
      id: `search-tst-${t.id}`,
      title: t.name,
      subtitle: `Testimoni • "${t.message.slice(0, 45)}..."`,
      type: "Testimoni",
      href: "/dashboardpanel/testimonial",
    })),
    ...allRegistrations.map((r) => ({
      id: `search-reg-${r.id}`,
      title: r.patientName,
      subtitle: `Pendaftaran • ${r.queueCode} (${r.service})`,
      type: "Pendaftaran",
      href: "/dashboardpanel/pendaftaran",
    })),
  ];

  const totalViews = viewsRow?.count ?? 0;

  return {
    servicesCount: servicesCount?.value ?? 0,
    doctorsCount: doctorsCount?.value ?? 0,
    postsCount: postsCount?.value ?? 0,
    testimonialsCount: testimonialsCount?.value ?? 0,
    registrationsCount: registrationsCount?.value ?? 0,
    todayRegistrationsCount: todayRegistrationsCount?.value ?? 0,
    pageViewsCount: totalViews,
    recentActivity,
    recentItems,
    searchItems,
  };
});
