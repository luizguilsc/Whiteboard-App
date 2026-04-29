'use client';

import { useRef } from 'react';

import type { BoardElement } from '@/types';

interface Props {
  el: BoardElement;
  onUpdate: (id: string, patch: Partial<BoardElement>) => void;
}

export default function StickyElement({ el, onUpdate }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const colorVar = `var(--sticky-${el.color ?? 'yellow'})`;
  const text = el.extra?.text ?? '';
  const meta = el.extra?.meta ?? el.meta;

  return (
    <div className="sticky-elem" style={{ width: '100%', height: '100%', background: colorVar }}>
      <div
        ref={ref}
        className="sticky-text"
        contentEditable
        suppressContentEditableWarning
        data-empty={!text ? 'true' : undefined}
        data-placeholder="Anotação rápida…"
        onBlur={() => onUpdate(el.id, { extra: { ...el.extra, text: ref.current?.innerText } })}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {text}
      </div>
      {meta && <div className="sticky-meta">{meta}</div>}
    </div>
  );
}
