import { useState } from "react";
import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  Edit2,
  FileText,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { getSessionFn } from "@/lib/auth";
import { createPostFn, deletePostFn, getPostsFn, type PostInput, updatePostFn } from "@/lib/posts";
import type { Post } from "@/db/schema";

export const Route = createFileRoute("/dashboardpanel/blog")({
  head: () => ({
    meta: [{ title: "Kelola Blog & Edukasi — Dashboard Admin" }],
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
    const res = await getPostsFn();
    return { posts: res.data };
  },
  component: ManageBlogPage,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const predefinedCategories = ["Edukasi", "Ibu & Anak", "Kabar Sehat", "Layanan", "Tips Sehat"];

const initialForm: PostInput = {
  title: "",
  slug: "",
  category: "Edukasi",
  excerpt: "",
  body: [""],
  coverImage: "",
  status: "draft",
};

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

function ManageBlogPage() {
  const { session } = Route.useRouteContext();
  const { posts } = Route.useLoaderData();
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostInput>(initialForm);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryVal, setCustomCategoryVal] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setFormData({
      ...initialForm,
      body: [""],
    });
    setSlugManuallyEdited(false);
    setIsCustomCategory(false);
    setCustomCategoryVal("");
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (post: Post) => {
    setEditingPost(post);

    const isPredefined = predefinedCategories.includes(post.category);
    setIsCustomCategory(!isPredefined);
    setCustomCategoryVal(!isPredefined ? post.category : "");

    setFormData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      category: post.category,
      excerpt: post.excerpt,
      body: post.body && post.body.length > 0 ? [...post.body] : [""],
      coverImage: post.coverImage || "",
      status: post.status,
    });
    setSlugManuallyEdited(true);
    setErrorMessage(null);
    setIsFormOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !slugManuallyEdited && !editingPost ? slugify(val) : prev.slug,
    }));
  };

  const handleAddParagraph = () => {
    setFormData((prev) => ({
      ...prev,
      body: [...prev.body, ""],
    }));
  };

  const handleParagraphChange = (index: number, val: string) => {
    setFormData((prev) => {
      const next = [...prev.body];
      next[index] = val;
      return { ...prev, body: next };
    });
  };

  const handleRemoveParagraph = (index: number) => {
    setFormData((prev) => {
      const next = prev.body.filter((_, i) => i !== index);
      return { ...prev, body: next.length > 0 ? next : [""] };
    });
  };

  const handleMoveParagraph = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const next = [...prev.body];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < next.length) {
        const currentVal = next[index];
        const targetVal = next[targetIndex];
        if (currentVal !== undefined && targetVal !== undefined) {
          next[index] = targetVal;
          next[targetIndex] = currentVal;
        }
      }
      return { ...prev, body: next };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const selectedCategory = isCustomCategory ? customCategoryVal.trim() : formData.category;

      const payload: PostInput = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        category: selectedCategory,
        excerpt: formData.excerpt.trim(),
        body: formData.body.map((p) => p.trim()).filter(Boolean),
        coverImage: formData.coverImage?.trim() || null,
        status: formData.status,
      };

      if (!payload.title || !payload.slug || !payload.category || !payload.excerpt) {
        setErrorMessage("Judul, slug, kategori, dan ringkasan wajib diisi.");
        setIsSaving(false);
        return;
      }

      if (payload.body.length === 0) {
        setErrorMessage("Konten wajib diisi minimal 1 paragraf.");
        setIsSaving(false);
        return;
      }

      if (editingPost) {
        const res = await updatePostFn({
          data: { ...payload, id: editingPost.id },
        });
        if (!res.success) {
          setErrorMessage(res.error || "Gagal memperbarui postingan.");
          setIsSaving(false);
          return;
        }
        setSuccessMessage(`Postingan "${payload.title}" berhasil diperbarui.`);
      } else {
        const res = await createPostFn({
          data: payload,
        });
        if (!res.success) {
          setErrorMessage(res.error || "Gagal menambahkan postingan.");
          setIsSaving(false);
          return;
        }
        setSuccessMessage(`Postingan "${payload.title}" berhasil ditambahkan.`);
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
      await deletePostFn({
        data: { id: deletingId },
      });
      setDeletingId(null);
      setSuccessMessage("Postingan berhasil dihapus.");
      await router.invalidate();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gagal menghapus postingan.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout userEmail={session.user?.email}>
      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/dashboardpanel" className="flex items-center gap-1 hover:text-foreground">
                <ArrowLeft className="size-3" /> Dashboard
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">Blog</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Kelola Blog & Edukasi
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tulis dan kelola artikel, kabar terbaru, serta edukasi kesehatan klinik.
            </p>
          </div>

          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-xs"
          >
            <Plus className="size-4" /> Tulis Artikel Baru
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

        {/* Posts Table */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {posts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <FileText className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">
                Belum ada data artikel
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Klik tombol di bawah untuk menulis artikel pertama Anda.
              </p>
              <Button onClick={handleOpenCreate} className="mt-6 rounded-xl text-sm font-semibold">
                <Plus className="mr-1.5 size-4" /> Tulis Artikel Sekarang
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5">Artikel</th>
                    <th className="px-5 py-3.5">Kategori</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Tanggal</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{post.title}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          slug: {post.slug}
                        </div>
                        <p className="mt-1 line-clamp-1 max-w-md text-xs text-muted-foreground/80">
                          {post.excerpt}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {post.status === "published" ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">
                        <div>Dibuat: {formatDate(post.createdAt)}</div>
                        {post.publishedAt && (
                          <div className="mt-0.5 text-green-600 font-medium">
                            Rilis: {formatDate(post.publishedAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(post)}
                            className="size-8 p-0 rounded-lg"
                            title="Edit Artikel"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingId(post.id)}
                            className="size-8 p-0 rounded-lg text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                            title="Hapus Artikel"
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
                {editingPost ? "Edit Artikel" : "Tulis Artikel Baru"}
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
                    Judul Artikel <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Manfaat Pola Hidup Sehat"
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
                    placeholder="contoh: manfaat-pola-hidup-sehat"
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Kategori <span className="text-destructive">*</span>
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    {!isCustomCategory ? (
                      <select
                        value={formData.category}
                        onChange={(e) => {
                          if (e.target.value === "__custom__") {
                            setIsCustomCategory(true);
                            setCustomCategoryVal("");
                          } else {
                            setFormData((prev) => ({ ...prev, category: e.target.value }));
                          }
                        }}
                        className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      >
                        {predefinedCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="__custom__">+ Kategori Baru...</option>
                      </select>
                    ) : (
                      <div className="flex w-full gap-2">
                        <input
                          type="text"
                          required
                          value={customCategoryVal}
                          onChange={(e) => setCustomCategoryVal(e.target.value)}
                          placeholder="Ketik kategori baru..."
                          className="block flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCategory(false);
                            setFormData((prev) => ({
                              ...prev,
                              category: predefinedCategories[0] || "Edukasi",
                            }));
                          }}
                          className="rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-muted text-muted-foreground"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Status Publikasi
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as "draft" | "published",
                      }))
                    }
                    className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                  Ringkasan Singkat (Excerpt) <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Ringkasan singkat artikel untuk preview halaman daftar blog..."
                  className="mt-1.5 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <ImageUpload
                  label="Gambar Sampul Artikel (Cover Image)"
                  value={formData.coverImage || ""}
                  onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
                  placeholder="Upload gambar sampul artikel dari device"
                  description="Foto ini akan menjadi thumbnail di daftar blog dan header halaman artikel."
                  previewAspect="wide"
                  allowClear
                />
              </div>

              {/* Dynamic Paragraph Body Editor */}
              <div>
                <div className="flex items-center justify-between border-b border-border pb-1.5">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                    Konten Artikel (Paragraf) <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddParagraph}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="size-3" /> Tambah Paragraf
                  </button>
                </div>

                <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
                  {formData.body.map((para, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="mt-2.5 text-[11px] font-bold text-muted-foreground w-6 text-center">
                        P{idx + 1}
                      </span>
                      <textarea
                        rows={3}
                        value={para}
                        onChange={(e) => handleParagraphChange(idx, e.target.value)}
                        placeholder={`Tulis paragraf ${idx + 1} di sini...`}
                        className="block flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                      <div className="flex flex-col gap-1 shrink-0">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveParagraph(idx, "up")}
                            className="p-1 rounded-md text-muted-foreground hover:bg-muted"
                            title="Pindahkan ke atas"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                        )}
                        {idx < formData.body.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveParagraph(idx, "down")}
                            className="p-1 rounded-md text-muted-foreground hover:bg-muted"
                            title="Pindahkan ke bawah"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                        )}
                        {formData.body.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveParagraph(idx)}
                            className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                            title="Hapus paragraf"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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
                  ) : editingPost ? (
                    "Simpan Perubahan"
                  ) : (
                    "Terbitkan Artikel"
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
              Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.
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
