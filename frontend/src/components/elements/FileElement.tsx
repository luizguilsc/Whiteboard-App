import type { BoardElement } from '@/types';

const EXT_COLORS: Record<string, string> = {
  py:   'oklch(0.65 0.14 235)',
  js:   'oklch(0.7 0.14 95)',
  xls:  'oklch(0.55 0.14 145)',
  docx: 'oklch(0.55 0.16 250)',
};

interface Props {
  el: BoardElement;
}

export default function FileElement({ el }: Props) {
  const { name = 'arquivo', size = '0 kb', ext = 'txt' } = el.extra ?? {};
  const color = EXT_COLORS[ext as string] ?? 'var(--accent-ink)';

  return (
    <div className="file-elem" style={{ width: '100%', height: '100%' }}>
      <div className="file-icon" style={{ color }}>
        {String(ext).toUpperCase()}
      </div>
      <div className="file-meta">
        <div className="file-name">{name}</div>
        <div className="file-info">{size} · {ext}</div>
      </div>
    </div>
  );
}
