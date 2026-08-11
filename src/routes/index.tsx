import { useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Facebook, HeartPulse, Instagram, Mail, MapPin, MessageCircle, ShieldCheck, Stethoscope, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PostCard, ServiceCard } from "@/components/site/cards";
import { DoctorSection } from "@/components/site/doctor-section";
import { Pill, Section, SectionHeading } from "@/components/site/section";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/site/scroll-reveal";
import { clinic, posts, services, stats } from "@/data/clinic";
import { TestimonialSection } from "@/components/site/testimonial-section";
import heroImage from "@/assets/hero-care.jpg";
import blogCover from "@/assets/blog-cover.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Klinik Harapan Sehat — Klinik Keluarga 24 Jam Jakarta" },
      {
        name: "description",
        content:
          "Klinik Harapan Sehat menyediakan layanan dokter umum, gigi, ibu & anak, laboratorium, dan gawat darurat 24 jam di Jakarta Selatan.",
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

const advantages = [
  {
    icon: Stethoscope,
    title: "Dokter Berpengalaman",
    text: "Tim dokter umum dan spesialis yang siap mendampingi setiap tahap perawatan Anda.",
  },
  {
    icon: ShieldCheck,
    title: "Fasilitas Terstandar",
    text: "Ruang periksa, laboratorium, dan alat medis yang steril serta terkalibrasi rutin.",
  },
  {
    icon: HeartPulse,
    title: "Siaga 24 Jam",
    text: "Layanan gawat darurat dengan ambulans siaga dan rujukan cepat ke rumah sakit mitra.",
  },
];

function HomePage() {
  const servicesRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth * 0.75;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Hero */}
      <div id="atas" className="surface-hero">
        <div className="mx-auto grid max-w-[1440px] items-start gap-8 px-4 pt-2 pb-8 sm:pt-3 sm:pb-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:pt-3 lg:pb-12">
          <ScrollReveal variant="fade-right" distance={30} className="pt-1 sm:pt-2">
            <Pill className="bg-background/80">
              <span className="size-2 rounded-full bg-mint-foreground" />
              LAYANAN MEDIS 24/7
            </Pill>
            <h1 className="mt-4 text-4xl leading-[1.05] font-bold sm:text-5xl lg:text-6xl">
              Selamat datang di
              <span className="block text-primary">Klinik Harapan Sehat</span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              {clinic.name} menghadirkan layanan kesehatan keluarga yang ramah, cepat, dan
              transparan, dengan sistem pembayaran sukarela “Ijab Kabul”. Pasien bisa membayar
              sesuai kemampuannya dan tidak merasa keberatan.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/" hash="doctors">
                  Cari Dokter <UserRound className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/" hash="layanan">Lihat Layanan</Link>
              </Button>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="fade-left" distance={30} delay={0.1} className="relative mx-auto w-full max-w-lg lg:max-w-xl">
            <img
              src={heroImage}
              alt="Perawat mendampingi pasien di ruang perawatan Klinik Harapan Sehat"
              width={1200}
              height={1100}
              className="shadow-float aspect-[1/1] sm:aspect-[4/3.6] max-h-[460px] lg:max-h-[520px] w-full rounded-3xl border border-border bg-card object-cover"
            />
            <div className="shadow-card absolute bottom-5 left-5 sm:bottom-6 sm:left-6 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-mint text-mint-foreground">
                <HeartPulse className="size-5" />
              </span>
              <div>
                <p className="text-lg font-bold">99.8%</p>
                <p className="text-xs text-muted-foreground">Kepuasan pasien</p>
              </div>
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

      {/* Testimonials */}
      <TestimonialSection />

      {/* Advantages */}
      <Section id="about" className="pt-4">
        <ScrollReveal variant="fade-up">
          <SectionHeading
            eyebrow="Mengapa Kami"
            title="Pelayanan yang berpusat pada pasien"
            description="Setiap alur layanan kami dirancang agar Anda merasa didengar, dari pendaftaran hingga konsultasi hasil."
            align="center"
          />
        </ScrollReveal>
        <StaggerContainer staggerChildren={0.1} className="mt-10 grid gap-6 md:grid-cols-3">
          {advantages.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title} className="shadow-card rounded-2xl border border-border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      {/* Services */}
      <Section id="layanan" className="bg-secondary/50">
        <ScrollReveal variant="fade-up">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <SectionHeading
                title="Pusat layanan unggulan"
                description="Klinik Harapan Sehat mendukung perjalanan kesehatan anda dengan layanan yang terpercaya dan penuh perhatian."
              />
            </div>

            <div className="lg:col-span-8 overflow-hidden">
              <div
                ref={servicesRef}
                className="flex gap-6 overflow-x-auto pb-6 pt-2 scroll-smooth snap-x snap-mandatory [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {services.map((service) => (
                  <div key={service.slug} className="w-[280px] sm:w-[320px] lg:w-[340px] shrink-0 snap-start">
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              onClick={() => scrollContainer(servicesRef, "left")}
              aria-label="Scroll Layanan ke Kiri"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              onClick={() => scrollContainer(servicesRef, "right")}
              aria-label="Scroll Layanan ke Kanan"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </ScrollReveal>
      </Section>

      {/* Doctors */}
      <Section id="doctors">
        <ScrollReveal variant="fade-up">
          <SectionHeading
            eyebrow="Dokter"
            title="Tim dokter kami"
            description="Kenali dokter yang akan mendampingi Anda beserta jadwal praktiknya."
            align="center"
          />
        </ScrollReveal>
        <div className="mt-6">
          <DoctorSection />
        </div>
      </Section>


      {/* Blog */}
      <Section id="blog">
        <ScrollReveal variant="fade-up">
          <SectionHeading
            eyebrow="Blog"
            title="Kabar &amp; edukasi terbaru"
            description="Informasi kesehatan praktis dan pembaruan layanan dari klinik kami."
            align="center"
          />

          <div
            ref={postsRef}
            className="mt-10 flex gap-6 overflow-x-auto pb-4 pt-2 scroll-smooth snap-x snap-mandatory [::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {posts.map((post) => (
              <div key={post.slug} className="w-[280px] sm:w-[320px] lg:w-[360px] shrink-0 snap-start">
                <PostCard post={post} cover={blogCover} />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              onClick={() => scrollContainer(postsRef, "left")}
              aria-label="Scroll Blog ke Kiri"
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
              onClick={() => scrollContainer(postsRef, "right")}
              aria-label="Scroll Blog ke Kanan"
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </ScrollReveal>
      </Section>

      {/* Buat Janji */}
      <Section id="buat-janji" className="bg-secondary/50">
        <ScrollReveal variant="zoom-in" distance={15}>
          <div className="surface-hero rounded-3xl border border-border p-8 sm:p-14">
            <SectionHeading
              eyebrow="Buat Janji"
              title="Jadwalkan kunjungan Anda"
              description="Isi formulir berikut dan tim kami akan menghubungi Anda untuk konfirmasi jadwal pada hari yang sama."
              align="center"
            />
            <form className="mx-auto mt-10 max-w-lg space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="nama" className="block text-sm font-medium text-foreground">Nama Lengkap</label>
                  <input id="nama" type="text" placeholder="Budi Santoso" className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label htmlFor="telepon" className="block text-sm font-medium text-foreground">Nomor Telepon</label>
                  <input id="telepon" type="tel" placeholder="08xx-xxxx-xxxx" className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label htmlFor="tanggal" className="block text-sm font-medium text-foreground">Tanggal Kunjungan</label>
                <input id="tanggal" type="date" className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="keluhan" className="block text-sm font-medium text-foreground">Keluhan</label>
                  <input id="keluhan" type="text" placeholder="cth. demam, batuk, nyeri…" className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label htmlFor="poli" className="block text-sm font-medium text-foreground">Poli yang Dituju</label>
                  <select id="poli" className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Pilih poli…</option>
                    <option>Poli Umum</option>
                    <option>Kesehatan Gigi</option>
                    <option>Ibu &amp; Anak</option>
                    <option>Laboratorium</option>
                    <option>Layanan Optik</option>
                    <option>Rawat Inap</option>
                    <option>Gawat Darurat</option>
                  </select>
                </div>
              </div>
              <Button type="submit" size="lg" className="w-full rounded-full">
                Kirim Permintaan <ArrowRight className="size-4" />
              </Button>
            </form>
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
          />
        </ScrollReveal>

        {/* Contact cards + Map */}
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
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
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">WhatsApp</p>
                  <p className="mt-1 font-semibold">{clinic.whatsapp}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Balas cepat dalam jam kerja</p>
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
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">Email</p>
                  <p className="mt-1 font-semibold">{clinic.email}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Kami akan membalas dalam 24 jam</p>
                </div>
              </a>
            </StaggerItem>

            <StaggerItem variant="fade-right">
              <div className="shadow-card rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sosial Media Kami</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Jangan lupa kunjungi sosial media kami — update terbaru, tips kesehatan, dan promo spesial ada di sana!
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
                    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.24 8.24 0 004.84 1.55V6.8a4.85 4.85 0 01-1.07-.11z" />
                    </svg>
                  </a>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Right: Google Maps Embed */}
          <ScrollReveal variant="fade-left" className="overflow-hidden rounded-3xl border border-border shadow-lg">
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
