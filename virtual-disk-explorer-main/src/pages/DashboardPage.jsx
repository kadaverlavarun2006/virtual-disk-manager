import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, Clock3, HardDrive, Trash2 } from "lucide-react";
import { clearSimulationHistory, readSimulationHistory, removeSimulation } from "@/lib/simulationHistory";

const COLORS = ["#5b8cff", "#9b7bff", "#36d399", "#ffba5c", "#42d5e8", "#f472b6"];

export default function DashboardPage() {
  const [simulations, setSimulations] = useState([]);
  const [error, setError] = useState("");

  const refreshHistory = useCallback(() => {
    try {
      setSimulations(readSimulationHistory());
      setError("");
    } catch (historyError) {
      setError(historyError.message || "Unable to read saved history.");
    }
  }, []);

  useEffect(() => {
    refreshHistory();
    window.addEventListener("storage", refreshHistory);
    return () => window.removeEventListener("storage", refreshHistory);
  }, [refreshHistory]);

  const algoStats = useMemo(() => {
    const stats = {};
    simulations.forEach((simulation) => {
      if (!stats[simulation.algorithm]) stats[simulation.algorithm] = { total: 0, count: 0 };
      stats[simulation.algorithm].total += Number(simulation.totalSeekTime);
      stats[simulation.algorithm].count++;
    });
    return stats;
  }, [simulations]);

  const chartData = Object.entries(algoStats).map(([name, { total, count }]) => ({
    name: name.toUpperCase(),
    avgSeek: Math.round(total / count),
  }));
  const averageSeek = simulations.length
    ? Math.round(simulations.reduce((total, simulation) => total + Number(simulation.averageSeekTime), 0) / simulations.length)
    : 0;

  const deleteSimulation = (id) => {
    try {
      removeSimulation(id);
      refreshHistory();
    } catch (historyError) {
      setError(historyError.message || "Unable to remove this simulation.");
    }
  };

  const clearHistory = () => {
    if (!window.confirm("Clear all saved simulations from this device?")) return;
    try {
      clearSimulationHistory();
      refreshHistory();
    } catch (historyError) {
      setError(historyError.message || "Unable to clear saved history.");
    }
  };

  return (
    <main className="container mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-12">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <Activity className="h-3.5 w-3.5" /> Personal workspace
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simulation history</h1>
          <p className="mt-2 text-muted-foreground">Your saved runs, kept privately in this browser.</p>
        </div>
        <Link to="/disk-scheduling" className="inline-flex items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
          New simulation <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p>}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Saved runs", value: simulations.length, icon: HardDrive, color: "text-primary" },
          { label: "Algorithms explored", value: Object.keys(algoStats).length, icon: Activity, color: "text-violet-400" },
          { label: "Average seek", value: averageSeek, icon: Clock3, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <article key={label} className="glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/70">
                <Icon className={`h-5 w-5 ${color}`} />
              </span>
            </div>
          </article>
        ))}
      </section>

      {chartData.length > 0 && (
        <section className="glass rounded-2xl p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">Seek time by algorithm</h2>
            <p className="mt-1 text-sm text-muted-foreground">Average total seek distance across your saved runs.</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip cursor={{ fill: "hsl(var(--muted) / 0.45)" }} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
              <Bar dataKey="avgSeek" name="Avg. seek distance" radius={[7, 7, 0, 0]}>
                {chartData.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}

      <section className="glass overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-semibold">Recent runs</h2>
            <p className="mt-1 text-xs text-muted-foreground">Stored on this device only</p>
          </div>
          {simulations.length > 0 && (
            <button type="button" onClick={clearHistory} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Clear history
            </button>
          )}
        </div>

        {simulations.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HardDrive className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-semibold">Nothing saved yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Run a disk scheduling algorithm and save its result to start building your history.</p>
            <Link to="/disk-scheduling" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              Run a simulation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 text-left font-medium">Algorithm</th>
                  <th className="px-4 py-3 text-right font-medium">Cylinders</th>
                  <th className="px-4 py-3 text-right font-medium">Head</th>
                  <th className="px-4 py-3 text-right font-medium">Total seek</th>
                  <th className="px-4 py-3 text-right font-medium">Avg. seek</th>
                  <th className="px-4 py-3 text-right font-medium">Date</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {simulations.map((simulation) => (
                  <tr key={simulation.id} className="border-t border-border/50 transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4 font-semibold">{simulation.algorithm.toUpperCase()}</td>
                    <td className="px-4 py-4 text-right font-mono text-muted-foreground">{simulation.cylinders}</td>
                    <td className="px-4 py-4 text-right font-mono text-muted-foreground">{simulation.head}</td>
                    <td className="px-4 py-4 text-right font-mono font-semibold">{simulation.totalSeekTime}</td>
                    <td className="px-4 py-4 text-right font-mono text-muted-foreground">{Number(simulation.averageSeekTime).toFixed(2)}</td>
                    <td className="px-4 py-4 text-right text-xs text-muted-foreground">{new Date(simulation.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <button type="button" aria-label={`Delete ${simulation.algorithm.toUpperCase()} run`} onClick={() => deleteSimulation(simulation.id)} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
