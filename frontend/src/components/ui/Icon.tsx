import type { JSX } from 'react';

interface IconProps {
  name: string;
  size?: number;
  stroke?: number;
}

const ICON_PATHS: Record<string, JSX.Element> = {
  cursor:   <><path d="M4 3l3 11 2-4 4-2z"/></>,
  hand:     <><path d="M6 9V4.5a1 1 0 1 1 2 0V8"/><path d="M8 8V3.5a1 1 0 1 1 2 0V8"/><path d="M10 8V4.5a1 1 0 1 1 2 0V9"/><path d="M12 9v-1a1 1 0 1 1 2 0v5a4 4 0 0 1-4 4H8.5c-1.5 0-2-.5-3-1.5l-2-2"/></>,
  card:     <><rect x="3" y="4" width="12" height="10" rx="1.5"/><path d="M5.5 7.5h7M5.5 10.5h4"/></>,
  sticky:   <><path d="M3 3h9l3 3v9H3z"/><path d="M12 3v3h3"/></>,
  shape:    <><rect x="2.5" y="2.5" width="7" height="7"/><circle cx="12" cy="12.5" r="3"/></>,
  column:   <><rect x="2.5" y="3" width="3.5" height="12" rx="1"/><rect x="7.25" y="3" width="3.5" height="9" rx="1"/><rect x="12" y="3" width="3.5" height="6" rx="1"/></>,
  check:    <><rect x="2.5" y="2.5" width="13" height="13" rx="1.5"/><path d="M5.5 9l2.5 2.5L13 6.5"/></>,
  link:     <><path d="M7.5 10.5l3-3"/><path d="M9 6l1-1a3 3 0 0 1 4.2 4.2L13 10.5"/><path d="M9 12l-1 1a3 3 0 0 1-4.2-4.2L5 7.5"/></>,
  audio:    <><path d="M5 7v4M3 8v2M7 6v6M9 5v8M11 6v6M13 7v4M15 8v2"/></>,
  file:     <><path d="M4 2.5h6.5L14 6v9.5H4z"/><path d="M10 2.5V6h4"/></>,
  arrow:    <><path d="M3.5 9h11"/><path d="M11 5.5L14.5 9 11 12.5"/></>,
  line:     <><path d="M3.5 14.5L14.5 3.5"/></>,
  pen:      <><path d="M3 15l3-1L14 6l-2-2-8 8z"/></>,
  text:     <><path d="M4 5h10M9 5v10M6.5 15h5"/></>,
  comment:  <><path d="M3 4h12v8H8.5L5 15v-3H3z"/></>,
  search:   <><circle cx="8" cy="8" r="4"/><path d="M11 11l3 3"/></>,
  plus:     <><path d="M9 4v10M4 9h10"/></>,
  minus:    <><path d="M4 9h10"/></>,
  fit:      <><path d="M5 3H3v2M13 3h2v2M5 15H3v-2M13 15h2v-2"/></>,
  more:     <><circle cx="9" cy="4" r="0.7" fill="currentColor"/><circle cx="9" cy="9" r="0.7" fill="currentColor"/><circle cx="9" cy="14" r="0.7" fill="currentColor"/></>,
  folder:   <><path d="M2.5 5.5V13a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1H8.5l-1.5-2H3.5a1 1 0 0 0-1 1z"/></>,
  share:    <><circle cx="13" cy="4" r="1.5"/><circle cx="13" cy="14" r="1.5"/><circle cx="5" cy="9" r="1.5"/><path d="M6.4 8.2L11.6 4.7M6.4 9.8L11.6 13.3"/></>,
  download: <><path d="M9 3v8M5.5 8L9 11.5 12.5 8M3.5 14h11"/></>,
  layers:   <><path d="M9 2.5L2.5 6 9 9.5 15.5 6z"/><path d="M2.5 9.5L9 13l6.5-3.5"/><path d="M2.5 13L9 16.5 15.5 13"/></>,
  zap:      <><path d="M10 2L4 10h4l-1 6 6-8H9z"/></>,
  history:  <><path d="M3 9a6 6 0 1 0 1.7-4.2L3 6.5"/><path d="M3 3v3.5h3.5"/><path d="M9 6v3l2 2"/></>,
  settings: <><circle cx="9" cy="9" r="2"/><path d="M9 1.5v2M9 14.5v2M16.5 9h-2M3.5 9h-2M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4M14.3 14.3l-1.4-1.4M5.1 5.1L3.7 3.7"/></>,
  check2:   <><path d="M3 9.5L7 13.5 15 5"/></>,
  copy:     <><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M3 11V4a1 1 0 0 1 1-1h7"/></>,
  trash:    <><path d="M3.5 5h11M7 5V3.5h4V5M5 5l1 10h6l1-10"/></>,
  group:    <><rect x="2.5" y="2.5" width="6" height="6"/><rect x="9.5" y="9.5" width="6" height="6"/></>,
  paste:    <><path d="M5 4h2V3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V4h2v3H5z"/><path d="M5 5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H13"/></>,
  eye:      <><path d="M1.5 9s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5z"/><circle cx="9" cy="9" r="2"/></>,
  'eye-off':<><path d="M3 3l12 12"/><path d="M6.2 6.2C3.5 7.7 1.5 9 1.5 9s2.5 5 7.5 5c1.5 0 2.8-.4 3.9-1"/><path d="M14.7 11.5c1.3-1 2.3-2.5 2.3-2.5s-2.5-5-7.5-5c-.7 0-1.4.1-2 .3"/></>,
  lock:     <><rect x="3.5" y="8" width="11" height="7" rx="1.2"/><path d="M5.5 8V6a3.5 3.5 0 0 1 7 0v2"/></>,
  unlock:   <><rect x="3.5" y="8" width="11" height="7" rx="1.2"/><path d="M5.5 8V6a3.5 3.5 0 0 1 6.7-1.4"/></>,
  close:    <><path d="M4 4l10 10M14 4L4 14"/></>,
  image:    <><rect x="2.5" y="3.5" width="13" height="11" rx="1.5"/><circle cx="6.5" cy="7" r="1.2"/><path d="M2.5 12l3.5-3.5 2.5 2.5 2-2 3 3"/></>,
};

export default function Icon({ name, size = 18, stroke = 1.5 }: IconProps) {
  const paths = ICON_PATHS[name];
  if (!paths) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  );
}
