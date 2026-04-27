/*
  Whiteboard com Konva com foco em manipulação robusta de elementos:
  - seleção visual
  - resize fluido
  - edição por painel lateral (sem alert/prompt)
  - exclusão por teclado e menu de contexto
*/

const container = document.getElementById("boardContainer");
const statusEl = document.getElementById("status");
const boardNameEl = document.getElementById("boardName");
const inspectorForm = document.getElementById("inspectorForm");
const inspectorEmpty = document.getElementById("inspectorEmpty");
const inspectorTitle = document.getElementById("inspectorTitle");
const deleteSelectedBtn = document.getElementById("deleteSelected");
const contextMenu = document.getElementById("contextMenu");
const contextDeleteBtn = document.getElementById("contextDelete");

const MIN_SIZE = 40;

const stage = new Konva.Stage({
  container: "boardContainer",
  width: container.clientWidth,
  height: container.clientHeight,
  draggable: true,
});

const layer = new Konva.Layer();
stage.add(layer);

const transformer = new Konva.Transformer({
  rotateEnabled: false,
  enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
  boundBoxFunc: (_, newBox) => {
    if (Math.abs(newBox.width) < MIN_SIZE || Math.abs(newBox.height) < MIN_SIZE) {
      return _;
    }
    return newBox;
  },
});
layer.add(transformer);

const state = {
  boardId: null,
  elements: [],
  connections: [],
  selectedId: null,
};

function setStatus(msg) {
  statusEl.textContent = msg;
}

function uid() {
  return `el_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function elementById(id) {
  return state.elements.find((el) => el.id === id);
}

function ensureElementDefaults(el) {
  const sizedTypes = ["note", "rect", "folder", "progress", "checklist", "list", "column", "table", "image", "text"];
  if (sizedTypes.includes(el.type)) {
    el.width = el.width || (el.type === "text" ? 220 : 220);
    el.height = el.height || (el.type === "text" ? 60 : 140);
  }
  if (el.type === "circle") {
    el.radius = el.radius || 55;
  }
  if ((el.type === "list" || el.type === "column" || el.type === "checklist") && !Array.isArray(el.items)) {
    el.items = ["Item 1", "Item 2"];
  }
  if (el.type === "progress") {
    el.value = clamp(el.value ?? 50, 0, 100);
  }
  if (el.type === "table") {
    el.rows = Math.max(1, el.rows || 3);
    el.cols = Math.max(1, el.cols || 3);
  }
}

function createTextNode(opts) {
  return new Konva.Text({
    fontFamily: "Inter, system-ui, sans-serif",
    ...opts,
  });
}

function shapeForElement(el) {
  ensureElementDefaults(el);
  const common = { x: el.x, y: el.y, draggable: true, id: el.id, name: "board-item" };

  if (el.type === "text") {
    return createTextNode({
      ...common,
      text: el.text || "Texto",
      width: el.width,
      height: el.height,
      padding: 8,
      fontSize: 22,
      fill: "#f8fafc",
      stroke: state.selectedId === el.id ? "#38bdf8" : undefined,
      strokeWidth: state.selectedId === el.id ? 1 : 0,
    });
  }

  if (el.type === "circle") {
    return new Konva.Circle({
      ...common,
      radius: el.radius,
      fill: "rgba(251,146,60,0.25)",
      stroke: state.selectedId === el.id ? "#38bdf8" : "#fb923c",
      strokeWidth: state.selectedId === el.id ? 2 : 1,
    });
  }

  if (el.type === "arrow") {
    return new Konva.Arrow({
      ...common,
      points: el.points || [0, 0, 150, 0],
      stroke: "#f43f5e",
      fill: "#f43f5e",
      pointerWidth: 8,
      pointerLength: 8,
      strokeWidth: state.selectedId === el.id ? 3 : 2,
    });
  }

  const group = new Konva.Group(common);
  const isSelected = state.selectedId === el.id;
  const w = el.width;
  const h = el.height;

  if (el.type === "note") {
    group.add(new Konva.Rect({ width: w, height: h, fill: "#fef08a", cornerRadius: 8, stroke: isSelected ? "#0284c7" : "#facc15", strokeWidth: isSelected ? 2 : 1 }));
    group.add(createTextNode({ x: 10, y: 10, width: w - 20, height: h - 20, text: el.text || "Sticky note", fontSize: 16, fill: "#111827" }));
    return group;
  }

  if (el.type === "rect" || el.type === "folder") {
    group.add(new Konva.Rect({
      width: w,
      height: h,
      fill: el.type === "folder" ? "rgba(56,189,248,0.15)" : "rgba(148,163,184,0.2)",
      stroke: isSelected ? "#0ea5e9" : "#38bdf8",
      cornerRadius: 8,
      strokeWidth: isSelected ? 2 : 1,
    }));
    if (el.title) {
      group.add(createTextNode({ x: 10, y: 10, text: el.title, width: w - 20, fill: "#e2e8f0", fontSize: 16, fontStyle: "bold" }));
    }
    return group;
  }

  if (el.type === "progress") {
    const progress = clamp(el.value ?? 50, 0, 100);
    const barHeight = Math.max(24, Math.floor(h * 0.3));
    const y = (h - barHeight) / 2;
    group.add(new Konva.Rect({ width: w, height: h, fill: "#0b1220", stroke: isSelected ? "#0ea5e9" : "#334155", cornerRadius: 8, strokeWidth: isSelected ? 2 : 1 }));
    group.add(new Konva.Rect({ x: 10, y, width: w - 20, height: barHeight, fill: "#334155", cornerRadius: 12 }));
    group.add(new Konva.Rect({ x: 10, y, width: ((w - 20) * progress) / 100, height: barHeight, fill: "#22c55e", cornerRadius: 12 }));
    group.add(createTextNode({ x: 16, y: y + 4, text: `${progress}%`, fill: "white", fontSize: 14 }));
    return group;
  }

  if (el.type === "checklist") {
    const items = el.items || [];
    group.add(new Konva.Rect({ width: w, height: h, fill: "#0b1220", stroke: isSelected ? "#0ea5e9" : "#38bdf8", cornerRadius: 8, strokeWidth: isSelected ? 2 : 1 }));
    const maxLines = Math.max(1, Math.floor((h - 20) / 24));
    items.slice(0, maxLines).forEach((item, idx) => {
      group.add(createTextNode({ x: 10, y: 10 + idx * 24, text: `☐ ${item}`, width: w - 20, fill: "#e2e8f0", fontSize: 15 }));
    });
    return group;
  }

  if (el.type === "list" || el.type === "column") {
    const title = el.title || (el.type === "column" ? "Coluna" : "Lista");
    const items = el.items || [];
    group.add(new Konva.Rect({ width: w, height: h, fill: "#111827", stroke: isSelected ? "#0ea5e9" : "#64748b", cornerRadius: 8, strokeWidth: isSelected ? 2 : 1 }));
    group.add(createTextNode({ x: 10, y: 10, text: title, width: w - 20, fontSize: 16, fill: "#7dd3fc", fontStyle: "bold" }));
    const maxLines = Math.max(1, Math.floor((h - 48) / 24));
    items.slice(0, maxLines).forEach((item, idx) => {
      group.add(createTextNode({ x: 14, y: 40 + idx * 24, text: `• ${item}`, width: w - 22, fontSize: 14, fill: "#e5e7eb" }));
    });
    return group;
  }

  if (el.type === "table") {
    const rows = Math.max(1, el.rows || 3);
    const cols = Math.max(1, el.cols || 3);
    group.add(new Konva.Rect({ width: w, height: h, stroke: isSelected ? "#0ea5e9" : "#a78bfa", fill: "rgba(139,92,246,0.12)", strokeWidth: isSelected ? 2 : 1 }));
    const cw = w / cols;
    const ch = h / rows;
    for (let r = 1; r < rows; r += 1) group.add(new Konva.Line({ points: [0, r * ch, w, r * ch], stroke: "#a78bfa" }));
    for (let c = 1; c < cols; c += 1) group.add(new Konva.Line({ points: [c * cw, 0, c * cw, h], stroke: "#a78bfa" }));
    return group;
  }

  if (el.type === "image") {
    const imageObj = new Image();
    imageObj.src = el.src;
    group.add(new Konva.Rect({ width: w, height: h, stroke: isSelected ? "#0ea5e9" : "#475569", cornerRadius: 8, strokeWidth: isSelected ? 2 : 1 }));
    group.add(new Konva.Image({ x: 0, y: 0, width: w, height: h, image: imageObj, cornerRadius: 8 }));
    return group;
  }

  group.add(createTextNode({ text: "Elemento", fill: "white" }));
  return group;
}

function base(type) {
  return { id: uid(), type, x: 100 + Math.random() * 180, y: 100 + Math.random() * 140 };
}

function selectElement(id) {
  state.selectedId = id;
  const selectedNode = id ? layer.findOne(`#${id}`) : null;
  transformer.nodes(selectedNode ? [selectedNode] : []);
  updateInspector();
  redraw();
}

function updateElementFromNode(node) {
  const el = elementById(node.id());
  if (!el) return;

  el.x = node.x();
  el.y = node.y();

  const rect = node.getClientRect({ skipTransform: false, skipShadow: true, skipStroke: true });
  const scaleX = node.scaleX ? node.scaleX() : 1;
  const scaleY = node.scaleY ? node.scaleY() : 1;

  if (el.type === "circle") {
    const nextRadius = Math.max(MIN_SIZE / 2, (el.radius || 55) * Math.max(scaleX, scaleY));
    el.radius = nextRadius;
  } else if (el.type === "arrow") {
    const points = el.points || [0, 0, 150, 0];
    const w = Math.max(MIN_SIZE, Math.abs(points[2] - points[0]) * Math.abs(scaleX));
    const h = Math.max(20, Math.abs(points[3] - points[1]) * Math.abs(scaleY));
    el.points = [0, 0, w, h];
  } else {
    el.width = Math.max(MIN_SIZE, rect.width);
    el.height = Math.max(MIN_SIZE, rect.height);
  }

  if (node.scaleX) node.scaleX(1);
  if (node.scaleY) node.scaleY(1);

  updateInspector();
  redrawConnections();
}

function bindNodeEvents(node) {
  node.on("click tap", (e) => {
    e.cancelBubble = true;
    selectElement(node.id());
  });

  node.on("dragmove", redrawConnections);
  node.on("dragend", () => {
    updateElementFromNode(node);
  });

  node.on("transform", () => {
    redrawConnections();
    layer.batchDraw();
  });

  node.on("transformend", () => {
    updateElementFromNode(node);
    redraw();
  });

  node.on("contextmenu", (e) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    selectElement(node.id());
    openContextMenu(e.evt.clientX, e.evt.clientY);
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

function redraw() {
  layer.find(".board-item").forEach((n) => n.destroy());
  state.elements.forEach((el) => {
    const node = shapeForElement(el);
    layer.add(node);
    bindNodeEvents(node);
  });

  redrawConnections();

  const selectedNode = state.selectedId ? layer.findOne(`#${state.selectedId}`) : null;
  transformer.nodes(selectedNode ? [selectedNode] : []);

  layer.add(transformer);
  layer.draw();
}

function removeElement(id) {
  if (!id) return;
  state.elements = state.elements.filter((el) => el.id !== id);
  state.connections = state.connections.filter((conn) => conn.from !== id && conn.to !== id);
  if (state.selectedId === id) {
    state.selectedId = null;
  }
  setStatus("Elemento removido.");
  updateInspector();
  redraw();
}

function addElement(el) {
  ensureElementDefaults(el);
  state.elements.push(el);
  selectElement(el.id);
}

function buildInspectorFields(el) {
  const fields = [];
  const addField = (label, key, type = "text", value = "") => {
    fields.push(`
      <label class="inspector-field">
        <span>${label}</span>
        <input data-prop="${key}" type="${type}" value="${String(value).replace(/"/g, "&quot;")}" />
      </label>
    `);
  };

  const addTextArea = (label, key, value = "") => {
    fields.push(`
      <label class="inspector-field">
        <span>${label}</span>
        <textarea data-prop="${key}" rows="4">${value}</textarea>
      </label>
    `);
  };

  addField("X", "x", "number", Math.round(el.x));
  addField("Y", "y", "number", Math.round(el.y));

  if (el.type === "text" || el.type === "note") {
    addTextArea("Texto", "text", el.text || "");
  }
  if (el.type === "list" || el.type === "column" || el.type === "folder") {
    addField("Título", "title", "text", el.title || "");
  }
  if (["note", "list", "column", "rect", "folder", "progress", "checklist", "table", "image", "text"].includes(el.type)) {
    addField("Largura", "width", "number", Math.round(el.width || 220));
    addField("Altura", "height", "number", Math.round(el.height || 140));
  }
  if (el.type === "circle") {
    addField("Raio", "radius", "number", Math.round(el.radius || 55));
  }
  if (el.type === "progress") {
    addField("Progresso (%)", "value", "number", el.value ?? 50);
  }
  if (el.type === "table") {
    addField("Linhas", "rows", "number", el.rows || 3);
    addField("Colunas", "cols", "number", el.cols || 3);
  }
  if (el.type === "list" || el.type === "column" || el.type === "checklist") {
    addTextArea("Itens (1 por linha)", "items", (el.items || []).join("\n"));
  }

  return fields.join("\n");
}

function updateInspector() {
  const el = elementById(state.selectedId);
  if (!el) {
    inspectorEmpty.hidden = false;
    inspectorForm.hidden = true;
    deleteSelectedBtn.disabled = true;
    inspectorTitle.textContent = "Nenhum elemento selecionado";
    return;
  }

  inspectorEmpty.hidden = true;
  inspectorForm.hidden = false;
  deleteSelectedBtn.disabled = false;
  inspectorTitle.textContent = `Editando: ${el.type}`;
  inspectorForm.innerHTML = buildInspectorFields(el);
}

function applyInspectorUpdates() {
  const el = elementById(state.selectedId);
  if (!el) return;

  const entries = [...inspectorForm.querySelectorAll("[data-prop]")];
  entries.forEach((input) => {
    const prop = input.dataset.prop;
    const raw = input.value;
    if (prop === "items") {
      el.items = raw
        .split("\n")
        .map((it) => it.trim())
        .filter(Boolean);
      return;
    }

    if (["x", "y", "width", "height", "radius", "value", "rows", "cols"].includes(prop)) {
      const numeric = Number(raw);
      if (Number.isFinite(numeric)) {
        el[prop] = numeric;
      }
      return;
    }

    el[prop] = raw;
  });

  if (el.width !== undefined) el.width = Math.max(MIN_SIZE, el.width);
  if (el.height !== undefined) el.height = Math.max(MIN_SIZE, el.height);
  if (el.radius !== undefined) el.radius = Math.max(MIN_SIZE / 2, el.radius);
  if (el.value !== undefined) el.value = clamp(el.value, 0, 100);
  if (el.rows !== undefined) el.rows = Math.max(1, Math.round(el.rows));
  if (el.cols !== undefined) el.cols = Math.max(1, Math.round(el.cols));

  redraw();
}

function exportState() {
  return {
    elements: state.elements,
    connections: state.connections,
    viewport: { x: stage.x(), y: stage.y(), scaleX: stage.scaleX(), scaleY: stage.scaleY() },
  };
}

function importState(data) {
  state.elements = (data.elements || []).map((el) => {
    ensureElementDefaults(el);
    return el;
  });
  state.connections = data.connections || [];

  if (data.viewport) {
    stage.position({ x: data.viewport.x ?? 0, y: data.viewport.y ?? 0 });
    stage.scale({ x: data.viewport.scaleX ?? 1, y: data.viewport.scaleY ?? 1 });
  }

  state.selectedId = null;
  updateInspector();
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
  pdf.addImage(img, "PNG", 20, 20, pageW - 40, pageH - 40, undefined, "FAST");
  pdf.save(`board-${Date.now()}.pdf`);
}

function openContextMenu(x, y) {
  contextMenu.hidden = false;
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
}

function closeContextMenu() {
  contextMenu.hidden = true;
}

function wireToolbar() {
  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      if (action === "add-text") addElement({ ...base("text"), text: "Novo texto", width: 260, height: 64 });
      if (action === "add-note") addElement({ ...base("note"), width: 220, height: 140, text: "Nota" });
      if (action === "add-list") addElement({ ...base("list"), width: 260, height: 220, title: "Lista", items: ["Tarefa 1", "Tarefa 2"] });
      if (action === "add-column") addElement({ ...base("column"), width: 280, height: 260, title: "Backlog", items: ["Card A", "Card B"] });
      if (action === "add-table") addElement({ ...base("table"), width: 280, height: 180, rows: 4, cols: 3 });
      if (action === "add-folder") addElement({ ...base("folder"), width: 280, height: 190, title: "Pasta" });
      if (action === "add-checklist") addElement({ ...base("checklist"), width: 240, height: 180, items: ["Planejar", "Construir", "Testar"] });
      if (action === "add-progress") addElement({ ...base("progress"), width: 260, height: 86, value: 65 });
      if (action === "add-rect") addElement({ ...base("rect"), width: 200, height: 120, title: "Bloco" });
      if (action === "add-circle") addElement({ ...base("circle"), radius: 60 });
      if (action === "add-arrow") addElement({ ...base("arrow"), points: [0, 0, 150, 30] });

      if (action === "connect-selected") {
        if (!state.selectedId) {
          setStatus("Selecione um elemento para iniciar conexão.");
          return;
        }
        const previous = state.connections[state.connections.length - 1];
        if (!previous || previous.to) {
          state.connections.push({ from: state.selectedId, to: null });
          setStatus("Elemento de origem definido. Selecione outro e clique em conectar novamente.");
        } else {
          previous.to = state.selectedId;
          if (previous.from === previous.to) {
            state.connections = state.connections.filter((conn) => conn !== previous);
            setStatus("Conexão inválida: escolha elementos diferentes.");
          } else {
            setStatus("Conexão criada.");
          }
        }
        state.connections = state.connections.filter((conn) => conn.from && conn.to);
        redrawConnections();
        layer.draw();
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

  stage.on("click tap", (e) => {
    if (e.target === stage) {
      selectElement(null);
    }
    closeContextMenu();
  });

  stage.on("contextmenu", (e) => {
    e.evt.preventDefault();
    if (e.target === stage) {
      selectElement(null);
      closeContextMenu();
    }
  });

  window.addEventListener("resize", () => {
    stage.size({ width: container.clientWidth, height: container.clientHeight });
    stage.batchDraw();
  });

  window.addEventListener("keydown", (e) => {
    const active = document.activeElement;
    const typing = active && ["INPUT", "TEXTAREA"].includes(active.tagName);
    if (typing) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      if (state.selectedId) {
        e.preventDefault();
        removeElement(state.selectedId);
      }
    }
  });

  document.addEventListener("click", (e) => {
    if (!contextMenu.contains(e.target)) {
      closeContextMenu();
    }
  });
}

function setupInspector() {
  inspectorForm.addEventListener("input", applyInspectorUpdates);
  deleteSelectedBtn.addEventListener("click", () => removeElement(state.selectedId));
  contextDeleteBtn.addEventListener("click", () => {
    removeElement(state.selectedId);
    closeContextMenu();
  });
}

wireToolbar();
setupStageInteractions();
setupInspector();
updateInspector();
redraw();
