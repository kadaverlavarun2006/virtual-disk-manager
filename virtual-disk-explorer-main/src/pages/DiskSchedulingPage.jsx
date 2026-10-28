import { useState, useCallback } from "react";
import { fcfs, sstf, scan, cscan, look, clook } from "@/lib/algorithms/diskScheduling";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Play, RotateCcw, Shuffle, ChevronDown, Save } from "lucide-react";
import { saveSimulation } from "@/lib/simulationHistory";

const ALGO_MAP = { fcfs, sstf, scan, cscan, look, clook };
const ALGO_LABELS = { fcfs: "FCFS", sstf: "SSTF", scan: "SCAN", cscan: "C-SCAN", look: "LOOK", clook: "C-LOOK" };
const COLORS = { fcfs: "#315f9c", sstf: "#3c8992", scan: "#46866b", cscan: "#ad7a34", look: "#626d8c", clook: "#9a5962" };

export default function DiskSchedulingPage() {
  const [cylinders, setCylinders] = useState(200);
  const [head, setHead] = useState(50);
  const [requestStr, setRequestStr] = useState("98, 183, 37, 122, 14, 124, 65, 67");
  const [direction, setDirection] = useState('right');
  const [selectedAlgo, setSelectedAlgo] = useState("fcfs");
  const [result, setResult] = useState(null);
  const [animStep, setAnimStep] = useState(-1);
  const [comparing, setComparing] = useState(false);
  const [compareResults, setCompareResults] = useState({});
  const [runParameters, setRunParameters] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [runError, setRunError] = useState("");

  const parseRequests = () => requestStr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n >= 0 && n < cylinders);

  const runAlgorithm = useCallback(() => {
    const requests = parseRequests();
    if (requests.length === 0) {
      setRunError("Enter at least one request within the selected cylinder range.");
      return;
    }
    if (!Number.isInteger(cylinders) || cylinders < 1 || !Number.isInteger(head) || head < 0 || head >= cylinders) {
      setRunError("Choose a valid cylinder count and a head position within that range.");
      return;
    }
    setRunError("");
    setSaveMessage("");
    const algo = ALGO_MAP[selectedAlgo];
    const needsDir = ['scan', 'cscan', 'look', 'clook'].includes(selectedAlgo);
    const r = needsDir
      ? algo(head, requests, cylinders, direction)
      : algo(head, requests);
    setResult(r);
    setRunParameters({ algorithm: selectedAlgo, cylinders, head, requests });
    setAnimStep(-1);
    setComparing(false);
  }, [selectedAlgo, head, requestStr, cylinders, direction]);

  const compareAll = useCallback(() => {
    const requests = parseRequests();
    if (requests.length === 0) {
      setRunError("Enter at least one request within the selected cylinder range.");
      return;
    }
    if (!Number.isInteger(cylinders) || cylinders < 1 || !Number.isInteger(head) || head < 0 || head >= cylinders) {
      setRunError("Choose a valid cylinder count and a head position within that range.");
      return;
    }
    setRunError("");
    const results = {};
    for (const [name, fn] of Object.entries(ALGO_MAP)) {
      const needsDir = ['scan', 'cscan', 'look', 'clook'].includes(name);
      results[name] = needsDir
        ? fn(head, requests, cylinders, direction)
        : fn(head, requests);
    }
    setCompareResults(results);
    setComparing(true);
    setResult(null);
  }, [head, requestStr, cylinders, direction]);

  const randomize = () => {
    const count = 8 + Math.floor(Math.random() * 8);
    const reqs = Array.from({ length: count }, () => Math.floor(Math.random() * cylinders));
    setRequestStr(reqs.join(", "));
    setHead(Math.floor(Math.random() * cylinders));
  };

  const animate = () => {
    if (!result) return;
    setAnimStep(0);
    let step = -1;
    const interval = setInterval(() => {
      step++;
      if (step >= result.seekSequence.length - 1) clearInterval(interval);
      setAnimStep(step);
    }, 800);
  };

  const saveResult = () => {
    if (!result || !runParameters) return;
    setSaveMessage("");
    try {
      saveSimulation({
        ...runParameters,
        totalSeekTime: result.totalSeekTime,
        averageSeekTime: result.averageSeekTime,
      });
      setSaveMessage("Saved to this device. View it in History.");
    } catch (saveError) {
      setSaveMessage(`Unable to save simulation: ${saveError.message || "Unknown error."}`);
    }
  };

  const displayedAlgorithm = runParameters?.algorithm ?? selectedAlgo;
  const chartData = result ? result.seekSequence.map((pos, i) => ({ step: i, position: pos })) : [];
  const animatedData = animStep >= 0 ? chartData.slice(0, animStep + 2) : chartData;
  const completedMoves = result ? (animStep < 0 ? result.steps.length : Math.min(animStep + 1, result.steps.length)) : 0;
  const currentHead = result ? result.seekSequence[completedMoves] : head;

  return (
    <main className="container mx-auto max-w-6xl space-y-6 px-4 py-7 sm:py-9">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Activity className="h-3.5 w-3.5" /> Interactive simulator
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Disk scheduling</h1>
        <p className="mt-2 text-muted-foreground">Explore how disk algorithms order I/O requests and move the read/write head.</p>
      </div>

      {/* Input Panel */}
      <div className="glass rounded-md p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Cylinders</label>
            <input type="number" value={cylinders} onChange={e => setCylinders(+e.target.value)} min={1}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Initial Head Position</label>
            <input type="number" value={head} onChange={e => setHead(+e.target.value)} min={0} max={cylinders - 1}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Algorithm</label>
            <div className="relative">
              <select value={selectedAlgo} onChange={e => setSelectedAlgo(e.target.value)}
                className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none transition-colors">
                {Object.entries(ALGO_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Direction</label>
            <div className="relative">
              <select value={direction} onChange={e => setDirection(e.target.value)}
                className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none transition-colors">
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Request Queue (comma-separated)</label>
          <input value={requestStr} onChange={e => setRequestStr(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:border-primary outline-none transition-colors" />
        </div>
        {runError && <p role="alert" className="border-l-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">{runError}</p>}
        <div className="flex flex-wrap gap-2">
          <button onClick={runAlgorithm} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            <Play className="w-4 h-4" /> Run
          </button>
          <button onClick={compareAll} className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
            Compare All
          </button>
          <button onClick={randomize} className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
            <Shuffle className="w-4 h-4" /> Random
          </button>
          {result && (
            <button onClick={animate} className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
              <RotateCcw className="w-4 h-4" /> Animate
            </button>
          )}
        </div>
      </div>

      {/* Single Result */}
      {result && !comparing && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="glass rounded-md p-4 sm:p-5 lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">Head movement <span className="text-primary">/ {ALGO_LABELS[displayedAlgorithm]}</span></h2>
                <p className="mt-1 text-xs text-muted-foreground">Each point is a cylinder. Follow the line in request order.</p>
              </div>
              <span className="border border-border bg-background px-2.5 py-1 text-xs font-mono">
                Head at <strong className="text-primary">{currentHead}</strong>
              </span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={animatedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="step" label={{ value: "Step", position: "insideBottom", offset: -5 }} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[0, cylinders]} label={{ value: "Cylinder", angle: -90, position: "insideLeft" }} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                <Line type="linear" dataKey="position" stroke={COLORS[displayedAlgorithm]} strokeWidth={2.5} dot={{ fill: COLORS[displayedAlgorithm], r: 4 }} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-1 border-t border-border pt-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                <label htmlFor="movement-progress" className="font-medium">Playback</label>
                <span className="font-mono text-muted-foreground">
                  {completedMoves === result.steps.length ? "Route complete" : `Move ${completedMoves} of ${result.steps.length}`}
                </span>
              </div>
              <input
                id="movement-progress"
                aria-label="Head movement progress"
                type="range"
                min="0"
                max={result.steps.length}
                value={animStep < 0 ? result.steps.length : animStep + 1}
                onChange={(event) => setAnimStep(Number(event.target.value) - 1)}
                className="w-full accent-primary"
              />
              <div className="mt-1 flex justify-between text-[11px] font-mono text-muted-foreground">
                <span>Start · {runParameters.head}</span>
                <span>Finish · {result.seekSequence[result.seekSequence.length - 1]}</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="glass rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Seek Time</span><span className="font-bold text-primary">{result.totalSeekTime}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Average Seek Time</span><span className="font-bold">{result.averageSeekTime.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Requests Served</span><span className="font-bold">{result.order.length}</span></div>
              </div>
            </div>
            <div className="glass rounded-md p-4">
                <button
                  type="button"
                  onClick={saveResult}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Save className="w-4 h-4" />
                  Save to history
                </button>
                <p className="mt-2 text-center text-xs text-muted-foreground">Stored privately in this browser</p>
                {saveMessage && <p role={saveMessage.startsWith("Unable") ? "alert" : "status"} className={`mt-3 text-sm ${saveMessage.startsWith("Unable") ? "text-destructive" : "text-emerald-400"}`}>{saveMessage}</p>}
              </div>
            <div className="glass rounded-md p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Execution Order</h3>
              <div className="flex flex-wrap gap-2">
                {result.order.map((r, i) => (
                  <span key={i} className="border border-border bg-muted/60 px-2 py-1 text-xs font-mono font-medium">{r}</span>
                ))}
              </div>
            </div>
            <div className="glass rounded-md p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">Movement steps</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Distance between each consecutive request.</p>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{result.steps.length} moves</span>
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto">
                {result.steps.map((s, i) => (
                  <article
                    key={i}
                    className={`grid grid-cols-[2rem_1fr_auto] items-center gap-2 border-l-2 px-2 py-2 ${
                      animStep === i ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    <span className="font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="min-w-0">
                      <span className="block font-mono text-sm font-medium">{s.from} <span className="text-primary">→</span> {s.to}</span>
                      <span className="mt-1 block h-1 max-w-24 bg-muted">
                        <span className="block h-full bg-primary" style={{ width: `${Math.max(4, (s.seek / Math.max(...result.steps.map((step) => step.seek), 1)) * 100)}%` }} />
                      </span>
                    </span>
                    <span className="whitespace-nowrap text-right text-xs font-semibold">{s.seek} <span className="font-normal text-muted-foreground">cyl.</span></span>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compare All */}
      {comparing && (
        <div className="space-y-6">
          <div className="glass rounded-md p-4 sm:p-5">
            <h2 className="text-lg font-bold mb-4">Algorithm Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Algorithm</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Total Seek</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Avg Seek</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(compareResults).sort((a, b) => a[1].totalSeekTime - b[1].totalSeekTime).map(([name, r]) => (
                    <tr key={name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: COLORS[name] }} />
                        {ALGO_LABELS[name]}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">{r.totalSeekTime}</td>
                      <td className="py-3 px-4 text-right font-mono">{r.averageSeekTime.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="glass rounded-md p-4 sm:p-5">
            <h2 className="text-lg font-bold mb-4">Head Movement Comparison</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="step" type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[0, cylinders]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                {Object.entries(compareResults).map(([name, r]) => (
                  <Line key={name} data={r.seekSequence.map((pos, i) => ({ step: i, [name]: pos }))} dataKey={name} name={ALGO_LABELS[name]}
                    stroke={COLORS[name]} strokeWidth={2} dot={false} type="linear" />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </main>
  );
}
