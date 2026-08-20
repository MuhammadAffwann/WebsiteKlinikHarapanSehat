export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Mark: Green S box top, Blue H box bottom */}
      <div className="relative flex h-11 w-9 shrink-0 flex-col justify-between">
        {/* Top-right Green S box */}
        <div className="absolute top-0 right-0 flex size-5 items-center justify-center rounded-[3px] bg-[#43a047] font-bold text-white shadow-sm">
          <span className="text-[12px] font-extrabold leading-none">S</span>
        </div>
        {/* Bottom-left Blue H box */}
        <div className="absolute bottom-0 left-0 flex size-5 items-center justify-center rounded-[3px] bg-[#0052cc] font-bold text-white shadow-sm">
          <span className="text-[12px] font-extrabold leading-none">H</span>
        </div>
      </div>

      {/* Text Group */}
      <div className="flex flex-col justify-center leading-none">
        {/* Top row: Orange "Klinik" */}
        <span className="text-[13px] font-bold tracking-tight text-[#f2791d]">Klinik</span>

        {/* Middle row: Green "Harapan" + Blue "Sehat" */}
        <div className="mt-0.5 flex items-baseline font-display text-xl font-bold tracking-tight">
          <span className="text-[#38a169]">Harapan</span>
          <span className="ml-1 text-[#0052cc]">Sehat</span>
        </div>

        {/* Bottom row: Tagline "Ijab Kabul Biaya Berobat" */}
        <div className="mt-1 flex items-center gap-1 font-serif text-[10px] font-semibold italic text-[#f2791d]">
          <span>Ijab Kabul Biaya Berobat</span>
          <span className="flex size-3 items-center justify-center rounded-full border border-[#f2791d] p-0.2">
            <svg
              className="size-2 text-[#f2791d]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 11V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" />
              <path d="m11 17 2 2a1 1 0 0 0 1.4 0l3.6-3.6" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
