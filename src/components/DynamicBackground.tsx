"use client";

import React, { useEffect, useState } from "react";

export type ThemeType = "classic" | "starry" | "desert" | "mist";

interface Props {
  theme: ThemeType;
}

export default function DynamicBackground({ theme }: Props) {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Mettre à jour les variables CSS globales
    const root = document.documentElement;
    if (theme === "classic") {
      root.style.setProperty("--bg-primary", "#020617");
      root.style.setProperty("--bg-secondary", "#0f172a");
      root.style.setProperty("--accent-blue", "#38bdf8");
      root.style.setProperty("--accent-blue-glow", "rgba(56, 189, 248, 0.3)");
    } else if (theme === "starry") {
      root.style.setProperty("--bg-primary", "#090014");
      root.style.setProperty("--bg-secondary", "#1a0b2e");
      root.style.setProperty("--accent-blue", "#a855f7");
      root.style.setProperty("--accent-blue-glow", "rgba(168, 85, 247, 0.3)");
    } else if (theme === "desert") {
      root.style.setProperty("--bg-primary", "#1c0a00");
      root.style.setProperty("--bg-secondary", "#331800");
      root.style.setProperty("--accent-blue", "#f97316");
      root.style.setProperty("--accent-blue-glow", "rgba(249, 115, 22, 0.3)");
    } else if (theme === "mist") {
      root.style.setProperty("--bg-primary", "#001a18");
      root.style.setProperty("--bg-secondary", "#00332f");
      root.style.setProperty("--accent-blue", "#14b8a6");
      root.style.setProperty("--accent-blue-glow", "rgba(20, 184, 166, 0.3)");
    }

    // Générer les particules
    const p = [];
    let count = 0;
    if (theme === "starry") count = 70;
    if (theme === "desert") count = 40;
    if (theme === "mist") count = 6;

    for (let i = 0; i < count; i++) {
      p.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: theme === "mist" ? Math.random() * 400 + 200 : Math.random() * 3 + 1,
        duration: theme === "starry" ? Math.random() * 3 + 2 : Math.random() * 30 + 15,
        delay: Math.random() * -30,
      });
    }
    setParticles(p);
  }, [theme]);

  return (
    <div className={`dynamic-bg ${theme}`}>
      <div className="bg-gradient-overlay" />
      {particles.map(p => (
        <div
          key={p.id}
          className={`bg-particle particle-${theme}`}
          style={{
            left: theme === "desert" ? `${-10 + Math.random() * 20}%` : `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        .dynamic-bg {
          position: fixed;
          inset: 0;
          z-index: -10;
          pointer-events: none;
          overflow: hidden;
          background: var(--bg-primary);
          transition: background 1.5s ease;
        }

        .bg-gradient-overlay {
          position: absolute;
          inset: 0;
          opacity: 0.5;
          transition: background 1.5s ease;
        }

        /* Classic */
        .dynamic-bg.classic .bg-gradient-overlay {
          background: 
            radial-gradient(circle at 0% 0%, rgba(56, 189, 248, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(30, 58, 138, 0.3) 0%, transparent 50%);
        }

        /* Starry Night */
        .dynamic-bg.starry .bg-gradient-overlay {
          background: radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 70%);
        }
        .particle-starry {
          position: absolute;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 6px white, 0 0 10px var(--accent-blue);
          animation: twinkle linear infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.5); }
        }

        /* Desert Dusk */
        .dynamic-bg.desert .bg-gradient-overlay {
          background: linear-gradient(180deg, rgba(249, 115, 22, 0.1) 0%, transparent 100%);
        }
        .particle-desert {
          position: absolute;
          background: rgba(249, 115, 22, 0.6);
          border-radius: 50%;
          animation: driftHorizontal linear infinite;
          filter: blur(1px);
        }
        @keyframes driftHorizontal {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translate(110vw, -20vh); opacity: 0; }
        }

        /* Mountain Mist */
        .dynamic-bg.mist .bg-gradient-overlay {
          background: linear-gradient(180deg, rgba(20, 184, 166, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
        }
        .particle-mist {
          position: absolute;
          background: rgba(20, 184, 166, 0.08);
          border-radius: 50%;
          filter: blur(60px);
          animation: floatMist ease-in-out infinite alternate;
        }
        @keyframes floatMist {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(100px, -80px) scale(1.3); }
        }
      `}</style>
    </div>
  );
}
