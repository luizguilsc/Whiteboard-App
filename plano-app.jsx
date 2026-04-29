/* global React, ReactDOM, PlanoIcon, PlanoCanvas, PlanoSidebar, PlanoToolbar,
   PlanoTopRightHud, PlanoBottomLeftHud, PlanoBottomRightHud, PlanoMiniMap, PlanoProperties,
   PlanoFloatingPanel, PlanoLayersList, PlanoHistoryList,
   PLANO_FOLDERS, PLANO_CHILDREN, PLANO_INITIAL_ELEMENTS, PLANO_INITIAL_CONNECTIONS, PLANO_COLLABORATORS,
   useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle */
const { useState, useRef, useEffect, useCallback, useMemo } = React;

const NEW_DEFAULTS = {
  card:      { type: "card", w: 240, h: 150, title: "Novo card", body: "", tag: null, meta: "agora" },
  sticky:    { type: "sticky", w: 200, h: 130, color: "yellow", text: "", meta: "agora" },
  image:     { type: "image", w: 240, h: 170, placeholder: "imagem", caption: "novo" },
  shape:     { type: "shape", w: 130, h: 130, shape: "rectangle", label: "" },
  column:    { type: "column", w: 240, h: 320, color: "var(--accent)", title: "Nova coluna", items: [{ id: "ni-1", text: "Item 1", done: false }] },
  checklist: { type: "checklist", w: 280, h: 240, title: "Checklist", items: [{ id: "ni-1", text: "Item 1", done: false }] },
  link:      { type: "link", w: 220, h: 200, title: "Novo link", host: "exemplo.com", placeholder: "preview" },
  audio:     { type: "audio", w: 320, h: 90, title: "novo áudio", duration: "00:00", progress: 0 },
  file:      { type: "file", w: 220, h: 70, name: "arquivo.txt", size: "0 kb", ext: "txt" },
};

function App() {
  const tweakDefaults = window.PLANO_TWEAKS_DEFAULTS;
  const [tweaks, setTweak] = useTweaks(tweakDefaults);

  const [elements, setElements] = useState(PLANO_INITIAL_ELEMENTS);
  const [connections, setConnections] = useState(PLANO_INITIAL_CONNECTIONS);
  const [selection, setSelection] = useState(["el-goal"]);
  const [selectedConnectionId, setSelectedConnectionId] = useState(null);
  const [tool, setTool] = useState("select");
  const [activeFolderId, setActiveFolderId] = useState("f-product");
  const [zoom, setZoom] = useState(0.65);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [draggingIds, setDraggingIds] = useState([]);
  const [absorbingIds, setAbsorbingIds] = useState([]);
  const [mergeTargetId, setMergeTargetId] = useState(null);
  const [marquee, setMarquee] = useState(null);
  const [dragLine, setDragLine] = useState(null);
  const [mouseWorld, setMouseWorld] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [collaborators] = useState(PLANO_COLLABORATORS);
  const [spacePressed, setSpacePressed] = useState(false);
  const [floatingPanel, setFloatingPanel] = useState(null); // "layers" | "history" | null

  const canvasRef = useRef(null);
  const dragState = useRef(null);

  // ---- Resize tracking ----
  useEffect(() => {
    const onResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const screenToWorld = (sx, sy) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (sx - rect.left - pan.x) / zoom, y: (sy - rect.top - pan.y) / zoom };
  };

  // ---- Element update ----
  const onUpdateElement = useCallback((id, patch) => {
    setElements(prev => prev.map(e => {
      if (e.id !== id) return e;
      const p = typeof patch === "function" ? patch(e) : patch;
      return { ...e, ...p };
    }));
  }, []);

  // ---- Element add ----
  const onAdd = useCallback((kind) => {
    const def = NEW_DEFAULTS[kind];
    if (!def) return;
    const id = "el-" + Date.now();
    // Add at center of viewport
    const w = def.w, h = def.h;
    const cx = (-pan.x + viewportSize.w / 2) / zoom - w / 2;
    const cy = (-pan.y + viewportSize.h / 2) / zoom - h / 2;
    const el = { ...def, id, x: cx, y: cy };
    setElements(prev => [...prev, el]);
    setSelection([id]);
    setSelectedConnectionId(null);
  }, [pan, zoom, viewportSize]);

  const onDuplicate = useCallback((id) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const newEl = { ...el, id: "el-" + Date.now(), x: el.x + 24, y: el.y + 24 };
    setElements(prev => [...prev, newEl]);
    setSelection([newEl.id]);
  }, [elements]);

  const onDelete = useCallback((id) => {
    setElements(prev => prev.filter(e => e.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    setSelection(prev => prev.filter(s => s !== id));
  }, []);

  // ---- Element drag ----
  const onElementMouseDown = useCallback((e, id) => {
    if (e.target.isContentEditable) return;
    if (spacePressed || tool === "pan") {
      // route to canvas pan instead
      e.stopPropagation();
      e.preventDefault();
      dragState.current = { kind: "pan", startMouse: { x: e.clientX, y: e.clientY }, startPan: { ...pan } };
      return;
    }
    e.stopPropagation();
    e.preventDefault();
    setSelectedConnectionId(null);

    const isMulti = e.shiftKey;
    let nextSel;
    if (isMulti) {
      nextSel = selection.includes(id) ? selection.filter(s => s !== id) : [...selection, id];
    } else if (!selection.includes(id)) {
      nextSel = [id];
    } else {
      nextSel = selection;
    }
    setSelection(nextSel);

    const ids = nextSel.length > 0 && nextSel.includes(id) ? nextSel : [id];
    const startPositions = ids.map(eid => {
      const el = elements.find(x => x.id === eid);
      return { id: eid, x: el.x, y: el.y };
    });
    dragState.current = {
      kind: "drag-elements",
      ids,
      startMouse: { x: e.clientX, y: e.clientY },
      startPositions,
    };
    setDraggingIds(ids);
  }, [elements, selection, spacePressed, tool, pan]);

  // ---- Resize ----
  const onResizeStart = useCallback((e, id, dir) => {
    e.preventDefault();
    const el = elements.find(x => x.id === id);
    dragState.current = {
      kind: "resize",
      id, dir: dir || "se",
      startMouse: { x: e.clientX, y: e.clientY },
      startBox: { x: el.x, y: el.y, w: el.w, h: el.h },
    };
  }, [elements]);

  // ---- Connection drag from port ----
  const onPortStart = useCallback((e, id, side) => {
    e.preventDefault();
    const el = elements.find(x => x.id === id);
    const start = side === "t" ? { x: el.x + el.w/2, y: el.y } :
                  side === "r" ? { x: el.x + el.w, y: el.y + el.h/2 } :
                  side === "b" ? { x: el.x + el.w/2, y: el.y + el.h } :
                                 { x: el.x, y: el.y + el.h/2 };
    dragState.current = {
      kind: "connect",
      fromId: id,
      fromSide: side,
      fromPos: start,
    };
    setDragLine({ from: start, to: start });
  }, [elements]);

  // ---- Canvas mouse down (pan / marquee) ----
  const onCanvasMouseDown = useCallback((e) => {
    if (e.button === 1 || tool === "pan" || spacePressed || e.altKey || e.metaKey) {
      // pan
      dragState.current = { kind: "pan", startMouse: { x: e.clientX, y: e.clientY }, startPan: { ...pan } };
      e.preventDefault();
      return;
    }
    if (e.target === canvasRef.current || e.target.classList.contains("canvas-bg") || e.target.classList.contains("canvas-stage")) {
      // marquee
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      dragState.current = { kind: "marquee", origin: { x, y } };
      setMarquee({ x0: x, y0: y, x1: x, y1: y });
      setSelection([]);
      setSelectedConnectionId(null);
    }
  }, [tool, pan]);

  // ---- Wheel: zoom + pan ----
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.ctrlKey || e.metaKey) {
      // zoom centered on cursor
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const delta = -e.deltaY * 0.0015;
      const newZoom = Math.max(0.2, Math.min(3, zoom * (1 + delta)));
      const wx = (mx - pan.x) / zoom;
      const wy = (my - pan.y) / zoom;
      setPan({ x: mx - wx * newZoom, y: my - wy * newZoom });
      setZoom(newZoom);
    } else {
      setPan(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, [zoom, pan]);

  // ---- Global mouse move/up ----
  useEffect(() => {
    const onMove = (e) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const w = screenToWorld(e.clientX, e.clientY);
        setMouseWorld(w);
      }
      const ds = dragState.current;
      if (!ds) return;
      if (ds.kind === "drag-elements") {
        const dx = (e.clientX - ds.startMouse.x) / zoom;
        const dy = (e.clientY - ds.startMouse.y) / zoom;
        setElements(prev => prev.map(el => {
          const sp = ds.startPositions.find(p => p.id === el.id);
          if (!sp) return el;
          return { ...el, x: sp.x + dx, y: sp.y + dy };
        }));
        // Detect merge target — hovering a non-dragged element
        if (ds.ids.length === 1) {
          const draggedId = ds.ids[0];
          const dragged = elements.find(e => e.id === draggedId);
          const w = screenToWorld(e.clientX, e.clientY);
          const target = elements.find(el => {
            if (el.id === draggedId) return false;
            if (!["checklist","column"].includes(el.type)) return false;
            return w.x >= el.x && w.x <= el.x + el.w && w.y >= el.y && w.y <= el.y + el.h;
          });
          setMergeTargetId(target?.id || null);
        }
      } else if (ds.kind === "resize") {
        const dx = (e.clientX - ds.startMouse.x) / zoom;
        const dy = (e.clientY - ds.startMouse.y) / zoom;
        const minW = 80, minH = 60;
        const dir = ds.dir;
        let { x, y, w, h } = ds.startBox;
        if (dir.includes("e")) w = Math.max(minW, ds.startBox.w + dx);
        if (dir.includes("s")) h = Math.max(minH, ds.startBox.h + dy);
        if (dir.includes("w")) {
          const nw = Math.max(minW, ds.startBox.w - dx);
          x = ds.startBox.x + (ds.startBox.w - nw);
          w = nw;
        }
        if (dir.includes("n")) {
          const nh = Math.max(minH, ds.startBox.h - dy);
          y = ds.startBox.y + (ds.startBox.h - nh);
          h = nh;
        }
        setElements(prev => prev.map(el => el.id === ds.id ? { ...el, x, y, w, h } : el));
      } else if (ds.kind === "pan") {
        setPan({ x: ds.startPan.x + (e.clientX - ds.startMouse.x), y: ds.startPan.y + (e.clientY - ds.startMouse.y) });
      } else if (ds.kind === "marquee") {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMarquee({ x0: ds.origin.x, y0: ds.origin.y, x1: x, y1: y });
      } else if (ds.kind === "connect") {
        const w = screenToWorld(e.clientX, e.clientY);
        // Snap to nearest port?
        let snapTo = w;
        let snapTarget = null;
        for (const el of elements) {
          if (el.id === ds.fromId) continue;
          if (e.clientX === 0) continue;
          const sides = {
            t: { x: el.x + el.w/2, y: el.y },
            r: { x: el.x + el.w, y: el.y + el.h/2 },
            b: { x: el.x + el.w/2, y: el.y + el.h },
            l: { x: el.x, y: el.y + el.h/2 },
          };
          for (const [s, p] of Object.entries(sides)) {
            const d = Math.hypot(p.x - w.x, p.y - w.y);
            if (d < 30 / zoom) { snapTo = p; snapTarget = { id: el.id, side: s }; }
          }
        }
        setDragLine({ from: ds.fromPos, to: snapTo, snapTarget });
      }
    };
    const onUp = (e) => {
      const ds = dragState.current;
      if (!ds) return;
      if (ds.kind === "drag-elements") {
        // Merge check
        if (ds.ids.length === 1 && mergeTargetId) {
          const draggedId = ds.ids[0];
          const dragged = elements.find(el => el.id === draggedId);
          const target = elements.find(el => el.id === mergeTargetId);
          if (dragged && target) {
            // Absorb animation then merge
            setAbsorbingIds([draggedId]);
            setTimeout(() => {
              setElements(prev => {
                const text = dragged.type === "card" ? (dragged.title || dragged.body) :
                             dragged.type === "sticky" ? dragged.text :
                             "item";
                const newItem = { id: "ni-" + Date.now(), text, done: false };
                return prev
                  .filter(el => el.id !== draggedId)
                  .map(el => el.id === target.id ? { ...el, items: [...el.items, newItem] } : el);
              });
              setConnections(prev => prev.filter(c => c.from !== draggedId && c.to !== draggedId));
              setAbsorbingIds([]);
              setMergeTargetId(null);
              setSelection([target.id]);
            }, 350);
          }
        }
        setDraggingIds([]);
        if (!mergeTargetId) setMergeTargetId(null);
      } else if (ds.kind === "marquee" && marquee) {
        const minX = Math.min(marquee.x0, marquee.x1);
        const maxX = Math.max(marquee.x0, marquee.x1);
        const minY = Math.min(marquee.y0, marquee.y1);
        const maxY = Math.max(marquee.y0, marquee.y1);
        // convert to world
        const w0 = { x: (minX - pan.x) / zoom, y: (minY - pan.y) / zoom };
        const w1 = { x: (maxX - pan.x) / zoom, y: (maxY - pan.y) / zoom };
        const sel = elements.filter(el =>
          el.x + el.w >= w0.x && el.x <= w1.x && el.y + el.h >= w0.y && el.y <= w1.y
        ).map(el => el.id);
        if (sel.length) setSelection(sel);
        setMarquee(null);
      } else if (ds.kind === "connect" && dragLine) {
        if (dragLine.snapTarget && dragLine.snapTarget.id !== ds.fromId) {
          const newConn = {
            id: "cn-" + Date.now(),
            from: ds.fromId, fromSide: ds.fromSide,
            to: dragLine.snapTarget.id, toSide: dragLine.snapTarget.side,
            style: "curve", arrow: true,
          };
          setConnections(prev => [...prev, newConn]);
          setSelectedConnectionId(newConn.id);
        }
        setDragLine(null);
      }
      dragState.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [zoom, pan, elements, marquee, dragLine, mergeTargetId]);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.isContentEditable || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space" && !spacePressed) { e.preventDefault(); setSpacePressed(true); return; }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selection.length) {
          selection.forEach(id => onDelete(id));
        } else if (selectedConnectionId) {
          setConnections(prev => prev.filter(c => c.id !== selectedConnectionId));
          setSelectedConnectionId(null);
        }
      } else if (e.key === "v") setTool("select");
      else if (e.key === "h") setTool("pan");
      else if (e.key === "c") onAdd("card");
      else if (e.key === "s") onAdd("sticky");
      else if (e.key === "k") onAdd("checklist");
      else if (e.key === "l") onAdd("column");
      else if (e.key === "r") onAdd("shape");
      else if (e.key === "Escape") { setSelection([]); setSelectedConnectionId(null); }
      else if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        selection.forEach(id => onDuplicate(id));
      }
    };
    window.addEventListener("keydown", onKey);
    const onKeyUp = (e) => { if (e.code === "Space") setSpacePressed(false); };
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [selection, selectedConnectionId, onAdd, onDelete, onDuplicate, spacePressed]);

  // ---- Paste (image) ----
  useEffect(() => {
    const onPaste = (e) => {
      const items = e.clipboardData?.items || [];
      for (const it of items) {
        if (it.type.startsWith("image/")) {
          const blob = it.getAsFile();
          if (blob) {
            const url = URL.createObjectURL(blob);
            const id = "el-" + Date.now();
            const cx = (-pan.x + viewportSize.w / 2) / zoom - 120;
            const cy = (-pan.y + viewportSize.h / 2) / zoom - 85;
            setElements(prev => [...prev, {
              id, type: "image", x: cx, y: cy, w: 240, h: 170, src: url, caption: "colado",
            }]);
            setSelection([id]);
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pan, zoom, viewportSize]);

  const fit = () => {
    if (!elements.length) return;
    const minX = Math.min(...elements.map(e => e.x));
    const minY = Math.min(...elements.map(e => e.y));
    const maxX = Math.max(...elements.map(e => e.x + e.w));
    const maxY = Math.max(...elements.map(e => e.y + e.h));
    const W = maxX - minX, H = maxY - minY;
    const cw = viewportSize.w - 304; // sidebar+toolbar offset
    const ch = viewportSize.h;
    const z = Math.min(cw / (W + 120), ch / (H + 120), 1);
    setZoom(z);
    setPan({ x: -minX * z + 60 + 304, y: -minY * z + 60 });
  };

  const onExport = (kind) => {
    if (kind === "json") {
      const blob = new Blob([JSON.stringify({ elements, connections }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "plano-board.json";
      a.click();
    } else {
      alert(`Exportar como ${kind.toUpperCase()} — em breve`);
    }
  };

  const folder = PLANO_FOLDERS.find(f => f.id === activeFolderId);
  const selectedEl = selection.length === 1 ? elements.find(e => e.id === selection[0]) : null;
  const selectedConn = selectedConnectionId ? connections.find(c => c.id === selectedConnectionId) : null;

  return (
    <div className="plano-app" data-theme={tweaks.theme} data-density={tweaks.density} style={{ cursor: spacePressed ? "grab" : undefined }}>
      <PlanoSidebar
        folders={PLANO_FOLDERS}
        children={PLANO_CHILDREN}
        activeFolderId={activeFolderId}
        setActiveFolderId={setActiveFolderId}
      />
      <PlanoToolbar tool={tool} setTool={setTool} onAdd={onAdd} onShowPanel={(p) => setFloatingPanel(prev => prev === p ? null : p)} />
      <PlanoCanvas
        elements={elements}
        connections={connections}
        selection={selection}
        draggingIds={draggingIds}
        mergeTargetId={mergeTargetId}
        absorbingIds={absorbingIds}
        zoom={zoom}
        pan={pan}
        cardStyle={tweaks.cardStyle}
        accent="var(--accent)"
        background={tweaks.background}
        onElementMouseDown={onElementMouseDown}
        onResizeStart={onResizeStart}
        onPortStart={onPortStart}
        onUpdateElement={onUpdateElement}
        onCanvasMouseDown={onCanvasMouseDown}
        onWheel={onWheel}
        onSelectConnection={(id) => { setSelectedConnectionId(id); setSelection([]); }}
        selectedConnectionId={selectedConnectionId}
        marquee={marquee}
        dragLine={dragLine}
        collaborators={collaborators}
        density={tweaks.density}
        canvasRef={canvasRef}
      />

      <PlanoTopRightHud folder={folder} onShare={() => alert("Compartilhar — em breve")} onExport={onExport} />
      <PlanoBottomLeftHud pan={pan} zoom={zoom} mouseWorld={mouseWorld} />
      <PlanoBottomRightHud
        zoom={zoom}
        setZoom={setZoom}
        fit={fit}
        status={{ collaborators: 3, elements: elements.length, unsync: 2 }}
        miniMap={<PlanoMiniMap elements={elements} pan={pan} zoom={zoom} viewportSize={viewportSize} />}
      />

      {(selectedEl || selectedConn) && (
        <PlanoProperties
          el={selectedEl}
          onUpdate={onUpdateElement}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          selectedConnection={selectedConn}
          onConnectionUpdate={(patch) => setConnections(prev => prev.map(c => c.id === selectedConnectionId ? { ...c, ...patch } : c))}
          onClose={() => { setSelection([]); setSelectedConnectionId(null); }}
        />
      )}

      {floatingPanel === "layers" && (
        <PlanoFloatingPanel title="Camadas" onClose={() => setFloatingPanel(null)} top={64} right={selectedEl || selectedConn ? 350 : 14}>
          <PlanoLayersList
            elements={elements}
            selection={selection}
            onSelect={(id) => setSelection([id])}
            onToggleVisible={(id) => onUpdateElement(id, (el) => ({ hidden: !el.hidden }))}
            onToggleLock={(id) => onUpdateElement(id, (el) => ({ locked: !el.locked }))}
          />
        </PlanoFloatingPanel>
      )}
      {floatingPanel === "history" && (
        <PlanoFloatingPanel title="Histórico" onClose={() => setFloatingPanel(null)} top={64} right={selectedEl || selectedConn ? 350 : 14}>
          <PlanoHistoryList elements={elements} />
        </PlanoFloatingPanel>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Tema">
          <TweakRadio
            value={tweaks.theme}
            onChange={(v) => setTweak("theme", v)}
            options={[{ value: "light", label: "Claro" }, { value: "dark", label: "Escuro" }]}
          />
        </TweakSection>
        <TweakSection label="Fundo do canvas">
          <TweakRadio
            value={tweaks.background}
            onChange={(v) => setTweak("background", v)}
            options={[
              { value: "dots",  label: "Pontos" },
              { value: "lines", label: "Grid" },
              { value: "plain", label: "Liso" },
              { value: "paper", label: "Papel" },
            ]}
          />
        </TweakSection>
        <TweakSection label="Densidade">
          <TweakRadio
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { value: "compact",     label: "Compacto" },
              { value: "comfortable", label: "Confort." },
              { value: "spacious",    label: "Amplo" },
            ]}
          />
        </TweakSection>
        <TweakSection label="Estilo dos cards">
          <TweakRadio
            value={tweaks.cardStyle}
            onChange={(v) => setTweak("cardStyle", v)}
            options={[
              { value: "shadow",  label: "Sombra" },
              { value: "flat",    label: "Flat" },
              { value: "outline", label: "Contorno" },
            ]}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
