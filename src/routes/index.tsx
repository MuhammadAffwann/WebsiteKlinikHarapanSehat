import { useState, useRef, useEffect, type ReactNode } from "react";
import { Link, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  ChevronRight,
  ClipboardList,
  Facebook,
  HeartPulse,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostCard, ServiceCard } from "@/components/site/cards";
import { CarouselScrollbar } from "@/components/site/carousel-scrollbar";
import { Pill, Section, SectionHeading } from "@/components/site/section";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/site/scroll-reveal";
import { clinic, stats } from "@/data/clinic";
import { IjabKabulSection } from "@/components/site/ijab-kabul-section";
import { FaqSection } from "@/components/site/faq-section";
import { TestimonialSection } from "@/components/site/testimonial-section";
import { cn } from "@/lib/utils";
import blogCover from "@/assets/blog-cover.jpg";
import hsBackground from "@/assets/hsbackground.png";
import { incrementPageViewFn } from "@/lib/dashboard";
import { getPublicServicesFn } from "@/lib/services";
import { getPublicPostsFn } from "@/lib/posts";
import { getPublicTestimonialsFn } from "@/lib/testimonials";
import dokterYusufImage from "@/assets/dokteryusuf.jpg";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Fire-and-forget: increment page view counter without blocking render
    incrementPageViewFn().catch(() => {
      // silently ignore errors — never block homepage
    });
  },
  loader: async () => {
    try {
      const [servicesRes, postsRes, testimonialsRes] = await Promise.all([
        getPublicServicesFn(),
        getPublicPostsFn(),
        getPublicTestimonialsFn(),
      ]);
      return {
        services: servicesRes.data || [],
        posts: postsRes.data || [],
        testimonials: testimonialsRes.data || [],
      };
    } catch {
      return {
        services: [],
        posts: [],
        testimonials: [],
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Klinik Harapan Sehat — Klinik Keluarga 24 Jam Cianjur" },
      {
        name: "description",
        content:
          "Klinik Harapan Sehat menyediakan layanan dokter umum, gigi, ibu & anak, laboratorium, dan gawat darurat 24 jam di Cianjur.",
      },
      { property: "og:title", content: "Klinik Harapan Sehat — Klinik Keluarga 24 Jam" },
      {
        property: "og:description",
        content: "Perawatan medis terpercaya dan terjangkau untuk seluruh keluarga.",
      },
    ],
  }),
  component: HomePage,
});

type AdvantageItem = {
  icon: typeof Stethoscope;
  title: string;
  text: string;
  image: string;
};

const advantages: [AdvantageItem, AdvantageItem, AdvantageItem] = [
  {
    icon: Stethoscope,
    title: "Dokter Berpengalaman",
    text: "Tim dokter umum dan spesialis yang siap mendampingi setiap tahap perawatan Anda.",
    image: dokterYusufImage,
  },
  {
    icon: ShieldCheck,
    title: "Fasilitas Terstandar",
    text: "Ruang periksa, laboratorium, dan alat medis yang steril serta terkalibrasi rutin.",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop",
  },
  {
    icon: HeartPulse,
    title: "Siaga 24 Jam",
    text: "Layanan gawat darurat dengan ambulans siaga dan rujukan cepat ke rumah sakit mitra.",
    image:
      "https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=1000&auto=format&fit=crop",
  },
];

const heroActions = [
  {
    label: "Cari Dokter",
    to: "/dokter" as const,
    icon: (
      <div className="relative flex size-7 shrink-0 items-center justify-center sm:size-8">
        <Calendar className="size-6 text-[#0052cc] sm:size-7" strokeWidth={1.5} />
        <Stethoscope
          className="absolute -bottom-0.5 -left-0.5 size-3.5 text-[#43a047] sm:size-4"
          strokeWidth={2.25}
        />
      </div>
    ),
    mobileIcon: <Calendar className="size-7 text-[#0052cc]" strokeWidth={1.5} />,
  },
  {
    label: "Daftar Online",
    to: "/daftar-online" as const,
    icon: (
      <div className="relative flex size-7 shrink-0 items-center justify-center sm:size-8">
        <Calendar className="size-6 text-[#0052cc] sm:size-7" strokeWidth={1.5} />
        <CalendarCheck
          className="absolute -bottom-0.5 -left-0.5 size-3.5 text-[#43a047] sm:size-4"
          strokeWidth={2.25}
        />
      </div>
    ),
    mobileIcon: <CalendarCheck className="size-7 text-[#0052cc]" strokeWidth={1.5} />,
  },
  {
    label: "Lihat Layanan",
    to: "/" as const,
    hash: "layanan",
    icon: (
      <div className="relative flex size-7 shrink-0 items-center justify-center sm:size-8">
        <ClipboardList className="size-6 text-[#0052cc] sm:size-7" strokeWidth={1.5} />
        <HeartPulse
          className="absolute -bottom-0.5 -left-0.5 size-3.5 text-[#43a047] sm:size-4"
          strokeWidth={2.25}
        />
      </div>
    ),
    mobileIcon: <ClipboardList className="size-7 text-[#0052cc]" strokeWidth={1.5} />,
  },
];

function HeroActionCard({
  label,
  to,
  hash,
  icon,
  mobileIcon,
}: {
  label: string;
  to: "/" | "/daftar-online" | "/dokter";
  hash?: string;
  icon: ReactNode;
  mobileIcon: ReactNode;
}) {
  return (
    <>
      {/* Mobile Version: Grid Card */}
      <Link
        to={to}
        {...(hash ? { hash } : {})}
        className="flex flex-col items-center gap-2 sm:hidden"
      >
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-md border border-border/40">
          {mobileIcon}
        </div>
        <span className="text-[10px] font-medium leading-tight text-[#333333] text-center">
          {label}
        </span>
      </Link>

      {/* Desktop/Tablet Version: Pill (Original) */}
      <Link
        to={to}
        {...(hash ? { hash } : {})}
        className="shadow-card hidden sm:flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-border/60 bg-white px-2.5 py-2.5 transition-transform hover:-translate-y-0.5 hover:shadow-lg sm:gap-2.5 sm:rounded-2xl sm:px-3.5 sm:py-3 md:gap-3 md:px-4 md:py-3.5"
      >
        {icon}
        <span className="min-w-0 flex-1 text-xs font-medium leading-tight text-[#333333] sm:text-sm">
          {label}
        </span>
        <ChevronRight className="size-3.5 shrink-0 text-[#0052cc] sm:size-4" strokeWidth={2} />
      </Link>
    </>
  );
}

function HomePage() {
  const { services, posts, testimonials } = Route.useLoaderData();
  const servicesRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>("Semua Artikel");

  const filteredBlogPosts =
    selectedBlogCategory === "Semua Artikel"
      ? posts
      : posts.filter((post) => post.category.toLowerCase() === selectedBlogCategory.toLowerCase());

  const currentHash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    const hash =
      currentHash || (typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "");
    if (!hash) return undefined;
    if (hash === "home" || hash === "atas") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return undefined;
    }
    const timer = setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentHash]);

  return (
    <>
      {/* Hero */}
      <div id="home" className="relative overflow-hidden border-b border-border/40 surface-hero" style={{ maxWidth: "100vw" }}>
        {/* Desktop full-bleed image with mask fade */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 overflow-hidden lg:block">
          <img
            src={hsBackground}
            alt="Gedung Klinik Harapan Sehat"
            className="h-full w-full object-cover object-[center_20%] [mask-image:linear-gradient(to_right,transparent_0%,black_35%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_35%)]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40" />
        </div>

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-6 px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 md:px-12 md:pt-16 md:pb-20 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
          {/* Mobile & Tablet Image (Full-bleed Edge-to-Edge) */}
          <div className="relative -mx-4 -mt-10 mb-2 overflow-hidden sm:-mx-6 sm:-mt-14 sm:mb-3 md:-mx-12 md:-mt-16 md:mb-4 lg:hidden">
            <img
              src={hsBackground}
              alt="Gedung Klinik Harapan Sehat"
              width={1200}
              height={800}
              className="aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/9] w-full object-cover object-[center_30%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent lg:hidden" />
          </div>

          <ScrollReveal
            variant="fade-right"
            distance={30}
            className="relative z-10 max-w-2xl text-left -mt-2 sm:-mt-3 md:-mt-4 lg:mt-0"
          >
            <p className="text-xs font-semibold text-[#0052cc] sm:text-sm md:text-base">
              Selamat Datang di Klinik Harapan Sehat
            </p>
            <h1 className="mt-2 text-3xl font-normal leading-[1.2] text-[#1a1a2e] dark:text-foreground sm:text-4xl md:text-5xl lg:text-[3.5rem] lg:leading-[1.18]">
              <span className="block">Ijab Kabul,</span>
              <span className="block text-[#0052cc] dark:text-blue-400">
                Biaya Berobat.
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-left text-sm leading-relaxed text-[#555] dark:text-muted-foreground sm:text-base md:text-lg md:mt-6">
              Memberikan pelayanan kesehatan yang paripurna kepada masyarakat tanpa terkendala
              biaya, didukung oleh sistem ijab kabul biaya berobat.
            </p>
            <div className="mt-8 grid w-full grid-cols-3 gap-4 sm:flex sm:flex-row sm:gap-3 justify-start md:mt-10">
              {heroActions.map((action) => (
                <HeroActionCard
                  key={action.label}
                  label={action.label}
                  to={action.to}
                  {...("hash" in action ? { hash: action.hash } : {})}
                  icon={action.icon}
                  mobileIcon={action.mobileIcon}
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Stats */}
      <Section className="py-12 sm:py-14">
        <StaggerContainer
          staggerChildren={0.1}
          className="grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-8 shadow-card lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <dt className="text-3xl font-bold text-primary">{stat.value}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      {/* Advantages */}
      <Section id="about" className="pt-4">
        <ScrollReveal variant="fade-up">
          <SectionHeading
            eyebrow="Mengapa Kami"
            title="Memberikan pelayanan kesehatan yang paripurna dan inklusif tanpa kendala biaya, didukung oleh sistem ijab kabul biaya berobat."
            description="Di setiap alur, kami memastikan akad biaya pengobatan harus sama-sama sepakat, tidak mahal, dan ridho sama ridho, tanpa membeda-bedakan, serta memberikan pelayanan optimal kepada seluruh pasien."
            align="center"
            titleClassName="font-normal"
          />
        </ScrollReveal>
        <StaggerContainer
          staggerChildren={0.1}
          className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12"
        >
          {/* Card 1: Dokter Berpengalaman (Besar di kiri, span 2 baris) */}
          <StaggerItem className="md:col-span-7 md:row-span-2">
            {(() => {
              const Icon = advantages[0].icon;
              return (
                <div className="group relative flex h-full min-h-[340px] md:min-h-[460px] flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/40 shadow-card">
                  {/* TODO: ganti dengan foto asli klinik — saat ini pakai placeholder Unsplash */}
                  <img
                    src={advantages[0].image}
                    alt={advantages[0].title}
                    className="absolute inset-0 h-full w-full object-cover object-[center_30%] transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
                    <div>
                      <span className="inline-flex size-12 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md shadow-sm">
                        <Icon className="size-6" />
                      </span>
                    </div>
                    <div className="mt-auto pt-8">
                      <h3 className="text-xl font-semibold text-white sm:text-2xl">
                        {advantages[0].title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/80 sm:text-base">
                        {advantages[0].text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </StaggerItem>

          {/* Card 2: Fasilitas Terstandar */}
          <StaggerItem className="md:col-span-5">
            {(() => {
              const Icon = advantages[1].icon;
              return (
                <div className="group relative flex h-full min-h-[210px] flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/40 shadow-card">
                  {/* TODO: ganti dengan foto asli klinik — saat ini pakai placeholder Unsplash */}
                  <img
                    src={advantages[1].image}
                    alt={advantages[1].title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7">
                    <div>
                      <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md shadow-sm">
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <div className="mt-auto pt-6">
                      <h3 className="text-lg font-semibold text-white sm:text-xl">
                        {advantages[1].title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/80 sm:text-sm">
                        {advantages[1].text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </StaggerItem>

          {/* Card 3: Siaga 24 Jam */}
          <StaggerItem className="md:col-span-5">
            {(() => {
              const Icon = advantages[2].icon;
              return (
                <div className="group relative flex h-full min-h-[210px] flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/40 shadow-card">
                  {/* TODO: ganti dengan foto asli klinik — saat ini pakai placeholder Unsplash */}
                  <img
                    src={advantages[2].image}
                    alt={advantages[2].title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7">
                    <div>
                      <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md shadow-sm">
                        <Icon className="size-5" />
                      </span>
                    </div>
                    <div className="mt-auto pt-6">
                      <h3 className="text-lg font-semibold text-white sm:text-xl">
                        {advantages[2].title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/80 sm:text-sm">
                        {advantages[2].text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </StaggerItem>
        </StaggerContainer>
      </Section>

      {/* Ijab Kabul */}
      <IjabKabulSection />

      {/* FAQ */}
      <FaqSection />

      {/* Testimonials */}
      <TestimonialSection testimonials={testimonials} />

      {/* Services */}
      <Section id="layanan" className="bg-white">
        <ScrollReveal variant="fade-up">
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            <div className="md:col-span-4 lg:col-span-4">
              <SectionHeading
                title="Pusat layanan unggulan"
                description="Klinik Harapan Sehat mendukung perjalanan kesehatan anda dengan layanan yang terpercaya dan penuh perhatian."
                titleClassName="font-normal"
              />
            </div>

            <div className="md:col-span-8 lg:col-span-8 overflow-hidden">
              <div
                ref={servicesRef}
                className="flex gap-6 overflow-x-auto pb-4 pt-2 scroll-smooth snap-x snap-mandatory [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {services.map((service) => (
                  <div
                    key={service.slug}
                    id={service.slug}
                    className="w-[280px] sm:w-[320px] lg:w-[340px] shrink-0 snap-start scroll-mt-24"
                  >
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
              <CarouselScrollbar targetRef={servicesRef} />
            </div>
          </div>
        </ScrollReveal>
      </Section>

      {/* Blog */}
      <Section id="blog" className="bg-[#f7fbfa]">
        <ScrollReveal variant="fade-up">
          {/* Grid Container */}
          <div className="grid gap-8 md:grid-cols-12 md:items-center">
            {/* Left Column: Heading, Description, Link */}
            <div className="flex flex-col justify-center md:col-span-4 lg:col-span-4 lg:pr-4">
              <h2 className="text-3xl font-normal leading-tight tracking-tight sm:text-4xl text-foreground">
                Kabar &amp; edukasi terbaru
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Akses berbagai informasi dan edukasi medis bermanfaat melalui blog resmi klinik kami
                untuk mendukung pola hidup sehat Anda.
              </p>

              <Link
                to="/blog"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
              >
                Lihat Semua Artikel <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Right Column: Carousel Cards */}
            <div className="md:col-span-8 lg:col-span-8 overflow-hidden">
              {/* Cards Container */}
              <div
                ref={postsRef}
                className="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {filteredBlogPosts.map((post) => (
                  <div
                    key={post.slug}
                    className="w-[280px] sm:w-[320px] lg:w-[340px] shrink-0 snap-start"
                  >
                    <PostCard post={post} cover={blogCover} />
                  </div>
                ))}
              </div>
              <CarouselScrollbar targetRef={postsRef} />
            </div>
          </div>
        </ScrollReveal>
      </Section>

      {/* Kontak */}
      <Section id="kontak" className="pb-0">
        <ScrollReveal variant="fade-up">
          <SectionHeading
            eyebrow="Hubungi Kami"
            title="Silakan hubungi kami jika ada pertanyaan"
            description="Tim kami siap membantu Anda — baik untuk pertanyaan medis, informasi layanan, maupun hal lainnya."
            align="center"
            titleClassName="font-normal"
          />
        </ScrollReveal>

        {/* Contact cards + Map */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Left: Contact Cards + Socmed */}
          <StaggerContainer staggerChildren={0.1} className="flex flex-col gap-4">
            <StaggerItem variant="fade-right">
              <a
                href={clinic.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shadow-card flex items-center gap-4 rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <MessageCircle className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    WhatsApp
                  </p>
                  <p className="mt-1 font-semibold">{clinic.whatsapp}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Balas cepat dalam jam kerja
                  </p>
                </div>
              </a>
            </StaggerItem>

            <StaggerItem variant="fade-right">
              <a
                href={`mailto:${clinic.email}`}
                className="shadow-card flex items-center gap-4 rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Mail className="size-6" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Email
                  </p>
                  <p className="mt-1 font-semibold">{clinic.email}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Kami akan membalas dalam 24 jam
                  </p>
                </div>
              </a>
            </StaggerItem>

            <StaggerItem variant="fade-right">
              <div className="shadow-card rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Sosial Media Kami
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Jangan lupa kunjungi sosial media kami — update terbaru, tips kesehatan, dan promo
                  spesial ada di sana!
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <a
                    href={clinic.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram Klinik Harapan Sehat"
                    className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-400 text-white transition-opacity hover:opacity-85"
                  >
                    <Instagram className="size-5" />
                  </a>
                  <a
                    href={clinic.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook Klinik Harapan Sehat"
                    className="flex size-11 items-center justify-center rounded-full bg-blue-600 text-white transition-opacity hover:opacity-85"
                  >
                    <Facebook className="size-5" />
                  </a>
                  <a
                    href={clinic.social.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok Klinik Harapan Sehat"
                    className="flex size-11 items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-85"
                  >
                    <svg
                      className="size-5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.24 8.24 0 004.84 1.55V6.8a4.85 4.85 0 01-1.07-.11z" />
                    </svg>
                  </a>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Right: Google Maps Embed */}
          <ScrollReveal
            variant="fade-left"
            className="overflow-hidden rounded-3xl border border-border shadow-lg"
          >
            <iframe
              title="Lokasi Klinik Harapan Sehat"
              src="https://maps.google.com/maps?q=Jl.+Raya+Cibeber+No.20,+Sukasari,+Kec.+Cilaku,+Kabupaten+Cianjur,+Jawa+Barat+43285&output=embed&hl=id"
              width="100%"
              height="100%"
              style={{ minHeight: "400px", border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </ScrollReveal>
        </div>

        {/* Address bar */}
        <ScrollReveal variant="fade-up" delay={0.1}>
          <div className="mt-6 mb-16 flex items-center gap-3 rounded-2xl bg-primary px-6 py-4 text-primary-foreground">
            <MapPin className="size-5 shrink-0" />
            <span className="text-sm font-medium">{clinic.address}</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto shrink-0 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold hover:bg-white/30 transition-colors"
            >
              Buka di Maps →
            </a>
          </div>
        </ScrollReveal>
      </Section>
    </>
  );
}
