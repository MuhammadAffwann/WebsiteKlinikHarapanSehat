import { useState } from "react";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  Edit2,
  Eye,
  EyeOff,
  Filter,
  Loader2,
  MessageSquareQuote,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getSessionFn } from "@/lib/auth";
import {
  createTestimonialFn,
  deleteTestimonialFn,
  getTestimonialsFn,
  toggleTestimonialVisibleFn,
  type TestimonialInput,
  updateTestimonialFn,
} from "@/lib/testimonials";
import type { Testimonial } from "@/db/schema";

export const Route = createFileRoute("/dashboardpanel/testimonial")({
  head: () => ({
    meta: [{ title: "Kelola Testimoni — Dashboard Admin" }],
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
    const res = await getTestimonialsFn();
    return { testimonials: res.data };
  },
  component: ManageTestimonialsPage,
});

export function getAvatarUrl(photo?: string | null, name: string = "Pasien"): string {
  if (!photo || photo === "PLACEHOLDER" || photo.trim() === "") {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&bold=true&rounded=true`;
  }
  return photo;
}

function formatDate(isoString: string) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

const initialForm: TestimonialInput = {
  name: "",
  message: "",
  rating: 5,
  photo: "",
  visible: true,
};

function ManageTestimonialsPage() {
  const { session } = Route.useRouteContext();
  const { testimonials } = Route.useLoaderData();
  const router = useRouter();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "visible" | "hidden">("all");

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState<TestimonialInput>(initialForm);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

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
    setEditingItem(null);
    setFormData(initialForm);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      message: item.message,
      rating: item.rating || 5,
      photo: item.photo || "",
      visible: item.visible,
    });
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage("Nama pasien / pengirim tidak boleh kosong.");
      return;
    }
    if (!formData.message.trim()) {
      setErrorMessage("Isi testimoni tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const res = await updateTestimonialFn({
          data: {
            ...formData,
            id: editingItem.id,
          },
        });

        if (!res.success && res.error) {
          setErrorMessage(res.error);
          setIsSaving(false);
          return;
        }

        setSuccessMessage(`Testimoni dari "${formData.name}" berhasil diperbarui.`);
      } else {
        const res = await createTestimonialFn({
          data: formData,
        });

        if (!res.success && res.error) {
          setErrorMessage(res.error);
          setIsSaving(false);
          return;
        }

        setSuccessMessage(`Testimoni dari "${formData.name}" berhasil ditambahkan.`);
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

  const handleToggleVisible = async (item: Testimonial) => {
    setTogglingId(item.id);
    try {
      const res = await toggleTestimonialVisibleFn({
        data: { id: item.id, visible: !item.visible },
      });

      if (res.success) {
        setSuccessMessage(
          `Testimoni "${item.name}" kini ${res.visible ? "ditampilkan di publik" : "disembunyikan"}.`
        );
        await router.invalidate();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal mengubah status testimoni.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteTestimonialFn({ data: { id: deletingId } });
      if (res.success) {
        setSuccessMessage("Testimoni berhasil dihapus.");
        setDeletingId(null);
        await router.invalidate();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal menghapus testimoni.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Derive stats
  const totalCount = testimonials.length;
  const visibleCount = testimonials.filter((t) => t.visible).length;
  const hiddenCount = testimonials.filter((t) => !t.visible).length;
  const avgRating =
    totalCount > 0
      ? (testimonials.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalCount).toFixed(1)
      : "5.0";

  // Filtered list
  const filteredTestimonials = testimonials.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      filterRating === "all" ? true : (item.rating || 5) === Number(filterRating);

    const matchesStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "visible"
          ? item.visible
          : !item.visible;

    return matchesSearch && matchesRating && matchesStatus;
  });

  const deletingItem = testimonials.find((t) => t.id === deletingId);

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
              <span className="text-foreground">Testimonial</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Kelola Testimoni Pasien
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Kelola cerita dan pengalaman pasien, rating bintang, foto profil, dan status tampil di website.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
          >
            <Plus className="size-4" />
            <span>Tambah Testimoni</span>
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
                <MessageSquareQuote className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Testimoni</p>
                <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                  {totalCount}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Eye className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tampil di Web</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {visibleCount}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <EyeOff className="size-4 sm:size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Disembunyikan</p>
                <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
                  {hiddenCount}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-card shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                <Star className="size-4 sm:size-5 fill-amber-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Rata-rata Rating</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
                    {avgRating}
                  </span>
                  <span className="text-xs font-bold text-amber-500">/ 5.0</span>
                </div>
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
              placeholder="Cari nama pasien, kata kunci ulasan..."
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
            {/* Rating Filter */}
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs font-medium text-foreground focus:border-blue-600 focus:outline-hidden"
            >
              <option value="all">Semua Rating</option>
              <option value="5">⭐⭐⭐⭐⭐ Bintang 5</option>
              <option value="4">⭐⭐⭐⭐ Bintang 4</option>
              <option value="3">⭐⭐⭐ Bintang 3</option>
              <option value="2">⭐⭐ Bintang 2</option>
              <option value="1">⭐ Bintang 1</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as "all" | "visible" | "hidden")}
              className="rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-xs font-medium text-foreground focus:border-blue-600 focus:outline-hidden"
            >
              <option value="all">Semua Status</option>
              <option value="visible">Tampil ({visibleCount})</option>
              <option value="hidden">Disembunyikan ({hiddenCount})</option>
            </select>
          </div>
        </div>

        {/* Testimonials Table Card */}
        <div className="rounded-3xl border border-border/70 bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 pl-6 pr-3 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Pasien</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Rating</th>
                  <th className="py-3.5 px-4 min-w-[280px]">Pesan Testimoni</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4 text-center">Status Tampil</th>
                  <th className="py-3.5 pl-4 pr-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTestimonials.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                          <MessageSquareQuote className="size-6" />
                        </div>
                        <p className="font-semibold text-foreground">Tidak ada testimoni yang cocok</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                          {searchQuery || filterRating !== "all" || filterStatus !== "all"
                            ? "Coba ubah kata kunci pencarian atau reset filter."
                            : "Belum ada testimoni pasien di database."}
                        </p>
                        {(searchQuery || filterRating !== "all" || filterStatus !== "all") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSearchQuery("");
                              setFilterRating("all");
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
                  filteredTestimonials.map((item, index) => {
                    const ratingValue = item.rating || 5;
                    const avatarSrc = getAvatarUrl(item.photo, item.name);

                    return (
                      <tr
                        key={item.id}
                        className={`group transition-colors hover:bg-muted/30 ${
                          !item.visible ? "opacity-75 bg-muted/10" : ""
                        }`}
                      >
                        {/* Index */}
                        <td className="py-4 pl-6 pr-3 text-center">
                          <span className="text-xs font-bold text-muted-foreground tabular-nums">
                            {index + 1}
                          </span>
                        </td>

                        {/* Patient Profile */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatarSrc}
                              alt={item.name}
                              className="size-10 rounded-full object-cover border border-border/80 bg-muted shrink-0 shadow-2xs"
                              onError={(e) => {
                                e.currentTarget.src = getAvatarUrl(null, item.name);
                              }}
                            />
                            <div>
                              <p className="font-bold text-foreground leading-snug">{item.name}</p>
                              {item.photo && (
                                <span className="inline-flex items-center text-[10px] font-semibold text-blue-600 bg-blue-500/10 px-1.5 py-0.2 rounded-md mt-0.5">
                                  Foto Custom
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Star Rating */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`size-4 ${
                                  star <= ratingValue
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-zinc-200 dark:text-zinc-700"
                                }`}
                              />
                            ))}
                          </div>
                        </td>

                        {/* Message Preview */}
                        <td className="py-4 px-4">
                          <p
                            className="text-xs text-foreground/80 line-clamp-2 leading-relaxed max-w-md italic"
                            title={item.message}
                          >
                            "{item.message}"
                          </p>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(item.createdAt)}
                        </td>

                        {/* Visible Toggle Switch */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleVisible(item)}
                            disabled={togglingId === item.id}
                            aria-label={`Ubah status tampil testimoni ${item.name}`}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              item.visible ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                            } ${togglingId === item.id ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <span
                              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                item.visible ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <div className="mt-1 text-[10px] font-semibold">
                            {item.visible ? (
                              <span className="text-emerald-600 dark:text-emerald-400">Tampil</span>
                            ) : (
                              <span className="text-muted-foreground">Disembunyikan</span>
                            )}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(item)}
                              className="size-8 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                              title="Edit Testimoni"
                            >
                              <Edit2 className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingId(item.id)}
                              className="size-8 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Hapus Testimoni"
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
            <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-border/70">
                <div className="flex items-center gap-3.5">
                  <img
                    src={getAvatarUrl(formData.photo, formData.name || "Preview")}
                    alt="Preview avatar"
                    className="size-12 rounded-full object-cover border border-border/80 bg-muted shrink-0 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = getAvatarUrl(null, formData.name || "Preview");
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {editingItem ? "Edit Testimoni" : "Tambah Testimoni"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {editingItem
                        ? `Perbarui ulasan dari ${editingItem.name}`
                        : "Tambahkan ulasan atau cerita pengalaman pasien baru."}
                    </p>
                  </div>
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
                {/* 1. Nama Pasien */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Nama Pasien <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: Ahmad Muyasar"
                    className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                </div>

                {/* 2. Rating Star Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Rating Kepuasan <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 p-2 rounded-xl border border-border/80 bg-background">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled =
                          hoveredStar !== null ? star <= hoveredStar : star <= formData.rating;

                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                            onClick={() => setFormData((prev) => ({ ...prev, rating: star }))}
                            className="p-1 text-zinc-300 hover:scale-115 transition-transform"
                          >
                            <Star
                              className={`size-6 ${
                                isFilled
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-zinc-300 dark:text-zinc-600"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {formData.rating} dari 5 Bintang
                    </span>
                  </div>
                </div>

                {/* 3. Isi Pesan Testimoni */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Pesan Testimoni <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Tuliskan pengalaman atau ulasan pasien tentang pelayanan klinik..."
                    className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all resize-y leading-relaxed"
                  />
                </div>

                {/* 4. Foto / URL Foto */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    URL Foto Profil (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.photo || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, photo: e.target.value }))}
                    placeholder="Kosongkan jika tidak ada foto (otomatis avatar inisial)"
                    className="w-full rounded-xl border border-border/80 bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Jika dikosongkan, avatar inisial warna biru akan otomatis dibuatkan dari nama pasien.
                  </p>
                </div>

                {/* 5. Status Tampil Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-border/70 bg-muted/30">
                  <div>
                    <p className="text-sm font-bold text-foreground">Tampilkan di Website</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Jika dinonaktifkan, testimoni ini tidak akan muncul di marquee halaman utama.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, visible: !prev.visible }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      formData.visible ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        formData.visible ? "translate-x-5" : "translate-x-0"
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
                    ) : editingItem ? (
                      "Simpan Perubahan"
                    ) : (
                      "Tambah Testimoni"
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
              <h3 className="text-lg font-bold text-foreground">Hapus Testimoni?</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Apakah Anda yakin ingin menghapus testimoni dari{" "}
                <span className="font-bold text-foreground">
                  "{deletingItem?.name || "pasien ini"}"
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
