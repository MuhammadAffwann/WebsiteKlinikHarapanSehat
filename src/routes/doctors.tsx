import { createFileRoute } from "@tanstack/react-router";

import { DoctorCard } from "@/components/site/cards";
import { PageHero, Section } from "@/components/site/section";
import { StaggerContainer, StaggerItem } from "@/components/site/scroll-reveal";
import { doctors } from "@/data/clinic";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Tim Dokter — Klinik Harapan Sehat" },
      {
        name: "description",
        content:
          "Kenali dokter umum dan spesialis Klinik Harapan Sehat beserta jadwal praktik harian mereka.",
      },
      { property: "og:title", content: "Tim Dokter Klinik Harapan Sehat" },
      {
        property: "og:description",
        content: "Dokter umum, kandungan, dan spesialis anak dengan jadwal praktik lengkap.",
      },
    ],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Doctors"
        title="Dokter yang siap mendampingi Anda"
        description="Pilih dokter sesuai kebutuhan dan jadwal Anda, lalu buat janji lewat halaman kontak."
      />
      <Section>
        <StaggerContainer staggerChildren={0.06} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {doctors.map((doctor) => (
            <StaggerItem key={doctor.slug}>
              <DoctorCard doctor={doctor} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Section>
    </>
  );
}
