"use client";

import React from "react";
import { X, Clock, Calendar, BarChart3, Trophy, Headphones } from "lucide-react";

interface StatsModalProps {
  totalSeconds: number;
  todaySeconds: number;
  onClose: () => void;
}

export default function StatsModal({ totalSeconds, todaySeconds, onClose }: StatsModalProps) {
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const getLevel = (totalSec: number) => {
    const minutes = totalSec / 60;
    if (minutes < 60) return { name: "Novice", icon: "🌱" };
    if (minutes < 600) return { name: "Fidèle", icon: "📖" };
    if (minutes < 3000) return { name: "Dévoué", icon: "✨" };
    return { name: "Maître", icon: "👑" };
  };

  const level = getLevel(totalSeconds);

  return (
    <div className="stats-overlay">
      <div className="stats-card glass-card">
        <button className="stats-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="stats-header">
          <div className="stats-icon-circle">
            <BarChart3 size={24} className="text-accent" />
          </div>
          <h2>Statistiques d'écoute</h2>
          <p>Suivez votre progression spirituelle</p>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">
              <Calendar size={14} />
              <span>Aujourd'hui</span>
            </div>
            <div className="stat-value">{formatTime(todaySeconds)}</div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{ width: `${Math.min(100, (todaySeconds / 3600) * 100)}%` }} />
            </div>
            <div className="stat-hint">Objectif: 1h / jour</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">
              <Clock size={14} />
              <span>Temps total</span>
            </div>
            <div className="stat-value">{formatTime(totalSeconds)}</div>
            <div className="stat-hint">Depuis votre première écoute</div>
          </div>
        </div>

        <div className="stats-footer">
          <div className="badge-section">
            <div className="badge-icon">{level.icon}</div>
            <div className="badge-info">
              <div className="badge-title">Rang: {level.name}</div>
              <div className="badge-desc">Continuez ainsi pour monter de niveau</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stats-overlay {
          position: fixed;
          inset: 0;
          z-index: 5000;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeIn 0.3s ease;
        }

        .stats-card {
          width: 100%;
          max-width: 450px;
          padding: 2.5rem 2rem;
          position: relative;
          text-align: center;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stats-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .stats-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .stats-header {
          margin-bottom: 2.5rem;
        }

        .stats-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }

        .stats-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
        }

        .stats-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          padding: 1.25rem;
          text-align: left;
        }

        .stat-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.75rem;
        }

        .stat-progress {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .stat-progress-bar {
          height: 100%;
          background: var(--accent-blue);
          box-shadow: 0 0 10px var(--accent-blue-glow);
          transition: width 0.5s ease;
        }

        .stat-hint {
          font-size: 0.7rem;
          color: var(--text-secondary);
          opacity: 0.7;
        }

        .stats-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 1.5rem;
        }

        .badge-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(129, 140, 248, 0.1));
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid rgba(56, 189, 248, 0.2);
        }

        .badge-icon {
          font-size: 2rem;
        }

        .badge-info {
          text-align: left;
        }

        .badge-title {
          font-weight: 700;
          color: var(--accent-blue);
          font-size: 0.95rem;
        }

        .badge-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .text-accent {
          color: var(--accent-blue);
        }
      `}</style>
    </div>
  );
}
