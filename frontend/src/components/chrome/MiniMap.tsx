'use client';

import type { BoardElement, Point } from '@/types';

interface Props {
  elements: BoardElement[];
  pan: Point;
  zoom: number;
  viewportSize: { w: number; h: number };
}

const PAD = 12;
const MW = 184;
const MH = 116;

export default function MiniMap({ elements, pan, zoom, viewportSize }: Props) {
  if (!elements.length) return <div className="minimap" />;

  const xs = elements.map((e) => e.x);
  const ys = elements.map((e) => e.y);
  const xs2 = elements.map((e) => e.x + e.w);
  const ys2 = elements.map((e) => e.y + e.h);
  const minX = Math.min(...xs, (-pan.x) / zoom);
  const minY = Math.min(...ys, (-pan.y) / zoom);
  const maxX = Math.max(...xs2, (-pan.x + viewportSize.w) / zoom);
  const maxY = Math.max(...ys2, (-pan.y + viewportSize.h) / zoom);
  const W = maxX - minX;
  const H = maxY - minY;
  const sx = (MW - PAD * 2) / W;
  const sy = (MH - PAD * 2) / H;
  const s = Math.min(sx, sy);

  return (
    <div className="minimap">
      {elements.map((el) => (
        <div
          key={el.id}
          className="minimap-elem"
          style={{
            left: PAD + (el.x - minX) * s,
            top: PAD + (el.y - minY) * s,
            width: el.w * s,
            height: el.h * s,
            background: el.type === 'sticky' ? 'var(--accent)' : 'var(--ink-mute)',
            opacity: el.type === 'sticky' ? 0.4 : 0.45,
          }}
        />
      ))}
      <div
        className="minimap-viewport"
        style={{
          left: PAD + ((-pan.x) / zoom - minX) * s,
          top: PAD + ((-pan.y) / zoom - minY) * s,
          width: (viewportSize.w / zoom) * s,
          height: (viewportSize.h / zoom) * s,
        }}
      />
    </div>
  );
}
