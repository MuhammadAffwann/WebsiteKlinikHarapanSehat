// Helper pattern for TanStack Start API file routes
export function createAPIFileRoute(path: string) {
  return <T extends { GET?: (req?: Request) => Promise<Response> | Response }>(handlers: T): T & { path: string } => ({
    path,
    ...handlers,
  });
}

const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/layanan", changefreq: "monthly", priority: "0.8" },
  { path: "/dokter", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/daftar-online", changefreq: "monthly", priority: "0.7" },
];

function toW3CDate(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString().split("T")[0]!;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString().split("T")[0]!;
    return d.toISOString().split("T")[0]!;
  } catch {
    return new Date().toISOString().split("T")[0]!;
  }
}

export const APIRoute = createAPIFileRoute("/sitemap.xml")({
  GET: async (_req?: Request) => {
    const siteUrl =
      process.env["SITE_URL"]?.replace(/\/$/, "") || "https://home.harapansehat.id";

    // Fetch published posts directly from DB (server-side, no auth needed)
    let publishedPosts: Array<{
      slug: string;
      publishedAt?: string | null;
      updatedAt?: string | null;
    }> = [];

    try {
      const { db } = await import("@/db");
      const { posts } = await import("@/db/schema");
      const { desc, eq } = await import("drizzle-orm");

      const result = await db
        .select({
          slug: posts.slug,
          publishedAt: posts.publishedAt,
          updatedAt: posts.updatedAt,
        })
        .from(posts)
        .where(eq(posts.status, "published"))
        .orderBy(desc(posts.publishedAt))
        .all();

      if (Array.isArray(result)) {
        publishedPosts = result;
      }
    } catch {
      // If DB not available or table empty, serve sitemap with static pages only
      publishedPosts = [];
    }

    const today = new Date().toISOString().split("T")[0]!;

    const staticUrls = STATIC_PAGES.map(
      ({ path, changefreq, priority }) => `
  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    ).join("");

    const postUrls = (publishedPosts || [])
      .map(
        (post) => `
  <url>
    <loc>${siteUrl}/blog/${encodeURIComponent(post.slug)}</loc>
    <lastmod>${toW3CDate(post.updatedAt || post.publishedAt)}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${postUrls}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  },
});
