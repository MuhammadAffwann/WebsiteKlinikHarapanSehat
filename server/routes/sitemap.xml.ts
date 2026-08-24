import { defineEventHandler } from "h3";

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

export default defineEventHandler(async (event) => {
  const siteUrl =
    process.env["SITE_URL"]?.replace(/\/$/, "") || "https://harapansehat.id";

  let publishedPosts: Array<{
    slug: string;
    publishedAt?: string | null;
    updatedAt?: string | null;
  }> = [];

  try {
    const { db } = await import("../../src/db/index.js");
    const { posts } = await import("../../src/db/schema.js");
    const { desc, eq } = await import("drizzle-orm");

    publishedPosts = await db
      .select({
        slug: posts.slug,
        publishedAt: posts.publishedAt,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.status, "published"))
      .orderBy(desc(posts.publishedAt))
      .all();
  } catch {
    // Fallback: serve static-only sitemap if DB unavailable
  }

  const today = new Date().toISOString().split("T")[0]!;

  const staticUrls = STATIC_PAGES.map(
    ({ path, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  ).join("\n");

  const postUrls = publishedPosts
    .map(
      (post) => `  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${toW3CDate(post.updatedAt || post.publishedAt)}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${postUrls ? postUrls + "\n" : ""}</urlset>`;

  setResponseHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setResponseHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=3600");

  return xml;
});

function setResponseHeader(event: Parameters<typeof defineEventHandler>[0] extends (event: infer E) => unknown ? E : never, key: string, value: string) {
  event.node.res.setHeader(key, value);
}
