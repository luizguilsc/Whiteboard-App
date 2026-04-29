'use client';

import { useRef } from 'react';

import type { BoardElement } from '@/types';

interface Props {
  el: BoardElement;
  onUpdate: (id: string, patch: Partial<BoardElement>) => void;
}

export default function ShapeElement({ el, onUpdate }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const shape = el.extra?.shape ?? 'rect';
  const label = el.extra?.label ?? '';
  const stroke = 'var(--ink)';
  const fill = 'var(--bg-elev)';

  let svg: React.ReactNode;
  if (shape === 'diamond') {
    svg = (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
        <polygon points="50,4 96,50 50,96 4,50" fill={fill} stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  } else if (shape === 'circle') {
    svg = (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
        <ellipse cx="50" cy="50" rx="46" ry="46" fill={fill} stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  } else {
    svg = (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ pointerEvents: 'none' }}>
        <rect x="2" y="2" width="96" height="96" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    );
  }

  return (
    <div className="shape-elem" style={{ width: '100%', height: '100%', background: 'transparent' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }} />
      {svg}
      <div
        ref={ref}
        className="shape-label"
        contentEditable
        suppressContentEditableWarning
        onBlur={() => onUpdate(el.id, { extra: { ...el.extra, label: ref.current?.innerText } })}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {label}
      </div>
    </div>
  );
}
