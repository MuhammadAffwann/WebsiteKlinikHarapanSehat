import { Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/site/section";
import { ScrollReveal } from "@/components/site/scroll-reveal";

// ============================================================================
// DATA TESTIMONI PASIEN
// Catatan untuk Avatar (avatarUrl):
// - Nilai "PLACEHOLDER" akan otomatis menampilkan foto avatar default dari ui-avatars.com.
// - Jika Anda ingin mengganti foto profil pasien, silakan ganti string "PLACEHOLDER"
//   dengan link/URL foto yang valid (contoh: avatarUrl: "https://domainanda.com/foto-pasien.jpg").
// ============================================================================

export interface TestimonialItem {
  name: string;
  rating: number;
  avatarUrl: string; // PLACEHOLDER — ganti manual dengan link gambar jika ada
  text: string;
}

const testimonials: TestimonialItem[] = [
  {
    name: "Ahmad Muyasar",
    rating: 5,
    avatarUrl: "PLACEHOLDER", // <-- Ganti "PLACEHOLDER" dengan link foto jika ada
    text: "Tempatnya nyaman, dokter sama perawatnya baik2 attitude nya juga bagus pada ramah sangat dijaga demi kenyamanan pasien. Mau umum atau pasien BPJS gak dibedain pelayanannya sama. Best banget pokoknya 👍👍👍",
  },
  {
    name: "Chen Dhani",
    rating: 5,
    avatarUrl: "PLACEHOLDER", // <-- Ganti "PLACEHOLDER" dengan link foto jika ada
    text: "Alhamdulillah ya Allah telah lahir anak kami pada hari ini tepatnya tanggal 2 Agustus 2026 terima kasih BD Annisa terima kasih Harapan Sehat, sudah memberikan pelayanan dan tindakan begitu cepat, sehingga kami merasa nyaman dan aman memilih tempat di Harapan Sehat.",
  },
  {
    name: "Egi Shaa",
    rating: 5,
    avatarUrl: "PLACEHOLDER", // <-- Ganti "PLACEHOLDER" dengan link foto jika ada
    text: "Alhamdulillah ya Allah saya merasa seneng banget ada klinik bisa bayar sesuai kemampuan.. saya berobat sampe di tanya dulu.. mau berapa jadi saya ga takut mau berobat karna bisa sesuai sama saya, sistem ijab kabul ini sangat meringankan",
  },
  {
    name: "Putri Wulandari",
    rating: 5,
    avatarUrl: "PLACEHOLDER", // <-- Ganti "PLACEHOLDER" dengan link foto jika ada
    text: "Pelayanannya best banget, buat Bidan Anisa dan Bidan Anna makasih banyak ya, baik banget sabar banget 😭 best banget deh pelayanan KIA-nya ⭐1000😚🤩",
  },
  {
    name: "Evi Faidah",
    rating: 5,
    avatarUrl: "PLACEHOLDER", // <-- Ganti "PLACEHOLDER" dengan link foto jika ada
    text: "Best banget pelayanan ramah, rekomen banget buat kalian yang mau berobat kesini 🤩🤩 jangan khawatir soal biaya karena ada pengobatan bagi yang kurang mampu 🥰🫰🏻",
  },
];

/** Helper function untuk menghasilkan URL avatar placeholder jika diisi "PLACEHOLDER" atau kosong */
const getAvatarUrl = (avatarUrl: string, name: string): string => {
  if (!avatarUrl || avatarUrl === "PLACEHOLDER") {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&bold=true&rounded=true`;
  }
  return avatarUrl;
};

export function TestimonialSection() {
  // Melakukan duplikasi data testimoni agar marquee berjalan seamless tanpa efek terputus (infinite loop)
  const marqueeItems = [...testimonials, ...testimonials];

  return (
    <Section id="testimoni" className="bg-white overflow-hidden py-12 sm:py-16">
      <ScrollReveal variant="fade-up">
        <SectionHeading
          eyebrow="Testimoni"
          title="Cerita & Pengalaman Pasien"
          description="Kepuasan dan kenyamanan pasien adalah kebanggaan utama Klinik Harapan Sehat."
          align="center"
        />
      </ScrollReveal>

      {/* Marquee Wrapper: Menyediakan efek shadow fade di pinggir & pause saat hover */}
      <div className="group relative mt-10 w-full overflow-hidden marquee-gradient-mask py-4">
        <div className="animate-marquee-continuous flex items-stretch gap-6">
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="w-[300px] sm:w-[360px] md:w-[400px] shrink-0 rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header Card: Foto profil di kiri atas + Nama & Bintang */}
                <div className="flex items-center gap-3.5">
                  <img
                    src={getAvatarUrl(item.avatarUrl, item.name)}
                    alt={`Foto profil ${item.name}`}
                    className="size-12 rounded-full object-cover border border-border/80 shadow-xs shrink-0 bg-muted"
                    onError={(e) => {
                      // Fallback otomatis jika gambar yang diberikan gagal dimuat
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0284c7&color=fff&bold=true&rounded=true`;
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-foreground text-base leading-snug">{item.name}</h4>
                    {/* Icon Bintang Gold / Kuning */}
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Isi Ulasan Pasien */}
                <p className="mt-4 text-sm leading-relaxed text-foreground/85 whitespace-normal break-words">
                  "{item.text}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
