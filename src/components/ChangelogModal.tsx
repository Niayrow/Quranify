import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, History, CheckCircle2, ChevronRight } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPDATES = [
  {
    version: "v1.2.0",
    date: "Mai 2026",
    title: "Bibliothèque & Hors-ligne",
    items: [
      "Nouvelle bibliothèque hors-ligne pour gérer vos téléchargements",
      "Téléchargement par récitateur pour une gestion plus fine",
      "Suivi de progression du téléchargement en temps réel",
      "Amélioration de la fiabilité PWA (accès offline instantané)",
      "Mode recherche robuste même sans connexion"
    ],
    highlight: true
  },
  {
    version: "v1.1.5",
    date: "Avril 2026",
    title: "Expérience Utilisateur",
    items: [
      "Nouveau tutoriel de bienvenue pour les nouveaux utilisateurs",
      "Correction des bugs d'affichage au chargement (FOUC)",
      "Optimisation des performances de rendu sur mobile"
    ]
  },
  {
    version: "v1.1.0",
    date: "Mars 2026",
    title: "Intelligence & Ambiance",
    items: [
      "Recherche vocale intelligente (Dites 'Sourate Al-Mulk')",
      "Thèmes dynamiques : Nuit étoilée, Désert Brûlant, Brume de Montagne",
      "Radio Coran 24/7 avec sélection de récitateurs aléatoires",
      "Statistiques d'écoute détaillées et historique"
    ]
  },
  {
    version: "v1.0.0",
    date: "Février 2026",
    title: "Lancement de Quranify",
    items: [
      "Lecture synchronisée verset par verset avec traduction",
      "Plus de 20 récitateurs de renommée mondiale",
      "Système de favoris et reprise de session automatique",
      "Interface premium avec mode sombre natif"
    ]
  }
];

export default function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="changelog-overlay" onClick={onClose}>
      <div className="changelog-modal" onClick={(e) => e.stopPropagation()}>
        <header className="changelog-header">
          <div className="header-left">
            <div className="history-icon">
              <History size={20} />
            </div>
            <div>
              <h2>Historique des mises à jour</h2>
              <p>Découvrez les dernières nouveautés de Quranify</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="changelog-scroll">
          {UPDATES.map((update, idx) => (
            <div key={update.version} className={`update-entry ${update.highlight ? 'featured' : ''}`}>
              <div className="version-badge-wrap">
                <span className="version-badge">{update.version}</span>
                <span className="version-date">{update.date}</span>
                {update.highlight && <span className="new-badge"><Sparkles size={10} /> Nouveau</span>}
              </div>
              
              <h3 className="update-title">{update.title}</h3>
              
              <ul className="update-list">
                {update.items.map((item, i) => (
                  <li key={i}>
                    <CheckCircle2 size={14} className="check-icon" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              
              {idx !== UPDATES.length - 1 && <div className="divider" />}
            </div>
          ))}
        </div>

        <footer className="changelog-footer">
          <p>Vous avez une suggestion ? <a href="https://sofianeweb.fr" target="_blank" rel="noopener noreferrer">Contactez-nous</a></p>
          <button className="done-btn" onClick={onClose}>Fermer</button>
        </footer>
      </div>

      <style jsx>{`
        .changelog-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5000;
          animation: fadeIn 0.3s ease;
          padding: 1.5rem;
        }

        .changelog-modal {
          width: 100%;
          max-width: 550px;
          max-height: 85vh;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .changelog-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(2, 6, 23, 0.2);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .history-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
        }

        .changelog-header h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin: 0;
        }

        .changelog-header p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .close-btn {
          color: var(--text-secondary);
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .changelog-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .update-entry {
          position: relative;
        }

        .version-badge-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .version-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: white;
        }

        .version-date {
          font-size: 0.75rem;
          color: var(--text-secondary);
          opacity: 0.7;
        }

        .new-badge {
          font-size: 0.65rem;
          font-weight: 700;
          background: var(--accent-blue);
          color: #020617;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          text-transform: uppercase;
        }

        .featured .update-title {
          color: var(--accent-blue);
        }

        .update-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }

        .update-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .update-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .check-icon {
          color: var(--accent-blue);
          margin-top: 0.15rem;
          flex-shrink: 0;
          opacity: 0.8;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 100%);
          margin-top: 2rem;
        }

        .changelog-footer {
          padding: 1.25rem 1.5rem;
          background: rgba(2, 6, 23, 0.2);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .changelog-footer p {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .changelog-footer a {
          color: var(--accent-blue);
          text-decoration: none;
        }

        .done-btn {
          padding: 0.6rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .done-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Custom scrollbar for the modal */
        .changelog-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .changelog-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .changelog-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>,
    document.body
  );
}
