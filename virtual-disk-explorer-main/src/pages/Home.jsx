import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, BarChart3, Disc3, FolderOpen, HardDrive, ShieldCheck } from "lucide-react";

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
    <main className="container mx-auto max-w-6xl space-y-10 px-4 pb-12 pt-8 sm:pt-10">
      <section className="border-y border-border bg-card px-5 py-8 sm:px-8 sm:py-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              SIMULATION TOOLS FOR OPERATING SYSTEMS
            </div>
            <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Understand disk systems through simulation.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Explore disk scheduling and file allocation with interactive models, step-by-step results, and clear comparisons.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/disk-scheduling" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Start a simulation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                View run history <ArrowDownRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm border border-border bg-background p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Example comparison</p>
                  <p className="mt-1 text-lg font-semibold">Total seek distance</p>
                </div>
                <span className="rounded-md bg-muted p-2 text-primary"><HardDrive className="h-5 w-5" /></span>
              </div>
              <div className="space-y-3">
                {[[ "FCFS", 643, 90, "bg-primary"], ["SSTF", 205, 38, "bg-primary/70"], ["SCAN", 357, 58, "bg-primary/45"]].map(([label, value, width, color]) => (
                  <div key={label} className="border-b border-border py-2.5">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-semibold">{label}</span>
                      <span className="font-mono text-muted-foreground">{value} units</span>
                    </div>
                    <div className="h-1 overflow-hidden bg-muted">
                      <div className={`h-full ${color}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Your history stays on this device
              </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Explore the toolkit</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Choose a simulation</h2>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">Pick a workspace to get started</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map(({ icon: Icon, title, description, label, to }) => (
            <Link key={to} to={to} className="glass group rounded-md p-5 transition-colors hover:border-primary/50">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{description}</p>
              <span className="mt-4 inline-flex text-xs font-medium text-muted-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
