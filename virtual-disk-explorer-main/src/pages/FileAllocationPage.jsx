import { useState } from "react";
import { createFileSystem, allocateSequential, allocateLinked, allocateIndexed, deallocateFile } from "@/lib/algorithms/fileAllocation";
import { HardDrive, Plus, Trash2, ChevronDown } from "lucide-react";

const BLOCK_COLORS = [
  "hsl(213, 58%, 48%)", "hsl(190, 42%, 42%)", "hsl(152, 38%, 38%)",
  "hsl(35, 62%, 44%)", "hsl(215, 35%, 52%)", "hsl(340, 38%, 48%)",
  "hsl(24, 55%, 46%)", "hsl(200, 48%, 44%)",
];

export default function FileAllocationPage() {
  const [totalBlocks, setTotalBlocks] = useState(32);
  const [fs, setFs] = useState(() => createFileSystem(32));
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(4);
  const [method, setMethod] = useState('sequential');
  const [error, setError] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);

  const resetFs = () => {
    setFs(createFileSystem(totalBlocks));
    setSelectedFileId(null);
    setError("");
  };

  const allocate = () => {
    if (!fileName.trim()) { setError("Enter a file name"); return; }
    if (fileSize < 1) { setError("Size must be at least 1"); return; }
    setError("");
    let result;
    if (method === 'sequential') result = allocateSequential(fs, fileName, fileSize);
    else if (method === 'linked') result = allocateLinked(fs, fileName, fileSize);
    else result = allocateIndexed(fs, fileName, fileSize);
    if (typeof result === 'string') setError(result);
    else {
      setFs(result);
      setSelectedFileId(result.files[result.files.length - 1].id);
      setFileName("");
    }
  };

  const deleteFile = (id) => {
    const updatedFs = deallocateFile(fs, id);
    setFs(updatedFs);
    if (selectedFileId === id) setSelectedFileId(updatedFs.files[updatedFs.files.length - 1]?.id ?? null);
  };

  const fileColorMap = {};
  fs.files.forEach((f, i) => { fileColorMap[f.id] = BLOCK_COLORS[i % BLOCK_COLORS.length]; });
  const selectedFile = fs.files.find((file) => file.id === selectedFileId) ?? null;
  const allocationSteps = selectedFile ? getAllocationSteps(selectedFile) : [];
  const selectedBlockSteps = {};
  if (selectedFile) {
    if (selectedFile.method === "indexed") {
      selectedBlockSteps[selectedFile.indexBlock] = 1;
      selectedFile.blocks.forEach((blockId, index) => { selectedBlockSteps[blockId] = index + 2; });
    } else if (selectedFile.method === "sequential") {
      selectedFile.blocks.forEach((blockId, index) => { selectedBlockSteps[blockId] = index + 2; });
    } else {
      selectedFile.blocks.forEach((blockId, index) => { selectedBlockSteps[blockId] = index + 1; });
    }
  }

  const cols = totalBlocks <= 16 ? 8 : totalBlocks <= 64 ? 8 : 16;

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <HardDrive className="h-3.5 w-3.5" /> Storage simulator
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">File allocation</h1>
        <p className="mt-2 text-muted-foreground">Visualize how different strategies reserve disk blocks for files.</p>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        {/* Controls */}
        <div className="space-y-4">
          <div className="glass rounded-md p-5 space-y-4">
            <h2 className="font-bold">Disk Setup</h2>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Total Blocks</label>
              <input type="number" value={totalBlocks} onChange={e => setTotalBlocks(+e.target.value)} min={8} max={256}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
            </div>
            <button onClick={resetFs} className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors">
              Reset Disk
            </button>
          </div>

          <div className="glass rounded-md p-5 space-y-4">
            <h2 className="font-bold">Create File</h2>
            {error && <div role="alert" className="border-l-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
            <input placeholder="File name" value={fileName} onChange={e => setFileName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
            <input type="number" value={fileSize} onChange={e => setFileSize(+e.target.value)} min={1} placeholder="Size (blocks)"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none transition-colors" />
            <div className="relative">
              <select value={method} onChange={e => setMethod(e.target.value)}
                className="w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary outline-none transition-colors">
                <option value="sequential">Sequential</option>
                <option value="linked">Linked</option>
                <option value="indexed">Indexed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <button onClick={allocate} className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Allocate
            </button>
          </div>

          {/* File List */}
          <div className="glass rounded-md p-5">
            <h2 className="font-bold mb-3">Files ({fs.files.length})</h2>
            {fs.files.length === 0 ? (
              <p className="text-sm text-muted-foreground">No files allocated yet</p>
            ) : (
              <div className="space-y-2">
                {fs.files.map(f => (
                  <div key={f.id} className={`flex items-center justify-between border-t border-border py-1 ${selectedFileId === f.id ? "bg-muted/50" : ""}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedFileId(f.id)}
                      aria-pressed={selectedFileId === f.id}
                      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
                    >
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: fileColorMap[f.id] }} />
                      <span className="truncate text-sm font-medium">{f.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{f.size} blocks</span>
                    </button>
                    <button type="button" aria-label={`Delete ${f.name}`} onClick={() => deleteFile(f.id)} className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Block Grid */}
        <div className="glass rounded-md p-4 lg:col-span-2 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Disk blocks</h2>
            <span className="text-xs text-muted-foreground">{totalBlocks} blocks</span>
          </div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {fs.blocks.map(block => {
              const file = fs.files.find(f => f.id === block.fileId);
              const color = block.fileId ? fileColorMap[block.fileId] : undefined;
              const isSelectedBlock = block.fileId === selectedFile?.id;
              return (
                <div
                  key={block.id}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-sm border text-xs transition-colors ${
                    isSelectedBlock ? "border-2" : block.fileId ? "border-transparent opacity-40" : "border-border bg-muted/20"
                  }`}
                  style={color ? {
                    background: `color-mix(in srgb, ${color} 14%, hsl(var(--card)))`,
                    borderColor: color,
                  } : undefined}
                  title={file ? `${file.name} (${file.method})${block.isIndex ? ' [INDEX]' : ''}${block.next !== null ? ` → ${block.next}` : ''}` : `Block ${block.id} (free)`}
                >
                  <span className="font-mono font-bold" style={color ? { color } : undefined}>{block.id}</span>
                  {selectedBlockSteps[block.id] && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center bg-primary px-0.5 text-[9px] font-bold leading-none text-primary-foreground">
                      {selectedBlockSteps[block.id]}
                    </span>
                  )}
                  {block.isIndex && <span className="text-[8px] font-bold" style={{ color }}>INDEX</span>}
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
              <span className="h-3 w-3 rounded-sm border border-border bg-muted/20" /> Free
            </div>
            {fs.files.map(f => (
              <div key={f.id} className="flex items-center gap-1.5 text-xs">
                <span className={`h-3 w-3 rounded-sm ${selectedFileId !== f.id ? "opacity-40" : ""}`} style={{ background: fileColorMap[f.id] }} />
                <span className={selectedFileId === f.id ? "font-medium" : "text-muted-foreground"}>{f.name}</span>
              </div>
            ))}
          </div>
        </div>
        <section className="glass rounded-md p-5 lg:col-span-3" aria-live="polite">
          <div className="flex flex-col justify-between gap-2 border-b border-border pb-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Allocation walkthrough</p>
              <h2 className="mt-1 text-lg font-semibold">
                {selectedFile ? `${selectedFile.name} · ${selectedFile.method} allocation` : "Select or create a file to see its steps"}
              </h2>
            </div>
            {selectedFile && <span className="text-xs text-muted-foreground">{allocationSteps.length} steps · numbered blocks are highlighted above</span>}
          </div>
          {selectedFile ? (
            <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {allocationSteps.map((step, index) => (
                <li key={`${step.title}-${index}`} className="flex gap-3 border border-border bg-background p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-primary text-xs font-semibold text-primary-foreground">{index + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{step.title}</span>
                    <span className="mt-1 block break-words text-xs leading-5 text-muted-foreground">{step.detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">After allocation, select a file from the list to inspect how its blocks were assigned.</p>
          )}
        </section>
      </div>
    </main>
  );
}

function getAllocationSteps(file) {
  if (file.method === "sequential") {
    return [
      {
        title: "Find consecutive free blocks",
        detail: `A run of ${file.size} blocks starts at ${file.blocks[0]} and ends at ${file.blocks[file.blocks.length - 1]}.`,
      },
      ...file.blocks.map((blockId, index) => ({
        title: `Allocate block ${blockId}`,
        detail: `This is data block ${index + 1} of ${file.size}; sequential allocation keeps the file together.`,
      })),
    ];
  }

  if (file.method === "linked") {
    return file.blocks.map((blockId, index) => {
      const nextBlock = file.blocks[index + 1];
      return {
        title: `Read data from block ${blockId}`,
        detail: nextBlock === undefined
          ? "This is the final block; its pointer marks the end of the file."
          : `Its pointer leads to block ${nextBlock}.`,
      };
    });
  }

  return [
    {
      title: `Reserve index block ${file.indexBlock}`,
      detail: `This block stores the addresses of all ${file.size} data blocks.`,
    },
    ...file.blocks.map((blockId, index) => ({
      title: `Store data block ${index + 1} at ${blockId}`,
      detail: `The index block points to data block ${index + 1} at disk block ${blockId}.`,
    })),
  ];
}
