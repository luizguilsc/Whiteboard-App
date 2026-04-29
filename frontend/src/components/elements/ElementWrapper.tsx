'use client';

import type { BoardElement, ResizeDir, Side } from '@/types';
import AudioElement from './AudioElement';
import CardElement from './CardElement';
import ChecklistElement from './ChecklistElement';
import ColumnElement from './ColumnElement';
import FileElement from './FileElement';
import ImageElement from './ImageElement';
import LinkElement from './LinkElement';
import ShapeElement from './ShapeElement';
import StickyElement from './StickyElement';

const SIDES: Side[] = ['t', 'r', 'b', 'l'];
const RESIZE_DIRS: ResizeDir[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

interface Props {
  el: BoardElement;
  selected: boolean;
  dragging: boolean;
  mergeTarget: boolean;
  absorbing: boolean;
  cardStyle: string;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string, dir: ResizeDir) => void;
  onPortStart: (e: React.MouseEvent, id: string, side: Side) => void;
  onUpdate: (id: string, patch: Partial<BoardElement>) => void;
}

export default function ElementWrapper({
  el, selected, dragging, mergeTarget, absorbing,
  cardStyle, onMouseDown, onResizeStart, onPortStart, onUpdate,
}: Props) {
  const styleClass = el.type === 'sticky' || el.type === 'shape' ? '' : `style-${cardStyle}`;
  const className = [
    'elem', `elem-${el.type}`, styleClass,
    selected ? 'selected' : '',
    dragging ? 'dragging' : '',
    mergeTarget ? 'merge-target' : '',
    absorbing ? 'absorbing' : '',
  ].filter(Boolean).join(' ');

  let content: React.ReactNode;
  switch (el.type) {
    case 'card':      content = <CardElement el={el} onUpdate={onUpdate} />; break;
    case 'sticky':    content = <StickyElement el={el} onUpdate={onUpdate} />; break;
    case 'image':     content = <ImageElement el={el} />; break;
    case 'shape':     content = <ShapeElement el={el} onUpdate={onUpdate} />; break;
    case 'column':    content = <ColumnElement el={el} onUpdate={onUpdate} />; break;
    case 'checklist': content = <ChecklistElement el={el} onUpdate={onUpdate} />; break;
    case 'link':      content = <LinkElement el={el} />; break;
    case 'audio':     content = <AudioElement el={el} />; break;
    case 'file':      content = <FileElement el={el} />; break;
    default:          content = <div>?</div>;
  }

  return (
    <div
      className={className}
      style={{ left: el.x, top: el.y, width: el.w, height: el.h }}
      onMouseDown={(e) => onMouseDown(e, el.id)}
      data-elem-id={el.id}
    >
      {content}
      {SIDES.map((side) => (
        <div
          key={side}
          className={`port ${side}`}
          onMouseDown={(e) => { e.stopPropagation(); onPortStart(e, el.id, side); }}
        />
      ))}
      {RESIZE_DIRS.map((dir) => (
        <div
          key={dir}
          className={`resize-handle r-${dir}`}
          onMouseDown={(e) => { e.stopPropagation(); onResizeStart(e, el.id, dir); }}
        />
      ))}
    </div>
  );
}
