export type ElementType =
  | 'card' | 'sticky' | 'image' | 'shape'
  | 'column' | 'checklist' | 'link' | 'audio' | 'file';

export type Side = 't' | 'r' | 'b' | 'l';
export type ConnectionStyle = 'curve' | 'straight' | 'dashed';
export type StickyColor = 'yellow' | 'pink' | 'blue' | 'green' | 'violet';
export type ShapeKind = 'rect' | 'circle' | 'diamond';
export type ResizeDir = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
export type Tool =
  | 'select' | 'pan'
  | 'card' | 'sticky' | 'checklist' | 'column' | 'shape'
  | 'image' | 'link' | 'audio' | 'file'
  | 'arrow' | 'line' | 'text' | 'comment';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface ColumnItem {
  id: string;
  text: string;
  done?: boolean;
}

export interface Tag {
  label: string;
  dot?: boolean;
}

export interface ElementExtra {
  text?: string;
  meta?: string;
  tag?: Tag;
  shape?: ShapeKind;
  label?: string;
  src?: string;
  caption?: string;
  placeholder?: string;
  items?: ChecklistItem[] | ColumnItem[];
  host?: string;
  url?: string;
  duration?: string;
  progress?: number;
  name?: string;
  size?: string;
  ext?: string;
}

export interface BoardElement {
  id: string;
  board_id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  body?: string;
  meta?: string;
  color?: string;
  hidden?: boolean;
  locked?: boolean;
  extra?: ElementExtra;
}

export interface Connection {
  id: string;
  board_id: string;
  from_id: string;
  from_side: Side;
  to_id: string;
  to_side: Side;
  style: ConnectionStyle;
  arrow: boolean;
  label?: string;
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  count: number;
  parent_id?: string;
  section?: string;
}

export interface Board {
  id: string;
  name: string;
  folder_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface DragLine {
  from: Point;
  to: Point;
  snapTarget?: { id: string; side: Side } | null;
}

export interface Marquee {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Tweaks {
  theme: 'light' | 'dark';
  background: 'dots' | 'lines' | 'plain' | 'paper';
  density: 'compact' | 'comfortable' | 'spacious';
  cardStyle: 'shadow' | 'flat' | 'outline';
}
