"use client";

import React, { useEffect, useState } from "react";
import { Surah, Reciter } from "@/types/quran";
import { X, Play, Pause, SkipForward, Radio, Settings, Check } from "lucide-react";

interface RadioModeProps {
  surah: Surah | null;
  reciter: Reciter | null;
  isPlaying: boolean;
  onClose: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  allReciters: Reciter[];
  selectedReciterIds: number[];
  onToggleReciter: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  radioScope: 'all' | 'juz_amma';
  onSetRadioScope: (scope: 'all' | 'juz_amma') => void;
}

export default function RadioMode({ 
  surah, reciter, isPlaying, onClose, onNext, onTogglePlay, 
  allReciters, selectedReciterIds, onToggleReciter,
  onSelectAll, onDeselectAll, radioScope, onSetRadioScope 
}: RadioModeProps) {
  // Generate random particles
  const [particles, setParticles] = useState<{id: number, left: string, top: string, animDelay: string}[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const p = [];
    for (let i = 0; i < 20; i++) {
      p.push({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animDelay: `${Math.random() * 5}s`
      });
    }
    setParticles(p);
  }, []);

  const sortedReciters = [...allReciters].sort((a, b) => {
    const aSelected = selectedReciterIds.includes(a.id);
    const bSelected = selectedReciterIds.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  return (
    <div className={`radio-overlay ${isPlaying ? 'playing' : ''}`}>
      {/* Background elements */}
      <div className="radio-bg-glow" />
      <div className="particles">
        {particles.map(p => (
          <div 
            key={p.id} 
            className="particle" 
            style={{ left: p.left, top: p.top, animationDelay: p.animDelay }} 
          />
        ))}
      </div>

      <div className="radio-top-actions">
        <button className="radio-action-circle" onClick={() => setIsSettingsOpen(!isSettingsOpen)} title="Paramètres de la radio">
          <Settings size={22} className={isSettingsOpen ? 'rotate-90' : ''} />
        </button>
        <button className="radio-action-circle" onClick={onClose} title="Fermer">
          <X size={22} />
        </button>
      </div>

      <div className={`radio-settings-panel ${isSettingsOpen ? 'open' : ''}`}>
        <div className="settings-header">
          <h3>Contenu de la radio</h3>
          <div className="scope-selector">
            <button 
              className={radioScope === 'all' ? 'active' : ''} 
              onClick={() => onSetRadioScope('all')}
            >
              Tout le Coran
            </button>
            <button 
              className={radioScope === 'juz_amma' ? 'active' : ''} 
              onClick={() => onSetRadioScope('juz_amma')}
            >
              Juz Amma
            </button>
          </div>
          
          <h3>Récitateurs inclus</h3>
          <p>{selectedReciterIds.length} sélectionnés</p>
          <div className="bulk-actions">
            <button onClick={onSelectAll}>Tout cocher</button>
            <button onClick={onDeselectAll}>Tout décocher</button>
          </div>
        </div>
        <div className="reciter-grid-mini">
          {sortedReciters.map(r => (
            <div 
              key={r.id} 
              className={`reciter-toggle-card ${selectedReciterIds.includes(r.id) ? 'active' : ''}`}
              onClick={() => onToggleReciter(r.id)}
            >
              <div className="toggle-avatar">
                {r.image ? <img src={r.image} alt="" /> : <Radio size={12} />}
                <div className="toggle-check">
                  <Check size={10} strokeWidth={4} />
                </div>
              </div>
              <span className="toggle-name">{r.name.split(' ').pop()}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="radio-content">
        <div className="radio-header">
          <div className="radio-badge">
            <Radio size={16} className="radio-icon-anim" />
            <span>RADIO CORAN EN DIRECT</span>
          </div>
        </div>

        <div className="radio-center">
          <div className={`vinyl-container ${isPlaying ? 'spinning' : ''}`}>
            <div className="vinyl-record">
              <div className="vinyl-grooves" />
              <div className="vinyl-label">
                {reciter?.image ? (
                  <img src={reciter.image} alt={reciter.name} />
                ) : (
                  <div className="label-placeholder">
                    <Radio size={24} />
                  </div>
                )}
              </div>
              <div className="vinyl-hole" />
            </div>
          </div>
        </div>

        <div className="radio-info">
          <h2 className="surah-title">{surah ? surah.name_simple : "Chargement..."}</h2>
          <p className="reciter-name">{reciter ? reciter.name : "..."}</p>
          
          {isPlaying && (
            <div className="radio-waves">
              <span/><span/><span/><span/><span/><span/><span/>
            </div>
          )}
        </div>

        <div className="radio-controls">
          <button className="radio-btn play-btn" onClick={onTogglePlay}>
            {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
          </button>
          <button className="radio-btn next-btn" onClick={onNext}>
            <SkipForward fill="currentColor" size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        .radio-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 6000;
          background: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          animation: fadeIn 0.4s ease-out;
          /* Prevent any touch scrolling or bouncing */
          touch-action: none;
          overscroll-behavior: none;
          /* Handle safe areas (iPhone notch, etc.) */
          padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
        }

        .radio-bg-glow {
          position: absolute;
          width: 80vw;
          height: 80vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(2, 6, 23, 0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: all 1s ease;
          pointer-events: none;
        }

        .radio-overlay.playing .radio-bg-glow {
          background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(129, 140, 248, 0.1) 40%, rgba(2, 6, 23, 0) 70%);
          animation: pulseGlow 4s infinite alternate;
        }

        @keyframes pulseGlow {
          0% { transform: translate(-50%, -50%) scale(1); }
          100% { transform: translate(-50%, -50%) scale(1.1); }
        }

        .particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          animation: floatParticle 10s linear infinite;
        }

        .radio-overlay.playing .particle {
          background: rgba(56, 189, 248, 0.5);
        }

        @keyframes floatParticle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) scale(0); opacity: 0; }
        }

        .radio-top-actions {
          position: absolute;
          top: 2rem;
          right: 2rem;
          display: flex;
          gap: 1rem;
          z-index: 100;
        }

        .radio-action-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .radio-action-circle:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .rotate-90 {
          transform: rotate(90deg);
        }

        /* Settings Panel */
        .radio-settings-panel {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 350px;
          max-width: 100%;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 90;
          padding: 6rem 2rem 2rem;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
        }

        .radio-settings-panel.open {
          transform: translateX(0);
        }

        .settings-header {
          margin-bottom: 2.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 1.5rem;
        }

        .settings-header h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .settings-header h3:not(:first-child) {
          margin-top: 2rem;
        }

        .scope-selector {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .scope-selector button {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 0.6rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .scope-selector button.active {
          background: var(--accent-blue);
          color: #020617;
          box-shadow: 0 4px 12px var(--accent-blue-glow);
        }

        .settings-header p {

          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .bulk-actions {
          display: flex;
          gap: 0.75rem;
        }

        .bulk-actions button {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          font-size: 0.75rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 600;
        }

        .bulk-actions button:hover {
          background: var(--accent-blue);
          color: #020617;
          border-color: var(--accent-blue);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--accent-blue-glow);
        }

        .reciter-grid-mini {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
          gap: 1.25rem;
          padding-bottom: 2rem;
        }

        .reciter-toggle-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0.75rem 0.5rem;
          border-radius: 1rem;
          background: transparent;
        }

        .reciter-toggle-card:hover {
          background: rgba(255, 255, 255, 0.03);
          transform: translateY(-4px);
        }

        .toggle-avatar {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          background: #1e293b;
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0.8;
        }

        .reciter-toggle-card.active .toggle-avatar {
          border-color: var(--accent-blue);
          box-shadow: 0 0 20px var(--accent-blue-glow);
          opacity: 1;
          transform: scale(1.05);
        }


        .toggle-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .toggle-check {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 22px;
          height: 22px;
          background: var(--accent-blue);
          border: 2px solid #020617;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #020617;
          opacity: 0;
          transform: scale(0) rotate(-45deg);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        }

        .reciter-toggle-card.active .toggle-check {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }

        .toggle-name {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: center;
          font-weight: 500;
          transition: color 0.3s;
        }

        .reciter-toggle-card.active .toggle-name {
          color: white;
          font-weight: 700;
        }

        .radio-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 500px;
          z-index: 5;
        }

        .radio-header {
          margin-bottom: 3rem;
        }

        .radio-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          color: #f87171;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .radio-icon-anim {
          animation: blink 2s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Vinyl Record */
        .vinyl-container {
          position: relative;
          width: 280px;
          height: 280px;
          margin-bottom: 3rem;
          filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5));
        }

        .vinyl-record {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #111;
          border: 4px solid #222;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8);
        }

        .vinyl-grooves {
          position: absolute;
          inset: 10px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 
            inset 0 0 0 10px #111,
            inset 0 0 0 11px rgba(255, 255, 255, 0.05),
            inset 0 0 0 20px #111,
            inset 0 0 0 21px rgba(255, 255, 255, 0.05),
            inset 0 0 0 30px #111,
            inset 0 0 0 31px rgba(255, 255, 255, 0.05),
            inset 0 0 0 40px #111,
            inset 0 0 0 41px rgba(255, 255, 255, 0.05);
        }

        .vinyl-record::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.05) 100%);
          pointer-events: none;
        }

        .vinyl-label {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: var(--accent-blue);
          position: relative;
          z-index: 2;
          overflow: hidden;
          border: 2px solid #222;
        }

        .vinyl-label img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .label-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #020617;
        }

        .vinyl-hole {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #020617;
          border: 2px solid #222;
          z-index: 3;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .vinyl-container.spinning {
          animation: spinRecord 4s linear infinite;
        }

        @keyframes spinRecord {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Info */
        .radio-info {
          text-align: center;
          margin-bottom: 2rem;
          min-height: 80px;
        }

        .surah-title {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .reciter-name {
          font-size: 1.1rem;
          color: var(--accent-blue);
          font-weight: 500;
        }

        .radio-waves {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 4px;
          height: 20px;
          margin-top: 1rem;
        }

        .radio-waves span {
          width: 4px;
          background: var(--accent-blue);
          border-radius: 2px;
          animation: radioEq 1s ease-in-out infinite alternate;
        }

        .radio-waves span:nth-child(1) { height: 8px; animation-delay: 0s; }
        .radio-waves span:nth-child(2) { height: 16px; animation-delay: 0.2s; }
        .radio-waves span:nth-child(3) { height: 10px; animation-delay: 0.4s; }
        .radio-waves span:nth-child(4) { height: 20px; animation-delay: 0.1s; }
        .radio-waves span:nth-child(5) { height: 14px; animation-delay: 0.5s; }
        .radio-waves span:nth-child(6) { height: 8px; animation-delay: 0.3s; }
        .radio-waves span:nth-child(7) { height: 12px; animation-delay: 0.6s; }

        @keyframes radioEq {
          0% { height: 4px; }
          100% { height: 20px; }
        }

        /* Controls */
        .radio-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .radio-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .radio-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .play-btn {
          width: 70px;
          height: 70px;
          background: var(--accent-blue);
          color: #020617;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
        }

        .play-btn:hover {
          background: #7dd3fc;
          box-shadow: 0 0 30px rgba(56, 189, 248, 0.6);
        }

        .next-btn {
          width: 50px;
          height: 50px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(1.05); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
