'use client';

import type { RefObject } from 'react';

import ElementWrapper from '@/components/elements/ElementWrapper';
import type {
  BoardElement,
  Collaborator,
  Connection,
  DragLine,
  Marquee,
  Point,
  ResizeDir,
  Side,
} from '@/types';

function portPos(el: BoardElement, side: Side): Point {
  switch (side) {
    case 't': return { x: el.x + el.w / 2, y: el.y };
    case 'r': return { x: el.x + el.w,     y: el.y + el.h / 2 };
    case 'b': return { x: el.x + el.w / 2, y: el.y + el.h };
    case 'l': return { x: el.x,            y: el.y + el.h / 2 };
  }
}

function connPath(a: Point, b: Point, style: string): string {
  if (style === 'straight' || style === 'dashed') {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const ax = Math.abs(dx) * 0.5 + 20;
  const ay = Math.abs(dy) * 0.5 + 20;
  let c1: Point, c2: Point;
  if (Math.abs(dx) > Math.abs(dy)) {
    c1 = { x: a.x + Math.sign(dx) * ax, y: a.y };
    c2 = { x: b.x - Math.sign(dx) * ax, y: b.y };
  } else {
    c1 = { x: a.x, y: a.y + Math.sign(dy) * ay };
    c2 = { x: b.x, y: b.y - Math.sign(dy) * ay };
  }
  return `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
}

function arrowMarker(a: Point, b: Point): string {
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  const size = 8;
  const left  = { x: b.x - Math.cos(ang - 0.4) * size, y: b.y - Math.sin(ang - 0.4) * size };
  const right = { x: b.x - Math.cos(ang + 0.4) * size, y: b.y - Math.sin(ang + 0.4) * size };
  return `M ${b.x} ${b.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`;
}

interface Props {
  elements: BoardElement[];
  connections: Connection[];
  selection: string[];
  draggingIds: string[];
  mergeTargetId: string | null;
  absorbingIds: string[];
  zoom: number;
  pan: Point;
  cardStyle: string;
  background: string;
  onElementMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string, dir: ResizeDir) => void;
  onPortStart: (e: React.MouseEvent, id: string, side: Side) => void;
  onUpdateElement: (id: string, patch: Partial<BoardElement>) => void;
  onCanvasMouseDown: (e: React.MouseEvent) => void;
  onSelectConnection: (id: string) => void;
  selectedConnectionId: string | null;
  marquee: Marquee | null;
  dragLine: DragLine | null;
  collaborators: Collaborator[];
  canvasRef: RefObject<HTMLDivElement | null>;
}

export default function CanvasView({
  elements, connections, selection, draggingIds, mergeTargetId, absorbingIds,
  zoom, pan, cardStyle, background,
  onElementMouseDown, onResizeStart, onPortStart, onUpdateElement,
  onCanvasMouseDown, onSelectConnection, selectedConnectionId,
  marquee, dragLine, collaborators, canvasRef,
}: Props) {
  return (
    <div
      ref={canvasRef}
      className="canvas-wrap"
      onMouseDown={onCanvasMouseDown}
    >
      <div
        className={`canvas-bg ${background}`}
        style={{
          backgroundSize:
            background === 'dots' ? `${24 * zoom}px ${24 * zoom}px` :
            background === 'lines' ? `${48 * zoom}px ${48 * zoom}px` :
            'auto',
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      <div
        className="canvas-stage"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        {/* Connections layer */}
        <svg
          className="connections-layer"
          style={{ width: 4000, height: 3000, left: -1000, top: -1000, position: 'absolute' }}
        >
          <g transform="translate(1000, 1000)">
            {connections.map((c) => {
              const fromEl = elements.find((e) => e.id === c.from_id);
              const toEl   = elements.find((e) => e.id === c.to_id);
              if (!fromEl || !toEl) return null;
              const a = portPos(fromEl, c.from_side);
              const b = portPos(toEl, c.to_side);
              const d = connPath(a, b, c.style);
              const isSelected = selectedConnectionId === c.id;
              return (
                <g
                  key={c.id}
                  className={`connection-group${isSelected ? ' selected' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onSelectConnection(c.id); }}
                >
                  <path className="connection-hit" d={d} />
                  <path className={`connection-path${c.style === 'dashed' ? ' dashed' : ''}`} d={d} />
                  {c.arrow && <path className="connection-arrow" d={arrowMarker(a, b)} />}
                  {c.label && (
                    <text
                      className="connection-label"
                      x={(a.x + b.x) / 2}
                      y={(a.y + b.y) / 2 - 6}
                      textAnchor="middle"
                    >
                      {c.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* In-progress connection drag */}
            {dragLine && (
              <g style={{ pointerEvents: 'none' }}>
                <path
                  d={connPath(dragLine.from, dragLine.to, 'curve')}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                <circle cx={dragLine.to.x} cy={dragLine.to.y} r="3" fill="var(--accent)" />
              </g>
            )}
          </g>
        </svg>

        {/* Elements */}
        {elements.map((el) => (
          <ElementWrapper
            key={el.id}
            el={el}
            selected={selection.includes(el.id)}
            dragging={draggingIds.includes(el.id)}
            mergeTarget={mergeTargetId === el.id}
            absorbing={absorbingIds.includes(el.id)}
            cardStyle={cardStyle}
            onMouseDown={onElementMouseDown}
            onResizeStart={onResizeStart}
            onPortStart={onPortStart}
            onUpdate={onUpdateElement}
          />
        ))}

        {/* Collaborator cursors */}
        {collaborators.map((c) => (
          <div key={c.id} className="collab-cursor" style={{ left: c.x, top: c.y }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M3 2 L3 14 L7 11 L9 16 L11 15 L9 10 L14 10 Z"
                fill={c.color}
                stroke="white"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
            <div className="collab-label" style={{ background: c.color }}>{c.name}</div>
          </div>
        ))}
      </div>

      {/* Selection marquee */}
      {marquee && (
        <div
          className="marquee"
          style={{
            left: Math.min(marquee.x0, marquee.x1),
            top: Math.min(marquee.y0, marquee.y1),
            width: Math.abs(marquee.x1 - marquee.x0),
            height: Math.abs(marquee.y1 - marquee.y0),
          }}
        />
      )}
    </div>
  );
}

export { portPos, connPath };
