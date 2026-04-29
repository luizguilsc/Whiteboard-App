'use client';

import { useState } from 'react';

import Icon from '@/components/ui/Icon';
import type { BoardElement, Connection } from '@/types';

interface Props {
  el: BoardElement | null;
  onUpdate: (id: string, patch: Partial<BoardElement>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  selectedConnection: Connection | null;
  onConnectionUpdate: (patch: Partial<Connection>) => void;
  onClose: () => void;
}

const STICKY_COLORS = ['yellow', 'pink', 'blue', 'green', 'violet'] as const;

const CONNECTION_STYLES = [
  ['straight', (
    <svg key="s" width="32" height="14" viewBox="0 0 32 14">
      <path d="M2 7 L30 7" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )],
  ['curve', (
    <svg key="c" width="32" height="14" viewBox="0 0 32 14">
      <path d="M2 7 C 10 0, 22 14, 30 7" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )],
  ['dashed', (
    <svg key="d" width="32" height="14" viewBox="0 0 32 14">
      <path d="M2 7 L30 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
    </svg>
  )],
] as const;

export default function PropertiesPanel({ el, onUpdate, onDelete, onDuplicate, selectedConnection, onConnectionUpdate, onClose }: Props) {
  const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 294 : 900, y: 70 });

  const onHeadDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const start = { mx: e.clientX, my: e.clientY, x: pos.x, y: pos.y };
    const move = (ev: MouseEvent) => {
      setPos({
        x: Math.max(8, Math.min(window.innerWidth - 240, start.x + ev.clientX - start.mx)),
        y: Math.max(8, Math.min(window.innerHeight - 80, start.y + ev.clientY - start.my)),
      });
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const wrapStyle: React.CSSProperties = { left: pos.x, top: pos.y, right: 'auto', width: 280 };
  const CloseBtn = () => (
    <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={onClose}>
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 2l7 7M9 2l-7 7" />
      </svg>
    </button>
  );

  if (selectedConnection) {
    return (
      <div className="props" style={wrapStyle}>
        <div className="props-head" style={{ cursor: 'move' }} onMouseDown={onHeadDown}>
          <div className="props-title">Conexão</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="props-id">#{selectedConnection.id.slice(-4)}</div>
            <CloseBtn />
          </div>
        </div>
        <div className="props-section">
          <div className="props-label">Estilo</div>
          <div className="connection-styles">
            {CONNECTION_STYLES.map(([k, ico]) => (
              <button
                key={k}
                className={`cs-pick${selectedConnection.style === k ? ' active' : ''}`}
                onClick={() => onConnectionUpdate({ style: k as Connection['style'] })}
              >
                {ico}
              </button>
            ))}
          </div>
        </div>
        <div className="props-section">
          <div className="props-label">Seta</div>
          <div className="connection-styles">
            <button className={`cs-pick${selectedConnection.arrow ? ' active' : ''}`} onClick={() => onConnectionUpdate({ arrow: true })}>com</button>
            <button className={`cs-pick${!selectedConnection.arrow ? ' active' : ''}`} onClick={() => onConnectionUpdate({ arrow: false })}>sem</button>
          </div>
        </div>
      </div>
    );
  }

  if (!el) return null;

  return (
    <div className="props" style={wrapStyle}>
      <div className="props-head" style={{ cursor: 'move' }} onMouseDown={onHeadDown}>
        <div className="props-title">{el.type}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="props-id">#{el.id.slice(-4)}</div>
          <CloseBtn />
        </div>
      </div>
      <div className="props-section">
        <div className="props-label">Posição &amp; tamanho</div>
        <div className="props-row">
          <div className="props-input"><span>x</span><input value={Math.round(el.x)} onChange={(e) => onUpdate(el.id, { x: +e.target.value || 0 })} /></div>
          <div className="props-input"><span>y</span><input value={Math.round(el.y)} onChange={(e) => onUpdate(el.id, { y: +e.target.value || 0 })} /></div>
        </div>
        <div className="props-row">
          <div className="props-input"><span>w</span><input value={Math.round(el.w)} onChange={(e) => onUpdate(el.id, { w: +e.target.value || 50 })} /></div>
          <div className="props-input"><span>h</span><input value={Math.round(el.h)} onChange={(e) => onUpdate(el.id, { h: +e.target.value || 50 })} /></div>
        </div>
      </div>
      {el.type === 'sticky' && (
        <div className="props-section">
          <div className="props-label">Cor</div>
          <div className="swatch-row">
            {STICKY_COLORS.map((c) => (
              <div
                key={c}
                className={`swatch-pick${el.color === c ? ' active' : ''}`}
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
          <button className="props-action" onClick={() => onDuplicate(el.id)} title="Duplicar"><Icon name="copy" size={13} /></button>
          <button className="props-action" title="Agrupar"><Icon name="group" size={13} /></button>
          <button className="props-action" title="Mais"><Icon name="more" size={13} /></button>
          <button className="props-action danger" onClick={() => onDelete(el.id)} title="Apagar"><Icon name="trash" size={13} /></button>
        </div>
      </div>
    </div>
  );
}
