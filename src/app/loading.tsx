export default function Loading() {
  return (
    <div className="min-h-dvh bg-cream-50">
      <div className="border-b border-ink-100 bg-white/70">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="skeleton h-8 w-40" />
          <div className="hidden gap-2 sm:flex">
            <div className="skeleton h-8 w-20" />
            <div className="skeleton h-8 w-24" />
            <div className="skeleton h-9 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <div className="container-page py-12">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-4">
            <div className="skeleton h-6 w-32 rounded-full" />
            <div className="skeleton h-14 w-full max-w-lg" />
            <div className="skeleton h-14 w-full max-w-md" />
            <div className="skeleton h-5 w-full max-w-sm" />
            <div className="flex gap-3 pt-2">
              <div className="skeleton h-12 w-40 rounded-full" />
              <div className="skeleton h-12 w-32 rounded-full" />
            </div>
          </div>
          <div className="skeleton h-72 w-full rounded-3xl" />
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
