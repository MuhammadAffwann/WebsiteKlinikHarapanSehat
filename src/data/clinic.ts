/**
 * Single source of truth for all clinic content.
 * Edit copy here — pages only render this data.
 */

export const clinic = {
  name: "Klinik Harapan Sehat",
  phone: "0263336097",
  whatsapp: "+62 858-7155-5157",
  whatsappUrl: "https://wa.me/6285871555157",
  doctorScheduleUrl: "https://jadwal-dokter.harapansehat.id",
  email: "admin@klinikharapansehat.id",
  address: "Jl. Raya Cibeber No.20, Sukasari, Kec. Cilaku, Kabupaten Cianjur, Jawa Barat 43285",
  hours: [
    { day: "Senin – Jumat", time: "08.00 – 21.00" },
    { day: "Sabtu", time: "08.00 – 18.00" },
    { day: "Minggu & Hari Libur", time: "09.00 – 15.00" },
  ],
  social: {
    instagram: "https://www.instagram.com/klinik.hs/",
    facebook: "https://www.facebook.com/klinik.hs/",
    tiktok: "https://www.tiktok.com/@klinik.hs",
  },
} as const;

export const stats = [
  { value: "18+", label: "Tahun Melayani" },
  { value: "24/7", label: "Layanan Gawat Darurat" },
  { value: "40+", label: "Dokter & Tenaga Medis" },
  { value: "99.8%", label: "Kepuasan Pasien" },
] as const;

export type Service = {
  slug: string;
  title: string;
  description: string;
  points: string[];
  badge?: string;
  image: "umum" | "gigi" | "ibuAnak" | "lab" | "darurat" | "optic" | "rawatInap";
};

export const services: Service[] = [
  {
    slug: "poli-umum",
    title: "Poli Umum",
    description:
      "Pemeriksaan kesehatan harian, pengobatan penyakit ringan, hingga rujukan spesialis oleh dokter umum berpengalaman.",
    points: [
      "Konsultasi dokter umum",
      "Surat keterangan sehat",
      "Pengobatan ISPA & demam",
      "Sistem Ijab Kabul",
    ],
    image: "umum",
    badge: "Paling Dicari",
  },
  {
    slug: "kesehatan-gigi",
    title: "Kesehatan Gigi",
    description:
      "Perawatan gigi lengkap mulai dari pembersihan karang gigi, tambal, hingga pencabutan dengan peralatan steril.",
    points: ["Scaling & pemutihan", "Tambal gigi estetik", "Cabut gigi minim nyeri"],
    image: "gigi",
  },
  {
    slug: "ibu-dan-anak",
    title: "Ibu & Anak",
    description:
      "Pendampingan kehamilan, USG, imunisasi anak, dan konsultasi tumbuh kembang dalam suasana yang nyaman.",
    points: ["Kontrol kehamilan & USG", "Imunisasi lengkap", "Konsultasi laktasi"],
    image: "ibuAnak",
  },
  {
    slug: "laboratorium",
    title: "Laboratorium",
    description:
      "Pemeriksaan darah, urine, dan panel medical check-up dengan hasil digital yang dapat diakses dari ponsel.",
    points: ["Cek darah lengkap", "Panel gula & kolesterol", "Hasil digital 3 jam"],
    image: "lab",
  },
  {
    slug: "optik",
    title: "Layanan Optik",
    description:
      "Pemeriksaan kesehatan mata, resep kacamata, serta penyediaan bingkai dan lensa berkualitas untuk ketajaman penglihatan Anda.",
    points: ["Pemeriksaan visus mata", "Koleksi bingkai & lensa", "Konsultasi kesehatan mata"],
    image: "optic",
  },
  {
    slug: "rawat-inap",
    title: "Rawat Inap",
    description:
      "Perawatan inap pasien dengan fasilitas kamar yang nyaman, higienis, dan pengawasan tim medis serta perawat 24 jam.",
    points: ["Kamar perawatan nyaman", "Perawat & dokter siaga 24 jam", "Fasilitas medis lengkap"],
    image: "rawatInap",
  },
  {
    slug: "gawat-darurat",
    title: "Gawat Darurat 24 Jam",
    description:
      "Tim siaga 24 jam dengan ruang tindakan, ambulans, dan jalur cepat rujukan ke rumah sakit mitra.",
    points: ["Ambulans siaga", "Ruang tindakan", "Rujukan cepat"],
    image: "darurat",
  },
];

export type Doctor = {
  slug: string;
  name: string;
  specialty: string;
  days: string;
  time: string;
  image?: string;
};

export const doctors: Doctor[] = [
  {
    slug: "dr-riyan-annasith",
    name: "dr. Riyan Annasith",
    specialty: "Dokter Umum",
    days: "Senin – Jumat",
    time: "07:00 – 20:00",
  },
  {
    slug: "dr-yusuf-nugraha",
    name: "Dr Yusuf Nugraha M.H",
    specialty: "Dokter Umum",
    days: "Senin – Rabu",
    time: "09:30 – 19:00",
  },
  {
    slug: "dr-raden-robi-a",
    name: "dr. Raden Robi A",
    specialty: "Dokter Umum",
    days: "Senin – Minggu",
    time: "09:00 – 20:00",
  },
  {
    slug: "dr-pratiwi-eka-putri",
    name: "dr. Pratiwi Eka Putri",
    specialty: "Dokter Umum",
    days: "Selasa, Rabu, dan Jumat",
    time: "09:00 – 20:00",
  },
  {
    slug: "dr-nofan-pratama",
    name: "dr. Nofan Pratama",
    specialty: "Dokter Umum",
    days: "Sabtu – Minggu",
    time: "07:00 – 20:00",
  },
  {
    slug: "dr-muhammad-rudiansyah",
    name: "dr. Muhammad Rudiansyah",
    specialty: "Dokter Umum",
    days: "Kamis dan Sabtu",
    time: "09:00 – 20:00",
  },
  {
    slug: "dr-guntur-muharram",
    name: "dr. Guntur Muharram",
    specialty: "Dokter Umum",
    days: "Senin – Jumat",
    time: "20:00 – 07:00",
  },
  {
    slug: "dr-rizki-hermawan",
    name: "dr. Rizki Hermawan",
    specialty: "Dokter Umum",
    days: "Jumat – Minggu",
    time: "20:00 – 07:00",
  },
  {
    slug: "drg-ardisa-nadia-saraswati",
    name: "drg. Ardisa Nadia Saraswati",
    specialty: "Dokter Gigi",
    days: "Selasa – Jumat",
    time: "08:00 – 19:00",
  },
  {
    slug: "drg-ariesty",
    name: "drg. Ariesty",
    specialty: "Dokter Gigi",
    days: "Sabtu",
    time: "17:00 – 19:00",
  },
];

export type Post = {
  slug: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "cek-kesehatan-rutin",
    category: "Edukasi",
    date: "24 Juli 2026",
    title: "Kenapa Cek Kesehatan Rutin Setiap 6 Bulan Itu Penting",
    excerpt:
      "Banyak penyakit kronis berkembang tanpa gejala. Pemeriksaan berkala membantu menemukannya lebih awal saat masih mudah ditangani.",
    body: [
      "Tekanan darah tinggi, diabetes, dan kolesterol tinggi sering disebut silent disease karena tidak menimbulkan keluhan pada tahap awal.",
      "Di Klinik Harapan Sehat, paket medical check-up dasar mencakup pemeriksaan tekanan darah, gula darah, profil lipid, serta konsultasi hasil bersama dokter umum.",
      "Kami menyarankan pemeriksaan setiap enam bulan bagi usia di atas 35 tahun, dan setahun sekali untuk usia dewasa muda tanpa faktor risiko.",
    ],
  },
  {
    slug: "imunisasi-anak-lengkap",
    category: "Ibu & Anak",
    date: "12 Juni 2026",
    title: "Panduan Jadwal Imunisasi Anak yang Perlu Orang Tua Tahu",
    excerpt:
      "Jadwal imunisasi membantu melindungi anak pada masa paling rentan. Berikut ringkasan yang mudah diikuti orang tua.",
    body: [
      "Imunisasi dasar dimulai sejak lahir dengan hepatitis B, dilanjutkan BCG, polio, DPT, hingga campak pada usia sembilan bulan.",
      "Bila ada jadwal yang terlewat, imunisasi masih dapat dikejar. Tim kami akan menyusun jadwal susulan sesuai usia anak.",
      "Setiap kunjungan imunisasi disertai pemeriksaan tumbuh kembang agar perkembangan anak terpantau dengan baik.",
    ],
  },
  {
    slug: "layanan-gawat-darurat",
    category: "Informasi Klinik",
    date: "3 Maret 2026",
    title: "Layanan Gawat Darurat 24 Jam Kini Tersedia Setiap Hari",
    excerpt:
      "Kami memperluas layanan gawat darurat dengan ambulans siaga dan jalur rujukan cepat ke rumah sakit mitra.",
    body: [
      "Ruang tindakan baru kami dilengkapi monitor pasien, nebulizer, dan perangkat EKG untuk penanganan awal kasus darurat.",
      "Ambulans siaga beroperasi 24 jam dan dapat dipanggil melalui nomor telepon klinik.",
      "Untuk kasus yang membutuhkan perawatan lanjutan, kami bekerja sama dengan tiga rumah sakit rujukan di Cianjur.",
    ],
  },
];
