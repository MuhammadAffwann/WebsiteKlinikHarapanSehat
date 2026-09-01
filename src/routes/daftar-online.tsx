import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarCheck,
  UserPlus,
  UserCheck,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Printer,
  AlertCircle,
  FileText,
  MessageCircle,
  Loader2,
  Info,
  ExternalLink,
} from "lucide-react";

import { clinic } from "@/data/clinic";
import type { Doctor, Service } from "@/db/schema";
import { getPublicServicesFn } from "@/lib/services";
import { getPublicDoctorsFn } from "@/lib/doctors";
import { createRegistrationFn } from "@/lib/registrations";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/site/section";
import { ScrollReveal } from "@/components/site/scroll-reveal";

type DaftarOnlineSearch = {
  poli?: string | undefined;
  dokter?: string | undefined;
};

export const Route = createFileRoute("/daftar-online")({
  validateSearch: (search: Record<string, unknown>): DaftarOnlineSearch => {
    const rawPoli = search["poli"];
    const rawDokter = search["dokter"];
    return {
      poli: typeof rawPoli === "string" ? rawPoli : undefined,
      dokter: typeof rawDokter === "string" ? rawDokter : undefined,
    };
  },
  loader: async () => {
    try {
      const [servicesRes, doctorsRes] = await Promise.all([
        getPublicServicesFn(),
        getPublicDoctorsFn(),
      ]);
      return {
        services: servicesRes.data || [],
        doctors: doctorsRes.data || [],
      };
    } catch {
      return {
        services: [],
        doctors: [],
      };
    }
  },
  head: () => ({
    meta: [
      { title: "Pendaftaran Online — Klinik Harapan Sehat" },
      {
        name: "description",
        content:
          "Formulir pendaftaran pasien online Klinik Harapan Sehat untuk Pasien Baru & Pasien Lama (BPJS & Non-BPJS/Umum).",
      },
      { property: "og:title", content: "Pendaftaran Online — Klinik Harapan Sehat" },
      {
        property: "og:description",
        content: "Daftar antrean dokter secara online dengan cepat dan praktis.",
      },
    ],
  }),
  component: DaftarOnlinePage,
});

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;

function coveredDays(daysStr: string): number[] {
  const dayTokens = daysStr
    .split(/,|(?:\sdan\s)/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const DAY_MAP: Record<string, number> = {
    Minggu: 0,
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
  };

  const resultSet = new Set<number>();

  for (const token of dayTokens) {
    if (token.includes("–") || token.includes("-")) {
      const parts = token.split(/\s*[–-]\s*/);
      const startDay = parts[0]?.trim();
      const endDay = parts[1]?.trim();

      const startIdx = DAY_MAP[startDay ?? ""] ?? -1;
      if (startIdx !== -1) {
        if (!endDay) {
          resultSet.add(startIdx);
        } else {
          const endIdx = DAY_MAP[endDay] ?? -1;
          if (endIdx !== -1) {
            let idx = startIdx;
            let safety = 0;
            while (safety++ < 8) {
              resultSet.add(idx);
              if (idx === endIdx) break;
              idx = (idx + 1) % 7;
            }
          }
        }
      }
    } else {
      const idx = DAY_MAP[token] ?? -1;
      if (idx !== -1) resultSet.add(idx);
    }
  }

  return Array.from(resultSet);
}

function getAvailableDoctors(poli: string, dateStr: string, doctorsList: Doctor[]): Doctor[] {
  let filtered = doctorsList;

  if (poli === "Kesehatan Gigi") {
    filtered = filtered.filter((doc) => doc.specialty === "Dokter Gigi");
  } else if (poli) {
    filtered = filtered.filter((doc) => doc.specialty === "Dokter Umum");
  }

  if (dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    const dayIdx = date.getDay();
    filtered = filtered.filter((doc) => coveredDays(doc.days).includes(dayIdx));
  }

  return filtered;
}

type RegistrationResult = {
  queueCode: string;
  patientType: "Baru" | "Lama";
  nama: string;
  namaAyah?: string | undefined;
  alamat?: string | undefined;
  noRm?: string | undefined;
  noTelp: string;
  tanggalKunjungan: string;
  dayName: string;
  poli: string;
  dokter: string;
  pembayaran: "BPJS" | "Non-BPJS";
  noBpjs?: string | undefined;
  nik?: string | undefined;
  keluhan?: string | undefined;
  waktuPendaftaran: string;
};

function DaftarOnlinePage() {
  const { services, doctors } = Route.useLoaderData();
  const search = Route.useSearch();
  const [patientType, setPatientType] = useState<"Baru" | "Lama" | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<"BPJS" | "Non-BPJS">("Non-BPJS");

  const handleSelectPatientType = (type: "Baru" | "Lama") => {
    if (patientType === type) return;
    setIsLoadingForm(true);
    setPatientType(type);
    setTimeout(() => {
      setIsLoadingForm(false);
    }, 350);
  };

  // Form states
  const todayStr = new Date().toISOString().split("T")[0];
  const [tanggalKunjungan, setTanggalKunjungan] = useState<string>(todayStr || "");

  const initialPoli = useMemo(() => {
    if (search.poli) {
      const matched = services.find(
        (s) =>
          s.title.toLowerCase() === search.poli?.toLowerCase() ||
          s.slug.toLowerCase() === search.poli?.toLowerCase(),
      );
      return matched ? matched.title : search.poli;
    }
    if (search.dokter) {
      const matchedDoc = doctors.find((d) => d.slug === search.dokter);
      if (matchedDoc) {
        return matchedDoc.specialty === "Dokter Gigi" ? "Kesehatan Gigi" : "Poli Umum";
      }
    }
    return "";
  }, [search.poli, search.dokter, services, doctors]);

  const [jenisPoli, setJenisPoli] = useState<string>(initialPoli);
  const [selectedDokter, setSelectedDokter] = useState<string>(search.dokter || "");

  useEffect(() => {
    if (search.poli) {
      const matched = services.find(
        (s) =>
          s.title.toLowerCase() === search.poli?.toLowerCase() ||
          s.slug.toLowerCase() === search.poli?.toLowerCase(),
      );
      if (matched) setJenisPoli(matched.title);
    }
  }, [search.poli, services]);

  useEffect(() => {
    if (search.dokter) {
      setSelectedDokter(search.dokter);
      const matchedDoc = doctors.find((d) => d.slug === search.dokter);
      if (matchedDoc) {
        setJenisPoli(matchedDoc.specialty === "Dokter Gigi" ? "Kesehatan Gigi" : "Poli Umum");
      }
    }
  }, [search.dokter, doctors]);

  const [namaLengkap, setNamaLengkap] = useState("");
  const [namaAyah, setNamaAyah] = useState("");
  const [alamat, setAlamat] = useState("");
  const [noRm, setNoRm] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [keluhan, setKeluhan] = useState("");

  const [noBpjs, setNoBpjs] = useState("");
  const [nik, setNik] = useState("");

  const [ticketResult, setTicketResult] = useState<RegistrationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Available doctors based on chosen Poli & Date
  const availableDoctors = useMemo(() => {
    return getAvailableDoctors(jenisPoli, tanggalKunjungan, doctors);
  }, [jenisPoli, tanggalKunjungan, doctors]);

  const selectedDayName = useMemo(() => {
    if (!tanggalKunjungan) return "";
    const d = new Date(tanggalKunjungan + "T00:00:00");
    return DAY_NAMES[d.getDay()] || "";
  }, [tanggalKunjungan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientType) return;
    setSubmitError(null);

    const dokterObj = doctors.find((d) => d.slug === selectedDokter) || availableDoctors[0];
    const dokterName = dokterObj
      ? `${dokterObj.name} (${dokterObj.time})`
      : "Dokter Tugas Hari Ini";

    setIsSubmitting(true);

    try {
      const res = await createRegistrationFn({
        data: {
          patientName: namaLengkap,
          fatherName: patientType === "Baru" ? namaAyah : "-",
          phone: noTelp,
          service: jenisPoli,
          doctor: dokterName,
          visitDate: tanggalKunjungan,
          complaint: keluhan.trim() || "-",
          paymentType,
          patientType,
          address: patientType === "Baru" ? alamat : null,
          medicalRecordNo: patientType === "Lama" ? noRm : null,
        },
      });

      if (!res.success || !res.data) {
        setSubmitError("Gagal menyimpan pendaftaran. Silakan coba kembali.");
        setIsSubmitting(false);
        return;
      }

      const saved = res.data;

      const result: RegistrationResult = {
        queueCode: saved.queueCode,
        patientType,
        nama: namaLengkap,
        namaAyah: patientType === "Baru" ? namaAyah : undefined,
        alamat: patientType === "Baru" ? alamat : undefined,
        noRm: patientType === "Lama" ? noRm : undefined,
        noTelp,
        tanggalKunjungan,
        dayName: selectedDayName,
        poli: jenisPoli,
        dokter: dokterName,
        pembayaran: paymentType,
        noBpjs: paymentType === "BPJS" ? noBpjs : undefined,
        nik: nik || undefined,
        keluhan: keluhan.trim() || undefined,
        waktuPendaftaran: new Date().toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      };

      setTicketResult(result);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pendaftaran online."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const resetForm = () => {
    setTicketResult(null);
    setPatientType(null);
    setNamaLengkap("");
    setNamaAyah("");
    setAlamat("");
    setNoRm("");
    setTanggalLahir("");
    setNoTelp("");
    setNoBpjs("");
    setNik("");
    setKeluhan("");
  };

  return (
    <>
      <Section className="pt-6 pb-12 sm:pt-8">
        <ScrollReveal variant="fade-up">
          {/* Main Card */}
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            {/* Question Header: Apakah sudah pernah daftar sebelumnya? */}
            <div className="border-b border-border bg-muted/30 p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
                Kategori Pendaftaran Pasien
              </p>
              <h2 className="text-base sm:text-lg font-bold text-foreground mb-1.5">
                Apakah Anda sudah pernah mendaftar / berobat di Klinik Harapan Sehat sebelumnya?
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Pilih <strong className="text-foreground">Ya</strong> jika sudah pernah berobat di Klinik Harapan Sehat, atau pilih <strong className="text-foreground">Tidak</strong> jika ini kunjungan pertama Anda.
              </p>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Opsi YA -> Pasien Lama */}
                <button
                  type="button"
                  onClick={() => handleSelectPatientType("Lama")}
                  className={`group relative flex flex-col sm:flex-row items-center sm:items-start gap-2.5 sm:gap-3 rounded-2xl border p-3.5 sm:p-4 text-center sm:text-left transition-all ${
                    patientType === "Lama"
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <div
                    className={`flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl font-bold transition-colors ${
                      patientType === "Lama"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }`}
                  >
                    <UserCheck className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-foreground">Ya</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          patientType === "Lama"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        Pasien Lama
                      </span>
                    </div>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground leading-tight">
                      Sudah pernah berobat
                    </span>
                  </div>
                </button>

                {/* Opsi TIDAK -> Pasien Baru */}
                <button
                  type="button"
                  onClick={() => handleSelectPatientType("Baru")}
                  className={`group relative flex flex-col sm:flex-row items-center sm:items-start gap-2.5 sm:gap-3 rounded-2xl border p-3.5 sm:p-4 text-center sm:text-left transition-all ${
                    patientType === "Baru"
                      ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <div
                    className={`flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl font-bold transition-colors ${
                      patientType === "Baru"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }`}
                  >
                    <UserPlus className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap">
                      <span className="text-sm sm:text-base font-bold text-foreground">Tidak</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          patientType === "Baru"
                            ? "bg-primary/20 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        Pasien Baru
                      </span>
                    </div>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground leading-tight">
                      Kunjungan pertama
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Form state handling */}
            {patientType === null ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center text-muted-foreground bg-muted/5 border-t border-border">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3.5 shadow-sm">
                  <FileText className="size-7" />
                </div>
                <h4 className="text-base font-bold text-foreground">Pilih Kategori Pasien</h4>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm leading-relaxed">
                  Silakan pilih opsi <strong className="text-foreground font-semibold">Ya</strong> atau <strong className="text-foreground font-semibold">Tidak</strong> di atas untuk memuat formulir pendaftaran yang sesuai.
                </p>
              </div>
            ) : isLoadingForm ? (
              <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center border-t border-border animate-in fade-in duration-300">
                <Loader2 className="size-8 animate-spin text-primary mb-3" />
                <p className="text-sm font-bold text-foreground">Menyiapkan formulir pendaftaran...</p>
                <p className="text-xs text-muted-foreground mt-0.5">Mohon tunggu sebentar</p>
              </div>
            ) : (
              /* Form content */
              <div className="p-6 sm:p-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6 flex items-center gap-3 rounded-2xl bg-primary/5 p-4 border border-primary/10">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      Formulir Pendaftaran {patientType === "Lama" ? "Pasien Lama" : "Pasien Baru"}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {patientType === "Lama"
                        ? "Silakan lengkapi Nomor Rekam Medis (RM) / NIK dan jadwal kunjungan Anda."
                        : "Lengkapi data identitas pertama kali untuk mendapatkan Nomor Rekam Medis (RM)."}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Section 1: Data Identitas Pasien */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                      <FileText className="size-4" /> Data Identitas Pasien
                    </h4>

                  {patientType === "Baru" ? (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="namaLengkap"
                            className="block text-xs font-semibold text-foreground mb-1.5"
                          >
                            Nama Lengkap Pasien *
                          </label>
                          <input
                            id="namaLengkap"
                            type="text"
                            required
                            placeholder="Sesuai KTP / KK"
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="namaAyah"
                            className="block text-xs font-semibold text-foreground mb-1.5"
                          >
                            Nama Ayah Kandung *
                          </label>
                          <input
                            id="namaAyah"
                            type="text"
                            required
                            placeholder="Nama ayah kandung pasien"
                            value={namaAyah}
                            onChange={(e) => setNamaAyah(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="alamat"
                          className="block text-xs font-semibold text-foreground mb-1.5"
                        >
                          Alamat Lengkap *
                        </label>
                        <textarea
                          id="alamat"
                          rows={2}
                          required
                          placeholder="Jl. Raya / Kampung, RT/RW, Desa/Kelurahan, Kecamatan"
                          value={alamat}
                          onChange={(e) => setAlamat(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="noRm"
                            className="block text-xs font-semibold text-foreground mb-1.5"
                          >
                            No. Rekam Medis (RM) / NIK / BPJS *
                          </label>
                          <input
                            id="noRm"
                            type="text"
                            required
                            placeholder="cth. RM-089123 / 3203xxxx"
                            value={noRm}
                            onChange={(e) => setNoRm(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="namaLengkapLama"
                            className="block text-xs font-semibold text-foreground mb-1.5"
                          >
                            Nama Lengkap Pasien *
                          </label>
                          <input
                            id="namaLengkapLama"
                            type="text"
                            required
                            placeholder="Sesuai kartu berobat"
                            value={namaLengkap}
                            onChange={(e) => setNamaLengkap(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="tanggalLahir"
                          className="block text-xs font-semibold text-foreground mb-1.5"
                        >
                          Tanggal Lahir Pasien *
                        </label>
                        <input
                          id="tanggalLahir"
                          type="date"
                          required
                          value={tanggalLahir}
                          onChange={(e) => setTanggalLahir(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label
                      htmlFor="noTelp"
                      className="block text-xs font-semibold text-foreground mb-1.5"
                    >
                      Nomor Telepon / WhatsApp Aktif *
                    </label>
                    <input
                      id="noTelp"
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                      value={noTelp}
                      onChange={(e) => setNoTelp(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="h-px bg-border my-4" />

                {/* Section 2: Jadwal & Poli */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                    <CalendarCheck className="size-4" /> Rencana Kunjungan & Poli
                  </h4>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="tanggalKunjungan"
                        className="block text-xs font-semibold text-foreground mb-1.5"
                      >
                        Tanggal Kunjungan *
                      </label>
                      <input
                        id="tanggalKunjungan"
                        type="date"
                        min={todayStr}
                        required
                        value={tanggalKunjungan}
                        onChange={(e) => setTanggalKunjungan(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                      {selectedDayName && (
                        <p className="mt-1 text-[11px] font-medium text-emerald-600">
                          Hari {selectedDayName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="jenisPoli"
                        className="block text-xs font-semibold text-foreground mb-1.5"
                      >
                        Jenis Poli *
                      </label>
                      <select
                        id="jenisPoli"
                        required
                        value={jenisPoli}
                        onChange={(e) => {
                          setJenisPoli(e.target.value);
                          setSelectedDokter("");
                        }}
                        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">-- Pilih Jenis Poli --</option>
                        {services.map((svc) => (
                          <option key={svc.slug} value={svc.title}>
                            {svc.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Doctor Schedule dropdown */}
                  <div>
                    <label
                      htmlFor="jadwalDokter"
                      className="block text-xs font-semibold text-foreground mb-1.5"
                    >
                      Dokter & Jadwal Praktik {selectedDayName ? `(${selectedDayName})` : ""} *
                    </label>
                    {!jenisPoli ? (
                      <div className="flex items-center gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground border border-border">
                        <AlertCircle className="size-4 shrink-0 text-primary" />
                        <span>
                          Silakan pilih <strong>Jenis Poli</strong> terlebih dahulu untuk melihat
                          daftar dokter & jadwal praktik.
                        </span>
                      </div>
                    ) : availableDoctors.length > 0 ? (
                      <select
                        id="jadwalDokter"
                        required
                        value={selectedDokter}
                        onChange={(e) => setSelectedDokter(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">-- Pilih Dokter Praktik ({selectedDayName}) --</option>
                        {availableDoctors.map((doc) => (
                          <option key={doc.slug} value={doc.slug}>
                            {doc.name} — ({doc.time})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>
                          Tidak ada jadwal praktik untuk <strong>{jenisPoli}</strong> pada hari{" "}
                          <strong>{selectedDayName}</strong>. Silakan pilih tanggal kunjungan lain.
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="keluhan"
                      className="block text-xs font-semibold text-foreground mb-1.5"
                    >
                      Keluhan / Gejala Utama (Opsional)
                    </label>
                    <textarea
                      id="keluhan"
                      rows={2}
                      placeholder="Contoh: Demam tinggi 2 hari, batuk berdahak, nyeri lambung, dll."
                      value={keluhan}
                      onChange={(e) => setKeluhan(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="h-px bg-border my-4" />

                {/* Section 3: Pembayaran (BPJS / Non-BPJS) */}
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                    <CreditCard className="size-4" /> Metode Pembayaran & Identitas Medis
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                        paymentType === "Non-BPJS"
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-input bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value="Non-BPJS"
                        checked={paymentType === "Non-BPJS"}
                        onChange={() => setPaymentType("Non-BPJS")}
                        className="sr-only"
                      />
                      <span>Non-BPJS / Umum</span>
                    </label>

                    <label
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border p-4 text-center transition-all ${
                        paymentType === "BPJS"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700 font-bold shadow-sm"
                          : "border-input bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentType"
                        value="BPJS"
                        checked={paymentType === "BPJS"}
                        onChange={() => setPaymentType("BPJS")}
                        className="sr-only"
                      />
                      <ShieldCheck className="size-4 text-emerald-600" />
                      <span>BPJS Kesehatan</span>
                    </label>
                  </div>

                  {paymentType === "BPJS" ? (
                    <div className="rounded-2xl bg-emerald-500/10 p-4 sm:p-5 border border-emerald-500/30">
                      <div className="flex items-start gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm mt-0.5">
                          <ShieldCheck className="size-5" />
                        </div>
                        <div className="text-xs sm:text-sm leading-relaxed text-foreground space-y-2">
                          <p className="font-bold text-emerald-800 dark:text-emerald-300">
                            Himbauan Pendaftaran Pasien BPJS Kesehatan
                          </p>
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            Bagi pasien BPJS Kesehatan, disarankan untuk melakukan pendaftaran antrean dan memastikan status kepesertaan BPJS Anda aktif melalui aplikasi <strong>Mobile JKN</strong> sebelum berkunjung ke klinik.
                          </p>
                          <div className="pt-1">
                            <a
                              href="https://play.google.com/store/apps/details?id=app.bpjs.mobile&hl=id"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-700 shadow-xs"
                            >
                              <span>Buka / Unduh Aplikasi Mobile JKN</span>
                              <ExternalLink className="size-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-muted/40 p-4 border border-border">
                      <label
                        htmlFor="nikUmum"
                        className="block text-xs font-semibold text-foreground mb-1.5"
                      >
                        NIK (Nomor Induk Kependudukan) *
                      </label>
                      <input
                        id="nikUmum"
                        type="text"
                        required
                        maxLength={16}
                        placeholder="16 Digit NIK KTP Pasien"
                        value={nik}
                        onChange={(e) => setNik(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs sm:text-sm font-medium text-red-800 dark:text-red-300">
                    <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                    <span>{submitError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="mt-6 w-full rounded-full bg-primary py-6 text-base font-bold shadow-lg hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-5 animate-spin" />
                      Memproses Pendaftaran...
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="mr-2 size-5" />
                      Kirim Pendaftaran Online
                    </>
                  )}
                </Button>
              </form>
            </div>
            )}
          </div>
        </ScrollReveal>
      </Section>

      {/* Ticket Modal / Print View */}
      {ticketResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-background border border-border shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="mt-3 text-xl font-extrabold text-foreground">
                Pendaftaran Online Berhasil!
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Tunjukkan bukti pendaftaran ini kepada petugas administrasi klinik saat kedatangan.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Kode Antrean Digital
                  </p>
                  <p className="text-2xl font-black text-primary tracking-tight">
                    {ticketResult.queueCode}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  Pasien {ticketResult.patientType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Nama Pasien:</p>
                  <p className="font-bold text-foreground">{ticketResult.nama}</p>
                </div>
                {ticketResult.namaAyah && (
                  <div>
                    <p className="text-muted-foreground">Nama Ayah:</p>
                    <p className="font-bold text-foreground">{ticketResult.namaAyah}</p>
                  </div>
                )}
                {ticketResult.noRm && (
                  <div>
                    <p className="text-muted-foreground">No. RM:</p>
                    <p className="font-bold text-foreground">{ticketResult.noRm}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">No. Telp / WA:</p>
                  <p className="font-bold text-foreground">{ticketResult.noTelp}</p>
                </div>
              </div>

              <div className="h-px bg-border" />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Poli Tujuan:</p>
                  <p className="font-bold text-foreground">{ticketResult.poli}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tanggal Kunjungan:</p>
                  <p className="font-bold text-foreground">
                    {ticketResult.dayName}, {ticketResult.tanggalKunjungan}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Dokter & Jadwal:</p>
                <p className="text-xs font-bold text-foreground">{ticketResult.dokter}</p>
              </div>

              {ticketResult.keluhan && (
                <div>
                  <p className="text-xs text-muted-foreground">Keluhan / Gejala:</p>
                  <p className="text-xs font-medium text-foreground bg-background p-2 rounded-lg border border-border mt-0.5">
                    {ticketResult.keluhan}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl bg-background p-2.5 border border-border text-xs">
                <span className="text-muted-foreground">Jenis Pembayaran:</span>
                <span className="font-bold text-primary">{ticketResult.pembayaran}</span>
              </div>
            </div>

            {/* WhatsApp Direct Confirmation Button */}
            {(() => {
              const cleanPhone = clinic.whatsapp.replace(/\D/g, "");
              const waMessage = `Halo Admin Klinik Harapan Sehat, saya telah mendaftar online dengan rincian berikut:

*Kode Antrean:* ${ticketResult.queueCode}
*Nama Pasien:* ${ticketResult.nama}
*Jenis Pasien:* Pasien ${ticketResult.patientType}${ticketResult.namaAyah ? `\n*Nama Ayah:* ${ticketResult.namaAyah}` : ""}${ticketResult.alamat ? `\n*Alamat:* ${ticketResult.alamat}` : ""}${ticketResult.noRm ? `\n*No. RM:* ${ticketResult.noRm}` : ""}
*No. Telp / WA:* ${ticketResult.noTelp}
*Poli Tujuan:* ${ticketResult.poli}
*Dokter:* ${ticketResult.dokter}
*Tanggal Kunjungan:* ${ticketResult.dayName}, ${ticketResult.tanggalKunjungan}
*Jenis Pembayaran:* ${ticketResult.pembayaran}${ticketResult.keluhan ? `\n*Keluhan:* ${ticketResult.keluhan}` : ""}

Mohon konfirmasi pendaftaran saya. Terima kasih.`;

              const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

              return (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition-colors"
                >
                  <MessageCircle className="size-4" />
                  Kirim Bukti via WhatsApp
                </a>
              );
            })()}

            {/* Action buttons */}
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <Button onClick={handlePrint} variant="outline" className="flex-1 rounded-full">
                <Printer className="mr-2 size-4" /> Cetak / Simpan
              </Button>
              <Button onClick={resetForm} variant="secondary" className="flex-1 rounded-full">
                Selesai / Daftar Lagi
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
