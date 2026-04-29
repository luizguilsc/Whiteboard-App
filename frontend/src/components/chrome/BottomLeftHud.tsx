'use client';

import type { Point } from '@/types';

interface Props {
  pan: Point;
  zoom: number;
  mouseWorld: Point;
  viewportSize: { w: number; h: number };
}

export default function BottomLeftHud({ pan, zoom, mouseWorld, viewportSize }: Props) {
  const cx = (-pan.x + viewportSize.w / 2) / zoom;
  const cy = (-pan.y + viewportSize.h / 2) / zoom;
  const quad = (cx >= 0 ? 'E' : 'W') + (cy >= 0 ? 'S' : 'N');

  return (
    <div className="hud hud-bottomleft">
      <div className="breadcrumb">
        <span className="bc-quad">
          <span className="bc-quad-mark">
            <span style={{
              top: cy >= 0 ? 'auto' : 1,
              bottom: cy >= 0 ? 1 : 'auto',
              left: cx >= 0 ? 'auto' : 1,
              right: cx >= 0 ? 1 : 'auto',
              position: 'absolute',
              width: 4, height: 4,
              background: 'var(--accent)',
              borderRadius: 1,
            }} />
          </span>
          <span style={{ color: 'var(--ink-soft)' }}>{quad}</span>
        </span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span className="coord-pill">
          <span className="coord-x">x</span> {Math.round(mouseWorld.x)}
          <span style={{ margin: '0 6px', opacity: 0.5 }}>/</span>
          <span className="coord-y">y</span> {Math.round(mouseWorld.y)}
        </span>
      </div>
    </div>
  );
}
