/* global React, PlanoIcon */
const { useState, useRef, useEffect, useCallback } = React;

// ============ Card / Note ============
function CardElement({ el, onUpdate }) {
  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  const handleBlur = (field, ref) => {
    onUpdate(el.id, { [field]: ref.current.innerText });
  };

  return (
    <div className="card-elem" style={{ width: "100%", height: "100%" }}>
      <div
        ref={titleRef}
        className="card-title"
        contentEditable
        suppressContentEditableWarning
        data-empty={!el.title}
        data-placeholder="Título…"
        onBlur={() => handleBlur("title", titleRef)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {el.title}
      </div>
      <div
        ref={bodyRef}
        className="card-body"
        contentEditable
        suppressContentEditableWarning
        data-empty={!el.body}
        data-placeholder="Comece a escrever…"
        onBlur={() => handleBlur("body", bodyRef)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {el.body}
      </div>
      <div className="card-foot">
        {el.tag && (
          <span className="card-tag">
            {el.tag.dot && <span className="dot" />}
            {el.tag.label}
          </span>
        )}
        <span>{el.meta}</span>
      </div>
    </div>
  );
}

// ============ Sticky note ============
function StickyElement({ el, onUpdate }) {
  const ref = useRef(null);
  const colorVar = `var(--sticky-${el.color || "yellow"})`;
  return (
    <div className="sticky-elem" style={{ width: "100%", height: "100%", background: colorVar }}>
      <div
        ref={ref}
        className="sticky-text"
        contentEditable
        suppressContentEditableWarning
        data-empty={!el.text}
        data-placeholder="Anotação rápida…"
        onBlur={() => onUpdate(el.id, { text: ref.current.innerText })}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {el.text}
      </div>
      {el.meta && <div className="sticky-meta">{el.meta}</div>}
    </div>
  );
}

// ============ Image ============
function ImageElement({ el, onUpdate }) {
  return (
    <div className="image-elem" style={{ width: "100%", height: "100%" }}>
      <div className="img-wrap">
        {el.src ? (
          <img src={el.src} alt={el.caption || ""} />
        ) : (
          <div className="img-placeholder">{el.placeholder || "imagem"}</div>
        )}
      </div>
      {el.caption && (
        <div className="img-caption">
          <span>{el.caption}</span>
          <span>{el.w}×{el.h}</span>
        </div>
      )}
    </div>
  );
}

// ============ Shape ============
function ShapeElement({ el, onUpdate, accent }) {
  const ref = useRef(null);
  const stroke = "var(--ink)";
  const fill = "var(--bg-elev)";
  let svg;
  if (el.shape === "diamond") {
    svg = (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <polygon points="50,4 96,50 50,96 4,50"
          fill={fill} stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  } else if (el.shape === "circle") {
    svg = (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <ellipse cx="50" cy="50" rx="46" ry="46"
          fill={fill} stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  } else {
    svg = (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
        <rect x="2" y="2" width="96" height="96" rx="6"
          fill={fill} stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }
  return (
    <div className="shape-elem" style={{ width: "100%", height: "100%", background: "transparent" }}>
      {/* invisible hit area covering full bounds — fixes drag bug for diamond/circle */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "auto" }} />
      {svg}
      <div
        ref={ref}
        className="shape-label"
        contentEditable
        suppressContentEditableWarning
        onBlur={() => onUpdate(el.id, { label: ref.current.innerText })}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {el.label}
      </div>
    </div>
  );
}

// ============ Column ============
function ColumnElement({ el, onUpdate }) {
  const titleRef = useRef(null);
  const toggle = (id) => {
    const items = el.items.map(it => it.id === id ? { ...it, done: !it.done } : it);
    onUpdate(el.id, { items });
  };
  const addItem = () => {
    const items = [...el.items, { id: "new-" + Date.now(), text: "Novo item", done: false }];
    onUpdate(el.id, { items });
  };
  return (
    <div className="column-elem" style={{ width: "100%", height: "100%" }}>
      <div className="col-head">
        <span className="col-swatch" style={{ background: el.color || "var(--accent)" }} />
        <div
          ref={titleRef}
          className="col-title"
          contentEditable
          suppressContentEditableWarning
          onBlur={() => onUpdate(el.id, { title: titleRef.current.innerText })}
          onMouseDown={(e) => e.stopPropagation()}
        >{el.title}</div>
        <span className="col-count">{el.items.filter(i=>!i.done).length}/{el.items.length}</span>
      </div>
      <div className="col-body" onMouseDown={(e) => e.stopPropagation()}>
        {el.items.map(it => (
          <div key={it.id} className={"col-item" + (it.done ? " done" : "")} onClick={() => toggle(it.id)}>
            <span className="col-item-dot" />
            <span>{it.text}</span>
          </div>
        ))}
        <button className="col-add" onClick={addItem}>
          <PlanoIcon name="plus" size={12} /> adicionar
        </button>
      </div>
    </div>
  );
}

// ============ Checklist ============
function ChecklistElement({ el, onUpdate }) {
  const titleRef = useRef(null);
  const total = el.items.length;
  const done = el.items.filter(i => i.done).length;
  const pct = total ? (done / total) * 100 : 0;

  const toggle = (id) => {
    const items = el.items.map(it => it.id === id ? { ...it, done: !it.done } : it);
    onUpdate(el.id, { items });
  };
  const updateText = (id, text) => {
    const items = el.items.map(it => it.id === id ? { ...it, text } : it);
    onUpdate(el.id, { items });
  };
  const addItem = () => {
    const items = [...el.items, { id: "new-" + Date.now(), text: "Novo item", done: false }];
    onUpdate(el.id, { items });
  };

  return (
    <div className="checklist-elem" style={{ width: "100%", height: "100%" }}>
      <div className="check-title">
        <span
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={() => onUpdate(el.id, { title: titleRef.current.innerText })}
          onMouseDown={(e) => e.stopPropagation()}
        >{el.title}</span>
        <span className="check-progress">{done}/{total}</span>
      </div>
      <div className="check-bar"><div className="check-bar-fill" style={{ width: pct + "%" }} /></div>
      <div className="check-list" onMouseDown={(e) => e.stopPropagation()}>
        {el.items.map(it => (
          <div key={it.id} className={"check-item" + (it.done ? " done" : "")} onClick={() => toggle(it.id)}>
            <div className="check-box">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 5l2 2 4-4" />
              </svg>
            </div>
            <span
              className="check-text"
              contentEditable
              suppressContentEditableWarning
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => updateText(it.id, e.target.innerText)}
            >{it.text}</span>
          </div>
        ))}
        <div className="check-add" onClick={addItem}>
          <span className="plus"><PlanoIcon name="plus" size={9} stroke={2} /></span>
          adicionar tarefa
        </div>
      </div>
    </div>
  );
}

// ============ Link / embed ============
function LinkElement({ el }) {
  return (
    <div className="link-elem" style={{ width: "100%", height: "100%" }}>
      <div className="link-img">{el.placeholder || "preview"}</div>
      <div className="link-meta">
        <div className="link-title">{el.title}</div>
        <div className="link-host">{el.host}</div>
      </div>
    </div>
  );
}

// ============ Audio ============
function AudioElement({ el, onUpdate }) {
  const [playing, setPlaying] = useState(false);
  const bars = 38;
  const progress = el.progress || 0;
  return (
    <div className="audio-elem" style={{ width: "100%", height: "100%" }}>
      <div className="audio-head">
        <button className="audio-play" onClick={(e) => { e.stopPropagation(); setPlaying(p => !p); }}>
          {playing ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="2" y="1.5" width="2" height="7"/><rect x="6" y="1.5" width="2" height="7"/></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M2.5 1.5L8.5 5l-6 3.5z"/></svg>
          )}
        </button>
        <div className="audio-meta">
          <div className="audio-title">{el.title}</div>
          <div className="audio-time">{Math.floor(progress * parseInt(el.duration))}:00 / {el.duration}</div>
        </div>
      </div>
      <div className="waveform">
        {Array.from({ length: bars }).map((_, i) => {
          const heights = [0.3, 0.5, 0.7, 0.4, 0.6, 0.9, 0.5, 0.4, 0.7, 0.3, 0.5, 0.6, 0.8, 0.4, 0.5, 0.7, 0.6, 0.3, 0.4, 0.6, 0.7, 0.5, 0.4, 0.6, 0.8, 0.5, 0.3, 0.4, 0.6, 0.5, 0.7, 0.4, 0.5, 0.3, 0.4, 0.5, 0.3, 0.4];
          const h = heights[i % heights.length];
          const isPlayed = i / bars < progress;
          return <div key={i} className={"wave-bar" + (isPlayed ? " played" : "")} style={{ height: (h * 100) + "%" }} />;
        })}
      </div>
    </div>
  );
}

// ============ File ============
function FileElement({ el }) {
  const colors = {
    py: "oklch(0.65 0.14 235)",
    js: "oklch(0.7 0.14 95)",
    xls: "oklch(0.55 0.14 145)",
    docx: "oklch(0.55 0.16 250)",
    default: "var(--accent-ink)",
  };
  const c = colors[el.ext] || colors.default;
  return (
    <div className="file-elem" style={{ width: "100%", height: "100%" }}>
      <div className="file-icon" style={{ color: c }}>
        {el.ext.toUpperCase()}
      </div>
      <div className="file-meta">
        <div className="file-name">{el.name}</div>
        <div className="file-info">{el.size} · {el.ext}</div>
      </div>
    </div>
  );
}

// ============ Element Wrapper ============
function ElementWrapper({
  el, selected, dragging, mergeTarget, absorbing,
  cardStyle, accent,
  onMouseDown, onResizeStart, onPortStart, onUpdate,
}) {
  const styleClass = el.type === "sticky" || el.type === "shape" ? "" : "style-" + cardStyle;
  const className = [
    "elem", "elem-" + el.type, styleClass,
    selected ? "selected" : "",
    dragging ? "dragging" : "",
    mergeTarget ? "merge-target" : "",
    absorbing ? "absorbing" : "",
  ].filter(Boolean).join(" ");

  let content;
  switch (el.type) {
    case "card":      content = <CardElement el={el} onUpdate={onUpdate} />; break;
    case "sticky":    content = <StickyElement el={el} onUpdate={onUpdate} />; break;
    case "image":     content = <ImageElement el={el} onUpdate={onUpdate} />; break;
    case "shape":     content = <ShapeElement el={el} onUpdate={onUpdate} accent={accent} />; break;
    case "column":    content = <ColumnElement el={el} onUpdate={onUpdate} />; break;
    case "checklist": content = <ChecklistElement el={el} onUpdate={onUpdate} />; break;
    case "link":      content = <LinkElement el={el} />; break;
    case "audio":     content = <AudioElement el={el} onUpdate={onUpdate} />; break;
    case "file":      content = <FileElement el={el} />; break;
    default:          content = <div>?</div>;
  }

  return (
    <div
      className={className}
      style={{ left: el.x, top: el.y, width: el.w, height: el.h }}
      onMouseDown={(e) => onMouseDown(e, el.id)}
      data-elem-id={el.id}
    >
      {content}
      {/* Connection ports */}
      {["t","r","b","l"].map(side => (
        <div
          key={side}
          className={"port " + side}
          onMouseDown={(e) => { e.stopPropagation(); onPortStart(e, el.id, side); }}
        />
      ))}
      {/* 8 resize handles */}
      {["nw","n","ne","e","se","s","sw","w"].map(dir => (
        <div
          key={dir}
          className={"resize-handle r-" + dir}
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, el.id, dir); }}
        />
      ))}
    </div>
  );
}

window.PlanoElement = ElementWrapper;
