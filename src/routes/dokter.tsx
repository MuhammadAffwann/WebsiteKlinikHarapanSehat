import { createFileRoute } from "@tanstack/react-router";

import { DoctorSection } from "@/components/site/doctor-section";
import { PageHero, Section } from "@/components/site/section";
import { getPublicDoctorsFn } from "@/lib/doctors";
import doctorBanner from "@/assets/doctor-banner.jpg";

export const Route = createFileRoute("/dokter")({
  loader: async () => {
    try {
      const res = await getPublicDoctorsFn();
      return { doctors: res.data || [] };
    } catch {
      return { doctors: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "Jadwal & Tim Dokter — Klinik Harapan Sehat" },
      {
        name: "description",
        content:
          "Kenali tim dokter umum dan dokter gigi Klinik Harapan Sehat beserta jadwal praktik lengkap setiap harinya.",
      },
      { property: "og:title", content: "Jadwal & Tim Dokter Klinik Harapan Sehat" },
      {
        property: "og:description",
        content: "Kenali dokter yang akan mendampingi Anda beserta jadwal praktiknya.",
      },
    ],
  }),
  component: DokterPage,
});

function DokterPage() {
  const { doctors } = Route.useLoaderData();

  return (
    <>
      <PageHero
        title="Tim dokter"
        description="Kenali dokter yang siap mendampingi perjalanan kesehatan Anda beserta jadwal praktik setiap harinya."
        backgroundImage={doctorBanner}
      />
      <Section className="pt-8">
        <DoctorSection doctors={doctors} />
      </Section>
    </>
  );
}
