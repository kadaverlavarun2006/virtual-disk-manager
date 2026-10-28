import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, BarChart3, Disc3, FolderOpen, HardDrive, ShieldCheck, Zap } from "lucide-react";

const tools = [
  {
    icon: Disc3,
    title: "Disk scheduling",
    description: "Run FCFS, SSTF, SCAN, C-SCAN, LOOK, and C-LOOK against your own request queues.",
    label: "6 algorithms",
    to: "/disk-scheduling",
  },
  {
    icon: FolderOpen,
    title: "File allocation",
    description: "See sequential, linked, and indexed allocation take shape across a virtual disk.",
    label: "3 strategies",
    to: "/file-allocation",
  },
  {
    icon: BarChart3,
    title: "Run history",
    description: "Save results locally, review performance, and compare your past simulations.",
    label: "Private to this device",
    to: "/dashboard",
  },
];

export default function Home() {
  return (
    <main className="container mx-auto max-w-6xl space-y-14 px-4 pb-16 pt-10 sm:pt-16">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card px-6 py-12 shadow-2xl shadow-primary/5 sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-accent/15 blur-[100px]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              OPERATING SYSTEMS, MADE VISUAL
            </div>
            <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              Understand what happens <span className="gradient-text">under the hood.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Explore disk scheduling and file allocation with hands-on simulations, clear visualizations, and instant comparisons.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/disk-scheduling" className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5">
                Start a simulation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-5 py-3 text-sm font-semibold transition-colors hover:bg-muted">
                View run history <ArrowDownRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="glass rounded-3xl p-5 shadow-xl shadow-black/10">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Disk activity</p>
                  <p className="mt-1 text-lg font-semibold">Head movement</p>
                </div>
                <span className="rounded-lg bg-primary/10 p-2 text-primary"><HardDrive className="h-5 w-5" /></span>
              </div>
              <div className="space-y-3">
                {[["FCFS", 82, "bg-primary"], ["SSTF", 54, "bg-violet-400"], ["SCAN", 68, "bg-emerald-400"]].map(([label, width, color]) => (
                  <div key={label} className="rounded-xl border border-border/70 bg-background/60 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold">{label}</span>
                      <span className="font-mono text-muted-foreground">{width * 2 + 38} tracks</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                Run and compare algorithms instantly
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs shadow-lg">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Your history stays on this device
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Explore the toolkit</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Learn by experimenting</h2>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">Pick a workspace to get started</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map(({ icon: Icon, title, description, label, to }) => (
            <Link key={to} to={to} className="glass group rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5">
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{description}</p>
              <span className="mt-5 inline-flex rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
