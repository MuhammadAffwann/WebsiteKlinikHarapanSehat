import { createFileRoute } from "@tanstack/react-router";

import { PostCard } from "@/components/site/cards";
import { PageHero, Section } from "@/components/site/section";
import { getPublicPostsFn } from "@/lib/posts";
import blogCover from "@/assets/blog-cover.jpg";
import blogBanner from "@/assets/blog-banner.jpg";

export const Route = createFileRoute("/blog/")({
  loader: async () => {
    try {
      const res = await getPublicPostsFn();
      return { posts: res.data || [] };
    } catch {
      return { posts: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Blog Kesehatan — Klinik Harapan Sehat" },
      {
        name: "description",
        content:
          "Artikel edukasi kesehatan dan kabar terbaru layanan Klinik Harapan Sehat untuk keluarga Indonesia.",
      },
      { property: "og:title", content: "Blog Kesehatan Klinik Harapan Sehat" },
      {
        property: "og:description",
        content: "Edukasi kesehatan praktis dan pembaruan layanan klinik.",
      },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const { posts } = Route.useLoaderData();

  return (
    <>
      <PageHero
        title="Kabar & edukasi kesehatan"
        description="Tulisan ringkas dari tim medis kami seputar pencegahan penyakit dan layanan klinik."
        backgroundImage={blogBanner}
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} cover={blogCover} />
          ))}
        </div>
      </Section>
    </>
  );
}
