import { useState } from "react";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Edit2,
  Layers,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getSessionFn } from "@/lib/auth";
import {
  createServiceFn,
  deleteServiceFn,
  getServicesFn,
  type ServiceInput,
  updateServiceFn,
} from "@/lib/services";
import type { Service } from "@/db/schema";

export const Route = createFileRoute("/dashboardpanel/layanan")({
  head: () => ({
    meta: [{ title: "Kelola Layanan — Dashboard Admin" }],
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
    const res = await getServicesFn();
    return { services: res.data };
  },
  component: ManageServicesPage,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const initialForm: ServiceInput = {
  title: "",
  slug: "",
  description: "",
  points: [""],
  badge: "",
  image: "umum",
  orderIndex: 0,
};

function ManageServicesPage() {
  const { session } = Route.useRouteContext();
  const { services } = Route.useLoaderData();
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceInput>(initialForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      ...initialForm,
      orderIndex: services.length + 1,
      points: [""],
    });
    setSlugManuallyEdited(false);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (svc: Service) => {
    setEditingService(svc);
    setFormData({
      id: svc.id,
      title: svc.title,
      slug: svc.slug,
      description: svc.description,
      points: svc.points && svc.points.length > 0 ? [...svc.points] : [""],
      badge: svc.badge || "",
      image: svc.image,
      orderIndex: svc.orderIndex,
    });
    setSlugManuallyEdited(true);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !slugManuallyEdited && !editingService ? slugify(val) : prev.slug,
    }));
  };

  const handleAddPoint = () => {
    setFormData((prev) => ({
      ...prev,
      points: [...prev.points, ""],
    }));
  };

  const handlePointChange = (index: number, val: string) => {
    setFormData((prev) => {
      const next = [...prev.points];
      next[index] = val;
      return { ...prev, points: next };
    });
  };

  const handleRemovePoint = (index: number) => {
    setFormData((prev) => {
      const next = prev.points.filter((_, i) => i !== index);
      return { ...prev, points: next.length > 0 ? next : [""] };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const payload: ServiceInput = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        points: formData.points.map((p) => p.trim()).filter(Boolean),
        badge: formData.badge?.trim() || null,
        image: formData.image.trim(),
        orderIndex: Number(formData.orderIndex) || 0,
      };

      if (!payload.title || !payload.slug || !payload.description || !payload.image) {
        setErrorMessage("Judul, slug, deskripsi, dan gambar wajib diisi.");
        setIsSaving(false);
        return;
      }

      if (editingService) {
        const res = await updateServiceFn({
          data: { ...payload, id: editingService.id },
        });
        if (!res.success) {
          setErrorMessage(res.error || "Gagal memperbarui layanan.");
          setIsSaving(false);
          return;
        }
        setSuccessMessage(`Layanan "${payload.title}" berhasil diperbarui.`);
      } else {
        const res = await createServiceFn({
          data: payload,
        });
        if (!res.success) {
          setErrorMessage(res.error || "Gagal menambahkan layanan.");
          setIsSaving(false);
          return;
        }
        setSuccessMessage(`Layanan "${payload.title}" berhasil ditambahkan.`);
      }

      setIsFormOpen(false);
      await router.invalidate();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan pada server.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteServiceFn({
        data: { id: deletingId },
      });
      setDeletingId(null);
      setSuccessMessage("Layanan berhasil dihapus.");
      await router.invalidate();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal menghapus layanan.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout userEmail={session.user?.email}>
      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/dashboardpanel" className="flex items-center gap-1 hover:text-foreground">
                <ArrowLeft className="size-3" /> Dashboard
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Layanan</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Manajemen Layanan
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola daftar layanan kesehatan klinik yang tersimpan di database.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-xs"
          >
            <Plus className="size-4" /> Tambah Layanan
          </Button>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-300">
            <div className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-green-600" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-600 hover:text-green-800"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {errorMessage && !isFormOpen && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Services List Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {services.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Layers className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Belum ada data layanan
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Klik tombol di bawah untuk menambahkan layanan pertama klinik.
              </p>
              <Button onClick={handleOpenCreate} className="mt-6 rounded-xl text-sm font-semibold">
                <Plus className="mr-1.5 size-4" /> Tambah Layanan Sekarang
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5 w-16 text-center">Urutan</th>
                    <th className="px-5 py-3.5">Layanan</th>
                    <th className="px-5 py-3.5">Badge</th>
                    <th className="px-5 py-3.5">Poin Unggulan</th>
                    <th className="px-5 py-3.5">Gambar</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {services.map((svc) => (
                    <tr key={svc.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 text-center font-semibold text-muted-foreground">
                        #{svc.orderIndex}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{svc.title}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          slug: {svc.slug}
                        </div>
                        <p className="mt-1 line-clamp-1 max-w-sm text-xs text-muted-foreground/80">
                          {svc.description}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {svc.badge ? (
                          <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {svc.badge}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {svc.points && svc.points.length > 0 ? (
                            svc.points.map((p, idx) => (
                              <span
                                key={idx}
                                className="inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                              >
                                {p}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground/50">Tidak ada</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                        {svc.image}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(svc)}
                            className="size-8 p-0 rounded-lg"
                            title="Edit Layanan"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingId(svc.id)}
                            className="size-8 p-0 rounded-lg text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                            title="Hapus Layanan"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Form Create / Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">
                {editingService ? "Edit Layanan" : "Tambah Layanan Baru"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Judul Layanan <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Poli Umum"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Slug (URL) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    }}
                    placeholder="contoh: poli-umum"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Deskripsi Singkat <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Penjelasan ringkas mengenai layanan ini..."
                  className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Dynamic Points */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Poin Unggulan / Fasilitas Layanan
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="size-3" /> Tambah Poin
                  </button>
                </div>

                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.points.map((pt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pt}
                        onChange={(e) => handlePointChange(idx, e.target.value)}
                        placeholder={`Poin ${idx + 1} (contoh: Konsultasi dokter umum)`}
                        className="block flex-1 rounded-xl border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                      {formData.points.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePoint(idx)}
                          className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Badge (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    placeholder="Contoh: Paling Dicari"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Gambar / Identifier <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="umum / gigi / lab / URL"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Urutan Tampil (Order)
                  </label>
                  <input
                    type="number"
                    value={formData.orderIndex}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        orderIndex: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl font-medium"
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isSaving} className="rounded-xl font-medium">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : editingService ? (
                    "Simpan Perubahan"
                  ) : (
                    "Tambahkan Layanan"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground">Konfirmasi Hapus</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus layanan ini? Tindakan ini tidak dapat dibatalkan.
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
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
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
    </DashboardLayout>
  );
}
