export default function LoadingScreen({ label }: { label?: string }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center safe-top safe-bottom">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-brand/20" />
        <div className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin" />
      </div>
      <div>
        <p className="text-[15px] font-medium text-ink">
          {label ?? "Menyiapkan kalender…"}
        </p>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          Kalau ini pertama kali dibuka setelah lama tidak dipakai, server
          database sedang &quot;bangun&quot; dari mode hemat daya — biasanya
          cuma beberapa detik.
        </p>
      </div>
    </div>
  );
}
