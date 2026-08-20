import { useState } from "react";
import { DoctorCard } from "@/components/site/cards";
import { StaggerContainer, StaggerItem } from "@/components/site/scroll-reveal";
import { doctors } from "@/data/clinic";

// Day order (0 = Senin, 6 = Minggu)
const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const;
type Day = (typeof DAYS)[number];

const DAY_INDEX: Record<Day, number> = {
  Senin: 0,
  Selasa: 1,
  Rabu: 2,
  Kamis: 3,
  Jumat: 4,
  Sabtu: 5,
  Minggu: 6,
};

/**
 * Returns an array of all day indices covered by a `days` string.
 * Handles:
 *  - Single day:  "Kamis"
 *  - Range same-week: "Senin – Rabu"  → [0,1,2]
 *  - Range wrap-around: "Sabtu – Selasa" → [5,6,0,1]
 */
function coveredDays(daysStr: string): number[] {
  // Handle lists separated by comma or 'dan' (e.g. "Selasa, Rabu, dan Jumat" or "Kamis dan Sabtu")
  const dayTokens = daysStr
    .split(/,|(?:\sdan\s)/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const resultSet = new Set<number>();

  for (const token of dayTokens) {
    if (token.includes("–") || token.includes("-")) {
      const parts = token.split(/\s*[–-]\s*/);
      const startDay = parts[0]?.trim() as Day;
      const endDay = parts[1]?.trim() as Day | undefined;

      const startIdx = DAY_INDEX[startDay] ?? -1;
      if (startIdx !== -1) {
        if (!endDay) {
          resultSet.add(startIdx);
        } else {
          const endIdx = DAY_INDEX[endDay] ?? -1;
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
      const day = token as Day;
      const idx = DAY_INDEX[day] ?? -1;
      if (idx !== -1) resultSet.add(idx);
    }
  }

  return Array.from(resultSet);
}

/** Get today's day name (in Bahasa) */
function getTodayName(): Day {
  // JS: 0=Sunday, 1=Monday... convert to our order
  const jsDay = new Date().getDay();
  const map: Day[] = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return map[jsDay] ?? "Senin";
}

export function DoctorSection() {
  const today = getTodayName();
  const [activeDay, setActiveDay] = useState<Day | "Semua">(today);

  const filtered =
    activeDay === "Semua"
      ? doctors
      : doctors.filter((doc) => coveredDays(doc.days).includes(DAY_INDEX[activeDay]));

  return (
    <div className="mt-8">
      {/* Day filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveDay("Semua")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeDay === "Semua"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/80"
          }`}
        >
          Semua
        </button>
        {DAYS.map((day) => {
          const count = doctors.filter((doc) =>
            coveredDays(doc.days).includes(DAY_INDEX[day]),
          ).length;
          const isActive = activeDay === day;
          const isToday = day === today;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              {day}
              {isToday && (
                <span
                  title="Hari ini"
                  className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-background bg-green-500"
                />
              )}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active label */}
      <p className="mt-4 text-sm text-muted-foreground">
        {activeDay === "Semua"
          ? `Menampilkan semua ${filtered.length} jadwal dokter`
          : `${filtered.length} dokter tersedia hari ${activeDay}`}
        {activeDay === today && (
          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
            <span className="size-1.5 rounded-full bg-green-500" />
            Hari ini
          </span>
        )}
      </p>

      {/* Doctor grid */}
      {filtered.length > 0 ? (
        <StaggerContainer
          key={activeDay}
          staggerChildren={0.06}
          className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filtered.map((doctor) => (
            <StaggerItem key={doctor.slug}>
              <DoctorCard doctor={doctor} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="text-4xl">😔</span>
          <p className="font-semibold">Tidak ada dokter yang praktik hari {activeDay}</p>
          <p className="text-sm text-muted-foreground">
            Coba pilih hari lain atau lihat semua jadwal.
          </p>
          <button
            onClick={() => setActiveDay("Semua")}
            className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Lihat semua dokter
          </button>
        </div>
      )}
    </div>
  );
}
