/*
  Whiteboard MVP em Konva.
  Objetivo: cobrir funcionalidades essenciais de criação e manipulação de elementos,
  mantendo arquitetura simples para evoluir para produto real.
*/

const container = document.getElementById("boardContainer");
const statusEl = document.getElementById("status");
const boardNameEl = document.getElementById("boardName");

const stage = new Konva.Stage({
  container: "boardContainer",
  width: container.clientWidth,
  height: container.clientHeight,
  draggable: true,
});

const layer = new Konva.Layer();
stage.add(layer);
const transformer = new Konva.Transformer({ rotateEnabled: false, enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"] });
layer.add(transformer);

const state = {
  boardId: null,
  elements: [],
  connections: [],
  selectedIds: [],
};

function setStatus(msg) { statusEl.textContent = msg; }
function uid() { return `el_${Date.now()}_${Math.floor(Math.random()*9999)}`; }

function shapeForElement(el) {
  const common = { x: el.x, y: el.y, draggable: true, id: el.id, name: "board-item" };

  if (el.type === "text") {
    return new Konva.Text({ ...common, text: el.text || "Texto", fontSize: 22, fill: "#f8fafc" });
  }
  if (el.type === "note") {
    const g = new Konva.Group(common);
    g.add(new Konva.Rect({ width: el.width || 180, height: el.height || 130, fill: "#fef08a", cornerRadius: 8, stroke: "#facc15" }));
    g.add(new Konva.Text({ x: 10, y: 10, width: (el.width || 180)-20, text: el.text || "Sticky note", fontSize: 16, fill: "#111827" }));
    return g;
  }
  if (el.type === "rect" || el.type === "folder") {
    return new Konva.Rect({ ...common, width: el.width || 220, height: el.height || 140, fill: el.type === "folder" ? "rgba(56,189,248,0.15)" : "rgba(148,163,184,0.2)", stroke: "#38bdf8", cornerRadius: 8 });
  }
  if (el.type === "circle") {
    return new Konva.Circle({ ...common, radius: el.radius || 55, fill: "rgba(251,146,60,0.25)", stroke: "#fb923c" });
  }
  if (el.type === "progress") {
    const g = new Konva.Group(common);
    const w = el.width || 220;
    const progress = Math.max(0, Math.min(100, el.value ?? 50));
    g.add(new Konva.Rect({ width: w, height: 24, fill: "#334155", cornerRadius: 12 }));
    g.add(new Konva.Rect({ width: (w * progress)/100, height: 24, fill: "#22c55e", cornerRadius: 12 }));
    g.add(new Konva.Text({ x: 8, y: 3, text: `${progress}%`, fill: "white", fontSize: 14 }));
    return g;
  }
  if (el.type === "checklist") {
    const g = new Konva.Group(common);
    const items = el.items || ["Item 1", "Item 2", "Item 3"];
    g.add(new Konva.Rect({ width: 220, height: 40 + items.length * 24, fill: "#0b1220", stroke: "#38bdf8", cornerRadius: 8 }));
    items.forEach((item, idx) => {
      g.add(new Konva.Text({ x: 10, y: 12 + idx * 24, text: `☐ ${item}`, fill: "#e2e8f0", fontSize: 15 }));
    });
    return g;
  }
  if (el.type === "list" || el.type === "column") {
    const g = new Konva.Group(common);
    const title = el.title || (el.type === "column" ? "Coluna" : "Lista");
    const items = el.items || ["A", "B", "C"];
    const w = 220;
    g.add(new Konva.Rect({ width: w, height: 42 + items.length * 24, fill: "#111827", stroke: "#64748b", cornerRadius: 8 }));
    g.add(new Konva.Text({ x: 10, y: 10, text: title, fontSize: 16, fill: "#7dd3fc", fontStyle: "bold" }));
    items.forEach((item, idx) => {
      g.add(new Konva.Text({ x: 14, y: 40 + idx*24, text: `• ${item}`, fontSize: 14, fill: "#e5e7eb" }));
    });
    return g;
  }
  if (el.type === "table") {
    const g = new Konva.Group(common);
    const rows = el.rows || 3;
    const cols = el.cols || 3;
    const cw = 80, ch = 36;
    g.add(new Konva.Rect({ width: cols*cw, height: rows*ch, stroke: "#a78bfa", fill: "rgba(139,92,246,0.12)" }));
    for (let r=1;r<rows;r++) g.add(new Konva.Line({ points:[0,r*ch, cols*cw, r*ch], stroke:"#a78bfa" }));
    for (let c=1;c<cols;c++) g.add(new Konva.Line({ points:[c*cw,0, c*cw, rows*ch], stroke:"#a78bfa" }));
    return g;
  }
  if (el.type === "arrow") {
    return new Konva.Arrow({ ...common, points: el.points || [0,0,140,40], stroke: "#f43f5e", fill: "#f43f5e", pointerWidth: 8, pointerLength: 8 });
  }
  if (el.type === "image") {
    const image = new Image();
    image.src = el.src;
    return new Konva.Image({ ...common, image, width: el.width || 220, height: el.height || 160 });
  }
  return new Konva.Text({ ...common, text: "Elemento", fill: "white" });
}

function base(type) { return { id: uid(), type, x: 100 + Math.random()*180, y: 100 + Math.random()*140 }; }

function addElement(el) {
  state.elements.push(el);
  redraw();
}

function bindNodeEvents(node) {
  node.on("click tap", (e) => {
    e.cancelBubble = true;
    const id = node.id();
    if (state.selectedIds.includes(id)) {
      state.selectedIds = state.selectedIds.filter((s) => s !== id);
    } else {
      state.selectedIds = [...state.selectedIds.slice(-1), id];
    }
    const selectedNodes = layer.find(".board-item").filter((n) => state.selectedIds.includes(n.id()));
    transformer.nodes(selectedNodes);
    layer.draw();
  });

  node.on("dragend transformend", () => {
    const el = state.elements.find((item) => item.id === node.id());
    if (!el) return;
    el.x = node.x();
    el.y = node.y();
    if (node.width) el.width = node.width() * (node.scaleX ? node.scaleX() : 1);
    if (node.height) el.height = node.height() * (node.scaleY ? node.scaleY() : 1);
    if (node.scaleX) node.scaleX(1);
    if (node.scaleY) node.scaleY(1);
    redrawConnections();
  });

  node.on("dblclick dbltap", () => {
    const el = state.elements.find((item) => item.id === node.id());
    if (!el) return;
    const newText = prompt("Editar texto/título:", el.text || el.title || "");
    if (newText !== null) {
      el.text = newText;
      el.title = newText;
      redraw();
    }
  });
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
      points: [p1.x + p1.width/2, p1.y + p1.height/2, p2.x + p2.width/2, p2.y + p2.height/2],
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

function redraw() {
  layer.find(".board-item").forEach((n) => n.destroy());
  state.elements.forEach((el) => {
    const node = shapeForElement(el);
    layer.add(node);
    bindNodeEvents(node);
  });
  redrawConnections();
  layer.add(transformer);
  layer.draw();
}

function exportState() {
  return {
    elements: state.elements,
    connections: state.connections,
    viewport: { x: stage.x(), y: stage.y(), scaleX: stage.scaleX(), scaleY: stage.scaleY() },
  };
}

function importState(data) {
  state.elements = data.elements || [];
  state.connections = data.connections || [];
  if (data.viewport) {
    stage.position({ x: data.viewport.x ?? 0, y: data.viewport.y ?? 0 });
    stage.scale({ x: data.viewport.scaleX ?? 1, y: data.viewport.scaleY ?? 1 });
  }
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
  if (!list.boards.length) {
    setStatus("Nenhum board salvo ainda.");
    return;
  }
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

function exportJSONFile() {
  const blob = new Blob([JSON.stringify(exportState(), null, 2)], { type: "application/json" });
  download(`board-${Date.now()}.json`, URL.createObjectURL(blob));
}

function exportPNG() {
  const uri = stage.toDataURL({ pixelRatio: 2 });
  download(`board-${Date.now()}.png`, uri);
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("l", "pt", "a4");
  const img = stage.toDataURL({ pixelRatio: 2 });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  pdf.addImage(img, "PNG", 20, 20, pageW-40, pageH-40, undefined, "FAST");
  pdf.save(`board-${Date.now()}.pdf`);
}

function wireToolbar() {
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      if (action === "add-text") addElement({ ...base("text"), text: "Novo texto" });
      if (action === "add-note") addElement({ ...base("note"), width: 200, height: 130, text: "Nota" });
      if (action === "add-list") addElement({ ...base("list"), title: "Lista", items: ["Tarefa 1", "Tarefa 2"] });
      if (action === "add-column") addElement({ ...base("column"), title: "Backlog", items: ["Card A", "Card B"] });
      if (action === "add-table") addElement({ ...base("table"), rows: 4, cols: 3 });
      if (action === "add-folder") addElement({ ...base("folder"), width: 280, height: 190 });
      if (action === "add-checklist") addElement({ ...base("checklist"), items: ["Planejar", "Construir", "Testar"] });
      if (action === "add-progress") addElement({ ...base("progress"), value: 65 });
      if (action === "add-rect") addElement({ ...base("rect"), width: 200, height: 120 });
      if (action === "add-circle") addElement({ ...base("circle"), radius: 60 });
      if (action === "add-arrow") addElement({ ...base("arrow"), points: [0, 0, 150, 0] });
      if (action === "connect-selected") {
        if (state.selectedIds.length !== 2) {
          setStatus("Selecione exatamente 2 elementos para conectar.");
        } else {
          state.connections.push({ from: state.selectedIds[0], to: state.selectedIds[1] });
          redrawConnections();
          layer.draw();
          setStatus("Conexão criada.");
        }
      }
      if (action === "save-board") await saveBoard();
      if (action === "load-board") await loadLatestBoard();
      if (action === "export-json") exportJSONFile();
      if (action === "export-png") exportPNG();
      if (action === "export-pdf") exportPDF();
    });
  });

  document.getElementById("jsonInput").addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const text = await file.text();
    importState(JSON.parse(text));
    setStatus("Board importado de JSON local.");
  });

  document.getElementById("imageInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addElement({ ...base("image"), src: reader.result, width: 280, height: 180 });
      setStatus("Imagem adicionada ao board.");
    };
    reader.readAsDataURL(file);
  });
}

function setupStageInteractions() {
  // Zoom com wheel no ponteiro.
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

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  });

  // Limpa seleção ao clicar no fundo.
  stage.on("click", (e) => {
    if (e.target === stage) {
      state.selectedIds = [];
      transformer.nodes([]);
      layer.draw();
    }
  });

  window.addEventListener("resize", () => {
    stage.size({ width: container.clientWidth, height: container.clientHeight });
    stage.batchDraw();
  });
}

wireToolbar();
setupStageInteractions();
redraw();
