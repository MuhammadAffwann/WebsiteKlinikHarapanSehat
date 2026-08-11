import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Section } from "@/components/site/section";
import { posts } from "@/data/clinic";
import blogCover from "@/assets/blog-cover.jpg";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = posts.find((item) => item.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
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
  const { post } = Route.useLoaderData();

  return (
    <Section className="pt-12">
      <article className="mx-auto max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <ArrowLeft className="size-4" /> Kembali ke blog
        </Link>
        <p className="mt-8 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          {post.category} · {post.date}
        </p>
        <h1 className="mt-3 font-serif text-3xl leading-tight font-bold sm:text-4xl">
          {post.title}
        </h1>
        <img
          src={blogCover}
          alt={post.title}
          loading="lazy"
          width={1200}
          height={800}
          className="shadow-card mt-8 aspect-[3/2] w-full rounded-2xl border border-border object-cover"
        />
        <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/85">
          {post.body.map((paragraph: string) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </Section>
  );
}
