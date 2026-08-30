import { useState } from "react";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Section } from "@/components/site/section";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { cn } from "@/lib/utils";

interface Faq {
  question: string;
  answer: string;
}

const faqs: Faq[] = [
  {
    question:
      "Bagaimana cara kerja sistem pembayaran Ijab Kabul di Klinik Harapan Sehat bagi pasien dengan kemampuan ekonomi yang berbeda?",
    answer:
      "Biaya berobat disesuaikan dengan kondisi pasien: dapat dibayarkan sesuai tagihan standar, disesuaikan dengan kemampuan pasien, atau gratis bagi masyarakat yang kurang mampu.",
  },
  {
    question:
      "Bagaimana mekanisme subsidi silang dan nilai sedekah diterapkan dalam proses pembayaran berobat di klinik ini?",
    answer:
      "Pembayaran dari pasien yang mampu digunakan secara langsung untuk membantu membiayai pasien yang membutuhkan. Dengan begitu, pasien yang membayar tidak hanya berobat, tetapi juga bernilai sedekah yang memberi dampak nyata.",
  },
  {
    question: "Di mana dan bagaimana proses kesepakatan akad Ijab Kabul tersebut disahkan?",
    answer:
      "Kesepakatan dilakukan secara langsung di bagian pendaftaran atau di ruang dokter, kemudian disahkan melalui tanda tangan sebagai bukti persetujuan bersama.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section id="faq">
      <div className="mx-auto max-w-5xl">
        <ScrollReveal variant="fade-up">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_2.2fr] lg:gap-12">
            {/* Left: heading, vertically centered on desktop & centered on mobile */}
            <h3 className="text-xl font-normal text-foreground text-center lg:text-left sm:text-2xl">
              Frequently Asked Question
            </h3>

            {/* Right: accordion list */}
            <div className="divide-y divide-border/80 border-y border-border/80">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div key={index} className="group transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                      className="flex w-full cursor-pointer items-start justify-between gap-4 py-5 text-left transition-colors"
                    >
                      <span className="text-base font-medium text-foreground sm:text-lg leading-snug">
                        {faq.question}
                      </span>
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center text-foreground/70 transition-transform duration-200">
                        <Plus
                          className={cn(
                            "size-5 transition-transform duration-300",
                            isOpen && "rotate-45 text-foreground",
                          )}
                          strokeWidth={2.2}
                        />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="pb-5 text-sm sm:text-base leading-relaxed text-muted-foreground">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}
