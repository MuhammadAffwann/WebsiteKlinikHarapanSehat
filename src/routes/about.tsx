import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { PageHero, Section, SectionHeading } from "@/components/site/section";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/site/scroll-reveal";
import { clinic, stats } from "@/data/clinic";
import clinicInterior from "@/assets/clinic-interior.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Tentang Kami — Klinik Harapan Sehat" },
      {
        name: "description",
        content:
          "Mengenal Klinik Harapan Sehat: visi, misi, fasilitas, dan komitmen kami dalam melayani kesehatan keluarga di Jakarta Selatan.",
      },
      { property: "og:title", content: "Tentang Klinik Harapan Sehat" },
      {
        property: "og:description",
        content: "Visi, misi, dan fasilitas klinik keluarga Harapan Sehat.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  "Transparansi biaya sebelum tindakan dilakukan",
  "Waktu tunggu singkat dengan pendaftaran online",
  "Rekam medis digital yang aman dan mudah diakses",
  "Edukasi kesehatan di setiap konsultasi",
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Tentang Kami"
        title="Klinik keluarga yang tumbuh bersama warga"
        description={`Sejak 2011, ${clinic.name} melayani warga Jakarta Selatan dengan layanan medis yang terjangkau, ramah, dan berbasis standar mutu.`}
      />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal variant="fade-right">
            <img
              src={clinicInterior}
              alt="Interior lobi Klinik Harapan Sehat"
              loading="lazy"
              width={1400}
              height={1000}
              className="shadow-card aspect-[7/5] w-full rounded-3xl border border-border object-cover"
            />
          </ScrollReveal>
          <ScrollReveal variant="fade-left" delay={0.1}>
            <SectionHeading
              eyebrow="Visi &amp; Misi"
              title="Kesehatan bermutu tanpa harus mahal"
              description="Kami percaya layanan kesehatan dasar yang baik adalah hak setiap keluarga. Karena itu kami menjaga biaya tetap wajar tanpa mengorbankan mutu."
            />
            <ul className="mt-8 space-y-3">
              {values.map((value) => (
                <li key={value} className="flex gap-3 text-sm text-foreground/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {value}
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </Section>

      <Section className="bg-secondary/50">
        <ScrollReveal variant="fade-up">
          <SectionHeading eyebrow="Pencapaian" title="Angka yang kami jaga" align="center" />
        </ScrollReveal>
        <StaggerContainer staggerChildren={0.08} className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="shadow-card rounded-2xl border border-border bg-card p-6 text-center">
                <dt className="text-3xl font-bold text-primary">{stat.value}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>

      <Section>
        <ScrollReveal variant="fade-up">
          <SectionHeading eyebrow="Jam Operasional" title="Kami buka setiap hari" />
        </ScrollReveal>
        <StaggerContainer staggerChildren={0.08} className="mt-8 grid gap-4 sm:grid-cols-3">
          {clinic.hours.map((item) => (
            <StaggerItem key={item.day}>
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-semibold">{item.day}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.time}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>
    </>
  );
}
