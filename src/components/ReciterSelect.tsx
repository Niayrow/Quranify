"use client";

import React, { useState } from "react";
import { Reciter } from "@/types/quran";
import { User, Check, Search, X } from "lucide-react";

interface ReciterSelectProps {
  reciters: Reciter[];
  selectedReciterId: number;
  onSelect: (reciter: Reciter) => void;
  isOpen: boolean;
  onClose: () => void;
}

function ReciterCard({ reciter, isActive, onSelect }: { reciter: Reciter, isActive: boolean, onSelect: () => void }) {
  return (
    <div
      className={`reciter-card ${isActive ? 'active' : ''} ${reciter.folder ? 'has-vbyv' : ''}`}
      onClick={onSelect}
    >
      <div className="reciter-avatar">
        {reciter.image ? (
          <img src={reciter.image} alt={reciter.name} className="avatar-img" />
        ) : (
          <User size={22} />
        )}
        {reciter.folder && (
          <div className="sync-badge" title="Suivi de lecture disponible">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          </div>
        )}
      </div>
      <div className="reciter-details">
        <span className="reciter-name">{reciter.name}</span>
        <span className="reciter-style">{reciter.style}</span>
      </div>
      {isActive && (
        <div className="check-icon">
          <Check size={18} />
        </div>
      )}

      <style jsx>{`
        .reciter-card {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          border-radius: 0.85rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(255, 255, 255, 0.02);
          position: relative;
          user-select: none;
        }

        .reciter-card.has-vbyv {
          border-color: rgba(34, 197, 94, 0.2);
          animation: pulse-card-green 3s infinite;
        }

        @keyframes pulse-card-green {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.05); border-color: rgba(34, 197, 94, 0.15); }
          50% { box-shadow: 0 0 15px 0 rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.4); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.05); border-color: rgba(34, 197, 94, 0.15); }
        }

        .reciter-card:hover {
          background: rgba(56, 189, 248, 0.06);
          border-color: rgba(56, 189, 248, 0.12);
        }

        .reciter-card.active {
          background: rgba(56, 189, 248, 0.1);
          border-color: rgba(56, 189, 248, 0.3);
        }

        .reciter-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #38bdf8;
          flex-shrink: 0;
          position: relative;
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
          overflow: hidden;
        }

        .sync-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 18px;
          height: 18px;
          background: #38bdf8;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
          border: 2px solid #0f172a;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .reciter-card.active .reciter-avatar {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.3);
          color: #38bdf8;
        }

        .reciter-details {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }

        .reciter-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .reciter-card.active .reciter-name {
          color: #38bdf8;
        }

        .reciter-style {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 1px;
        }

        .check-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #38bdf8;
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export default function ReciterSelect({ reciters, selectedReciterId, onSelect, isOpen, onClose }: ReciterSelectProps) {
  const [search, setSearch] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen && !isClosing) return null;

  const filtered = reciters.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.style.toLowerCase().includes(search.toLowerCase())
  );

  const syncReciters = filtered.filter(r => r.folder);
  const otherReciters = filtered.filter(r => !r.folder);

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      setSearch("");
    }, 350);
  };

  const handleSelect = (reciter: Reciter) => {
    onSelect(reciter);
    triggerClose();
  };

  return (
    <div className={`reciter-fullscreen ${isClosing ? 'closing' : ''}`}>
      {/* Header */}
      <div className="reciter-top">
        <div className="reciter-top-bar">
          <div className="reciter-title-wrap">
            <img src="/logo.png" alt="" className="reciter-logo-mini" />
            <div>
              <h2>Récitateurs</h2>
              <p className="reciter-count">{reciters.length} disponibles</p>
            </div>
          </div>
          <button onClick={triggerClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="reciter-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher un récitateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-btn" onClick={() => setSearch("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="reciter-legend">
          <div className="legend-item">
            <div className="legend-pulse" />
            <span>Suivi verset par verset disponible</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="reciter-scroll-area">
        {syncReciters.length > 0 && (
          <div className="reciter-section">
            <h3 className="section-title premium">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              Suivi Verset par Verset
            </h3>
            <div className="reciter-grid">
              {syncReciters.map((reciter) => (
                <ReciterCard 
                  key={reciter.id} 
                  reciter={reciter} 
                  isActive={selectedReciterId === reciter.id} 
                  onSelect={() => handleSelect(reciter)} 
                />
              ))}
            </div>
          </div>
        )}

        {otherReciters.length > 0 && (
          <div className="reciter-section">
            <h3 className="section-title">Autres Récitateurs</h3>
            <div className="reciter-grid">
              {otherReciters.map((reciter) => (
                <ReciterCard 
                  key={reciter.id} 
                  reciter={reciter} 
                  isActive={selectedReciterId === reciter.id} 
                  onSelect={() => handleSelect(reciter)} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .reciter-fullscreen {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: #020617;
          background-image:
            radial-gradient(circle at 20% 0%, rgba(56, 189, 248, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 100%, rgba(129, 140, 248, 0.1) 0%, transparent 50%);
          display: flex;
          flex-direction: column;
          animation: slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: hidden;
        }

        .reciter-fullscreen.closing {
          animation: slideUp 0.35s cubic-bezier(0.7, 0, 0.84, 0) forwards;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }

        /* Header */
        .reciter-top {
          padding: 1.5rem 2rem 1rem;
          flex-shrink: 0;
        }

        .reciter-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }

        .reciter-top-bar h2 {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #38bdf8, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .reciter-title-wrap {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .reciter-logo-mini {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .reciter-count {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.2rem;
        }

        .close-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        /* Search */
        .reciter-search {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 0.85rem;
          color: #94a3b8;
          transition: all 0.2s;
        }

        .reciter-search:focus-within {
          border-color: rgba(56, 189, 248, 0.3);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
        }

        .reciter-search input {
          flex: 1;
          background: none;
          border: none;
          color: white;
          font-size: 0.9rem;
          outline: none;
        }

        .reciter-search input::placeholder {
          color: #94a3b8;
          opacity: 0.6;
        }

        .clear-btn {
          color: #94a3b8;
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .clear-btn:hover {
          opacity: 1;
        }

        .reciter-legend {
          padding: 0.5rem 1rem 0;
          display: flex;
          justify-content: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 2rem;
          font-size: 0.75rem;
          color: #4ade80;
          font-weight: 500;
        }

        .legend-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
          animation: legend-pulse-anim 1.5s infinite;
        }

        @keyframes legend-pulse-anim {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        /* Grid & Sections */
        .reciter-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 2rem 5rem;
        }

        .reciter-section {
          margin-bottom: 2.5rem;
        }

        .section-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: #94a3b8;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .section-title.premium {
          color: #38bdf8;
        }

        .reciter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          align-content: start;
        }

        @media (max-width: 640px) {
          .reciter-top {
            padding: 1.25rem 1.25rem 0.75rem;
          }

          .reciter-top-bar h2 {
            font-size: 1.4rem;
          }

          .reciter-grid {
            grid-template-columns: 1fr;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
