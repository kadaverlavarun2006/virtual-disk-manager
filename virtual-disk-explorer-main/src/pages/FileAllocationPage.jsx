import { useState } from "react";
import { createFileSystem, allocateSequential, allocateLinked, allocateIndexed, deallocateFile } from "@/lib/algorithms/fileAllocation";
import { HardDrive, Plus, Trash2, ChevronDown } from "lucide-react";

const BLOCK_COLORS = [
  "hsl(210, 100%, 55%)", "hsl(265, 85%, 60%)", "hsl(142, 72%, 45%)",
  "hsl(38, 92%, 50%)", "hsl(185, 85%, 50%)", "hsl(340, 80%, 55%)",
  "hsl(30, 90%, 55%)", "hsl(200, 80%, 50%)",
];

export default function FileAllocationPage() {
  const [totalBlocks, setTotalBlocks] = useState(32);
  const [fs, setFs] = useState(() => createFileSystem(32));
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(4);
  const [method, setMethod] = useState('sequential');
  const [error, setError] = useState("");

  const resetFs = () => { setFs(createFileSystem(totalBlocks)); setError(""); };

  const allocate = () => {
    if (!fileName.trim()) { setError("Enter a file name"); return; }
    if (fileSize < 1) { setError("Size must be at least 1"); return; }
    setError("");
    let result;
    if (method === 'sequential') result = allocateSequential(fs, fileName, fileSize);
    else if (method === 'linked') result = allocateLinked(fs, fileName, fileSize);
    else result = allocateIndexed(fs, fileName, fileSize);
    if (typeof result === 'string') setError(result);
    else { setFs(result); setFileName(""); }
  };

  const deleteFile = (id) => setFs(deallocateFile(fs, id));

  const fileColorMap = {};
  fs.files.forEach((f, i) => { fileColorMap[f.id] = BLOCK_COLORS[i % BLOCK_COLORS.length]; });

  const cols = totalBlocks <= 16 ? 8 : totalBlocks <= 64 ? 8 : 16;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <HardDrive className="h-3.5 w-3.5" /> Storage simulator
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">File allocation</h1>
        <p className="mt-2 text-muted-foreground">Visualize how different strategies reserve disk blocks for files.</p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        {/* Controls */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-bold">Disk Setup</h2>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Total Blocks</label>
              <input type="number" value={totalBlocks} onChange={e => setTotalBlocks(+e.target.value)} min={8} max={256}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
            </div>
            <button onClick={resetFs} className="w-full py-2.5 rounded-xl glass font-semibold text-sm hover:bg-muted transition-all">
              Reset Disk
            </button>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-bold">Create File</h2>
            {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-2">{error}</div>}
            <input placeholder="File name" value={fileName} onChange={e => setFileName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
            <input type="number" value={fileSize} onChange={e => setFileSize(+e.target.value)} min={1} placeholder="Size (blocks)"
              className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
            <div className="relative">
              <select value={method} onChange={e => setMethod(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none">
                <option value="sequential">Sequential</option>
                <option value="linked">Linked</option>
                <option value="indexed">Indexed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <button onClick={allocate} className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm">
              <Plus className="w-4 h-4" /> Allocate
            </button>
          </div>

          {/* File List */}
          <div className="glass rounded-2xl p-6">
            <h2 className="font-bold mb-3">Files ({fs.files.length})</h2>
            {fs.files.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files allocated yet</p>
            ) : (
              <div className="space-y-2">
                {fs.files.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: fileColorMap[f.id] }} />
                      <span className="text-sm font-medium">{f.name}</span>
                      <span className="text-xs text-muted-foreground">({f.size} blocks, {f.method})</span>
                    </div>
                    <button onClick={() => deleteFile(f.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Block Grid */}
        <div className="glass rounded-2xl p-5 lg:col-span-2 sm:p-6">
          <h2 className="font-bold mb-4">Disk Blocks</h2>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {fs.blocks.map(block => {
              const file = fs.files.find(f => f.id === block.fileId);
              const color = block.fileId ? fileColorMap[block.fileId] : undefined;
              return (
                <div
                  key={block.id}
                  className={`relative aspect-square rounded-lg border flex flex-col items-center justify-center text-xs transition-all ${
                    block.fileId ? 'border-transparent' : 'border-border bg-muted/20'
                  }`}
                  style={color ? { background: color + '22', borderColor: color } : undefined}
                  title={file ? `${file.name} (${file.method})${block.isIndex ? ' [INDEX]' : ''}${block.next !== null ? ` → ${block.next}` : ''}` : `Block ${block.id} (free)`}
                >
                  <span className="font-mono font-bold" style={color ? { color } : undefined}>{block.id}</span>
                  {block.isIndex && <span className="text-[8px] font-bold" style={{ color }}>IDX</span>}
                  {block.next !== null && (
                    <span className="text-[8px]" style={{ color }}>→{block.next}</span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded border border-border bg-muted/20" /> Free
            </div>
            {fs.files.map(f => (
              <div key={f.id} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded" style={{ background: fileColorMap[f.id] }} />
                {f.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
