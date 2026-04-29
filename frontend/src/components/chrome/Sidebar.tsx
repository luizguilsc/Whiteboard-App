'use client';

import Icon from '@/components/ui/Icon';
import type { Folder } from '@/types';

interface Props {
  folders: Folder[];
  childFolders: Record<string, Folder[]>;
  activeFolderId: string;
  setActiveFolderId: (id: string) => void;
}

export default function Sidebar({ folders, childFolders, activeFolderId, setActiveFolderId }: Props) {
  const rootFolders = folders.filter((f) => !f.section);
  const sectionFolders = folders.filter((f) => f.section);

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <div className="brand">
          <span className="brand-mark" />
          <span>plano</span>
        </div>
        <button className="icon-btn" title="Novo board">
          <Icon name="plus" size={16} />
        </button>
      </div>
      <div className="sidebar-search">
        <Icon name="search" size={14} />
        <input placeholder="Buscar em tudo…" />
        <kbd>⌘K</kbd>
      </div>

      <div className="section-label">
        <span>Pastas</span>
        <button className="icon-btn" style={{ width: 22, height: 22 }} title="Nova pasta">
          <Icon name="plus" size={12} />
        </button>
      </div>
      <div className="folder-tree">
        {rootFolders.map((f) => {
          const isActive = activeFolderId === f.id;
          const subs = childFolders[f.id] ?? [];
          return (
            <>
              <div
                key={f.id}
                className={`folder-row${isActive ? ' active' : ''}`}
                onClick={() => setActiveFolderId(f.id)}
              >
                <span className="swatch" style={{ background: f.color ?? undefined }} />
                <span>{f.name}</span>
                <span className="count">{f.count}</span>
              </div>
              {isActive && subs.map((s) => (
                <div
                  key={s.id}
                  className="folder-row nested"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ color: 'var(--ink-mute)', fontFamily: 'var(--mono-font)', fontSize: 10, width: 10 }}>↳</span>
                  <span>{s.name}</span>
                  <span className="count">{s.count}</span>
                </div>
              ))}
            </>
          );
        })}
        <div className="section-label" style={{ marginTop: 8 }}>Outros</div>
        {sectionFolders.map((f) => (
          <div
            key={f.id}
            className={`folder-row${activeFolderId === f.id ? ' active' : ''}`}
            onClick={() => setActiveFolderId(f.id)}
          >
            <span className="swatch" style={{ background: f.color ?? undefined }} />
            <span>{f.name}</span>
            <span className="count">{f.count}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-foot">
        <div className="avatar-stack">
          <div className="avatar">AM</div>
          <div className="avatar a2">TH</div>
          <div className="avatar a3">RI</div>
          <div className="avatar a4">+2</div>
        </div>
        <div className="foot-meta">live</div>
      </div>
    </aside>
  );
}
