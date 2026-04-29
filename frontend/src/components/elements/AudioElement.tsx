'use client';

import { useState } from 'react';

import type { BoardElement } from '@/types';

const HEIGHTS = [0.3, 0.5, 0.7, 0.4, 0.6, 0.9, 0.5, 0.4, 0.7, 0.3, 0.5, 0.6, 0.8, 0.4, 0.5, 0.7, 0.6, 0.3, 0.4, 0.6, 0.7, 0.5, 0.4, 0.6, 0.8, 0.5, 0.3, 0.4, 0.6, 0.5, 0.7, 0.4, 0.5, 0.3, 0.4, 0.5, 0.3, 0.4];
const BARS = 38;

interface Props {
  el: BoardElement;
}

export default function AudioElement({ el }: Props) {
  const [playing, setPlaying] = useState(false);
  const { duration = '00:00', progress = 0 } = el.extra ?? {};

  return (
    <div className="audio-elem" style={{ width: '100%', height: '100%' }}>
      <div className="audio-head">
        <button
          className="audio-play"
          onClick={(e) => { e.stopPropagation(); setPlaying((p) => !p); }}
        >
          {playing ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="2" y="1.5" width="2" height="7"/>
              <rect x="6" y="1.5" width="2" height="7"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M2.5 1.5L8.5 5l-6 3.5z"/>
            </svg>
          )}
        </button>
        <div className="audio-meta">
          <div className="audio-title">{el.title}</div>
          <div className="audio-time">
            {Math.floor((progress as number) * parseInt(String(duration)))}:00 / {duration}
          </div>
        </div>
      </div>
      <div className="waveform">
        {Array.from({ length: BARS }).map((_, i) => {
          const h = HEIGHTS[i % HEIGHTS.length];
          const isPlayed = i / BARS < (progress as number);
          return (
            <div
              key={i}
              className={`wave-bar${isPlayed ? ' played' : ''}`}
              style={{ height: `${h * 100}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
