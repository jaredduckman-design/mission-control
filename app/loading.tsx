const skeletonRows = Array.from({ length: 4 })
const navRows = Array.from({ length: 8 })

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#050816] px-4 py-5 text-slate-100 lg:px-6 lg:py-6">
      <div className="mx-auto grid max-w-[1680px] gap-5 xl:grid-cols-[260px_minmax(0,1fr)] animate-pulse">
        <aside className="rounded-[32px] border border-white/8 bg-[#091122]/95 p-5">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
            <div className="h-6 w-36 rounded bg-white/10" />
            <div className="mt-3 h-4 w-28 rounded bg-white/10" />
            <div className="mt-5 h-24 rounded-2xl bg-white/5" />
          </div>

          <div className="mt-6 space-y-2">
            {navRows.map((_, index) => (
              <div key={index} className="h-11 rounded-2xl border border-white/5 bg-white/[0.03]" />
            ))}
          </div>
        </aside>

        <section className="space-y-5">
          <header className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-6">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="mt-4 h-10 w-2/3 rounded bg-white/10" />
            <div className="mt-4 h-4 w-3/4 rounded bg-white/10" />

            <div className="mt-6 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {skeletonRows.map((_, index) => (
                <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="h-4 w-24 rounded bg-white/10" />
                  <div className="mt-3 h-8 w-16 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </header>

          <section className="grid gap-5 2xl:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-5">
              <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5">
                <div className="h-7 w-52 rounded bg-white/10" />
                <div className="mt-5 grid gap-4 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="h-6 w-28 rounded bg-white/10" />
                      <div className="mt-3 h-4 w-full rounded bg-white/10" />
                      <div className="mt-3 h-2 w-full rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5">
                <div className="h-7 w-56 rounded bg-white/10" />
                <div className="mt-5 grid gap-4 xl:grid-cols-4">
                  {skeletonRows.map((_, index) => (
                    <div key={index} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="h-4 w-28 rounded bg-white/10" />
                      <div className="mt-3 h-6 w-36 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/8 bg-[#091120]/90 p-5">
              <div className="h-7 w-52 rounded bg-white/10" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 rounded-3xl border border-white/10 bg-white/[0.04]" />
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  )
}
