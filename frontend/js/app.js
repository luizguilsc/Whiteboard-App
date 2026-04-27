/* Whiteboard MVP - versão com UX melhorada e editor contextual. */

const container = document.getElementById("boardContainer");
const statusEl = document.getElementById("status");
const boardNameEl = document.getElementById("boardName");
const scopeLabelEl = document.getElementById("scopeLabel");

const inspectorEl = document.getElementById("inspector");
const editTextEl = document.getElementById("editText");
const editProgressEl = document.getElementById("editProgress");
const itemListEl = document.getElementById("itemList");

const stage = new Konva.Stage({
  container: "boardContainer",
  width: container.clientWidth,
  height: container.clientHeight,
  draggable: false,
});

const layer = new Konva.Layer();
stage.add(layer);
const transformer = new Konva.Transformer({
  rotateEnabled: false,
  enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
});
layer.add(transformer);

const state = {
  boardId: null,
  elements: [],
  connections: [],
  selectedIds: [],
  currentFolderId: null,
};

function setStatus(msg) { statusEl.textContent = msg; }
function uid() { return `el_${Date.now()}_${Math.floor(Math.random() * 9999)}`; }
function slugify(s) { return (s || "pasta").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function activeElements() { return state.elements.filter((e) => (e.parentId || null) === state.currentFolderId); }
function getSelectedElement() { return state.elements.find((e) => e.id === state.selectedIds[0]); }

function defaultItems(prefix = "Card") {
  return [{ text: `${prefix} 1`, done: false }];
}

function base(type) {
  return {
    id: uid(),
    type,
    x: 120 + Math.random() * 140,
    y: 100 + Math.random() * 120,
    parentId: state.currentFolderId,
  };
}

function openFolder(folderEl) {
  state.currentFolderId = folderEl.id;
  state.selectedIds = [];
  transformer.nodes([]);
  history.pushState({}, "", `#/folder/${folderEl.id}/${slugify(folderEl.title || "pasta")}`);
  scopeLabelEl.textContent = `Escopo atual: Pasta "${folderEl.title || "Pasta"}"`;
  redraw();
}

function goRoot() {
  state.currentFolderId = null;
  state.selectedIds = [];
  transformer.nodes([]);
  history.pushState({}, "", `#/`);
  scopeLabelEl.textContent = "Escopo atual: Raiz";
  redraw();
}

function shapeForElement(el) {
  const common = { x: el.x, y: el.y, draggable: true, id: el.id, name: "board-item" };

  if (el.type === "text") {
    return new Konva.Text({ ...common, text: el.text || "Texto", fontSize: 22, fill: "#f8fafc" });
  }
  if (el.type === "note") {
    const g = new Konva.Group(common);
    g.add(new Konva.Rect({ width: el.width || 220, height: el.height || 140, fill: "#fef08a", cornerRadius: 8, stroke: "#facc15" }));
    g.add(new Konva.Text({ x: 10, y: 10, width: (el.width || 220) - 20, text: el.text || "Nota", fontSize: 16, fill: "#111827" }));
    return g;
  }
  if (el.type === "rect") {
    return new Konva.Rect({ ...common, width: el.width || 220, height: el.height || 120, fill: "rgba(148,163,184,0.2)", stroke: "#38bdf8", cornerRadius: 8 });
  }
  if (el.type === "folder") {
    const g = new Konva.Group(common);
    const width = el.width || 260;
    const height = el.height || 160;
    g.add(new Konva.Rect({ width, height, fill: "rgba(56,189,248,0.15)", stroke: "#38bdf8", cornerRadius: 8 }));
    g.add(new Konva.Text({ x: 12, y: 8, text: `📁 ${el.title || "Pasta"}`, fontSize: 16, fill: "#7dd3fc" }));
    g.add(new Konva.Text({ x: 12, y: 34, text: "Duplo clique para abrir", fontSize: 12, fill: "#cbd5e1" }));
    return g;
  }
  if (el.type === "circle") {
    return new Konva.Circle({ ...common, radius: el.radius || 55, fill: "rgba(251,146,60,0.25)", stroke: "#fb923c" });
  }
  if (el.type === "progress") {
    const g = new Konva.Group(common);
    const w = el.width || 220;
    const progress = Math.max(0, Math.min(100, el.value ?? 50));
    g.add(new Konva.Rect({ width: w, height: 24, fill: "#334155", cornerRadius: 12 }));
    g.add(new Konva.Rect({ width: (w * progress) / 100, height: 24, fill: "#22c55e", cornerRadius: 12 }));
    g.add(new Konva.Text({ x: 8, y: 3, text: `${progress}%`, fill: "white", fontSize: 14 }));
    return g;
  }
  if (["checklist", "list", "column"].includes(el.type)) {
    const g = new Konva.Group(common);
    const title = el.title || (el.type === "column" ? "Coluna" : el.type === "list" ? "Lista" : "Checklist");
    const items = el.items || defaultItems("Item");
    const w = 250;
    g.add(new Konva.Rect({ width: w, height: 42 + items.length * 24, fill: "#111827", stroke: "#64748b", cornerRadius: 8 }));
    g.add(new Konva.Text({ x: 10, y: 10, text: title, fontSize: 16, fill: "#7dd3fc", fontStyle: "bold" }));
    items.forEach((item, idx) => {
      const prefix = item.done ? "☑" : "☐";
      const row = new Konva.Text({ x: 14, y: 40 + idx * 24, text: `${prefix} ${item.text}`, fontSize: 14, fill: item.done ? "#22c55e" : "#e5e7eb", name: `item-row-${idx}` });
      row.on("dblclick dbltap", () => {
        item.done = !item.done;
        redraw();
      });
      g.add(row);
    });
    return g;
  }
  if (el.type === "table") {
    const g = new Konva.Group(common);
    const rows = el.rows || 3;
    const cols = el.cols || 3;
    const cw = el.cellWidth || 100;
    const ch = el.cellHeight || 40;
    if (!el.cells) {
      el.cells = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
    }
    g.add(new Konva.Rect({ width: cols * cw, height: rows * ch, stroke: "#a78bfa", fill: "rgba(139,92,246,0.12)" }));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r > 0) g.add(new Konva.Line({ points: [0, r * ch, cols * cw, r * ch], stroke: "#a78bfa" }));
        if (c > 0) g.add(new Konva.Line({ points: [c * cw, 0, c * cw, rows * ch], stroke: "#a78bfa" }));
        const cellText = new Konva.Text({ x: c * cw + 8, y: r * ch + 10, width: cw - 16, text: el.cells?.[r]?.[c] || "", fontSize: 14, fill: "#f5f3ff", name: `cell-${r}-${c}` });
        cellText.on("dblclick dbltap", () => {
          const value = prompt(`Texto da célula [${r + 1},${c + 1}]`, el.cells[r][c] || "");
          if (value !== null) {
            el.cells[r][c] = value;
            redraw();
          }
        });
        g.add(cellText);
      }
    }
    return g;
  }
  if (el.type === "arrow") {
    return new Konva.Arrow({ ...common, points: el.points || [0, 0, 150, 0], stroke: "#f43f5e", fill: "#f43f5e", pointerWidth: 8, pointerLength: 8 });
  }
  if (el.type === "image") {
    const image = new Image();
    image.src = el.src;
    return new Konva.Image({ ...common, image, width: el.width || 240, height: el.height || 160 });
  }
  return new Konva.Text({ ...common, text: "Elemento", fill: "white" });
}

function redrawConnections() {
  layer.find(".connection").forEach((n) => n.destroy());
  state.connections.forEach((conn) => {
    const fromNode = layer.findOne(`#${conn.from}`);
    const toNode = layer.findOne(`#${conn.to}`);
    if (!fromNode || !toNode) return;
    const p1 = fromNode.getClientRect();
    const p2 = toNode.getClientRect();
    const arrow = new Konva.Arrow({
      points: [p1.x + p1.width / 2, p1.y + p1.height / 2, p2.x + p2.width / 2, p2.y + p2.height / 2],
      stroke: "#22d3ee",
      fill: "#22d3ee",
      pointerLength: 8,
      pointerWidth: 8,
      dash: [6, 4],
      name: "connection",
    });
    layer.add(arrow);
    arrow.moveToBottom();
  });
}

function syncInspector() {
  const el = getSelectedElement();
  if (!el) {
    inspectorEl.classList.add("hidden");
    return;
  }
  inspectorEl.classList.remove("hidden");
  editTextEl.value = el.text || el.title || "";
  editProgressEl.value = el.value ?? "";

  const canItems = ["list", "column", "checklist"].includes(el.type);
  itemListEl.innerHTML = "";
  if (canItems) {
    (el.items || []).forEach((item, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <input value="${item.text.replace(/"/g, "&quot;")}" data-idx="${idx}" />
        <button data-toggle="${idx}">${item.done ? "Feito" : "Pendente"}</button>
        <button data-remove="${idx}">X</button>
      `;
      itemListEl.appendChild(li);
    });
  }
}

function redraw() {
  layer.find(".board-item").forEach((n) => n.destroy());
  const visibleElements = activeElements();
  visibleElements.forEach((el) => {
    const node = shapeForElement(el);
    layer.add(node);
    bindNodeEvents(node);
  });
  redrawConnections();
  layer.add(transformer);
  layer.draw();
  syncInspector();
}

function bindNodeEvents(node) {
  node.on("click tap", (e) => {
    e.cancelBubble = true;
    const targetNode = e.target.findAncestor(".board-item") || node;
    const id = targetNode.id();
    if (e.evt.shiftKey) {
      if (state.selectedIds.includes(id)) {
        state.selectedIds = state.selectedIds.filter((s) => s !== id);
      } else {
        state.selectedIds.push(id);
      }
    } else {
      state.selectedIds = [id];
    }
    transformer.nodes(layer.find(".board-item").filter((n) => state.selectedIds.includes(n.id())));
    layer.draw();
    syncInspector();
  });

  node.on("dragend transformend", () => {
    const el = state.elements.find((item) => item.id === node.id());
    if (!el) return;
    el.x = node.x();
    el.y = node.y();
    if (typeof node.width === "function" && ["rect", "folder", "note", "image", "progress"].includes(el.type)) {
      el.width = Math.max(80, node.width() * node.scaleX());
    }
    if (typeof node.height === "function" && ["rect", "folder", "note", "image"].includes(el.type)) {
      el.height = Math.max(60, node.height() * node.scaleY());
    }
    node.scaleX(1);
    node.scaleY(1);
    redrawConnections();
  });

  node.on("dblclick dbltap", () => {
    const el = state.elements.find((item) => item.id === node.id());
    if (!el) return;
    if (el.type === "folder") {
      openFolder(el);
      return;
    }
    syncInspector();
  });
}

function exportState() {
  return {
    elements: state.elements,
    connections: state.connections,
    currentFolderId: state.currentFolderId,
    viewport: { x: stage.x(), y: stage.y(), scaleX: stage.scaleX(), scaleY: stage.scaleY() },
  };
}

function importState(data) {
  state.elements = data.elements || [];
  state.connections = data.connections || [];
  state.currentFolderId = data.currentFolderId || null;
  if (data.viewport) {
    stage.position({ x: data.viewport.x ?? 0, y: data.viewport.y ?? 0 });
    stage.scale({ x: data.viewport.scaleX ?? 1, y: data.viewport.scaleY ?? 1 });
  }
  scopeLabelEl.textContent = state.currentFolderId ? "Escopo atual: Pasta" : "Escopo atual: Raiz";
  state.selectedIds = [];
  transformer.nodes([]);
  redraw();
}

async function saveBoard() {
  const payload = { name: boardNameEl.value || "Meu Board", data: exportState() };
  const url = state.boardId ? `/api/boards/${state.boardId}` : "/api/boards";
  const method = state.boardId ? "PUT" : "POST";
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const json = await res.json();
  state.boardId = json.id;
  setStatus(`Board salvo (ID ${state.boardId}).`);
}

async function loadLatestBoard() {
  const list = await fetch("/api/boards").then((r) => r.json());
  if (!list.boards.length) return setStatus("Nenhum board salvo ainda.");
  const latest = list.boards[0];
  const board = await fetch(`/api/boards/${latest.id}`).then((r) => r.json());
  state.boardId = board.id;
  boardNameEl.value = board.name;
  importState(board.data);
  setStatus(`Board ${board.id} carregado.`);
}

function download(name, dataUrl) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = name;
  a.click();
}

function wireInspectorEvents() {
  editTextEl.addEventListener("input", () => {
    const el = getSelectedElement();
    if (!el) return;
    if (["text", "note"].includes(el.type)) el.text = editTextEl.value;
    else el.title = editTextEl.value;
    redraw();
  });

  editProgressEl.addEventListener("input", () => {
    const el = getSelectedElement();
    if (!el || el.type !== "progress") return;
    el.value = Number(editProgressEl.value || 0);
    redraw();
  });

  document.getElementById("addItemBtn").addEventListener("click", () => {
    const el = getSelectedElement();
    if (!el || !["list", "column", "checklist"].includes(el.type)) return;
    el.items = el.items || [];
    el.items.push({ text: `Novo item ${el.items.length + 1}`, done: false });
    redraw();
  });

  itemListEl.addEventListener("input", (e) => {
    const el = getSelectedElement();
    if (!el || !e.target.dataset.idx) return;
    el.items[Number(e.target.dataset.idx)].text = e.target.value;
    redraw();
  });

  itemListEl.addEventListener("click", (e) => {
    const el = getSelectedElement();
    if (!el) return;
    if (e.target.dataset.toggle !== undefined) {
      const idx = Number(e.target.dataset.toggle);
      el.items[idx].done = !el.items[idx].done;
      redraw();
    }
    if (e.target.dataset.remove !== undefined) {
      const idx = Number(e.target.dataset.remove);
      el.items.splice(idx, 1);
      redraw();
    }
  });

  document.getElementById("addRowBtn").addEventListener("click", () => {
    const el = getSelectedElement();
    if (!el || el.type !== "table") return;
    el.rows = (el.rows || 3) + 1;
    el.cells = el.cells || [];
    el.cells.push(Array.from({ length: el.cols || 3 }, () => ""));
    redraw();
  });
  document.getElementById("removeRowBtn").addEventListener("click", () => {
    const el = getSelectedElement();
    if (!el || el.type !== "table" || (el.rows || 3) <= 1) return;
    el.rows -= 1;
    el.cells.pop();
    redraw();
  });
  document.getElementById("addColBtn").addEventListener("click", () => {
    const el = getSelectedElement();
    if (!el || el.type !== "table") return;
    el.cols = (el.cols || 3) + 1;
    (el.cells || []).forEach((r) => r.push(""));
    redraw();
  });
  document.getElementById("removeColBtn").addEventListener("click", () => {
    const el = getSelectedElement();
    if (!el || el.type !== "table" || (el.cols || 3) <= 1) return;
    el.cols -= 1;
    (el.cells || []).forEach((r) => r.pop());
    redraw();
  });
}

function wireToolbar() {
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      if (action === "add-text") state.elements.push({ ...base("text"), text: "Novo texto" });
      if (action === "add-note") state.elements.push({ ...base("note"), width: 220, height: 140, text: "Nota" });
      if (action === "add-list") state.elements.push({ ...base("list"), title: "Lista", items: defaultItems("Card") });
      if (action === "add-column") state.elements.push({ ...base("column"), title: "Coluna", items: defaultItems("Card") });
      if (action === "add-table") state.elements.push({ ...base("table"), rows: 3, cols: 3, cellWidth: 100, cellHeight: 40, cells: Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => "")) });
      if (action === "add-folder") state.elements.push({ ...base("folder"), title: "Nova pasta", width: 260, height: 160 });
      if (action === "add-checklist") state.elements.push({ ...base("checklist"), title: "Checklist", items: defaultItems("Tarefa") });
      if (action === "add-progress") state.elements.push({ ...base("progress"), value: 50 });
      if (action === "add-rect") state.elements.push({ ...base("rect"), width: 200, height: 120 });
      if (action === "add-circle") state.elements.push({ ...base("circle"), radius: 60 });
      if (action === "add-arrow") state.elements.push({ ...base("arrow"), points: [0, 0, 150, 0] });

      if (action === "connect-selected") {
        if (state.selectedIds.length !== 2) setStatus("Selecione exatamente 2 elementos para conectar.");
        else state.connections.push({ from: state.selectedIds[0], to: state.selectedIds[1] });
      }

      if (action === "move-to-folder") {
        const selected = state.selectedIds.map((id) => state.elements.find((e) => e.id === id)).filter(Boolean);
        const folder = selected.find((e) => e.type === "folder");
        const moving = selected.filter((e) => e.type !== "folder");
        if (!folder || !moving.length) {
          setStatus("Selecione 1 pasta e ao menos 1 elemento para mover.");
        } else {
          moving.forEach((e) => { e.parentId = folder.id; });
          setStatus(`${moving.length} elemento(s) movidos para a pasta.`);
        }
      }

      if (action === "back-folder") goRoot();
      if (action === "save-board") await saveBoard();
      if (action === "load-board") await loadLatestBoard();
      if (action === "export-json") download(`board-${Date.now()}.json`, URL.createObjectURL(new Blob([JSON.stringify(exportState(), null, 2)], { type: "application/json" })));
      if (action === "export-png") download(`board-${Date.now()}.png`, stage.toDataURL({ pixelRatio: 2 }));
      if (action === "export-pdf") {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF("l", "pt", "a4");
        const img = stage.toDataURL({ pixelRatio: 2 });
        pdf.addImage(img, "PNG", 20, 20, pdf.internal.pageSize.getWidth() - 40, pdf.internal.pageSize.getHeight() - 40, undefined, "FAST");
        pdf.save(`board-${Date.now()}.pdf`);
      }

      redraw();
    });
  });

  document.getElementById("jsonInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    importState(JSON.parse(await file.text()));
    setStatus("Board importado de JSON.");
  });

  document.getElementById("imageInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.elements.push({ ...base("image"), src: reader.result, width: 260, height: 180 });
      redraw();
    };
    reader.readAsDataURL(file);
  });
}

function setupStageInteractions() {
  stage.on("wheel", (e) => {
    e.evt.preventDefault();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    stage.scale({ x: newScale, y: newScale });
    stage.position({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
    stage.batchDraw();
  });

  stage.on("mousedown", (e) => {
    if (e.evt.button === 1) {
      stage.draggable(true);
      document.body.style.cursor = "grab";
    }
    if (e.target === stage) {
      state.selectedIds = [];
      transformer.nodes([]);
      layer.draw();
      syncInspector();
    }
  });

  stage.on("mouseup", () => {
    stage.draggable(false);
    document.body.style.cursor = "default";
  });

  window.addEventListener("resize", () => {
    stage.size({ width: container.clientWidth, height: container.clientHeight });
    stage.batchDraw();
  });

  window.addEventListener("popstate", () => {
    goRoot();
  });
}

wireToolbar();
wireInspectorEvents();
setupStageInteractions();
goRoot();
redraw();
