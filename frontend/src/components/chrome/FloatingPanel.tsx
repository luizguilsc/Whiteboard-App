'use client';

import Icon from '@/components/ui/Icon';
import type { BoardElement } from '@/types';

interface LayersProps {
  variant: 'layers';
  elements: BoardElement[];
  selection: string[];
  onSelectElement: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onToggleLock: (id: string) => void;
}

interface HistoryProps {
  variant: 'history';
  elements: BoardElement[];
}

type Props = {
  title: string;
  onClose: () => void;
  top?: number;
  right?: number;
} & (LayersProps | HistoryProps);

const ELEM_LABEL: Record<string, string> = {
  card: 'Card', sticky: 'Sticky', checklist: 'Lista', image: 'Imagem',
  shape: 'Forma', column: 'Coluna', link: 'Link', audio: 'Áudio', file: 'Arquivo', text: 'Texto',
};

const ELEM_ICON: Record<string, string> = {
  card: 'card', sticky: 'sticky', checklist: 'check', image: 'paste',
  shape: 'shape', column: 'column', link: 'link', audio: 'audio', file: 'file',
};

function elemTitle(el: BoardElement): string {
  return el.title ?? (el.extra?.text as string | undefined) ?? ELEM_LABEL[el.type] ?? el.type;
}

const HISTORY_ENTRIES = [
  { who: 'Você',    ago: 'agora',       what: 'moveu "Bug: ESC fecha modal"' },
  { who: 'Você',    ago: '1 min',       what: 'criou conexão Goal → Risk' },
  { who: 'Lia M.',  ago: '4 min',       what: 'editou "Métrica: TTFI"' },
  { who: 'Rafa S.', ago: '12 min',      what: 'adicionou checklist "Beta"' },
  { who: 'Você',    ago: '26 min',      what: 'merge: card → lista' },
  { who: 'Bia C.',  ago: '1 h',         what: 'renomeou board para "Plano Q3"' },
  { who: 'Lia M.',  ago: '2 h',         what: 'removeu sticky "?? prazo"' },
  { who: 'Rafa S.', ago: 'ontem 18:42', what: 'criou Coluna "Riscos"' },
  { who: 'Você',    ago: 'ontem 14:10', what: 'anexou áudio "Briefing 03"' },
];

export default function FloatingPanel(props: Props) {
  const { title, onClose, top = 64, right = 14, variant, elements } = props;

  return (
    <div className="floating-panel" style={{ top, right }}>
      <div className="props-head">
        <span className="props-head-title">{title}</span>
        <button className="props-close" onClick={onClose}>
          <Icon name="close" size={14} />
        </button>
      </div>
      <div className="floating-panel-body">
        {variant === 'layers' ? (
          <div className="layers-list">
            {[...elements].reverse().map((el) => (
              <div
                key={el.id}
                className={`layers-row${(props as LayersProps).selection.includes(el.id) ? ' selected' : ''}`}
                onClick={() => (props as LayersProps).onSelectElement(el.id)}
              >
                <Icon name={ELEM_ICON[el.type] ?? 'card'} size={14} />
                <span className="layers-row-title">{elemTitle(el)}</span>
                <button
                  className="layers-row-btn"
                  onClick={(e) => { e.stopPropagation(); (props as LayersProps).onToggleVisible(el.id); }}
                  title="Visibilidade"
                >
                  <Icon name={el.hidden ? 'eye-off' : 'eye'} size={13} />
                </button>
                <button
                  className="layers-row-btn"
                  onClick={(e) => { e.stopPropagation(); (props as LayersProps).onToggleLock(el.id); }}
                  title="Bloquear"
                >
                  <Icon name={el.locked ? 'lock' : 'unlock'} size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="history-list">
            {HISTORY_ENTRIES.map((h, i) => (
              <div key={i} className="history-row">
                <div className="history-dot" />
                <div className="history-meta">
                  <div className="history-line"><b>{h.who}</b> <span>{h.what}</span></div>
                  <div className="history-ago">{h.ago}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
