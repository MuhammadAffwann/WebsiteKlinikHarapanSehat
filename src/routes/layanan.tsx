import { createFileRoute } from "@tanstack/react-router";

import { ServiceCard } from "@/components/site/cards";
import { PageHero, Section } from "@/components/site/section";
import { StaggerContainer, StaggerItem } from "@/components/site/scroll-reveal";
import { getPublicServicesFn } from "@/lib/services";
import hsBackground from "@/assets/hsbackground.png";

export const Route = createFileRoute("/layanan")({
  loader: async () => {
    try {
      const res = await getPublicServicesFn();
      return { services: res.data || [] };
    } catch {
      return { services: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Layanan Klinik — Klinik Harapan Sehat" },
      {
        name: "description",
        content:
          "Daftar layanan Klinik Harapan Sehat: poli umum, kesehatan gigi, ibu & anak, laboratorium, optik, rawat inap, dan gawat darurat 24 jam.",
      },
      { property: "og:title", content: "Layanan Klinik Harapan Sehat" },
      {
        property: "og:description",
        content:
          "Poli umum, gigi, ibu & anak, laboratorium, optik, rawat inap, dan gawat darurat 24 jam.",
      },
    ],
  }),
  component: LayananPage,
});

function LayananPage() {
  const { services } = Route.useLoaderData();

  return (
    <>
      <PageHero
        backgroundImage={hsBackground}
        title="Layanan lengkap untuk seluruh keluarga"
        description="Semua layanan ditangani tenaga medis berlisensi dengan biaya yang diinformasikan di awal."
      />
      <Section>
        <StaggerContainer
          staggerChildren={0.08}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <StaggerItem key={service.slug}>
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>
    </>
  );
}
