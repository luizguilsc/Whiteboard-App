/* global React, PlanoIcon */
const { useState } = React;

// ============ Sidebar (folders) ============
function Sidebar({ folders, children, activeFolderId, setActiveFolderId, stats }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="brand">
          <span className="brand-mark" />
          <span>plano</span>
        </div>
        <button className="icon-btn" title="Novo board">
          <PlanoIcon name="plus" size={16} />
        </button>
      </div>
      <div className="sidebar-search">
        <PlanoIcon name="search" size={14} />
        <input placeholder="Buscar em tudo…" />
        <kbd>⌘K</kbd>
      </div>

      <div className="section-label">
        <span>Pastas</span>
        <button className="icon-btn" style={{ width: 22, height: 22 }} title="Nova pasta">
          <PlanoIcon name="plus" size={12} />
        </button>
      </div>
      <div className="folder-tree">
        {folders.filter(f => !f.section).map(f => {
          const isActive = activeFolderId === f.id;
          const subs = children[f.id] || [];
          return (
            <React.Fragment key={f.id}>
              <div
                className={"folder-row" + (isActive ? " active" : "")}
                onClick={() => setActiveFolderId(f.id)}
              >
                <span className="swatch" style={{ background: f.color }} />
                <span>{f.name}</span>
                <span className="count">{f.count}</span>
              </div>
              {isActive && subs.map(s => (
                <div
                  key={s.id}
                  className={"folder-row nested" + (s.current ? " active" : "")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ color: "var(--ink-mute)", fontFamily: "var(--mono-font)", fontSize: 10, width: 10 }}>↳</span>
                  <span>{s.name}</span>
                  <span className="count">{s.count}</span>
                </div>
              ))}
            </React.Fragment>
          );
        })}
        <div className="section-label" style={{ marginTop: 8 }}>Outros</div>
        {folders.filter(f => f.section).map(f => (
          <div
            key={f.id}
            className={"folder-row" + (activeFolderId === f.id ? " active" : "")}
            onClick={() => setActiveFolderId(f.id)}
          >
            <span className="swatch" style={{ background: f.color }} />
            <span>{f.name}</span>
            <span className="count">{f.count}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        <div className="avatar-stack">
          <div className="avatar">AM</div>
          <div className="avatar a2">TH</div>
          <div className="avatar a3">RI</div>
          <div className="avatar a4">+2</div>
        </div>
        <div className="foot-meta">live</div>
      </div>
    </aside>
  );
}

// ============ Toolbar ============
function Toolbar({ tool, setTool, onAdd, onShowPanel }) {
  const tools = [
    { id: "select", icon: "cursor", label: "Selecionar", key: "V" },
    { id: "pan",    icon: "hand",   label: "Mover canvas", key: "H" },
  ];
  const adders = [
    { id: "card",      icon: "card",   label: "Card / nota", key: "C" },
    { id: "sticky",    icon: "sticky", label: "Sticky note", key: "S" },
    { id: "checklist", icon: "check",  label: "Checklist",   key: "K" },
    { id: "column",    icon: "column", label: "Coluna",       key: "L" },
    { id: "shape",     icon: "shape",  label: "Forma",        key: "R" },
    { id: "image",     icon: "paste",  label: "Imagem",       key: "I" },
    { id: "link",      icon: "link",   label: "Link / embed", key: "U" },
    { id: "audio",     icon: "audio",  label: "Áudio",        key: "A" },
    { id: "file",      icon: "file",   label: "Arquivo",      key: "F" },
  ];
  const drawing = [
    { id: "arrow", icon: "arrow", label: "Conectar (seta)",  key: "X" },
    { id: "line",  icon: "line",  label: "Linha livre",       key: "P" },
    { id: "text",  icon: "text",  label: "Texto",             key: "T" },
    { id: "comment", icon: "comment", label: "Comentário",    key: "M" },
  ];
  return (
    <div className="toolbar">
      {tools.map(t => (
        <button
          key={t.id}
          className={"tool-btn" + (tool === t.id ? " active" : "")}
          onClick={() => setTool(t.id)}
        >
          <PlanoIcon name={t.icon} size={18} />
          <span className="key">{t.key}</span>
          <span className="tool-tooltip">{t.label}<kbd>{t.key}</kbd></span>
        </button>
      ))}
      <div className="tool-divider" />
      {adders.map(t => (
        <button
          key={t.id}
          className="tool-btn"
          onClick={() => onAdd(t.id)}
        >
          <PlanoIcon name={t.icon} size={18} />
          <span className="key">{t.key}</span>
          <span className="tool-tooltip">{t.label}<kbd>{t.key}</kbd></span>
        </button>
      ))}
      <div className="tool-divider" />
      {drawing.map(t => (
        <button
          key={t.id}
          className={"tool-btn" + (tool === t.id ? " active" : "")}
          onClick={() => setTool(t.id)}
        >
          <PlanoIcon name={t.icon} size={18} />
          <span className="key">{t.key}</span>
          <span className="tool-tooltip">{t.label}<kbd>{t.key}</kbd></span>
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <button className="tool-btn" onClick={() => onShowPanel("layers")}>
        <PlanoIcon name="layers" size={18} />
        <span className="tool-tooltip">Camadas</span>
      </button>
      <button className="tool-btn" onClick={() => onShowPanel("history")}>
        <PlanoIcon name="history" size={18} />
        <span className="tool-tooltip">Histórico</span>
      </button>
    </div>
  );
}

// ============ Top-right HUD ============
function TopRightHud({ folder, onShare, onExport }) {
  const [exportOpen, setExportOpen] = useState(false);
  return (
    <div className="hud hud-topright">
      <div className="pill">
        <span style={{ color: "var(--ink-mute)" }}>pasta</span>
        <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{folder?.name}</strong>
        <span style={{ color: "var(--ink-mute)" }}>/ {folder?.current || "—"}</span>
      </div>
      <button className="icon-btn" title="Compartilhar" onClick={onShare}>
        <PlanoIcon name="share" size={15} />
      </button>
      <div style={{ position: "relative" }}>
        <button className="icon-btn" title="Exportar" onClick={() => setExportOpen(o => !o)}>
          <PlanoIcon name="download" size={15} />
        </button>
        {exportOpen && (
          <div style={{
            position: "absolute", top: 36, right: 0,
            background: "var(--bg-elev)", border: "1px solid var(--line)",
            borderRadius: 8, boxShadow: "var(--shadow-md)",
            padding: 4, minWidth: 160, zIndex: 60,
          }}>
            {[
              ["JSON", "json"],
              ["Imagem (PNG)", "png"],
              ["PDF", "pdf"],
              ["Markdown", "md"],
            ].map(([label, k]) => (
              <button key={k}
                onClick={() => { setExportOpen(false); onExport(k); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  width: "100%", padding: "7px 10px", border: "none",
                  background: "transparent", fontSize: 13,
                  textAlign: "left", borderRadius: 5, cursor: "pointer",
                  color: "var(--ink-soft)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <span style={{
                  fontFamily: "var(--mono-font)", fontSize: 10,
                  width: 28, color: "var(--ink-mute)",
                }}>.{k}</span>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="icon-btn" title="Configurações">
        <PlanoIcon name="settings" size={15} />
      </button>
    </div>
  );
}

// ============ Bottom-left HUD ============
function BottomLeftHud({ pan, zoom, mouseWorld }) {
  // Spatial breadcrumb: which quadrant is the viewport center in?
  const cx = (-pan.x + window.innerWidth / 2) / zoom;
  const cy = (-pan.y + window.innerHeight / 2) / zoom;
  const quad = (cx >= 0 ? "E" : "W") + (cy >= 0 ? "S" : "N");
  const quadX = cx >= 0 ? "right" : "left";
  const quadY = cy >= 0 ? "bottom" : "top";

  return (
    <div className="hud hud-bottomleft">
      <div className="breadcrumb">
        <span className="bc-quad">
          <span className="bc-quad-mark">
            <span style={{
              top: cy >= 0 ? "auto" : 1, bottom: cy >= 0 ? 1 : "auto",
              left: cx >= 0 ? "auto" : 1, right: cx >= 0 ? 1 : "auto",
              position: "absolute",
              width: 4, height: 4, background: "var(--accent)", borderRadius: 1,
            }} />
          </span>
          <span style={{ color: "var(--ink-soft)" }}>{quad}</span>
        </span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span className="coord-pill">
          <span className="coord-x">x</span> {Math.round(mouseWorld.x)}
          <span style={{ margin: "0 6px", opacity: 0.5 }}>/</span>
          <span className="coord-y">y</span> {Math.round(mouseWorld.y)}
        </span>
      </div>
    </div>
  );
}

// ============ Bottom-right HUD ============
function BottomRightHud({ zoom, setZoom, fit, status, miniMap }) {
  return (
    <div className="hud hud-bottomright">
      <div className="status-bar">
        <span className="stat live"><strong>{status.collaborators}</strong> ativos</span>
        <span className="stat"><strong>{status.elements}</strong> elementos</span>
        <span className="stat warn"><strong>{status.unsync}</strong> não sincronizado</span>
      </div>
      {miniMap}
      <div className="zoom-ctrl">
        <button onClick={fit} title="Encaixar"><PlanoIcon name="fit" size={14} /></button>
        <button onClick={() => setZoom(z => Math.max(0.2, +(z - 0.1).toFixed(2)))}><PlanoIcon name="minus" size={12} /></button>
        <span className="zoom-val" onClick={() => setZoom(1)}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))}><PlanoIcon name="plus" size={12} /></button>
      </div>
    </div>
  );
}

// ============ Mini-map ============
function MiniMap({ elements, pan, zoom, viewportSize }) {
  if (!elements.length) return <div className="minimap" />;
  const xs = elements.map(e => e.x);
  const ys = elements.map(e => e.y);
  const xs2 = elements.map(e => e.x + e.w);
  const ys2 = elements.map(e => e.y + e.h);
  const minX = Math.min(...xs, (-pan.x) / zoom);
  const minY = Math.min(...ys, (-pan.y) / zoom);
  const maxX = Math.max(...xs2, (-pan.x + viewportSize.w) / zoom);
  const maxY = Math.max(...ys2, (-pan.y + viewportSize.h) / zoom);
  const W = maxX - minX, H = maxY - minY;
  const pad = 12;
  const mw = 184, mh = 116;
  const sx = (mw - pad * 2) / W;
  const sy = (mh - pad * 2) / H;
  const s = Math.min(sx, sy);

  return (
    <div className="minimap">
      {elements.map(el => (
        <div
          key={el.id}
          className="minimap-elem"
          style={{
            left: pad + (el.x - minX) * s,
            top:  pad + (el.y - minY) * s,
            width: el.w * s,
            height: el.h * s,
            background: el.type === "sticky" ? "var(--accent)" : "var(--ink-mute)",
            opacity: el.type === "sticky" ? 0.4 : 0.45,
          }}
        />
      ))}
      <div className="minimap-viewport" style={{
        left: pad + ((-pan.x) / zoom - minX) * s,
        top:  pad + ((-pan.y) / zoom - minY) * s,
        width:  (viewportSize.w / zoom) * s,
        height: (viewportSize.h / zoom) * s,
      }} />
    </div>
  );
}

// ============ Properties panel ============
function PropertiesPanel({ el, onUpdate, onDelete, onDuplicate, onConnectionStyleChange, selectedConnection, onConnectionUpdate, onClose }) {
  const [pos, setPos] = React.useState({ x: window.innerWidth - 280, y: 70 });
  const dragRef = React.useRef(null);
  const onHeadDown = (e) => {
    if (e.target.closest("button")) return;
    const start = { mx: e.clientX, my: e.clientY, x: pos.x, y: pos.y };
    const move = (ev) => {
      setPos({
        x: Math.max(8, Math.min(window.innerWidth - 240, start.x + ev.clientX - start.mx)),
        y: Math.max(8, Math.min(window.innerHeight - 80,  start.y + ev.clientY - start.my)),
      });
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  const wrapStyle = { left: pos.x, top: pos.y, right: "auto", width: 280 };

  if (selectedConnection) {
    return (
      <div className="props" style={wrapStyle}>
        <div className="props-head" style={{ cursor: "move" }} onMouseDown={onHeadDown}>
          <div className="props-title">Conexão</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="props-id">#{selectedConnection.id.slice(-4)}</div>
            <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={onClose}>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l7 7M9 2l-7 7"/></svg>
            </button>
          </div>
        </div>
        <div className="props-section">
          <div className="props-label">Estilo</div>
          <div className="connection-styles">
            {[
              ["straight", <svg key="s" width="32" height="14" viewBox="0 0 32 14"><path d="M2 7 L30 7" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>],
              ["curve",    <svg key="c" width="32" height="14" viewBox="0 0 32 14"><path d="M2 7 C 10 0, 22 14, 30 7" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>],
              ["dashed",   <svg key="d" width="32" height="14" viewBox="0 0 32 14"><path d="M2 7 L30 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4 3"/></svg>],
            ].map(([k, ico]) => (
              <button key={k}
                className={"cs-pick" + (selectedConnection.style === k ? " active" : "")}
                onClick={() => onConnectionUpdate({ style: k })}
              >{ico}</button>
            ))}
          </div>
        </div>
        <div className="props-section">
          <div className="props-label">Seta</div>
          <div className="connection-styles">
            <button className={"cs-pick" + (selectedConnection.arrow ? " active" : "")}
              onClick={() => onConnectionUpdate({ arrow: true })}>com</button>
            <button className={"cs-pick" + (!selectedConnection.arrow ? " active" : "")}
              onClick={() => onConnectionUpdate({ arrow: false })}>sem</button>
          </div>
        </div>
      </div>
    );
  }
  if (!el) return null;
  return (
    <div className="props" style={wrapStyle}>
      <div className="props-head" style={{ cursor: "move" }} onMouseDown={onHeadDown}>
        <div className="props-title">{el.type}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div className="props-id">#{el.id.slice(-4)}</div>
          <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={onClose}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l7 7M9 2l-7 7"/></svg>
          </button>
        </div>
      </div>
      <div className="props-section">
        <div className="props-label">Posição & tamanho</div>
        <div className="props-row">
          <div className="props-input"><span>x</span><input value={Math.round(el.x)} onChange={e => onUpdate(el.id, { x: +e.target.value || 0 })} /></div>
          <div className="props-input"><span>y</span><input value={Math.round(el.y)} onChange={e => onUpdate(el.id, { y: +e.target.value || 0 })} /></div>
        </div>
        <div className="props-row">
          <div className="props-input"><span>w</span><input value={Math.round(el.w)} onChange={e => onUpdate(el.id, { w: +e.target.value || 50 })} /></div>
          <div className="props-input"><span>h</span><input value={Math.round(el.h)} onChange={e => onUpdate(el.id, { h: +e.target.value || 50 })} /></div>
        </div>
      </div>
      {el.type === "sticky" && (
        <div className="props-section">
          <div className="props-label">Cor</div>
          <div className="swatch-row">
            {["yellow","pink","blue","green","violet"].map(c => (
              <div key={c}
                className={"swatch-pick" + (el.color === c ? " active" : "")}
                style={{ background: `var(--sticky-${c})` }}
                onClick={() => onUpdate(el.id, { color: c })}
              />
            ))}
          </div>
        </div>
      )}
      <div className="props-section">
        <div className="props-label">Ações</div>
        <div className="props-actions">
          <button className="props-action" onClick={() => onDuplicate(el.id)} title="Duplicar"><PlanoIcon name="copy" size={13} /></button>
          <button className="props-action" title="Agrupar"><PlanoIcon name="group" size={13} /></button>
          <button className="props-action" title="Mais"><PlanoIcon name="more" size={13} /></button>
          <button className="props-action danger" onClick={() => onDelete(el.id)} title="Apagar"><PlanoIcon name="trash" size={13} /></button>
        </div>
      </div>
    </div>
  );
}

window.PlanoSidebar = Sidebar;
window.PlanoToolbar = Toolbar;
window.PlanoTopRightHud = TopRightHud;
window.PlanoBottomLeftHud = BottomLeftHud;
window.PlanoBottomRightHud = BottomRightHud;
window.PlanoMiniMap = MiniMap;
window.PlanoProperties = PropertiesPanel;

// ============ Floating panel + Layers + History ============
function FloatingPanel({ title, onClose, top = 64, right = 14, children }) {
  return (
    <div className="floating-panel" style={{ top, right }}>
      <div className="props-head">
        <span className="props-head-title">{title}</span>
        <button className="props-close" onClick={onClose}><PlanoIcon name="close" size={14} /></button>
      </div>
      <div className="floating-panel-body">{children}</div>
    </div>
  );
}

const ELEM_LABEL = {
  card: "Card", sticky: "Sticky", checklist: "Lista", image: "Imagem",
  shape: "Forma", column: "Coluna", link: "Link", audio: "Áudio", file: "Arquivo", text: "Texto"
};
function elemTitle(el) {
  return el.title || el.text || el.label || el.url || ELEM_LABEL[el.type] || el.type;
}
function LayersList({ elements, selection, onSelect, onToggleVisible, onToggleLock }) {
  return (
    <div className="layers-list">
      {[...elements].slice().reverse().map(el => (
        <div
          key={el.id}
          className={"layers-row" + (selection.includes(el.id) ? " selected" : "")}
          onClick={() => onSelect(el.id)}
        >
          <PlanoIcon name={el.type === "card" ? "card" : el.type === "sticky" ? "sticky" : el.type === "checklist" ? "check" : el.type === "image" ? "image" : el.type === "shape" ? "shape" : el.type === "column" ? "column" : el.type === "link" ? "link" : el.type === "audio" ? "audio" : el.type === "file" ? "file" : "card"} size={14} />
          <span className="layers-row-title">{elemTitle(el)}</span>
          <button className="layers-row-btn" onClick={(e) => { e.stopPropagation(); onToggleVisible(el.id); }} title="Visibilidade">
            <PlanoIcon name={el.hidden ? "eye-off" : "eye"} size={13} />
          </button>
          <button className="layers-row-btn" onClick={(e) => { e.stopPropagation(); onToggleLock(el.id); }} title="Bloquear">
            <PlanoIcon name={el.locked ? "lock" : "unlock"} size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
const HISTORY_ENTRIES = [
  { who: "Você",     ago: "agora",     what: "moveu “Bug: ESC fecha modal”" },
  { who: "Você",     ago: "1 min",     what: "criou conexão Goal → Risk" },
  { who: "Lia M.",   ago: "4 min",     what: "editou “Métrica: TTFI”" },
  { who: "Rafa S.",  ago: "12 min",    what: "adicionou checklist “Beta”" },
  { who: "Você",     ago: "26 min",    what: "merge: card → lista" },
  { who: "Bia C.",   ago: "1 h",       what: "renomeou board para “Plano Q3”" },
  { who: "Lia M.",   ago: "2 h",       what: "removeu sticky “?? prazo”" },
  { who: "Rafa S.",  ago: "ontem 18:42", what: "criou Coluna “Riscos”" },
  { who: "Você",     ago: "ontem 14:10", what: "anexou áudio “Briefing 03”" },
];
function HistoryList({ elements }) {
  void elements;
  return (
    <div className="history-list">
      {HISTORY_ENTRIES.map((h, i) => (
        <div key={i} className="history-row">
          <div className="history-dot" />
          <div className="history-meta">
            <div className="history-line"><b>{h.who}</b> <span>{h.what}</span></div>
            <div className="history-ago">{h.ago}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
window.PlanoFloatingPanel = FloatingPanel;
window.PlanoLayersList = LayersList;
window.PlanoHistoryList = HistoryList;
