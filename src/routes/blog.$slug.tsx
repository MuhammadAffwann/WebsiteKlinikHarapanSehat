import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Section } from "@/components/site/section";
import { PostCard } from "@/components/site/cards";
import { getPublicPostBySlugFn, getPublicPostsFn } from "@/lib/posts";
import blogCover from "@/assets/blog-cover.jpg";

function formatPostDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      const [postRes, allPostsRes] = await Promise.all([
        getPublicPostBySlugFn({ data: { slug: params.slug } }),
        getPublicPostsFn(),
      ]);

      if (!postRes.data) throw notFound();

      const currentPost = postRes.data;
      const allPosts = allPostsRes.data || [];

      // Filter out current post
      const otherPosts = allPosts.filter((p) => p.slug !== currentPost.slug);

      // Prioritize same category first
      const sameCategoryPosts = otherPosts.filter(
        (p) => p.category.toLowerCase() === currentPost.category.toLowerCase()
      );
      const differentCategoryPosts = otherPosts.filter(
        (p) => p.category.toLowerCase() !== currentPost.category.toLowerCase()
      );

      // Pick up to 3 posts: same category first, fill remainder with latest published posts
      const relatedPosts = [...sameCategoryPosts, ...differentCategoryPosts].slice(0, 3);

      return { post: currentPost, relatedPosts };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return {
        meta: [{ title: "Artikel tidak ditemukan" }, { name: "robots", content: "noindex" }],
      };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — Klinik Harapan Sehat` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: PostPage,
});

function PostPage() {
  const { post, relatedPosts } = Route.useLoaderData();
  const displayDate = formatPostDate(post.publishedAt || post.createdAt);
  const coverSrc = post.coverImage || blogCover;

  return (
    <>
      <Section className="pt-12 pb-16">
        <article className="mx-auto max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2 transition-all"
          >
            <ArrowLeft className="size-4" /> Kembali ke blog
          </Link>
          <p className="mt-8 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            {post.category} {displayDate ? `· ${displayDate}` : ""}
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-tight font-bold sm:text-4xl">
            {post.title}
          </h1>
          <img
            src={coverSrc}
            alt={post.title}
            loading="lazy"
            width={1200}
            height={800}
            className="shadow-card mt-8 aspect-[3/2] w-full rounded-2xl border border-border object-cover"
          />
          <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/85">
            {post.body.map((paragraph: string, idx: number) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </article>
      </Section>

      {/* Section Postingan Lainnya / Terkait */}
      {relatedPosts.length > 0 && (
        <Section className="border-t border-border bg-muted/20 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
              <div>
                <p className="text-xs font-bold tracking-widest text-primary uppercase">
                  Baca Juga
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Artikel Terkait Lainnya
                </h2>
              </div>
              <Link
                to="/blog"
                className="text-sm font-semibold text-primary hover:underline shrink-0"
              >
                Lihat semua artikel →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((item) => (
                <PostCard key={item.slug} post={item} cover={blogCover} />
              ))}
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
