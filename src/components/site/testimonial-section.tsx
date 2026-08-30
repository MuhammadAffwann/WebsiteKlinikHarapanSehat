"use client";

import { Quote, Star } from "lucide-react";
import { Section } from "@/components/site/section";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import type { Testimonial } from "@/db/schema";

export interface TestimonialItem {
  name: string;
  rating: number;
  avatarUrl: string;
  text: string;
  timeLabel?: string;
}

const defaultTestimonials: TestimonialItem[] = [
  {
    name: "Ahmad Muyasar",
    rating: 5,
    avatarUrl: "PLACEHOLDER",
    text: "Tempatnya nyaman, dokter sama perawatnya baik2 attitude nya juga bagus pada ramah sangat dijaga demi kenyamanan pasien. Mau umum atau pasien BPJS gak dibedain pelayanannya sama. Best banget pokoknya 👍👍👍",
    timeLabel: "2 bulan lalu",
  },
  {
    name: "Chen Dhani",
    rating: 5,
    avatarUrl: "PLACEHOLDER",
    text: "Alhamdulillah ya Allah telah lahir anak kami pada hari ini tepatnya tanggal 2 Agustus 2026 terima kasih BD Annisa terima kasih Harapan Sehat, sudah memberikan pelayanan dan tindakan begitu cepat, sehingga kami merasa nyaman dan aman memilih tempat di Harapan Sehat.",
    timeLabel: "1 bulan lalu",
  },
  {
    name: "Egi Shaa",
    rating: 5,
    avatarUrl: "PLACEHOLDER",
    text: "Alhamdulillah ya Allah saya merasa seneng banget ada klinik bisa bayar sesuai kemampuan.. saya berobat sampe di tanya dulu.. mau berapa jadi saya ga takut mau berobat karna bisa sesuai sama saya, sistem ijab kabul ini sangat meringankan",
    timeLabel: "3 bulan lalu",
  },
  {
    name: "Putri Wulandari",
    rating: 5,
    avatarUrl: "PLACEHOLDER",
    text: "Pelayanannya best banget, buat Bidan Anisa dan Bidan Anna makasih banyak ya, baik banget sabar banget 😭 best banget deh pelayanan KIA-nya ⭐1000😚🤩",
    timeLabel: "2 bulan lalu",
  },
  {
    name: "Evi Faidah",
    rating: 5,
    avatarUrl: "PLACEHOLDER",
    text: "Best banget pelayanan ramah, rekomen banget buat kalian yang mau berobat kesini 🤩🤩 jangan khawatir soal biaya karena ada pengobatan bagi yang kurang mampu 🥰🫰🏻",
    timeLabel: "4 bulan lalu",
  },
];

/** Helper function untuk menghasilkan URL avatar placeholder jika diisi "PLACEHOLDER" atau kosong */
const getAvatarUrl = (avatarUrl: string | null | undefined, name: string): string => {
  if (!avatarUrl || avatarUrl === "PLACEHOLDER") {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&bold=true&rounded=true`;
  }
  return avatarUrl;
};

export function TestimonialSection({ testimonials: dbTestimonials }: { testimonials?: Testimonial[] }) {
  const activeItems: TestimonialItem[] =
    dbTestimonials && dbTestimonials.length > 0
      ? dbTestimonials.map((t) => ({
          name: t.name,
          rating: t.rating ?? 5,
          avatarUrl: t.photo || "PLACEHOLDER",
          text: t.message,
        }))
      : defaultTestimonials;

  // Duplicate for seamless infinite loop
  const marqueeItems = [...activeItems, ...activeItems];

  return (
    <Section id="testimoni" className="bg-[#f7fbfa] py-12 sm:py-16 overflow-hidden">
      {/* ── Top: centered heading ── */}
      <ScrollReveal variant="fade-up">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl xl:text-[2.6rem] leading-tight text-foreground font-normal">
            Baca cerita <br /> dan pengalaman mereka
          </h2>
        </div>
      </ScrollReveal>

      {/* ── Bottom: left label + right marquee ── */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
        {/* Left column */}
        <ScrollReveal variant="fade-right" className="lg:w-[300px] xl:w-[340px] shrink-0 flex flex-col gap-4 text-center lg:text-left items-center lg:items-start">
          <h3 className="text-3xl sm:text-4xl text-black font-semibold leading-tight">
            What our customers are saying
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Kepuasan dan kenyamanan pasien adalah kebanggaan utama Klinik Harapan Sehat.
          </p>
        </ScrollReveal>

        {/* Right column: infinite marquee */}
        <ScrollReveal variant="fade-left" className="flex-1 min-w-0 w-full overflow-hidden">
          <div className="marquee-gradient-mask group overflow-hidden">
            <div className="animate-marquee-continuous">
              {marqueeItems.map((item, idx) => (
                <TestimonialCard key={`${item.name}-${idx}`} item={item} />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="relative flex flex-col bg-white rounded-2xl shadow-sm border border-border/60 p-6 transition-shadow duration-300 hover:shadow-md w-[320px] sm:w-[350px] mx-3">
      {/* Testimonial text */}
      <p className="text-sm sm:text-base leading-relaxed text-foreground/80 flex-1 min-h-[100px]">
        &ldquo;{item.text}&rdquo;
      </p>

      {/* Divider */}
      <div className="my-4 border-t border-border/50" />

      {/* Star rating + Profile row */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-1">
          {Array.from({ length: item.rating || 5 }).map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <img
            src={getAvatarUrl(item.avatarUrl, item.name)}
            alt={`Foto profil ${item.name}`}
            className="w-10 h-10 rounded-full object-cover border border-border/80 shrink-0 bg-muted"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0284c7&color=fff&bold=true&rounded=true`;
            }}
          />
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{item.name}</p>
            {item.timeLabel && (
              <p className="text-xs text-muted-foreground mt-0.5">{item.timeLabel}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
