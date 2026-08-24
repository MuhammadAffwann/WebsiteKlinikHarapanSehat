import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadImageFn } from "@/lib/upload";
import svcUmum from "@/assets/svc-umum.jpg";
import svcGigi from "@/assets/svc-gigi.jpg";
import svcIbuAnak from "@/assets/svc-ibu-anak.jpg";
import svcLab from "@/assets/svc-lab.jpg";
import svcOptic from "@/assets/svc-optic.jpg";
import svcRawatInap from "@/assets/svc-rawat-inap.jpg";
import svcDarurat from "@/assets/svc-darurat.jpg";
import drRiyan from "@/assets/drriyan.png";
import drYusuf from "@/assets/dryusuf.png";
import drRaden from "@/assets/drraden.png";
import drPratiwi from "@/assets/drpratiwi.png";
import drNofan from "@/assets/drnofan.png";
import drMuhammadRudiansyah from "@/assets/drmuhammadrudiansyah.png";

const legacyAssetMap: Record<string, string> = {
  umum: svcUmum,
  gigi: svcGigi,
  ibuAnak: svcIbuAnak,
  "ibu-dan-anak": svcIbuAnak,
  lab: svcLab,
  laboratorium: svcLab,
  optic: svcOptic,
  optik: svcOptic,
  rawatInap: svcRawatInap,
  "rawat-inap": svcRawatInap,
  darurat: svcDarurat,
  "gawat-darurat": svcDarurat,
  "dr-riyan-annasith": drRiyan,
  "dr-yusuf-nugraha": drYusuf,
  "dr-raden-robi-a": drRaden,
  "dr-pratiwi-eka-putri": drPratiwi,
  "dr-nofan-pratama": drNofan,
  "dr-muhammad-rudiansyah": drMuhammadRudiansyah,
};

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  description?: string;
  allowClear?: boolean;
  placeholder?: string;
  previewAspect?: "square" | "video" | "wide";
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Gambar",
  required = false,
  description,
  allowClear = true,
  placeholder = "Klik atau tarik file gambar ke sini",
  previewAspect = "video",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvePreviewSrc = (val?: string | null): string | null => {
    if (!val) return null;
    if (val.startsWith("/") || val.startsWith("http") || val.startsWith("data:")) {
      return val;
    }
    return legacyAssetMap[val] || null;
  };

  const currentPreviewSrc = resolvePreviewSrc(value);

  const handleFile = async (file: File) => {
    setError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file melebihi 5MB. Silakan pilih file yang lebih kecil.");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError("Format file harus berupa JPG, PNG, atau WEBP.");
      return;
    }

    setIsUploading(true);

    try {
      // Read file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Gagal membaca file dari perangkat."));
        reader.readAsDataURL(file);
      });

      const res = await uploadImageFn({
        data: {
          fileBase64: base64,
          fileName: file.name,
          contentType: file.type,
        },
      });

      if (!res.success || !res.url) {
        setError(res.error || "Gagal mengunggah file gambar.");
        return;
      }

      onChange(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat upload gambar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const aspectClass =
    previewAspect === "square"
      ? "aspect-square max-w-[180px]"
      : previewAspect === "wide"
        ? "aspect-[21/9] w-full"
        : "aspect-[16/9] w-full max-w-[340px]";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
        {value && allowClear && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-semibold text-destructive hover:underline"
          >
            Hapus Gambar
          </button>
        )}
      </div>

      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Container */}
      {currentPreviewSrc ? (
        <div className="relative rounded-2xl border border-border/80 bg-muted/20 p-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Image Preview Box */}
            <div
              className={`relative shrink-0 overflow-hidden rounded-xl border border-border/80 bg-background shadow-xs ${aspectClass}`}
            >
              <img
                src={currentPreviewSrc}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-2xs text-white text-xs font-medium">
                  <Loader2 className="mr-1.5 size-4 animate-spin" /> Uploading...
                </div>
              )}
            </div>

            {/* Info & Replace Button */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="size-4 shrink-0" />
                <span className="truncate">Gambar Terpasang</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono truncate max-w-full">
                {value}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Upload className="size-3.5" />
                  Ganti File Gambar
                </button>
                {allowClear && (
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <X className="size-3.5" />
                    Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone / Empty State */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/40"
          }`}
        >
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2.5 group-hover:scale-105 transition-transform">
            {isUploading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Upload className="size-5" />
            )}
          </div>
          <p className="text-xs font-bold text-foreground">
            {isUploading ? "Mengunggah gambar..." : placeholder}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Mendukung file JPG, PNG, atau WEBP (maksimal 5MB)
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-300">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
