import type { BoardElement } from '@/types';

interface Props {
  el: BoardElement;
}

export default function LinkElement({ el }: Props) {
  const { placeholder, host } = el.extra ?? {};

  return (
    <div className="link-elem" style={{ width: '100%', height: '100%' }}>
      <div className="link-img">{placeholder ?? 'preview'}</div>
      <div className="link-meta">
        <div className="link-title">{el.title}</div>
        <div className="link-host">{host}</div>
      </div>
    </div>
  );
}
