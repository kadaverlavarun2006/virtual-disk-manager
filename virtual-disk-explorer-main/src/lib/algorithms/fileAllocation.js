export function createFileSystem(totalBlocks) {
  const blocks = Array.from({ length: totalBlocks }, (_, i) => ({
    id: i, fileId: null, next: null, isIndex: false,
  }));
  return { blocks, files: [], totalBlocks };
}

export function allocateSequential(state, fileName, size) {
  const blocks = [...state.blocks.map(b => ({ ...b }))];
  // Find contiguous free blocks
  let start = -1;
  let count = 0;
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].fileId === null) {
      if (start === -1) start = i;
      count++;
      if (count === size) break;
    } else {
      start = -1;
      count = 0;
    }
  }
  if (count < size) return `Not enough contiguous space for ${size} blocks`;
  const fileId = crypto.randomUUID();
  const allocatedBlocks = [];
  for (let i = start; i < start + size; i++) {
    blocks[i].fileId = fileId;
    allocatedBlocks.push(i);
  }
  const file = { id: fileId, name: fileName, size, blocks: allocatedBlocks, method: 'sequential' };
  return { ...state, blocks, files: [...state.files, file] };
}

export function allocateLinked(state, fileName, size) {
  const blocks = [...state.blocks.map(b => ({ ...b }))];
  const freeBlocks = blocks.filter(b => b.fileId === null).map(b => b.id);
  if (freeBlocks.length < size) return `Not enough free blocks (need ${size}, have ${freeBlocks.length})`;
  const fileId = crypto.randomUUID();
  const selected = freeBlocks.slice(0, size);
  for (let i = 0; i < selected.length; i++) {
    blocks[selected[i]].fileId = fileId;
    blocks[selected[i]].next = i < selected.length - 1 ? selected[i + 1] : null;
  }
  const file = { id: fileId, name: fileName, size, blocks: selected, method: 'linked' };
  return { ...state, blocks, files: [...state.files, file] };
}

export function allocateIndexed(state, fileName, size) {
  const blocks = [...state.blocks.map(b => ({ ...b }))];
  const freeBlocks = blocks.filter(b => b.fileId === null).map(b => b.id);
  if (freeBlocks.length < size + 1) return `Not enough free blocks (need ${size + 1} including index block)`;
  const fileId = crypto.randomUUID();
  const indexBlock = freeBlocks[0];
  const dataBlocks = freeBlocks.slice(1, size + 1);
  blocks[indexBlock].fileId = fileId;
  blocks[indexBlock].isIndex = true;
  for (const b of dataBlocks) {
    blocks[b].fileId = fileId;
  }
  const file = { id: fileId, name: fileName, size, blocks: dataBlocks, method: 'indexed', indexBlock };
  return { ...state, blocks, files: [...state.files, file] };
}

export function deallocateFile(state, fileId) {
  const blocks = state.blocks.map(b =>
    b.fileId === fileId ? { ...b, fileId: null, next: null, isIndex: false } : { ...b }
  );
  const files = state.files.filter(f => f.id !== fileId);
  return { ...state, blocks, files };
}
