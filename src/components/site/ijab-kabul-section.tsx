import { Section } from "@/components/site/section";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { IjabKabulCarousel } from "@/components/site/ijab-kabul-carousel";

export function IjabKabulSection() {
  return (
    <Section id="ijab-kabul" className="bg-[#f6fafa]">
      {/* Centered Two-column layout: text left, carousel right */}
      <div className="mx-auto max-w-5xl grid items-center gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left column: heading + description (centered on mobile, left-aligned on desktop) */}
        <ScrollReveal
          variant="fade-right"
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <h2
            className="text-4xl leading-tight tracking-tight sm:text-5xl text-foreground"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Ijab Kabul
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ijab kabul dalam layanan klinik adalah sistem pembayaran berobat fleksibel di mana
            pasien menyatakan kesanggupan dan membayar biaya pengobatan sesuai dengan kemampuan
            finansial atau keikhlasannya
          </p>
        </ScrollReveal>

        {/* Right column: carousel centered */}
        <ScrollReveal variant="fade-left" delay={0.1} className="flex justify-center">
          <div className="w-full max-w-[320px] sm:max-w-[360px] md:max-w-[380px]">
            <IjabKabulCarousel />
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}
