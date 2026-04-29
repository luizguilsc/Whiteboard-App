'use client';

import Icon from '@/components/ui/Icon';
import type { Tool } from '@/types';

interface Props {
  tool: Tool;
  setTool: (t: Tool) => void;
  onAdd: (kind: string) => void;
  onShowPanel: (panel: 'layers' | 'history') => void;
}

const TOOLS = [
  { id: 'select', icon: 'cursor', label: 'Selecionar', key: 'V' },
  { id: 'pan',    icon: 'hand',   label: 'Mover canvas', key: 'H' },
] as const;

const ADDERS = [
  { id: 'card',      icon: 'card',   label: 'Card / nota',   key: 'C' },
  { id: 'sticky',    icon: 'sticky', label: 'Sticky note',   key: 'S' },
  { id: 'checklist', icon: 'check',  label: 'Checklist',     key: 'K' },
  { id: 'column',    icon: 'column', label: 'Coluna',        key: 'L' },
  { id: 'shape',     icon: 'shape',  label: 'Forma',         key: 'R' },
  { id: 'image',     icon: 'paste',  label: 'Imagem',        key: 'I' },
  { id: 'link',      icon: 'link',   label: 'Link / embed',  key: 'U' },
  { id: 'audio',     icon: 'audio',  label: 'Áudio',         key: 'A' },
  { id: 'file',      icon: 'file',   label: 'Arquivo',       key: 'F' },
] as const;

const DRAWING = [
  { id: 'arrow',   icon: 'arrow',   label: 'Conectar (seta)', key: 'X' },
  { id: 'line',    icon: 'line',    label: 'Linha livre',     key: 'P' },
  { id: 'text',    icon: 'text',    label: 'Texto',           key: 'T' },
  { id: 'comment', icon: 'comment', label: 'Comentário',      key: 'M' },
] as const;

export default function Toolbar({ tool, setTool, onAdd, onShowPanel }: Props) {
  return (
    <div className="toolbar">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={`tool-btn${tool === t.id ? ' active' : ''}`}
          onClick={() => setTool(t.id as Tool)}
        >
          <Icon name={t.icon} size={18} />
          <span className="key">{t.key}</span>
          <span className="tool-tooltip">{t.label}<kbd>{t.key}</kbd></span>
        </button>
      ))}
      <div className="tool-divider" />
      {ADDERS.map((t) => (
        <button key={t.id} className="tool-btn" onClick={() => onAdd(t.id)}>
          <Icon name={t.icon} size={18} />
          <span className="key">{t.key}</span>
          <span className="tool-tooltip">{t.label}<kbd>{t.key}</kbd></span>
        </button>
      ))}
      <div className="tool-divider" />
      {DRAWING.map((t) => (
        <button
          key={t.id}
          className={`tool-btn${tool === t.id ? ' active' : ''}`}
          onClick={() => setTool(t.id as Tool)}
        >
          <Icon name={t.icon} size={18} />
          <span className="key">{t.key}</span>
          <span className="tool-tooltip">{t.label}<kbd>{t.key}</kbd></span>
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <button className="tool-btn" onClick={() => onShowPanel('layers')}>
        <Icon name="layers" size={18} />
        <span className="tool-tooltip">Camadas</span>
      </button>
      <button className="tool-btn" onClick={() => onShowPanel('history')}>
        <Icon name="history" size={18} />
        <span className="tool-tooltip">Histórico</span>
      </button>
    </div>
  );
}
