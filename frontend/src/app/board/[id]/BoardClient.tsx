'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import CanvasView from '@/components/canvas/CanvasView';
import BottomLeftHud from '@/components/chrome/BottomLeftHud';
import BottomRightHud from '@/components/chrome/BottomRightHud';
import FloatingPanel from '@/components/chrome/FloatingPanel';
import MiniMap from '@/components/chrome/MiniMap';
import PropertiesPanel from '@/components/chrome/PropertiesPanel';
import Sidebar from '@/components/chrome/Sidebar';
import Toolbar from '@/components/chrome/Toolbar';
import TopRightHud from '@/components/chrome/TopRightHud';
import { useBoard } from '@/hooks/useBoard';
import { useTweaks } from '@/hooks/useTweaks';
import type {
  Board,
  BoardElement,
  Connection,
  DragLine,
  Folder,
  Marquee,
  Point,
  ResizeDir,
  Side,
  Tool,
} from '@/types';

interface Props {
  boardId: string;
  board: Board | null;
  initialElements: BoardElement[];
  initialConnections: Connection[];
  folders: Folder[];
}

const NEW_DEFAULTS: Record<string, Omit<BoardElement, 'id' | 'board_id'>> = {
  card:      { type: 'card',      w: 240, h: 150, title: 'Novo card', body: '', meta: 'agora' },
  sticky:    { type: 'sticky',    w: 200, h: 130, color: 'yellow', extra: { text: '' } },
  image:     { type: 'image',     w: 240, h: 170, extra: { placeholder: 'imagem', caption: 'novo' } },
  shape:     { type: 'shape',     w: 130, h: 130, extra: { shape: 'rectangle', label: '' } },
  column:    { type: 'column',    w: 240, h: 320, title: 'Nova coluna', extra: { items: [{ id: 'ni-1', text: 'Item 1', done: false }] } },
  checklist: { type: 'checklist', w: 280, h: 240, title: 'Checklist', extra: { items: [{ id: 'ni-1', text: 'Item 1', done: false }] } },
  link:      { type: 'link',      w: 220, h: 200, title: 'Novo link', extra: { host: 'exemplo.com', placeholder: 'preview' } },
  audio:     { type: 'audio',     w: 320, h: 90,  title: 'novo áudio', extra: { duration: '00:00', progress: 0 } },
  file:      { type: 'file',      w: 220, h: 70,  extra: { name: 'arquivo.txt', size: '0 kb', ext: 'txt' } },
};

const DEMO_COLLABORATORS = [
  { id: 'u1', name: 'Amanda', color: 'oklch(0.62 0.18 28)', x: 800, y: 320 },
  { id: 'u2', name: 'Thiago', color: 'oklch(0.6 0.16 235)', x: 1340, y: 200 },
];

export default function BoardClient({
  boardId,
  board,
  initialElements,
  initialConnections,
  folders,
}: Props) {
  const { tweaks, setTweak } = useTweaks();

  const {
    elements, setElements,
    connections, setConnections,
    addElement, updateElement, updateElementLocal,
    removeElement, addConnection, updateConnection, removeConnection,
  } = useBoard(boardId, initialElements, initialConnections);

  const [selection, setSelection] = useState<string[]>([]);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('select');
  const [activeFolderId, setActiveFolderId] = useState(board?.folder_id ?? folders[0]?.id ?? '');
  const [zoom, setZoom] = useState(0.65);
  const [pan, setPan] = useState<Point>({ x: 60, y: 40 });
  const [draggingIds, setDraggingIds] = useState<string[]>([]);
  const [absorbingIds, setAbsorbingIds] = useState<string[]>([]);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const [dragLine, setDragLine] = useState<DragLine | null>(null);
  const [mouseWorld, setMouseWorld] = useState<Point>({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ w: 1280, h: 800 });
  const [spacePressed, setSpacePressed] = useState(false);
  const [floatingPanel, setFloatingPanel] = useState<'layers' | 'history' | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<DragStateRef | null>(null);

  useEffect(() => {
    setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    const onResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const screenToWorld = useCallback((sx: number, sy: number): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (sx - rect.left - pan.x) / zoom, y: (sy - rect.top - pan.y) / zoom };
  }, [pan, zoom]);

  // ---- Element ops ----
  const onUpdateElement = useCallback(
    (id: string, patch: Partial<BoardElement> | ((el: BoardElement) => Partial<BoardElement>)) => {
      setElements((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const p = typeof patch === 'function' ? patch(e) : patch;
          return { ...e, ...p };
        }),
      );
      const el = elements.find((e) => e.id === id);
      if (!el) return;
      const p = typeof patch === 'function' ? patch(el) : patch;
      updateElement(id, p).catch(console.error);
    },
    [elements, updateElement, setElements],
  );

  const onAdd = useCallback(
    (kind: string) => {
      const def = NEW_DEFAULTS[kind];
      if (!def) return;
      const { w = 240, h = 150 } = def;
      const cx = (-pan.x + viewportSize.w / 2) / zoom - w / 2;
      const cy = (-pan.y + viewportSize.h / 2) / zoom - h / 2;
      addElement({ ...def, x: cx, y: cy }).then((el) => {
        setSelection([el.id]);
        setSelectedConnectionId(null);
      }).catch(console.error);
    },
    [pan, zoom, viewportSize, addElement],
  );

  const onDuplicate = useCallback(
    (id: string) => {
      const el = elements.find((e) => e.id === id);
      if (!el) return;
      addElement({ ...el, x: el.x + 24, y: el.y + 24 }).then((newEl) => {
        setSelection([newEl.id]);
      }).catch(console.error);
    },
    [elements, addElement],
  );

  const onDelete = useCallback(
    (id: string) => {
      removeElement(id).catch(console.error);
      setSelection((prev) => prev.filter((s) => s !== id));
    },
    [removeElement],
  );

  // ---- Drag ----
  const onElementMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      const target = e.target as HTMLElement;
      if (target.isContentEditable) return;
      if (spacePressed || tool === 'pan') {
        e.stopPropagation();
        e.preventDefault();
        dragState.current = { kind: 'pan', startMouse: { x: e.clientX, y: e.clientY }, startPan: { ...pan } };
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      setSelectedConnectionId(null);
      const isMulti = e.shiftKey;
      let nextSel: string[];
      if (isMulti) {
        nextSel = selection.includes(id) ? selection.filter((s) => s !== id) : [...selection, id];
      } else if (!selection.includes(id)) {
        nextSel = [id];
      } else {
        nextSel = selection;
      }
      setSelection(nextSel);
      const ids = nextSel.includes(id) ? nextSel : [id];
      const startPositions = ids.map((eid) => {
        const el = elements.find((x) => x.id === eid)!;
        return { id: eid, x: el.x, y: el.y };
      });
      dragState.current = { kind: 'drag-elements', ids, startMouse: { x: e.clientX, y: e.clientY }, startPositions };
      setDraggingIds(ids);
    },
    [elements, selection, spacePressed, tool, pan],
  );

  const onResizeStart = useCallback(
    (e: React.MouseEvent, id: string, dir: ResizeDir) => {
      e.preventDefault();
      const el = elements.find((x) => x.id === id)!;
      dragState.current = { kind: 'resize', id, dir, startMouse: { x: e.clientX, y: e.clientY }, startBox: { x: el.x, y: el.y, w: el.w, h: el.h } };
    },
    [elements],
  );

  const onPortStart = useCallback(
    (e: React.MouseEvent, id: string, side: Side) => {
      e.preventDefault();
      const el = elements.find((x) => x.id === id)!;
      const start =
        side === 't' ? { x: el.x + el.w / 2, y: el.y } :
        side === 'r' ? { x: el.x + el.w,     y: el.y + el.h / 2 } :
        side === 'b' ? { x: el.x + el.w / 2, y: el.y + el.h } :
                       { x: el.x,            y: el.y + el.h / 2 };
      dragState.current = { kind: 'connect', fromId: id, fromSide: side, fromPos: start };
      setDragLine({ from: start, to: start });
    },
    [elements],
  );

  const onCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || tool === 'pan' || spacePressed || e.altKey || e.metaKey) {
        dragState.current = { kind: 'pan', startMouse: { x: e.clientX, y: e.clientY }, startPan: { ...pan } };
        e.preventDefault();
        return;
      }
      const t = e.target as HTMLElement;
      if (t === canvasRef.current || t.classList.contains('canvas-bg') || t.classList.contains('canvas-stage')) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        dragState.current = { kind: 'marquee', origin: { x, y } };
        setMarquee({ x0: x, y0: y, x1: x, y1: y });
        setSelection([]);
        setSelectedConnectionId(null);
      }
    },
    [tool, pan, spacePressed],
  );

  const onWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (e.ctrlKey || e.metaKey) {
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const delta = -e.deltaY * 0.0015;
        const newZoom = Math.max(0.2, Math.min(3, zoom * (1 + delta)));
        const wx = (mx - pan.x) / zoom;
        const wy = (my - pan.y) / zoom;
        setPan({ x: mx - wx * newZoom, y: my - wy * newZoom });
        setZoom(newZoom);
      } else {
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      }
    },
    [zoom, pan],
  );

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // ---- Global mouse move / up ----
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) setMouseWorld(screenToWorld(e.clientX, e.clientY));

      const ds = dragState.current;
      if (!ds) return;

      if (ds.kind === 'drag-elements') {
        const dx = (e.clientX - ds.startMouse.x) / zoom;
        const dy = (e.clientY - ds.startMouse.y) / zoom;
        setElements((prev) =>
          prev.map((el) => {
            const sp = (ds as DragElementsState).startPositions.find((p) => p.id === el.id);
            return sp ? { ...el, x: sp.x + dx, y: sp.y + dy } : el;
          }),
        );
        if ((ds as DragElementsState).ids.length === 1) {
          const draggedId = (ds as DragElementsState).ids[0];
          const w = screenToWorld(e.clientX, e.clientY);
          const target = elements.find((el) => {
            if (el.id === draggedId) return false;
            if (!['checklist', 'column'].includes(el.type)) return false;
            return w.x >= el.x && w.x <= el.x + el.w && w.y >= el.y && w.y <= el.y + el.h;
          });
          setMergeTargetId(target?.id ?? null);
        }
      } else if (ds.kind === 'resize') {
        const { id, dir, startMouse, startBox } = ds as ResizeState;
        const dx = (e.clientX - startMouse.x) / zoom;
        const dy = (e.clientY - startMouse.y) / zoom;
        const minW = 80, minH = 60;
        let { x, y, w, h } = startBox;
        if (dir.includes('e')) w = Math.max(minW, startBox.w + dx);
        if (dir.includes('s')) h = Math.max(minH, startBox.h + dy);
        if (dir.includes('w')) { const nw = Math.max(minW, startBox.w - dx); x = startBox.x + (startBox.w - nw); w = nw; }
        if (dir.includes('n')) { const nh = Math.max(minH, startBox.h - dy); y = startBox.y + (startBox.h - nh); h = nh; }
        setElements((prev) => prev.map((el) => el.id === id ? { ...el, x, y, w, h } : el));
      } else if (ds.kind === 'pan') {
        const { startPan, startMouse } = ds as PanState;
        setPan({ x: startPan.x + (e.clientX - startMouse.x), y: startPan.y + (e.clientY - startMouse.y) });
      } else if (ds.kind === 'marquee') {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMarquee({ x0: (ds as MarqueeState).origin.x, y0: (ds as MarqueeState).origin.y, x1: x, y1: y });
      } else if (ds.kind === 'connect') {
        const w = screenToWorld(e.clientX, e.clientY);
        let snapTo = w;
        let snapTarget: { id: string; side: Side } | null = null;
        for (const el of elements) {
          if (el.id === (ds as ConnectState).fromId) continue;
          const sides: Record<Side, Point> = {
            t: { x: el.x + el.w / 2, y: el.y },
            r: { x: el.x + el.w, y: el.y + el.h / 2 },
            b: { x: el.x + el.w / 2, y: el.y + el.h },
            l: { x: el.x, y: el.y + el.h / 2 },
          };
          for (const [s, p] of Object.entries(sides) as [Side, Point][]) {
            if (Math.hypot(p.x - w.x, p.y - w.y) < 30 / zoom) {
              snapTo = p;
              snapTarget = { id: el.id, side: s };
            }
          }
        }
        setDragLine({ from: (ds as ConnectState).fromPos, to: snapTo, snapTarget });
      }
    };

    const onUp = (e: MouseEvent) => {
      void e;
      const ds = dragState.current;
      if (!ds) return;

      if (ds.kind === 'drag-elements') {
        if ((ds as DragElementsState).ids.length === 1 && mergeTargetId) {
          const draggedId = (ds as DragElementsState).ids[0];
          const dragged = elements.find((el) => el.id === draggedId);
          const target = elements.find((el) => el.id === mergeTargetId);
          if (dragged && target) {
            setAbsorbingIds([draggedId]);
            setTimeout(() => {
              const text =
                dragged.type === 'card' ? (dragged.title ?? dragged.body ?? '') :
                dragged.type === 'sticky' ? (dragged.extra?.text ?? '') :
                'item';
              const newItem = { id: 'ni-' + Date.now(), text, done: false };
              const updatedItems = [...((target.extra?.items ?? []) as { id: string; text: string; done: boolean }[]), newItem];
              updateElementLocal(target.id, { extra: { ...target.extra, items: updatedItems } });
              updateElement(target.id, { extra: { ...target.extra, items: updatedItems } }).catch(console.error);
              removeElement(draggedId).catch(console.error);
              setAbsorbingIds([]);
              setMergeTargetId(null);
              setSelection([target.id]);
            }, 350);
          }
        }
        // flush position to API for all dragged elements
        (ds as DragElementsState).ids.forEach((id) => {
          const el = elements.find((e) => e.id === id);
          if (el) updateElement(id, { x: el.x, y: el.y }).catch(console.error);
        });
        setDraggingIds([]);
        if (!mergeTargetId) setMergeTargetId(null);
      } else if (ds.kind === 'resize') {
        const { id } = ds as ResizeState;
        const el = elements.find((e) => e.id === id);
        if (el) updateElement(id, { x: el.x, y: el.y, w: el.w, h: el.h }).catch(console.error);
      } else if (ds.kind === 'marquee' && marquee) {
        const minX = Math.min(marquee.x0, marquee.x1);
        const maxX = Math.max(marquee.x0, marquee.x1);
        const minY = Math.min(marquee.y0, marquee.y1);
        const maxY = Math.max(marquee.y0, marquee.y1);
        const w0 = { x: (minX - pan.x) / zoom, y: (minY - pan.y) / zoom };
        const w1 = { x: (maxX - pan.x) / zoom, y: (maxY - pan.y) / zoom };
        const sel = elements
          .filter((el) => el.x + el.w >= w0.x && el.x <= w1.x && el.y + el.h >= w0.y && el.y <= w1.y)
          .map((el) => el.id);
        if (sel.length) setSelection(sel);
        setMarquee(null);
      } else if (ds.kind === 'connect' && dragLine) {
        if (dragLine.snapTarget && dragLine.snapTarget.id !== (ds as ConnectState).fromId) {
          addConnection({
            from_id: (ds as ConnectState).fromId,
            from_side: (ds as ConnectState).fromSide,
            to_id: dragLine.snapTarget.id,
            to_side: dragLine.snapTarget.side,
            style: 'curve',
            arrow: true,
          }).then((conn) => setSelectedConnectionId(conn.id)).catch(console.error);
        }
        setDragLine(null);
      }
      dragState.current = null;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [zoom, pan, elements, marquee, dragLine, mergeTargetId, screenToWorld, updateElement, updateElementLocal, removeElement, addConnection, setElements]);

  // ---- Keyboard ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && !spacePressed) { e.preventDefault(); setSpacePressed(true); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection.length) selection.forEach((id) => onDelete(id));
        else if (selectedConnectionId) { removeConnection(selectedConnectionId).catch(console.error); setSelectedConnectionId(null); }
      } else if (e.key === 'v') setTool('select');
      else if (e.key === 'h') setTool('pan');
      else if (e.key === 'c') onAdd('card');
      else if (e.key === 's') onAdd('sticky');
      else if (e.key === 'k') onAdd('checklist');
      else if (e.key === 'l') onAdd('column');
      else if (e.key === 'r') onAdd('shape');
      else if (e.key === 'Escape') { setSelection([]); setSelectedConnectionId(null); }
      else if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); selection.forEach((id) => onDuplicate(id)); }
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') setSpacePressed(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); };
  }, [selection, selectedConnectionId, onAdd, onDelete, onDuplicate, spacePressed, removeConnection]);

  // ---- Paste image ----
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      for (const it of Array.from(e.clipboardData?.items ?? [])) {
        if (it.type.startsWith('image/')) {
          const blob = it.getAsFile();
          if (blob) {
            const url = URL.createObjectURL(blob);
            const cx = (-pan.x + viewportSize.w / 2) / zoom - 120;
            const cy = (-pan.y + viewportSize.h / 2) / zoom - 85;
            addElement({ type: 'image', x: cx, y: cy, w: 240, h: 170, extra: { src: url, caption: 'colado' } })
              .then((el) => setSelection([el.id])).catch(console.error);
          }
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [pan, zoom, viewportSize, addElement]);

  const fit = () => {
    if (!elements.length) return;
    const minX = Math.min(...elements.map((e) => e.x));
    const minY = Math.min(...elements.map((e) => e.y));
    const maxX = Math.max(...elements.map((e) => e.x + e.w));
    const maxY = Math.max(...elements.map((e) => e.y + e.h));
    const W = maxX - minX, H = maxY - minY;
    const cw = viewportSize.w - 304;
    const ch = viewportSize.h;
    const z = Math.min(cw / (W + 120), ch / (H + 120), 1);
    setZoom(z);
    setPan({ x: -minX * z + 60 + 304, y: -minY * z + 60 });
  };

  const onExport = (kind: string) => {
    if (kind === 'json') {
      const blob = new Blob([JSON.stringify({ elements, connections }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'plano-board.json';
      a.click();
    } else {
      alert(`Exportar como ${kind.toUpperCase()} — em breve`);
    }
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId) ?? null;
  const childFolders: Record<string, Folder[]> = {};
  folders.forEach((f) => {
    if (f.parent_id) {
      if (!childFolders[f.parent_id]) childFolders[f.parent_id] = [];
      childFolders[f.parent_id].push(f);
    }
  });

  const selectedEl = selection.length === 1 ? elements.find((e) => e.id === selection[0]) ?? null : null;
  const selectedConn = selectedConnectionId ? connections.find((c) => c.id === selectedConnectionId) ?? null : null;

  return (
    <div
      className="plano-app"
      data-theme={tweaks.theme}
      data-density={tweaks.density}
      style={{ cursor: spacePressed ? 'grab' : undefined }}
    >
      <Sidebar
        folders={folders.filter((f) => !f.parent_id)}
        childFolders={childFolders}
        activeFolderId={activeFolderId}
        setActiveFolderId={setActiveFolderId}
      />
      <Toolbar
        tool={tool}
        setTool={setTool}
        onAdd={onAdd}
        onShowPanel={(p) => setFloatingPanel((prev) => (prev === p ? null : p))}
      />
      <CanvasView
        elements={elements}
        connections={connections}
        selection={selection}
        draggingIds={draggingIds}
        mergeTargetId={mergeTargetId}
        absorbingIds={absorbingIds}
        zoom={zoom}
        pan={pan}
        cardStyle={tweaks.cardStyle}
        background={tweaks.background}
        onElementMouseDown={onElementMouseDown}
        onResizeStart={onResizeStart}
        onPortStart={onPortStart}
        onUpdateElement={onUpdateElement}
        onCanvasMouseDown={onCanvasMouseDown}
        onSelectConnection={(id) => { setSelectedConnectionId(id); setSelection([]); }}
        selectedConnectionId={selectedConnectionId}
        marquee={marquee}
        dragLine={dragLine}
        collaborators={DEMO_COLLABORATORS}
        canvasRef={canvasRef}
      />

      <TopRightHud
        folder={activeFolder}
        onShare={() => alert('Compartilhar — em breve')}
        onExport={onExport}
      />
      <BottomLeftHud pan={pan} zoom={zoom} mouseWorld={mouseWorld} viewportSize={viewportSize} />
      <BottomRightHud
        zoom={zoom}
        setZoom={setZoom}
        fit={fit}
        status={{ collaborators: 3, elements: elements.length, unsync: 0 }}
        miniMap={
          <MiniMap elements={elements} pan={pan} zoom={zoom} viewportSize={viewportSize} />
        }
      />

      {(selectedEl ?? selectedConn) && (
        <PropertiesPanel
          el={selectedEl}
          onUpdate={onUpdateElement}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          selectedConnection={selectedConn}
          onConnectionUpdate={(patch) =>
            selectedConnectionId && updateConnection(selectedConnectionId, patch).catch(console.error)
          }
          onClose={() => { setSelection([]); setSelectedConnectionId(null); }}
        />
      )}

      {floatingPanel === 'layers' && (
        <FloatingPanel
          title="Camadas"
          onClose={() => setFloatingPanel(null)}
          top={64}
          right={selectedEl ?? selectedConn ? 310 : 14}
          variant="layers"
          elements={elements}
          selection={selection}
          onSelectElement={(id) => setSelection([id])}
          onToggleVisible={(id) => onUpdateElement(id, (el) => ({ hidden: !el.hidden }))}
          onToggleLock={(id) => onUpdateElement(id, (el) => ({ locked: !el.locked }))}
        />
      )}
      {floatingPanel === 'history' && (
        <FloatingPanel
          title="Histórico"
          onClose={() => setFloatingPanel(null)}
          top={64}
          right={selectedEl ?? selectedConn ? 310 : 14}
          variant="history"
          elements={elements}
        />
      )}
    </div>
  );
}

// ---- Internal drag state types ----
interface DragElementsState {
  kind: 'drag-elements';
  ids: string[];
  startMouse: Point;
  startPositions: { id: string; x: number; y: number }[];
}
interface ResizeState {
  kind: 'resize';
  id: string;
  dir: ResizeDir;
  startMouse: Point;
  startBox: { x: number; y: number; w: number; h: number };
}
interface PanState {
  kind: 'pan';
  startMouse: Point;
  startPan: Point;
}
interface MarqueeState {
  kind: 'marquee';
  origin: Point;
}
interface ConnectState {
  kind: 'connect';
  fromId: string;
  fromSide: Side;
  fromPos: Point;
}
type DragStateRef = DragElementsState | ResizeState | PanState | MarqueeState | ConnectState;
