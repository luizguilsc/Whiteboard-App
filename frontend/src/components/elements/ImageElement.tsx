import type { BoardElement } from '@/types';

interface Props {
  el: BoardElement;
}

export default function ImageElement({ el }: Props) {
  const { src, caption, placeholder } = el.extra ?? {};

  return (
    <div className="image-elem" style={{ width: '100%', height: '100%' }}>
      <div className="img-wrap">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={caption ?? ''} />
        ) : (
          <div className="img-placeholder">{placeholder ?? 'imagem'}</div>
        )}
      </div>
      {caption && (
        <div className="img-caption">
          <span>{caption}</span>
          <span>{el.w}×{el.h}</span>
        </div>
      )}
    </div>
  );
}
