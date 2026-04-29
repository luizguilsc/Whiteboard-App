'use client';

import { useRef } from 'react';

import type { BoardElement } from '@/types';

interface Props {
  el: BoardElement;
  onUpdate: (id: string, patch: Partial<BoardElement>) => void;
}

export default function CardElement({ el, onUpdate }: Props) {
  const titleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const tag = el.extra?.tag;

  return (
    <div className="card-elem" style={{ width: '100%', height: '100%' }}>
      <div
        ref={titleRef}
        className="card-title"
        contentEditable
        suppressContentEditableWarning
        data-empty={!el.title ? 'true' : undefined}
        data-placeholder="Título…"
        onBlur={() => onUpdate(el.id, { title: titleRef.current?.innerText })}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {el.title}
      </div>
      <div
        ref={bodyRef}
        className="card-body"
        contentEditable
        suppressContentEditableWarning
        data-empty={!el.body ? 'true' : undefined}
        data-placeholder="Comece a escrever…"
        onBlur={() => onUpdate(el.id, { body: bodyRef.current?.innerText })}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {el.body}
      </div>
      <div className="card-foot">
        {tag && (
          <span className="card-tag">
            {tag.dot && <span className="dot" />}
            {tag.label}
          </span>
        )}
        <span>{el.meta}</span>
      </div>
    </div>
  );
}
