'use client';

import { useRef } from 'react';

import Icon from '@/components/ui/Icon';
import type { BoardElement, ChecklistItem } from '@/types';

interface Props {
  el: BoardElement;
  onUpdate: (id: string, patch: Partial<BoardElement>) => void;
}

export default function ChecklistElement({ el, onUpdate }: Props) {
  const titleRef = useRef<HTMLSpanElement>(null);
  const items = (el.extra?.items ?? []) as ChecklistItem[];
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const pct = total ? (done / total) * 100 : 0;

  const toggle = (id: string) => {
    const next = items.map((it) => (it.id === id ? { ...it, done: !it.done } : it));
    onUpdate(el.id, { extra: { ...el.extra, items: next } });
  };

  const updateText = (id: string, text: string) => {
    const next = items.map((it) => (it.id === id ? { ...it, text } : it));
    onUpdate(el.id, { extra: { ...el.extra, items: next } });
  };

  const addItem = () => {
    const next = [...items, { id: 'new-' + Date.now(), text: 'Novo item', done: false }];
    onUpdate(el.id, { extra: { ...el.extra, items: next } });
  };

  return (
    <div className="checklist-elem" style={{ width: '100%', height: '100%' }}>
      <div className="check-title">
        <span
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={() => onUpdate(el.id, { title: titleRef.current?.innerText })}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {el.title}
        </span>
        <span className="check-progress">{done}/{total}</span>
      </div>
      <div className="check-bar">
        <div className="check-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="check-list" onMouseDown={(e) => e.stopPropagation()}>
        {items.map((it) => (
          <div
            key={it.id}
            className={`check-item${it.done ? ' done' : ''}`}
            onClick={() => toggle(it.id)}
          >
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
              onBlur={(e) => updateText(it.id, e.currentTarget.innerText)}
            >
              {it.text}
            </span>
          </div>
        ))}
        <div className="check-add" onClick={addItem}>
          <span className="plus"><Icon name="plus" size={9} stroke={2} /></span>
          adicionar tarefa
        </div>
      </div>
    </div>
  );
}
