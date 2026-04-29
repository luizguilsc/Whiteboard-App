'use client';

import { useRef } from 'react';

import Icon from '@/components/ui/Icon';
import type { BoardElement, ColumnItem } from '@/types';

interface Props {
  el: BoardElement;
  onUpdate: (id: string, patch: Partial<BoardElement>) => void;
}

export default function ColumnElement({ el, onUpdate }: Props) {
  const titleRef = useRef<HTMLDivElement>(null);
  const items = (el.extra?.items ?? []) as ColumnItem[];

  const toggle = (id: string) => {
    const next = items.map((it) => (it.id === id ? { ...it, done: !it.done } : it));
    onUpdate(el.id, { extra: { ...el.extra, items: next } });
  };

  const addItem = () => {
    const next = [...items, { id: 'new-' + Date.now(), text: 'Novo item', done: false }];
    onUpdate(el.id, { extra: { ...el.extra, items: next } });
  };

  return (
    <div className="column-elem" style={{ width: '100%', height: '100%' }}>
      <div className="col-head">
        <span className="col-swatch" style={{ background: el.color ?? 'var(--accent)' }} />
        <div
          ref={titleRef}
          className="col-title"
          contentEditable
          suppressContentEditableWarning
          onBlur={() => onUpdate(el.id, { title: titleRef.current?.innerText })}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {el.title}
        </div>
        <span className="col-count">
          {items.filter((i) => !i.done).length}/{items.length}
        </span>
      </div>
      <div className="col-body" onMouseDown={(e) => e.stopPropagation()}>
        {items.map((it) => (
          <div
            key={it.id}
            className={`col-item${it.done ? ' done' : ''}`}
            onClick={() => toggle(it.id)}
          >
            <span className="col-item-dot" />
            <span>{it.text}</span>
          </div>
        ))}
        <button className="col-add" onClick={addItem}>
          <Icon name="plus" size={12} /> adicionar
        </button>
      </div>
    </div>
  );
}
