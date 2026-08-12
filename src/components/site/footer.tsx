import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";

import { BrandLogo } from "@/components/site/logo";
import { clinic, services } from "@/data/clinic";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-6 lg:px-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center">
            <BrandLogo />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Klinik keluarga dengan layanan dokter umum, gigi, ibu & anak, laboratorium, dan gawat
            darurat 24 jam di Cianjur.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Layanan</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {services.map((service) => (
              <li key={service.slug}>
                <Link to="/layanan" className="transition-colors hover:text-primary">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Kontak</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{clinic.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <a href={`tel:${clinic.phone}`} className="hover:text-primary">
                {clinic.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <a href={`mailto:${clinic.email}`} className="hover:text-primary">
                {clinic.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {clinic.name}. Seluruh hak cipta dilindungi.
      </div>
    </footer>
  );
}
