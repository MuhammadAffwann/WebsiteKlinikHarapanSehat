import { useState } from "react";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Edit2,
  Filter,
  Loader2,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { getSessionFn } from "@/lib/auth";
import {
  createDoctorFn,
  deleteDoctorFn,
  getDoctorsFn,
  toggleDoctorActiveFn,
  type DoctorInput,
  updateDoctorFn,
} from "@/lib/doctors";
import type { Doctor } from "@/db/schema";

export const Route = createFileRoute("/dashboardpanel/dokter")({
  head: () => ({
    meta: [{ title: "Kelola Dokter & Jadwal — Dashboard Admin" }],
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
    const res = await getDoctorsFn();
    return { doctors: res.data };
  },
  component: ManageDoctorsPage,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const predefinedSpecialties = [
  "Dokter Umum",
  "Dokter Gigi",
  "Spesialis Anak",
  "Spesialis Kandungan (Obsgyn)",
  "Spesialis Penyakit Dalam",
];

const dayPresets = ["Senin – Jumat", "Senin – Sabtu", "Sabtu – Minggu", "Setiap Hari"];
const timePresets = ["07:00 – 20:00", "08:00 – 21:00", "09:00 – 20:00", "20:00 – 07:00 (Malam)", "24 Jam"];

const initialForm: DoctorInput = {
  name: "",
  slug: "",
  specialty: "Dokter Umum",
  days: "Senin – Jumat",
  time: "07:00 – 20:00",
  image: "",
  active: true,
  orderIndex: 0,
};

function ManageDoctorsPage() {
  const { session } = Route.useRouteContext();
  const { doctors } = Route.useLoaderData();
  const router = useRouter();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<DoctorInput>(initialForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Loading & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Toggle Loading tracker
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingDoctor(null);
    setFormData({
      ...initialForm,
      orderIndex: doctors.length + 1,
    });
    setSlugManuallyEdited(false);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormData({
      id: doc.id,
      name: doc.name,
      slug: doc.slug,
      specialty: doc.specialty,
      days: doc.days,
      time: doc.time,
      image: doc.image || "",
      active: doc.active,
      orderIndex: doc.orderIndex,
    });
    setSlugManuallyEdited(true);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !slugManuallyEdited && !editingDoctor ? slugify(val) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!formData.name.trim()) {
      setErrorMessage("Nama dokter tidak boleh kosong.");
      return;
    }
    if (!formData.slug.trim()) {
      setErrorMessage("Slug dokter tidak boleh kosong.");
      return;
    }
    if (!formData.specialty.trim()) {
      setErrorMessage("Spesialisasi dokter tidak boleh kosong.");
      return;
    }
    if (!formData.days.trim()) {
      setErrorMessage("Hari praktik tidak boleh kosong.");
      return;
    }
    if (!formData.time.trim()) {
      setErrorMessage("Jam praktik tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingDoctor) {
        const res = await updateDoctorFn({
          data: {
            ...formData,
            id: editingDoctor.id,
          },
        });

        if (!res.success && res.error) {
          setErrorMessage(res.error);
          setIsSaving(false);
          return;
        }

        setSuccessMessage(`Dokter "${formData.name}" berhasil diperbarui.`);
      } else {
        const res = await createDoctorFn({
          data: formData,
        });

        if (!res.success && res.error) {
          setErrorMessage(res.error);
          setIsSaving(false);
          return;
        }

        setSuccessMessage(`Dokter "${formData.name}" berhasil ditambahkan.`);
      }

      setIsFormOpen(false);
      await router.invalidate();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (doc: Doctor) => {
    setTogglingId(doc.id);
    try {
      const res = await toggleDoctorActiveFn({
        data: { id: doc.id, active: !doc.active },
      });

      if (res.success) {
        setSuccessMessage(
          `Status dokter "${doc.name}" diubah menjadi ${res.active ? "Aktif" : "Nonaktif"}.`
        );
        await router.invalidate();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal mengubah status dokter.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteDoctorFn({ data: { id: deletingId } });
      if (res.success) {
        setSuccessMessage("Dokter berhasil dihapus.");
        setDeletingId(null);
        await router.invalidate();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal menghapus dokter.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Derive stats
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter((d) => d.active).length;
  const inactiveDoctors = doctors.filter((d) => !d.active).length;
  const uniqueSpecialties = Array.from(new Set(doctors.map((d) => d.specialty)));

  // Filtered list
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.days.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty = filterSpecialty === "all" || doc.specialty === filterSpecialty;
    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
          ? doc.active
          : !doc.active;

    return matchesSearch && matchesSpecialty && matchesStatus;
  });

  const deletingDoctor = doctors.find((d) => d.id === deletingId);

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
              <span className="text-foreground">Dokter</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Kelola Dokter &amp; Jadwal
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Atur daftar dokter, spesialisasi, jadwal praktik harian, status aktif, dan urutan tampil.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
          >
            <Plus className="size-4" />
            <span>Tambah Dokter</span>
          </Button>
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
        {errorMessage && !isFormOpen && (
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <Stethoscope className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Dokter</p>
                <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                  {totalDoctors}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <UserCheck className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Dokter Aktif</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {activeDoctors}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <UserX className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Cuti / Nonaktif</p>
                <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                  {inactiveDoctors}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                <Filter className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Spesialisasi</p>
                <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                  {uniqueSpecialties.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama dokter, spesialisasi, hari..."
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

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Specialty Filter */}
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs font-medium text-foreground focus:border-blue-600 focus:outline-hidden"
            >
              <option value="all">Semua Spesialisasi ({totalDoctors})</option>
              {uniqueSpecialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
              className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs font-medium text-foreground focus:border-blue-600 focus:outline-hidden"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif Saja ({activeDoctors})</option>
              <option value="inactive">Nonaktif Saja ({inactiveDoctors})</option>
            </select>
          </div>
        </div>

        {/* Doctors Table Card */}
        <div className="rounded-3xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 w-14 text-center">Urutan</th>
                  <th className="py-3.5 px-4">Dokter</th>
                  <th className="py-3.5 px-4">Spesialisasi</th>
                  <th className="py-3.5 px-4">Jadwal Praktik</th>
                  <th className="py-3.5 px-4 text-center">Status Tampil</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                          <Stethoscope className="size-6" />
                        </div>
                        <p className="font-semibold text-foreground">Tidak ada dokter yang cocok</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                          {searchQuery || filterSpecialty !== "all" || filterStatus !== "all"
                            ? "Coba ubah kata kunci pencarian atau reset filter."
                            : "Belum ada data dokter di database."}
                        </p>
                        {(searchQuery || filterSpecialty !== "all" || filterStatus !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery("");
                              setFilterSpecialty("all");
                              setFilterStatus("all");
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
                  filteredDoctors.map((doc) => {
                    const initials = doc.name
                      .replace(/^(drg?|Dr)\.\s*/i, "")
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() ?? "")
                      .join("");

                    return (
                      <tr
                        key={doc.id}
                        className={`group transition-colors hover:bg-muted/30 ${
                          !doc.active ? "opacity-75 bg-muted/10" : ""
                        }`}
                      >
                        {/* Order Index */}
                        <td className="py-4 pl-6 pr-3 text-center">
                          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground tabular-nums">
                            {doc.orderIndex}
                          </span>
                        </td>

                        {/* Doctor Profile */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold text-xs">
                              {initials || "DR"}
                            </div>
                            <div>
                              <p className="font-bold text-foreground leading-snug">{doc.name}</p>
                              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                /{doc.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Specialty */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                            {doc.specialty}
                          </span>
                        </td>

                        {/* Days & Time */}
                        <td className="py-4 px-4">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                              <span>{doc.days}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="size-3.5 text-muted-foreground shrink-0" />
                              <span>{doc.time}</span>
                            </div>
                          </div>
                        </td>

                        {/* Active Toggle Switch */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(doc)}
                            disabled={togglingId === doc.id}
                            aria-label={`Ubah status aktif dokter ${doc.name}`}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              doc.active ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                            } ${togglingId === doc.id ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <span
                              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                doc.active ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <div className="mt-1 text-[10px] font-semibold">
                            {doc.active ? (
                              <span className="text-emerald-600 dark:text-emerald-400">Aktif</span>
                            ) : (
                              <span className="text-muted-foreground">Cuti / Nonaktif</span>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(doc)}
                              className="size-8 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              title="Edit Dokter"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingId(doc.id)}
                              className="size-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Hapus Dokter"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Form Modal (Create / Edit) ─── */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-border/70">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Stethoscope className="size-4" />
                    </span>
                    <h2 className="text-xl font-bold text-foreground">
                      {editingDoctor ? "Edit Data Dokter" : "Tambah Dokter Baru"}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {editingDoctor
                      ? `Perbarui informasi untuk ${editingDoctor.name}`
                      : "Lengkapi data dokter untuk ditambahkan ke daftar & jadwal praktik."}
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Form Error Banner */}
              {errorMessage && (
                <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs sm:text-sm font-medium text-red-800 dark:text-red-300">
                  <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* 1. Nama Dokter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Nama Dokter <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Contoh: dr. Riyan Annasith"
                    className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                </div>

                {/* 2. Slug */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Slug URL <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      Otomatis dari nama (unik)
                    </span>
                  </div>
                  <div className="flex rounded-xl border border-border/80 bg-background overflow-hidden focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20">
                    <span className="inline-flex items-center bg-muted/60 px-3.5 text-xs text-muted-foreground border-r border-border/70 font-mono">
                      /dokter/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => {
                        setSlugManuallyEdited(true);
                        setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                      }}
                      placeholder="dr-riyan-annasith"
                      className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* 3. Spesialisasi */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Spesialisasi / Poli <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData((prev) => ({ ...prev, specialty: e.target.value }))}
                    placeholder="Contoh: Dokter Umum, Dokter Gigi"
                    className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                  {/* Preset chips */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {predefinedSpecialties.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, specialty: spec }))}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                          formData.specialty === spec
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Hari & Jam Praktik (Grid 2 Kolom) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hari Praktik */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Hari Praktik <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.days}
                      onChange={(e) => setFormData((prev) => ({ ...prev, days: e.target.value }))}
                      placeholder="Contoh: Senin – Jumat"
                      className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
                    />
                    <div className="mt-2 flex flex-wrap gap-1">
                      {dayPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, days: preset }))}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Jam Praktik */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Jam Praktik <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                      placeholder="Contoh: 07:00 – 20:00"
                      className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
                    />
                    <div className="mt-2 flex flex-wrap gap-1">
                      {timePresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, time: preset }))}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Urutan Tampil & Foto Dokter */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Urutan Tampil (Order)
                  </label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        orderIndex: Number(e.target.value) || 0,
                      }))
                    }
                    className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all tabular-nums"
                  />
                </div>

                <div>
                  <ImageUpload
                    label="Foto Profil Dokter (Opsional)"
                    value={formData.image || ""}
                    onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                    placeholder="Pilih atau tarik foto dokter dari device"
                    description="Foto profil dokter untuk halaman jadwal dokter publik."
                    previewAspect="square"
                    allowClear
                  />
                </div>

                {/* 6. Status Aktif Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-muted/30">
                  <div>
                    <p className="text-sm font-bold text-foreground">Status Aktif Praktik</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Jika dinonaktifkan, dokter ini akan disembunyikan dari jadwal publik (misal cuti).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, active: !prev.active }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      formData.active ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        formData.active ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/70">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-xl px-5"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 px-6"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : editingDoctor ? (
                      "Simpan Perubahan"
                    ) : (
                      "Tambah Dokter"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── Delete Confirmation Modal ─── */}
        {deletingId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-red-500/15 text-red-600 dark:bg-red-500/20 dark:text-red-400 mb-4">
                <Trash2 className="size-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Hapus Dokter?</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Apakah Anda yakin ingin menghapus data{" "}
                <span className="font-bold text-foreground">
                  "{deletingDoctor?.name || "dokter ini"}"
                </span>
                ? Tindakan ini tidak dapat dibatalkan.
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
