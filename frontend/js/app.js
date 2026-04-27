const container = document.getElementById("boardContainer");
const statusEl = document.getElementById("status");
const boardNameEl = document.getElementById("boardName");
const inspectorForm = document.getElementById("inspectorForm");
const inspectorEmpty = document.getElementById("inspectorEmpty");
const inspectorTitle = document.getElementById("inspectorTitle");
const deleteSelectedBtn = document.getElementById("deleteSelected");
const contextMenu = document.getElementById("contextMenu");
const contextDeleteBtn = document.getElementById("contextDelete");
const foldersListEl = document.getElementById("foldersList");
const newFolderNameEl = document.getElementById("newFolderName");
const createFolderBtn = document.getElementById("createFolderBtn");

const MIN_SIZE = 40;
const stage = new Konva.Stage({ container: "boardContainer", width: container.clientWidth, height: container.clientHeight, draggable: true });
const layer = new Konva.Layer();
stage.add(layer);

const transformer = new Konva.Transformer({
  rotateEnabled: false,
  enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
  boundBoxFunc: (oldBox, newBox) => (Math.abs(newBox.width) < MIN_SIZE || Math.abs(newBox.height) < MIN_SIZE ? oldBox : newBox),
});
layer.add(transformer);

const state = { boardId: null, boardSlug: null, elements: [], connections: [], selectedId: null, boards: [] };

const parentTypes = ["column", "list", "task"];
const slugify = (v) => (v || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "board";
const uid = () => `el_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const elementById = (id) => state.elements.find((el) => el.id === id);

function setStatus(msg) { statusEl.textContent = msg; }

function ensureElementDefaults(el) {
  if (["text", "note", "rect", "folder", "progress", "checklist", "list", "column", "table", "image", "card", "task"].includes(el.type)) {
    el.width = el.width || 240;
    el.height = el.height || (el.type === "task" ? 64 : 140);
  }
  if (["list", "column", "checklist"].includes(el.type) && !Array.isArray(el.items)) el.items = [];
  if (el.type === "circle") el.radius = el.radius || 60;
  if (el.type === "arrow") el.points = el.points || [0, 0, 160, 20];
  if (el.type === "task") el.checked = Boolean(el.checked);
}

function parentTarget() {
  const selected = elementById(state.selectedId);
  return selected && parentTypes.includes(selected.type) ? selected.id : null;
}

function childElements(parentId) {
  return state.elements.filter((e) => e.parentId === parentId && ["card", "task"].includes(e.type)).sort((a, b) => a.y - b.y);
}

function createTextNode(opts) { return new Konva.Text({ fontFamily: "Inter, system-ui, sans-serif", ...opts }); }

function shapeForElement(el) {
  ensureElementDefaults(el);
  const common = { x: el.x, y: el.y, draggable: true, id: el.id, name: "board-item" };
  const isSelected = state.selectedId === el.id;

  if (el.type === "column") {
    const group = new Konva.Group(common);
    const children = childElements(el.id);
    group.add(new Konva.Rect({ width: el.width, height: el.height, fill: "#111827", stroke: isSelected ? "#0ea5e9" : "#64748b", cornerRadius: 8, strokeWidth: isSelected ? 2 : 1 }));
    group.add(createTextNode({ x: 10, y: 10, text: el.title || "Coluna", width: el.width - 20, fontSize: 16, fill: "#7dd3fc", fontStyle: "bold" }));
    group.add(createTextNode({ x: 10, y: 32, text: `${children.length} itens`, width: el.width - 20, fontSize: 12, fill: "#94a3b8" }));
    return group;
  }

  if (el.type === "card") {
    const group = new Konva.Group(common);
    group.add(new Konva.Rect({ width: el.width, height: el.height, fill: "#1f2937", stroke: isSelected ? "#38bdf8" : "#475569", cornerRadius: 8, strokeWidth: isSelected ? 2 : 1 }));
    group.add(createTextNode({ x: 10, y: 8, text: el.title || "Card", width: el.width - 20, fontSize: 14, fill: "#e2e8f0", fontStyle: "bold" }));
    group.add(createTextNode({ x: 10, y: 30, text: el.description || "Sem descrição", width: el.width - 20, height: el.height - 50, fontSize: 12, fill: "#cbd5e1" }));
    group.add(createTextNode({ x: 10, y: el.height - 20, text: `Status: ${el.status || "todo"}`, width: el.width - 20, fontSize: 11, fill: "#7dd3fc" }));
    return group;
  }

  if (el.type === "task") {
    const group = new Konva.Group(common);
    group.add(new Konva.Rect({ width: el.width, height: el.height, fill: "#0b1220", stroke: isSelected ? "#0ea5e9" : "#334155", cornerRadius: 8, strokeWidth: isSelected ? 2 : 1 }));
    group.add(new Konva.Rect({ x: 10, y: 20, width: 18, height: 18, stroke: "#7dd3fc", cornerRadius: 4, fill: el.checked ? "#22c55e" : "transparent", name: "checkbox-hit" }));
    group.add(createTextNode({ x: 36, y: 18, text: `${el.checked ? "✔" : ""} ${el.title || "Tarefa"}`.trim(), width: el.width - 46, fontSize: 14, fill: "#e2e8f0" }));
    return group;
  }

  if (el.type === "circle") {
    return new Konva.Circle({ ...common, radius: el.radius || 60, fill: "rgba(56,189,248,0.2)", stroke: isSelected ? "#0ea5e9" : "#38bdf8", strokeWidth: isSelected ? 2 : 1 });
  }

  if (el.type === "arrow") {
    return new Konva.Arrow({ ...common, points: el.points || [0, 0, 160, 20], fill: "#f43f5e", stroke: "#f43f5e", strokeWidth: isSelected ? 3 : 2, pointerWidth: 8, pointerLength: 8 });
  }

  const group = new Konva.Group(common);
  group.add(new Konva.Rect({ width: el.width || 200, height: el.height || 120, fill: "rgba(148,163,184,0.2)", stroke: isSelected ? "#0ea5e9" : "#38bdf8", cornerRadius: 8, strokeWidth: isSelected ? 2 : 1 }));
  group.add(createTextNode({ x: 8, y: 8, text: el.title || el.text || el.type, fill: "#e2e8f0" }));
  return group;
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
  if (el.type === "circle") {
    const next = Math.max(MIN_SIZE / 2, (el.radius || 60) * Math.max(node.scaleX ? node.scaleX() : 1, node.scaleY ? node.scaleY() : 1));
    el.radius = next;
  } else if (el.type === "arrow") {
    const sx = node.scaleX ? Math.abs(node.scaleX()) : 1;
    const sy = node.scaleY ? Math.abs(node.scaleY()) : 1;
    const p = el.points || [0, 0, 160, 20];
    el.points = [0, 0, Math.max(MIN_SIZE, p[2] * sx), Math.max(10, p[3] * sy)];
  } else {
    el.width = Math.max(MIN_SIZE, rect.width);
    el.height = Math.max(MIN_SIZE, rect.height);
  }
  if (node.scaleX) node.scaleX(1);
  if (node.scaleY) node.scaleY(1);
}

function findColumnAtPoint(x, y, movingId) {
  return state.elements.find((el) => {
    if (el.id === movingId || el.type !== "column") return false;
    return x > el.x && x < el.x + el.width && y > el.y && y < el.y + el.height;
  });
}

function reorderChildren(parentId) {
  const parent = elementById(parentId);
  if (!parent) return;
  const children = childElements(parentId);
  children.forEach((child, idx) => {
    child.x = parent.x + 12;
    child.y = parent.y + 42 + idx * (child.height + 10);
    child.width = Math.min(child.width || 220, parent.width - 24);
  });
}

function bindNodeEvents(node) {
  node.on("click tap", (e) => {
    e.cancelBubble = true;
    const el = elementById(node.id());
    if (el?.type === "task") {
      const local = node.getRelativePointerPosition();
      if (local && local.x >= 10 && local.x <= 30 && local.y >= 20 && local.y <= 38) {
        el.checked = !el.checked;
        redraw();
        return;
      }
    }
    selectElement(node.id());
  });

  node.on("dblclick dbltap", () => {
    const el = elementById(node.id());
    if (!el) return;
    if (["card", "task", "column"].includes(el.type)) {
      selectElement(el.id);
      setStatus("Edição rápida: use o painel lateral para título/descrição/status.");
    }
  });

  node.on("dragend", () => {
    updateElementFromNode(node);
    const el = elementById(node.id());
    if (!el || !["card", "task"].includes(el.type)) return;
    const previousParent = el.parentId;
    const target = findColumnAtPoint(el.x + 5, el.y + 5, el.id);
    el.parentId = target ? target.id : null;
    if (previousParent) reorderChildren(previousParent);
    if (target) {
      reorderChildren(target.id);
      setStatus(`Item movido para coluna: ${target.title || "Coluna"}`);
    }
    redraw();
  });

  node.on("contextmenu", (e) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    selectElement(node.id());
    contextMenu.hidden = false;
    contextMenu.style.left = `${e.evt.clientX}px`;
    contextMenu.style.top = `${e.evt.clientY}px`;
  });
}

function redraw() {
  layer.find(".board-item").forEach((n) => n.destroy());
  state.elements.forEach((el) => { const node = shapeForElement(el); layer.add(node); bindNodeEvents(node); });
  const selectedNode = state.selectedId ? layer.findOne(`#${state.selectedId}`) : null;
  transformer.nodes(selectedNode ? [selectedNode] : []);
  layer.add(transformer);
  layer.draw();
}

function removeElement(id) {
  state.elements = state.elements.filter((el) => el.id !== id && el.parentId !== id);
  state.connections = state.connections.filter((c) => c.from !== id && c.to !== id);
  if (state.selectedId === id) state.selectedId = null;
  updateInspector();
  redraw();
}

function base(type) { return { id: uid(), type, x: 100 + Math.random() * 120, y: 80 + Math.random() * 120 }; }
function addElement(el) {
  ensureElementDefaults(el);
  state.elements.push(el);
  if (el.parentId) reorderChildren(el.parentId);
  selectElement(el.id);
}

function buildInspectorFields(el) {
  const fields = [];
  const addField = (label, key, type = "text", value = "") => fields.push(`<label class="inspector-field"><span>${label}</span><input data-prop="${key}" type="${type}" value="${String(value).replace(/"/g, "&quot;")}" /></label>`);
  const addTextArea = (label, key, value = "") => fields.push(`<label class="inspector-field"><span>${label}</span><textarea data-prop="${key}" rows="4">${value}</textarea></label>`);
  addField("X", "x", "number", Math.round(el.x)); addField("Y", "y", "number", Math.round(el.y));
  ["title", "status", "parentId"].forEach((key) => { if (el[key] !== undefined || ["card", "task", "column"].includes(el.type)) addField(key, key, "text", el[key] || ""); });
  if (!["circle", "arrow"].includes(el.type)) {
    addField("Largura", "width", "number", Math.round(el.width || 200));
    addField("Altura", "height", "number", Math.round(el.height || 100));
  }
  if (el.type === "circle") addField("Raio", "radius", "number", Math.round(el.radius || 60));
  if (["card", "task"].includes(el.type)) addTextArea("Descrição", "description", el.description || "");
  if (el.type === "task") addField("Concluída (0/1)", "checked", "number", el.checked ? 1 : 0);
  return fields.join("\n");
}

function updateInspector() {
  const el = elementById(state.selectedId);
  if (!el) { inspectorEmpty.hidden = false; inspectorForm.hidden = true; deleteSelectedBtn.disabled = true; inspectorTitle.textContent = "Nenhum elemento selecionado"; return; }
  inspectorEmpty.hidden = true; inspectorForm.hidden = false; deleteSelectedBtn.disabled = false; inspectorTitle.textContent = `Editando: ${el.type}`; inspectorForm.innerHTML = buildInspectorFields(el);
}

function applyInspectorUpdates() {
  const el = elementById(state.selectedId); if (!el) return;
  [...inspectorForm.querySelectorAll("[data-prop]")].forEach((input) => {
    const prop = input.dataset.prop;
    if (["x", "y", "width", "height", "radius"].includes(prop)) { const n = Number(input.value); if (Number.isFinite(n)) el[prop] = n; return; }
    if (prop === "checked") { el.checked = Boolean(Number(input.value)); return; }
    el[prop] = input.value;
  });
  redraw();
}

function exportState() { return { elements: state.elements, connections: state.connections, viewport: { x: stage.x(), y: stage.y(), scaleX: stage.scaleX(), scaleY: stage.scaleY() } }; }
function importState(data) { state.elements = (data.elements || []).map((e) => (ensureElementDefaults(e), e)); state.connections = data.connections || []; state.selectedId = null; updateInspector(); redraw(); }

async function fetchBoards() {
  const list = await fetch("/api/boards").then((r) => r.json());
  state.boards = list.boards || [];
  foldersListEl.innerHTML = state.boards.map((b) => `<button class="folder-link" data-slug="${b.slug}">${b.name}</button>`).join("");
  foldersListEl.querySelectorAll(".folder-link").forEach((btn) => btn.addEventListener("click", () => { window.location.href = `/${btn.dataset.slug}`; }));
}

async function saveBoard() {
  const payload = { name: boardNameEl.value || "Meu Board", slug: slugify(boardNameEl.value || state.boardSlug), data: exportState() };
  const url = state.boardId ? `/api/boards/${state.boardId}` : "/api/boards";
  const method = state.boardId ? "PUT" : "POST";
  const json = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json());
  state.boardId = json.id; state.boardSlug = json.slug;
  if (window.location.pathname !== `/${json.slug}`) window.history.replaceState({}, "", `/${json.slug}`);
  await fetchBoards();
  setStatus(`Board salvo em /${json.slug}`);
}

async function loadFromSlug() {
  const slug = window.location.pathname.replace(/^\//, "").trim();
  if (!slug) { await fetchBoards(); return; }
  try {
    const board = await fetch(`/api/boards/by-slug/${slug}`).then((r) => {
      if (!r.ok) throw new Error("not found");
      return r.json();
    });
    state.boardId = board.id; state.boardSlug = board.slug; boardNameEl.value = board.name; importState(board.data);
    setStatus(`Pasta carregada: /${board.slug}`);
  } catch {
    state.boardId = null;
    state.boardSlug = slug;
    boardNameEl.value = slug.replace(/-/g, " ");
    importState({ elements: [], connections: [] });
    setStatus(`Rota /${slug} sem pasta salva ainda.`);
  }
  await fetchBoards();
}

function wireToolbar() {
  document.querySelectorAll("[data-action]").forEach((btn) => btn.addEventListener("click", async () => {
    const action = btn.dataset.action;
    if (action === "add-column") addElement({ ...base("column"), width: 280, height: 320, title: "Nova coluna" });
    if (action === "add-card") addElement({ ...base("card"), width: 220, height: 120, title: "Novo card", description: "", status: "todo", parentId: parentTarget() });
    if (action === "add-task") addElement({ ...base("task"), width: 220, height: 64, title: "Nova tarefa", status: "todo", checked: false, parentId: parentTarget() });
    if (action === "add-list") addElement({ ...base("list"), width: 260, height: 220, title: "Lista" });
    if (action === "add-note") addElement({ ...base("note"), width: 220, height: 140, text: "Nota" });
    if (action === "add-text") addElement({ ...base("text"), width: 240, height: 80, text: "Texto" });
    if (action === "add-folder") addElement({ ...base("folder"), width: 280, height: 190, title: "Pasta" });
    if (action === "add-table") addElement({ ...base("table"), width: 260, height: 160, title: "Tabela" });
    if (action === "add-checklist") addElement({ ...base("checklist"), width: 240, height: 180, title: "Checklist" });
    if (action === "add-progress") addElement({ ...base("progress"), width: 260, height: 86, title: "Progresso" });
    if (action === "add-rect") addElement({ ...base("rect"), width: 200, height: 120, title: "Bloco" });
    if (action === "add-circle") addElement({ ...base("circle"), radius: 60 });
    if (action === "add-arrow") addElement({ ...base("arrow"), points: [0, 0, 160, 20] });
    if (action === "connect-selected") setStatus("Conexões livres estão temporariamente desativadas nesta revisão.");
    if (action === "save-board") await saveBoard();
    if (action === "load-board") await loadFromSlug();
  }));

  createFolderBtn.addEventListener("click", async () => {
    const name = newFolderNameEl.value.trim();
    if (!name) return;
    const payload = { name, slug: slugify(name), data: { elements: [], connections: [] } };
    const board = await fetch("/api/boards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then((r) => r.json());
    window.location.href = `/${board.slug}`;
  });
}

function setupStageInteractions() {
  stage.on("wheel", (e) => {
    e.evt.preventDefault();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const newScale = e.evt.deltaY > 0 ? oldScale / 1.05 : oldScale * 1.05;
    stage.scale({ x: newScale, y: newScale });
    stage.position({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
    stage.batchDraw();
  });
  stage.on("click tap", (e) => { if (e.target === stage) selectElement(null); contextMenu.hidden = true; });
  window.addEventListener("resize", () => { stage.size({ width: container.clientWidth, height: container.clientHeight }); stage.batchDraw(); });
  window.addEventListener("keydown", (e) => {
    const typing = document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
    if (!typing && ["Delete", "Backspace"].includes(e.key) && state.selectedId) { e.preventDefault(); removeElement(state.selectedId); }
  });
}

function setupInspector() {
  inspectorForm.addEventListener("input", applyInspectorUpdates);
  deleteSelectedBtn.addEventListener("click", () => removeElement(state.selectedId));
  contextDeleteBtn.addEventListener("click", () => { removeElement(state.selectedId); contextMenu.hidden = true; });
}

wireToolbar();
setupStageInteractions();
setupInspector();
updateInspector();
redraw();
loadFromSlug();
