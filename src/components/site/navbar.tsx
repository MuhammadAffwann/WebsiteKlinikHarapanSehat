import { useState, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  ArrowRight,
  CalendarCheck,
  Stethoscope,
  SmilePlus,
  Baby,
  FlaskConical,
  Glasses,
  BedDouble,
  Siren,
  ChevronDown,
} from "lucide-react";

import { BrandLogo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import type { Service } from "@/db/schema";

type NavItem = {
  label: string;
  to: "/" | "/dokter" | "/layanan" | "/blog" | "/daftar-online";
  hash?: string;
};

const navItems: NavItem[] = [
  { label: "Home", to: "/", hash: "atas" },
  { label: "Tentang Kami", to: "/", hash: "about" },
  { label: "Layanan", to: "/", hash: "layanan" },
  { label: "Cari Dokter", to: "/dokter" },
  { label: "Ijab Kabul", to: "/", hash: "ijab-kabul" },
  { label: "Blog", to: "/blog" },
];

const serviceIcons: Record<string, React.ElementType> = {
  "poli-umum": Stethoscope,
  "kesehatan-gigi": SmilePlus,
  "ibu-dan-anak": Baby,
  laboratorium: FlaskConical,
  optik: Glasses,
  "rawat-inap": BedDouble,
  "gawat-darurat": Siren,
};

export function Navbar({ services = [] }: { services?: Service[] }) {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMega = useCallback(() => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 150);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Main Navbar */}
      <div className="border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: Brand Logo */}
          <Link to="/" className="flex shrink-0 items-center py-1" onClick={() => setOpen(false)}>
            <BrandLogo />
          </Link>

          {/* Center: Nav Links distributed evenly across available space */}
          <nav className="hidden flex-1 items-center justify-center gap-6 lg:gap-8 xl:gap-10 md:flex">
            {navItems.map((item) =>
              item.label === "Layanan" ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <Link
                    to={item.to}
                    {...(item.hash ? { hash: item.hash } : {})}
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                    <ChevronDown
                      className={`size-3.5 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                    />
                  </Link>

                  {/* Mega dropdown panel */}
                  <div
                    className={`absolute left-1/2 top-full pt-3 -translate-x-1/2 transition-all duration-200 ${
                      megaOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-1 opacity-0"
                    }`}
                  >
                    <div className="w-[680px] rounded-2xl border border-border bg-background p-5 shadow-lg">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Layanan Kami
                        </p>
                        <Link
                          to="/"
                          hash="layanan"
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Lihat semua →
                        </Link>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {services.map((svc) => {
                          const Icon = serviceIcons[svc.slug] ?? Stethoscope;
                          return (
                            <Link
                              key={svc.slug}
                              to="/layanan"
                              hash={svc.slug}
                              className="group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-accent"
                            >
                              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                                <Icon className="size-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">{svc.title}</p>
                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                  {svc.points[0]}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  {...(item.hash ? { hash: item.hash } : {})}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* Right: Action button */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Button asChild size="sm" className="hidden rounded-full font-semibold sm:inline-flex">
              <Link to="/" hash="kontak">
                Hubungi Kami <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="rounded-full md:hidden"
              aria-label={open ? "Tutup menu" : "Buka menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  {...(item.hash ? { hash: item.hash } : {})}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-2">
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link to="/daftar-online" onClick={() => setOpen(false)}>
                <CalendarCheck className="size-4 text-primary" /> Daftar Online
              </Link>
            </Button>
            <Button asChild className="w-full rounded-full">
              <Link to="/" hash="kontak" onClick={() => setOpen(false)}>
                Hubungi Kami <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
