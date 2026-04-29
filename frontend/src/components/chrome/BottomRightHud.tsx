'use client';

import type { ReactNode } from 'react';

import Icon from '@/components/ui/Icon';

interface Props {
  zoom: number;
  setZoom: (fn: (z: number) => number) => void;
  fit: () => void;
  status: { collaborators: number; elements: number; unsync: number };
  miniMap: ReactNode;
}

export default function BottomRightHud({ zoom, setZoom, fit, status, miniMap }: Props) {
  return (
    <div className="hud hud-bottomright">
      <div className="status-bar">
        <span className="stat live"><strong>{status.collaborators}</strong> ativos</span>
        <span className="stat"><strong>{status.elements}</strong> elementos</span>
        <span className="stat warn"><strong>{status.unsync}</strong> não sincronizado</span>
      </div>
      {miniMap}
      <div className="zoom-ctrl">
        <button onClick={fit} title="Encaixar"><Icon name="fit" size={14} /></button>
        <button onClick={() => setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(2)))}>
          <Icon name="minus" size={12} />
        </button>
        <span className="zoom-val" onClick={() => setZoom(() => 1)}>
          {Math.round(zoom * 100)}%
        </span>
        <button onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}>
          <Icon name="plus" size={12} />
        </button>
      </div>
    </div>
  );
}
