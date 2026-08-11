import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, CalendarDays } from "lucide-react";

import { Pill } from "@/components/site/section";
import svcUmum from "@/assets/svc-umum.jpg";
import svcGigi from "@/assets/svc-gigi.jpg";
import svcIbuAnak from "@/assets/svc-ibu-anak.jpg";
import svcLab from "@/assets/svc-lab.jpg";
import svcOptic from "@/assets/svc-optic.jpg";
import svcRawatInap from "@/assets/svc-rawat-inap.jpg";
import svcDarurat from "@/assets/svc-darurat.jpg";
import type { Doctor, Post, Service } from "@/data/clinic";


/** Ganti file di src/assets untuk memakai foto klinik sendiri. */
const serviceImages = {
  umum: svcUmum,
  gigi: svcGigi,
  ibuAnak: svcIbuAnak,
  lab: svcLab,
  optic: svcOptic,
  rawatInap: svcRawatInap,
  darurat: svcDarurat,
} as const;

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="shadow-card flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-1">
      <img
        src={serviceImages[service.image]}
        alt={service.title}
        loading="lazy"
        width={800}
        height={600}
        className="aspect-[3/2] w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold">{service.title}</h3>
          {service.badge && <Pill>{service.badge}</Pill>}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
        <ul className="mt-5 space-y-2">
          {service.points.map((point) => (
            <li key={point} className="flex items-center gap-2 text-sm text-foreground/80">
              <Check className="size-4 shrink-0 text-primary" />
              {point}
            </li>
          ))}
        </ul>
        <Link
          to="/"
          hash="kontak"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5"
        >
          Buat janji <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}


export function DoctorCard({ doctor }: { doctor: Doctor }) {
  // Derive initials from name (skip "dr." or "drg." prefix)
  const initials = doctor.name
    .replace(/^(drg?|Dr)\.\s*/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Detect if schedule spans overnight (time starts with 00: or 20:)
  const isNight = doctor.time.startsWith("20") || doctor.time.startsWith("00");

  return (
    <article className="shadow-card flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-transform hover:-translate-y-1">
      {/* Top label */}
      <div className="flex items-center gap-1.5 border-b border-border bg-secondary/40 px-5 py-2.5">
        <span className={`size-2 rounded-full ${isNight ? "bg-indigo-400" : "bg-green-400"}`} />
        <span className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          {isNight ? "Shift Malam" : "Praktek Reguler"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Avatar + info */}
        <div className="flex items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="text-lg font-bold tracking-tight">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">{doctor.specialty}</p>
            <h3 className="mt-0.5 text-base font-bold leading-snug">{doctor.name}</h3>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Schedule */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Jadwal Praktik</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
              <CalendarDays className="size-3.5 text-primary" />
              {doctor.days}
            </span>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isNight ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}>
              {doctor.time}
            </span>
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-green-500" />
          Tersedia sesuai jadwal
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border p-4">
        <Link
          to="/"
          hash="buat-janji"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Buat Janji Temu <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}

export function PostCard({ post, cover }: { post: Post; cover: string }) {
  return (
    <article className="shadow-card flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative">
        <img
          src={cover}
          alt={post.title}
          loading="lazy"
          width={1200}
          height={800}
          className="aspect-[3/2] w-full object-cover"
        />
        <span className="absolute top-4 left-4 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold tracking-wide text-primary-foreground uppercase">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs text-muted-foreground">{post.date}</p>
        <h3 className="mt-2 font-serif text-xl leading-snug font-bold">{post.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5"
        >
          Baca selengkapnya <ArrowRight className="size-4" />
        </Link>
      </div>
    </article>
  );
}
