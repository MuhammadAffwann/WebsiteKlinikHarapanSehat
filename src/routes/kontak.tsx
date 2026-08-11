import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero, Section } from "@/components/site/section";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/site/scroll-reveal";
import { clinic } from "@/data/clinic";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Kontak & Janji Temu — Klinik Harapan Sehat" },
      {
        name: "description",
        content:
          "Hubungi Klinik Harapan Sehat di Jakarta Selatan untuk janji temu, informasi layanan, dan jam operasional.",
      },
      { property: "og:title", content: "Kontak Klinik Harapan Sehat" },
      {
        property: "og:description",
        content: "Alamat, nomor telepon, jam buka, dan formulir janji temu klinik.",
      },
    ],
  }),
  component: KontakPage,
});

function KontakPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Kontak"
        title="Buat janji temu atau tanyakan layanan"
        description="Isi formulir di bawah, atau hubungi kami langsung melalui telepon dan WhatsApp."
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <ScrollReveal variant="fade-right">
            <form
              className="shadow-card space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
                toast.success("Permintaan janji temu terkirim. Kami akan menghubungi Anda.");
                event.currentTarget.reset();
              }}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama lengkap</Label>
                  <Input id="name" name="name" required placeholder="Nama Anda" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor telepon</Label>
                  <Input id="phone" name="phone" type="tel" required placeholder="08xxxxxxxxxx" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="nama@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Keluhan atau pertanyaan</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tuliskan keluhan dan jadwal yang Anda inginkan"
                />
              </div>
              <Button type="submit" size="lg" className="w-full rounded-full sm:w-auto">
                Kirim permintaan
              </Button>
              {submitted && (
                <p className="text-sm text-mint-foreground">
                  Terima kasih, permintaan Anda sudah kami terima.
                </p>
              )}
            </form>
          </ScrollReveal>

          <StaggerContainer staggerChildren={0.1} className="space-y-4">
            <StaggerItem variant="fade-left">
              <InfoRow icon={MapPin} title="Alamat" lines={[clinic.address]} />
            </StaggerItem>
            <StaggerItem variant="fade-left">
              <InfoRow
                icon={Phone}
                title="Telepon & WhatsApp"
                lines={[clinic.phone, clinic.whatsapp]}
              />
            </StaggerItem>
            <StaggerItem variant="fade-left">
              <InfoRow icon={Mail} title="Email" lines={[clinic.email]} />
            </StaggerItem>
            <StaggerItem variant="fade-left">
              <InfoRow
                icon={Clock}
                title="Jam operasional"
                lines={clinic.hours.map((hour) => `${hour.day}: ${hour.time}`)}
              />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </Section>
    </>
  );
}

function InfoRow({
  icon: Icon,
  title,
  lines,
}: {
  icon: typeof MapPin;
  title: string;
  lines: string[];
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-card p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {lines.map((line) => (
          <p key={line} className="mt-1 text-sm text-muted-foreground">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
