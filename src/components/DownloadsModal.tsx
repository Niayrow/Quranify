"use client";

import React from "react";
import { X, Play, Trash2, HardDrive, Mic, ChevronRight } from "lucide-react";
import { Surah, Reciter } from "@/types/quran";

interface DownloadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloads: { surahId: number, reciterId: number }[];
  surahs: Surah[];
  reciters: Reciter[];
  onPlay: (surah: Surah, reciter: Reciter) => void;
  onRemove: (surahId: number, reciterId: number) => void;
}

export default function DownloadsModal({ 
  isOpen, onClose, downloads, surahs, reciters, onPlay, onRemove 
}: DownloadsModalProps) {
  if (!isOpen) return null;

  // Group downloads by reciter
  const groupedDownloads = downloads.reduce((acc, download) => {
    const reciter = reciters.find(r => r.id === download.reciterId);
    if (!reciter) return acc;
    
    if (!acc[reciter.id]) {
      acc[reciter.id] = { reciter, items: [] };
    }
    
    const surah = surahs.find(s => s.id === download.surahId);
    if (surah) {
      acc[reciter.id].items.push(surah);
    }
    
    return acc;
  }, {} as Record<number, { reciter: Reciter, items: Surah[] }>);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title-group">
            <div className="header-icon-box">
              <HardDrive size={20} />
            </div>
            <div>
              <h2>Bibliothèque Hors-ligne</h2>
              <p className="subtitle">{downloads.length} sourates téléchargées</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {downloads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-circle">
                <HardDrive size={32} />
              </div>
              <h3>Aucun téléchargement</h3>
              <p>Les sourates que vous téléchargez pour une écoute hors-ligne apparaîtront ici.</p>
              <button className="browse-btn" onClick={onClose}>Parcourir le catalogue</button>
            </div>
          ) : (
            <div className="reciter-groups">
              {Object.values(groupedDownloads).map(({ reciter, items }) => (
                <div key={reciter.id} className="reciter-group">
                  <div className="reciter-group-header">
                    <div className="reciter-mini-avatar">
                      {reciter.image ? <img src={reciter.image} alt="" /> : <Mic size={14} />}
                    </div>
                    <span className="reciter-name">{reciter.name}</span>
                    <span className="items-count">{items.length} sourates</span>
                  </div>
                  
                  <div className="downloads-grid">
                    {items.map(surah => (
                      <div key={`${reciter.id}-${surah.id}`} className="download-item">
                        <div className="item-info" onClick={() => { onPlay(surah, reciter); onClose(); }}>
                          <span className="surah-num">{surah.id}</span>
                          <div className="surah-names">
                            <span className="surah-name">{surah.name_simple}</span>
                            <span className="surah-details">{surah.verses_count} versets</span>
                          </div>
                        </div>
                        
                        <div className="item-actions">
                          <button 
                            className="play-btn-mini" 
                            onClick={() => { onPlay(surah, reciter); onClose(); }}
                            title="Écouter"
                          >
                            <Play size={14} fill="currentColor" />
                          </button>
                          <button 
                            className="remove-btn-mini" 
                            onClick={() => onRemove(surah.id, reciter.id)}
                            title="Supprimer le téléchargement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 1rem;
          animation: fadeIn 0.3s ease-out;
        }

        .modal-content {
          background: #0f172a;
          width: 100%;
          max-width: 650px;
          max-height: 85vh;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon-box {
          width: 40px;
          height: 40px;
          background: rgba(56, 189, 248, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
        }

        h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .subtitle {
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 0;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: none;
          color: #94a3b8;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 1rem;
        }

        .empty-icon-circle {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          color: #475569;
        }

        h3 {
          font-size: 1.1rem;
          color: white;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #94a3b8;
          font-size: 0.9rem;
          max-width: 300px;
          margin: 0 auto 1.5rem;
        }

        .browse-btn {
          background: var(--accent-blue);
          color: #020617;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reciter-group {
          margin-bottom: 2rem;
        }

        .reciter-group:last-child {
          margin-bottom: 0;
        }

        .reciter-group-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .reciter-mini-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .reciter-mini-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .reciter-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--accent-blue);
          flex: 1;
        }

        .items-count {
          font-size: 0.7rem;
          color: #64748b;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.2rem 0.5rem;
          border-radius: 1rem;
        }

        .downloads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.75rem;
        }

        .download-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          transition: all 0.2s;
        }

        .download-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(56, 189, 248, 0.2);
          transform: translateY(-2px);
        }

        .item-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          cursor: pointer;
          min-width: 0;
        }

        .surah-num {
          font-size: 0.7rem;
          font-weight: 800;
          color: #475569;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 6px;
        }

        .surah-names {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .surah-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .surah-details {
          font-size: 0.7rem;
          color: #64748b;
        }

        .item-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .play-btn-mini {
          background: rgba(56, 189, 248, 0.1);
          border: none;
          color: var(--accent-blue);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .play-btn-mini:hover {
          background: var(--accent-blue);
          color: #020617;
          transform: scale(1.1);
        }

        .remove-btn-mini {
          background: transparent;
          border: none;
          color: #475569;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .remove-btn-mini:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        @media (max-width: 480px) {
          .modal-content {
            max-height: 90vh;
          }
          .downloads-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
