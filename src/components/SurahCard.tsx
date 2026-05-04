"use client";

import { Surah } from "@/types/quran";
import { Play, Pause } from "lucide-react";

interface SurahCardProps {
  surah: Surah;
  isSelected: boolean;
  isPlaying?: boolean;
  onSelect: (surah: Surah) => void;
  compact?: boolean;
}

export default function SurahCard({ surah, isSelected, isPlaying, onSelect, compact }: SurahCardProps) {
  const isActive = isSelected && isPlaying;
  const isPaused = isSelected && !isPlaying;

  return (
    <div 
      className={`surah-card ${isSelected ? 'selected' : ''} ${isActive ? 'playing' : ''} ${isPaused ? 'paused' : ''} ${compact ? 'compact' : ''}`}
      onClick={() => onSelect(surah)}
    >
      {/* Animated glow background for active surah */}
      {isSelected && <div className="active-glow" />}

      {/* Number diamond */}
      <div className="surah-number-wrap">
        <svg viewBox="0 0 40 40" className="diamond-svg">
          <polygon 
            points="20,2 38,20 20,38 2,20" 
            fill={isSelected ? "rgba(56,189,248,0.1)" : "none"}
            stroke={isSelected ? "var(--accent-blue)" : "rgba(148,163,184,0.3)"}
            strokeWidth="1.5"
          />
        </svg>
        <span className="surah-num">{surah.id}</span>
      </div>

      {/* Info */}
      <div className="surah-info">
        <span className="surah-name">{surah.name_simple}</span>
        <span className="surah-translation">{surah.translated_name.name} · {surah.verses_count} versets</span>
      </div>

      {/* Status indicator */}
      <div className="status-indicator">
        {isActive ? (
          <div className="eq-bars">
            <span /><span /><span /><span />
          </div>
        ) : isPaused ? (
          <div className="eq-bars paused-bars">
            <span /><span /><span /><span />
          </div>
        ) : (
          <div className="play-icon-wrap">
            <Play fill="currentColor" size={14} />
          </div>
        )}
      </div>

      {/* Resume button (paused only) */}
      {isPaused && (
        <div className="resume-btn">
          <div className="sparkle s1" />
          <div className="sparkle s2" />
          <div className="sparkle s3" />
          <Play fill="currentColor" size={12} />
          <span>Reprendre</span>
        </div>
      )}

      {/* Arabic name */}
      {!isPaused && !compact && (
        <div className="surah-arabic-side">
          <span className="arabic-name">{surah.name_arabic}</span>
        </div>
      )}

      <style jsx>{`
        .surah-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 1.25rem;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
          position: relative;
          background: rgba(15, 23, 42, 0.3);
          overflow: hidden;
        }

        .surah-card.compact {
          padding: 0.5rem 1rem;
          gap: 0.75rem;
          border-radius: 0.75rem;
        }

        .surah-card:hover {
          background: rgba(56, 189, 248, 0.06);
          border-color: rgba(56, 189, 248, 0.15);
          transform: translateX(4px);
        }

        /* Selected (playing or paused) */
        .surah-card.selected {
          background: rgba(56, 189, 248, 0.06);
          border-color: rgba(56, 189, 248, 0.3);
        }

        .surah-card.playing {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(129, 140, 248, 0.06));
          border-color: rgba(56, 189, 248, 0.4);
          box-shadow: 0 0 24px rgba(56, 189, 248, 0.1),
                      0 0 8px rgba(56, 189, 248, 0.05);
        }

        .surah-card.paused {
          background: rgba(239, 68, 68, 0.06);
          border-color: rgba(239, 68, 68, 0.3);
          border-style: solid;
        }

        .surah-card.paused .surah-name {
          color: #f87171;
        }

        .surah-card.paused .surah-num {
          color: #f87171;
        }

        .surah-card.paused .diamond-svg polygon {
          stroke: #f87171 !important;
          fill: rgba(239, 68, 68, 0.08);
        }

        /* Animated glow behind active card */
        .active-glow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          z-index: 0;
        }

        .surah-card.playing .active-glow {
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(56, 189, 248, 0.06) 50%, 
            transparent 100%);
          animation: glowPulse 2.5s ease-in-out infinite;
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* Number */
        .surah-number-wrap {
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 1;
          transition: all 0.2s;
        }

        .surah-card.compact .surah-number-wrap {
          width: 30px;
          height: 30px;
        }

        .diamond-svg {
          position: absolute;
          width: 100%;
          height: 100%;
          transition: all 0.3s;
        }

        .surah-card.playing .diamond-svg {
          animation: diamondPulse 2s ease-in-out infinite;
        }

        @keyframes diamondPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .surah-card:hover .diamond-svg polygon {
          stroke: var(--accent-blue);
        }

        .surah-num {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          z-index: 1;
        }

        .surah-card.compact .surah-num {
          font-size: 0.65rem;
        }

        .surah-card.selected .surah-num {
          color: var(--accent-blue);
        }

        /* Info */
        .surah-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          z-index: 1;
        }

        .surah-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-primary);
          transition: color 0.2s;
        }

        .surah-card.compact .surah-name {
          font-size: 0.85rem;
        }

        .surah-card.selected .surah-name {
          color: var(--accent-blue);
          font-weight: 700;
        }

        .surah-translation {
          font-size: 0.72rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }

        /* Status indicator */
        .status-indicator {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 1;
        }

        .play-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
          opacity: 0;
          transition: all 0.2s;
        }

        .surah-card:hover .play-icon-wrap {
          opacity: 1;
        }

        /* Equalizer bars - Playing */
        .eq-bars {
          display: flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 18px;
        }

        .eq-bars span {
          width: 3px;
          background: var(--accent-blue);
          border-radius: 2px;
          animation: eqBounce 0.8s ease-in-out infinite alternate;
        }

        .eq-bars span:nth-child(1) { height: 6px; animation-delay: 0s; }
        .eq-bars span:nth-child(2) { height: 14px; animation-delay: 0.2s; }
        .eq-bars span:nth-child(3) { height: 9px; animation-delay: 0.35s; }
        .eq-bars span:nth-child(4) { height: 16px; animation-delay: 0.1s; }

        @keyframes eqBounce {
          0% { height: 4px; }
          100% { height: 18px; }
        }

        /* Equalizer bars - Paused (frozen, red) */
        .paused-bars span {
          animation: none !important;
          background: #f87171 !important;
          opacity: 0.7;
        }
        .paused-bars span:nth-child(1) { height: 5px; }
        .paused-bars span:nth-child(2) { height: 10px; }
        .paused-bars span:nth-child(3) { height: 7px; }
        .paused-bars span:nth-child(4) { height: 12px; }

        /* Arabic */
        .surah-arabic-side {
          flex-shrink: 0;
          transition: opacity 0.3s;
          z-index: 1;
        }

        .arabic-name {
          font-size: 1.1rem;
          color: rgba(148, 163, 184, 0.4);
          font-weight: 400;
        }

        .surah-card.selected .arabic-name {
          color: rgba(56, 189, 248, 0.4);
        }

        .surah-card:hover .surah-arabic-side {
          opacity: 0.3;
        }
        /* Resume button */
        .resume-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.85rem;
          border-radius: 2rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(248, 113, 113, 0.35);
          color: #f87171;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.3px;
          flex-shrink: 0;
          z-index: 1;
          animation: resumePulse 1.8s ease-in-out infinite;
          cursor: pointer;
          transition: all 0.2s;
          overflow: visible;
        }

        .resume-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(248, 113, 113, 0.5);
          transform: scale(1.05);
        }

        @keyframes resumePulse {
          0%, 100% {
            box-shadow: 0 0 6px rgba(248, 113, 113, 0.2);
          }
          50% {
            box-shadow: 0 0 16px rgba(248, 113, 113, 0.4),
                        0 0 32px rgba(248, 113, 113, 0.15);
          }
        }

        /* Sparkles */
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fca5a5;
          pointer-events: none;
        }

        .sparkle.s1 {
          top: -3px;
          right: 12px;
          animation: sparkleFloat 2s ease-in-out infinite;
        }

        .sparkle.s2 {
          bottom: -2px;
          left: 8px;
          animation: sparkleFloat 2s ease-in-out 0.6s infinite;
        }

        .sparkle.s3 {
          top: 50%;
          right: -4px;
          animation: sparkleFloat 2s ease-in-out 1.2s infinite;
        }

        @keyframes sparkleFloat {
          0%, 100% {
            opacity: 0;
            transform: scale(0) translateY(0);
          }
          30% {
            opacity: 1;
            transform: scale(1) translateY(-4px);
          }
          70% {
            opacity: 0.6;
            transform: scale(0.7) translateY(-8px);
          }
        }

        @media (max-width: 480px) {
          .surah-arabic-side {
            display: none;
          }
          .play-icon-wrap {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
