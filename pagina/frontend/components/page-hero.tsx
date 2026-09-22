export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-sky-wash">
      <div className="absolute inset-0 cloud-grid opacity-50" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/40 via-transparent to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="inline-flex items-center rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur-sm">
          {eyebrow}
        </div>
        <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </section>
  )
}
