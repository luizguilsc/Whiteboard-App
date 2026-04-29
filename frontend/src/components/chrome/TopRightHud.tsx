'use client';

import { useState } from 'react';

import Icon from '@/components/ui/Icon';
import type { Folder } from '@/types';

interface Props {
  folder: Folder | null;
  onShare: () => void;
  onExport: (kind: string) => void;
}

const EXPORT_OPTIONS: [string, string][] = [
  ['JSON', 'json'],
  ['Imagem (PNG)', 'png'],
  ['PDF', 'pdf'],
  ['Markdown', 'md'],
];

export default function TopRightHud({ folder, onShare, onExport }: Props) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="hud hud-topright">
      <div className="pill">
        <span style={{ color: 'var(--ink-mute)' }}>pasta</span>
        <strong style={{ color: 'var(--ink)', fontWeight: 500 }}>{folder?.name}</strong>
      </div>
      <button className="icon-btn" title="Compartilhar" onClick={onShare}>
        <Icon name="share" size={15} />
      </button>
      <div style={{ position: 'relative' }}>
        <button className="icon-btn" title="Exportar" onClick={() => setExportOpen((o) => !o)}>
          <Icon name="download" size={15} />
        </button>
        {exportOpen && (
          <div style={{
            position: 'absolute', top: 36, right: 0,
            background: 'var(--bg-elev)', border: '1px solid var(--line)',
            borderRadius: 8, boxShadow: 'var(--shadow-md)',
            padding: 4, minWidth: 160, zIndex: 60,
          }}>
            {EXPORT_OPTIONS.map(([label, k]) => (
              <button
                key={k}
                onClick={() => { setExportOpen(false); onExport(k); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 10px', border: 'none',
                  background: 'transparent', fontSize: 13,
                  textAlign: 'left', borderRadius: 5, cursor: 'pointer',
                  color: 'var(--ink-soft)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontFamily: 'var(--mono-font)', fontSize: 10, width: 28, color: 'var(--ink-mute)' }}>.{k}</span>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="icon-btn" title="Configurações">
        <Icon name="settings" size={15} />
      </button>
    </div>
  );
}
