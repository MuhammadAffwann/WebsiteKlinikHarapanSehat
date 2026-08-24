import { useState, useMemo } from "react";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  Check,
  Eye,
  Loader2,
  MessageCircle,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getSessionFn } from "@/lib/auth";
import {
  deleteRegistrationFn,
  getRegistrationsFn,
} from "@/lib/registrations";
import type { Registration } from "@/db/schema";

export const Route = createFileRoute("/dashboardpanel/pendaftaran")({
  head: () => ({
    meta: [{ title: "Kelola Pendaftaran Online — Dashboard Admin" }],
  }),
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (!session.isAuthenticated || !session.user) {
      throw redirect({
        to: "/dashboardpanel/login",
      });
    }
    return { session };
  },
  loader: async () => {
    const res = await getRegistrationsFn();
    return { registrations: res.data };
  },
  component: ManageRegistrationsPage,
});


function formatDate(isoString: string) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function ManageRegistrationsPage() {
  const { session } = Route.useRouteContext();
  const { registrations } = Route.useLoaderData();
  const router = useRouter();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDateMode, setFilterDateMode] = useState<"all" | "today" | "custom">("all");
  const [customDate, setCustomDate] = useState("");
  const [filterService, setFilterService] = useState("all");

  // Detail modal
  const [selectedItem, setSelectedItem] = useState<Registration | null>(null);

  // Loading & Feedback
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Stats
  const totalCount = registrations.length;
  const todayCount = registrations.filter((r) => r.visitDate === todayStr).length;

  const uniqueServices = useMemo(() => {
    return Array.from(new Set(registrations.map((r) => r.service)));
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((item) => {
      const matchesSearch =
        item.queueCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.service.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDate = true;
      if (filterDateMode === "today") {
        matchesDate = item.visitDate === todayStr;
      } else if (filterDateMode === "custom" && customDate) {
        matchesDate = item.visitDate === customDate;
      }

      const matchesService = filterService === "all" || item.service === filterService;

      return matchesSearch && matchesDate && matchesService;
    });
  }, [registrations, searchQuery, filterDateMode, customDate, filterService, todayStr]);


  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteRegistrationFn({ data: { id: deletingId } });
      if (res.success) {
        setSuccessMessage("Data pendaftaran berhasil dihapus.");
        setDeletingId(null);
        await router.invalidate();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal menghapus data pendaftaran.");
    } finally {
      setIsDeleting(false);
    }
  };

  const deletingItem = registrations.find((r) => r.id === deletingId);

  return (
    <DashboardLayout userEmail={session.user.email}>
      <div className="space-y-6">
        {/* Breadcrumb & Title */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Link to="/dashboardpanel" className="hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-foreground">Pendaftaran</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Kelola Antrean &amp; Pendaftaran Pasien
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Pantau antrean pasien online, panggil nomor antrean, konfirmasi kedatangan, dan kelola status periksa.
            </p>
          </div>

          <a
            href="/daftar-online"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            <CalendarCheck className="size-4" />
            <span>Buka Form Pasien ↗</span>
          </a>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-800 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-800 dark:text-red-300 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <Users className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Daftar</p>
                <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                  {totalCount}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-blue-500/30 bg-blue-500/5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Calendar className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 font-bold">Hari Ini</p>
                <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                  {todayCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode antrean, nama pasien, no telp, dokter..."
              className="w-full rounded-xl border border-border/70 bg-background/60 py-2 pl-9 pr-4 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns & Date Quick Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Mode Toggle */}
            <div className="flex items-center rounded-xl border border-border/70 bg-muted/40 p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilterDateMode("all")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterDateMode === "all"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Semua Tgl
              </button>
              <button
                type="button"
                onClick={() => setFilterDateMode("today")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterDateMode === "today"
                    ? "bg-blue-600 text-white font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Hari Ini ({todayCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterDateMode("custom")}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterDateMode === "custom"
                    ? "bg-card text-foreground font-bold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pilih Tgl
              </button>
            </div>

            {/* Custom Date Picker */}
            {filterDateMode === "custom" && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="rounded-xl border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground focus:border-blue-600 focus:outline-hidden"
              />
            )}


            {/* Poli / Service Filter */}
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs font-medium text-foreground focus:border-blue-600 focus:outline-hidden"
            >
              <option value="all">Semua Poli</option>
              {uniqueServices.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Registrations Table Card */}
        <div className="rounded-3xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 min-w-[120px]">Kode Antrean</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Pasien</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Poli &amp; Dokter</th>
                  <th className="py-3.5 px-4 min-w-[120px]">Tgl Kunjungan</th>
                  <th className="py-3.5 pl-4 pr-6 text-center">Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                          <CalendarCheck className="size-6" />
                        </div>
                        <p className="font-semibold text-foreground">Tidak ada pendaftaran yang cocok</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                          {searchQuery || filterDateMode !== "all" || filterService !== "all"
                            ? "Coba ubah kata kunci pencarian atau reset filter."
                            : "Belum ada pasien yang mendaftar online."}
                        </p>
                        {(searchQuery || filterDateMode !== "all" || filterService !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery("");
                              setFilterDateMode("all");
                              setCustomDate("");
                              setFilterService("all");
                            }}
                            className="mt-4 rounded-xl text-xs"
                          >
                            Reset Filter
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((item) => {
                    const isToday = item.visitDate === todayStr;

                    return (
                      <tr
                        key={item.id}
                        className="group transition-colors hover:bg-muted/30"
                      >
                        {/* Queue Code */}
                        <td className="py-4 pl-6 pr-3">
                          <span className="font-mono font-black text-sm text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg">
                            {item.queueCode}
                          </span>
                        </td>

                        {/* Patient */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-foreground leading-snug">{item.patientName}</p>
                            {item.patientType && (
                              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                item.patientType === "Baru"
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}>
                                {item.patientType}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Service & Doctor */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-foreground">
                            {item.service}
                          </span>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 font-medium">
                            {item.doctor}
                          </p>
                        </td>

                        {/* Visit Date */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-foreground">{item.visitDate}</p>
                            {isToday ? (
                              <span className="inline-flex items-center text-[10px] font-extrabold text-blue-600 bg-blue-500/10 px-1.5 py-0.2 rounded-md">
                                Hari Ini
                              </span>
                            ) : (
                              <p className="text-[11px] text-muted-foreground">Mendatang</p>
                            )}
                          </div>
                        </td>


                        {/* Info Button */}
                        <td className="py-4 pl-4 pr-6 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedItem(item)}
                            className="size-8 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            title="Lihat Detail"
                          >
                            <Eye className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Detail Info Modal ─── */}
        {selectedItem && (() => {
          const cleanPhone = selectedItem.phone.replace(/\D/g, "");
          const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}` : null;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={(e) => { if (e.target === e.currentTarget) setSelectedItem(null); }}
            >
              <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                      <User className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{selectedItem.patientName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
                          {selectedItem.queueCode}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* Data Pasien */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Data Pasien</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Kode Antrean</p>
                        <p className="font-mono font-bold text-foreground">{selectedItem.queueCode}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Jenis Pasien</p>
                        <p className="font-semibold text-foreground">{selectedItem.patientType || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Nama Pasien</p>
                        <p className="font-semibold text-foreground">{selectedItem.patientName}</p>
                      </div>
                      {selectedItem.fatherName && selectedItem.fatherName !== "-" && (
                        <div>
                          <p className="text-[11px] text-muted-foreground">Nama Ayah</p>
                          <p className="font-semibold text-foreground">{selectedItem.fatherName}</p>
                        </div>
                      )}
                      {selectedItem.address && (
                        <div className="col-span-2">
                          <p className="text-[11px] text-muted-foreground">Alamat</p>
                          <p className="font-semibold text-foreground">{selectedItem.address}</p>
                        </div>
                      )}
                      {selectedItem.medicalRecordNo && (
                        <div>
                          <p className="text-[11px] text-muted-foreground">No. Rekam Medis</p>
                          <p className="font-mono font-semibold text-foreground">{selectedItem.medicalRecordNo}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[11px] text-muted-foreground">No. Telepon</p>
                        <p className="font-semibold text-foreground">{selectedItem.phone}</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-border/60" />

                  {/* Rencana Kunjungan */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Rencana Kunjungan</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Poli</p>
                        <p className="font-semibold text-foreground">{selectedItem.service}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Dokter</p>
                        <p className="font-semibold text-foreground">{selectedItem.doctor}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Tanggal Kunjungan</p>
                        <p className="font-bold text-foreground">{selectedItem.visitDate}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Jenis Pembayaran</p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          selectedItem.paymentType === "BPJS"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}>
                          {selectedItem.paymentType}
                        </span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-border/60" />

                  {/* Keluhan */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">Keluhan</h4>
                    <div className="rounded-xl bg-muted/50 border border-border/60 p-3.5">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                        {selectedItem.complaint && selectedItem.complaint !== "-" ? selectedItem.complaint : "Tidak ada keluhan yang dicatat."}
                      </p>
                    </div>
                  </div>

                  <hr className="border-border/60" />

                  {/* Waktu Pendaftaran */}
                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Waktu Pendaftaran</h4>
                    <p className="text-xs text-muted-foreground">{formatDate(selectedItem.createdAt)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-border/60">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(null);
                      setDeletingId(selectedItem.id);
                    }}
                    className="rounded-xl text-red-600 border-red-500/30 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Hapus
                  </Button>
                  <div className="flex items-center gap-2">
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-colors"
                      >
                        <MessageCircle className="size-4" />
                        Hubungi via WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ─── Delete Confirmation Modal ─── */}
        {deletingId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400 mb-4">
                <Trash2 className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Hapus Pendaftaran?</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Apakah Anda yakin ingin menghapus data antrean{" "}
                <span className="font-mono font-bold text-foreground">
                  "{deletingItem?.queueCode}"
                </span>{" "}
                atas nama <span className="font-bold text-foreground">{deletingItem?.patientName}</span>?
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingId(null)}
                  disabled={isDeleting}
                  className="rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Menghapus...
                    </>
                  ) : (
                    "Ya, Hapus"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
