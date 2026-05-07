import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, Sparkles, Mic2, Download, BookOpen, Radio, Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: "Bienvenue sur Quranify",
    description: "Une expérience Coranique premium. Écoutez, lisez et méditez dans un environnement sans distraction et visuellement apaisant.",
    icon: Sparkles,
    color: "var(--accent-blue)"
  },
  {
    title: "Changez de Récitateur",
    description: "Plus de 20 voix exceptionnelles (Sudais, Alafasy, Dosari...). Changez à tout moment via le bouton en haut à gauche.",
    icon: Mic2,
    color: "#f43f5e" // rose
  },
  {
    title: "Mode Hors-Ligne",
    description: "Faites un clic droit (ou un appui long sur mobile) sur une sourate pour la télécharger. Écoutez partout, même sans internet.",
    icon: Download,
    color: "#10b981" // emerald
  },
  {
    title: "Lecture Synchronisée",
    description: "Ouvrez le mode lecteur pour suivre la récitation verset par verset, avec traduction en temps réel. Idéal pour l'apprentissage.",
    icon: BookOpen,
    color: "#f59e0b" // amber
  },
  {
    title: "Radio & Personnalisation",
    description: "Profitez de la radio 24/7 en continu et personnalisez votre thème en bas de l'écran. Votre expérience est unique.",
    icon: Radio,
    color: "#8b5cf6" // violet
  }
];

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
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

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const CurrentIcon = STEPS[currentStep].icon;

  return createPortal(
    <div className="onboarding-overlay">
      <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Skip button */}
        <button className="skip-btn" onClick={onClose}>
          Passer <X size={14} />
        </button>

        {/* Dynamic Background Glow based on current step */}
        <div 
          className="step-glow" 
          style={{ background: STEPS[currentStep].color }}
        />

        {/* Content */}
        <div className="onboarding-content">
          <div 
            className="icon-wrapper"
            style={{ color: STEPS[currentStep].color }}
          >
            <CurrentIcon size={48} strokeWidth={1.5} />
          </div>
          
          <div className="text-content">
            <h2 className="step-title">{STEPS[currentStep].title}</h2>
            <p className="step-description">{STEPS[currentStep].description}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="onboarding-controls">
          {/* Dots */}
          <div className="dots-container">
            {STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`dot ${idx === currentStep ? 'active' : ''}`}
                style={{ backgroundColor: idx === currentStep ? STEPS[currentStep].color : undefined }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="nav-buttons">
            <button 
              className={`btn-prev ${currentStep === 0 ? 'hidden' : ''}`}
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft size={18} />
              Précédent
            </button>
            
            <button 
              className="btn-next"
              onClick={nextStep}
              style={{ backgroundColor: STEPS[currentStep].color }}
            >
              {currentStep === STEPS.length - 1 ? (
                <>Terminer <Check size={18} /></>
              ) : (
                <>Suivant <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .onboarding-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease;
          padding: 1rem;
        }

        .onboarding-modal {
          width: 100%;
          max-width: 450px;
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .step-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          opacity: 0.15;
          filter: blur(80px);
          pointer-events: none;
          transition: background 0.5s ease;
          z-index: 0;
        }

        .skip-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.4rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
        }

        .skip-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .onboarding-content {
          padding: 4rem 2rem 2rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 1;
          min-height: 280px;
        }

        .icon-wrapper {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          animation: float 3s ease-in-out infinite;
        }

        .text-content {
          animation: contentFade 0.4s ease;
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
          letter-spacing: -0.5px;
        }

        .step-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .onboarding-controls {
          padding: 1.5rem 2rem;
          background: rgba(2, 6, 23, 0.4);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .dots-container {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .dot.active {
          width: 24px;
        }

        .nav-buttons {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-prev {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0.5rem;
        }

        .btn-prev:hover {
          color: white;
        }

        .btn-prev.hidden {
          visibility: hidden;
        }

        .btn-next {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
          color: white;
          font-size: 0.95rem;
          font-weight: 600;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .btn-next:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes contentFade {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>,
    document.body
  );
}
