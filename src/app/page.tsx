"use client";

import React, { useEffect, useState, useRef } from "react";
import { Surah, Reciter } from "@/types/quran";
import SurahCard from "@/components/SurahCard";
import AudioPlayer from "@/components/AudioPlayer";
import ReciterSelect from "@/components/ReciterSelect";
import SurahReader from "@/components/SurahReader";
import { Search, Music2, Users, BookOpen, X, Mic, ChevronRight } from "lucide-react";
import { POPULAR_RECITERS } from "@/constants/reciters";

export default function Home() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [reciters] = useState<Reciter[]>(POPULAR_RECITERS);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(POPULAR_RECITERS[0]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isReciterOpen, setIsReciterOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerTime, setPlayerTime] = useState(0);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetch("https://api.quran.com/api/v4/chapters?language=fr")
      .then((res) => res.json())
      .then((data) => {
        setSurahs(data.chapters);
        setFilteredSurahs(data.chapters);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = surahs.filter(
      (s) =>
        s.name_simple.toLowerCase().includes(search.toLowerCase()) ||
        s.translated_name.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toString() === search
    );
    setFilteredSurahs(filtered);
  }, [search, surahs]);

  useEffect(() => {
    if (selectedSurah && selectedReciter) {
      updateAudio(selectedSurah, selectedReciter);
    }
  }, [selectedSurah, selectedReciter]);

  const updateAudio = (surah: Surah, reciter: Reciter) => {
    const paddedId = surah.id.toString().padStart(3, "0");
    const url = `${reciter.server}${paddedId}.mp3`;
    setAudioUrl(url);
    setIsPlaying(true);
  };
  const playerAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleSelectSurah = (surah: Surah) => {
    if (selectedSurah?.id === surah.id) {
      // Toggle play/pause on the same surah
      if (playerAudioRef.current) {
        if (isPlaying) {
          playerAudioRef.current.pause();
        } else {
          playerAudioRef.current.play().catch(() => {});
        }
      }
    } else {
      setSelectedSurah(surah);
    }
  };

  const handleNext = () => {
    if (!selectedSurah) return;
    const currentIndex = surahs.findIndex((s) => s.id === selectedSurah.id);
    if (currentIndex < surahs.length - 1) {
      handleSelectSurah(surahs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (!selectedSurah) return;
    const currentIndex = surahs.findIndex((s) => s.id === selectedSurah.id);
    if (currentIndex > 0) {
      handleSelectSurah(surahs[currentIndex - 1]);
    }
  };

  const handleVerseClick = (time: number) => {
    if (time === -1) {
      setSelectedSurah(null);
      setAudioUrl("");
      setIsPlaying(false);
      return;
    }
    if (playerAudioRef.current) {
      playerAudioRef.current.currentTime = time;
      playerAudioRef.current.play().catch(() => {});
    }
  };

  return (
    <main className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <BookOpen size={24} />
          </div>
          <h1>Quranify</h1>
        </div>
        
        <div className="search-wrap">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Sourate, nom ou numéro..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="view-toggle-wrap">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grille"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Liste compacte"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          </button>
        </div>
      </header>

      {/* Reciter selector */}
      <button 
        className={`reciter-selector ${selectedReciter.folder ? 'has-vbyv' : ''}`}
        onClick={() => setIsReciterOpen(true)}
      >
        <div className="reciter-sel-left">
          <div className="reciter-sel-icon">
            {selectedReciter.image ? (
              <img src={selectedReciter.image} alt="" className="sel-avatar-img" />
            ) : (
              <Mic size={18} />
            )}
            {selectedReciter.folder && (
              <div className="sync-badge-mini" title="Suivi de lecture disponible">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
              </div>
            )}
          </div>
          <div className="reciter-sel-info">
            <span className="reciter-sel-label">Récitateur</span>
            <span className="reciter-sel-name">{selectedReciter.name}</span>
          </div>
        </div>
        <div className="reciter-sel-action">
          <span>Changer</span>
          <ChevronRight size={16} />
        </div>
      </button>

      {/* Stats badges */}
      <div className="stats-bar">
        <div className="stat-badge">
          <BookOpen size={14} />
          <span><strong>{filteredSurahs.length}</strong> sourates</span>
        </div>
        <div className="stat-badge">
          <Mic size={14} />
          <span><strong>{reciters.length}</strong> récitateurs</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="pulse-ring" />
          <p>Chargement des sourates...</p>
        </div>
      ) : (
        <div className={`surah-list ${viewMode}`}>
          {filteredSurahs.map((surah) => (
            <SurahCard 
              key={surah.id} 
              surah={surah} 
              isSelected={selectedSurah?.id === surah.id}
              isPlaying={selectedSurah?.id === surah.id && isPlaying}
              onSelect={handleSelectSurah}
              compact={viewMode === 'list'}
            />
          ))}
        </div>
      )}

      {/* Player */}
      <AudioPlayer 
        audioUrl={audioUrl} 
        surahName={selectedSurah?.name_simple || ""}
        surahArabic={selectedSurah?.name_arabic || ""}
        reciterName={selectedReciter?.name || ""}
        reciterImage={selectedReciter?.image}
        surahNumber={selectedSurah?.id}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onPlayStateChange={setIsPlaying}
        onTimeUpdate={setPlayerTime}
        audioRef={playerAudioRef}
        onOpenReader={() => setIsReaderOpen(true)}
      />



      {/* Reciter panel */}
      <ReciterSelect 
        reciters={reciters}
        selectedReciterId={selectedReciter?.id || 0}
        onSelect={setSelectedReciter}
        isOpen={isReciterOpen}
        onClose={() => setIsReciterOpen(false)}
      />

      {/* Surah Reader Modal */}
      {isReaderOpen && selectedSurah && (
        <div className="reader-modal-overlay">
          <div className="reader-modal-content">
            <SurahReader 
              surah={selectedSurah}
              reciter={selectedReciter}
              currentTime={playerTime}
              isPlaying={isPlaying}
              onVerseClick={(time) => {
                if (time === -1) {
                  setIsReaderOpen(false);
                } else {
                  handleVerseClick(time);
                }
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .app-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 6rem;
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-blue), #818cf8);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .logo h1 {
          font-size: 1.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent-blue), #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        /* Reciter selector */
        .reciter-selector {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(129, 140, 248, 0.06));
          border: 1px solid rgba(56, 189, 248, 0.15);
          cursor: pointer;
          transition: all 0.25s;
          margin-bottom: 1rem;
        }

        .reciter-selector:hover {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.14), rgba(129, 140, 248, 0.1));
          border-color: rgba(56, 189, 248, 0.35);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(56, 189, 248, 0.1);
        }

        .reciter-sel-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .reciter-selector.has-vbyv {
          border-color: rgba(34, 197, 94, 0.3);
          animation: pulse-selector-green 3s infinite;
        }

        @keyframes pulse-selector-green {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.05); border-color: rgba(34, 197, 94, 0.15); }
          50% { box-shadow: 0 0 12px 0 rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.35); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.05); border-color: rgba(34, 197, 94, 0.15); }
        }

        .reciter-sel-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(56, 189, 248, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-blue);
          overflow: hidden;
          position: relative;
          border: 1.5px solid rgba(255, 255, 255, 0.1);
        }

        .sync-badge-mini {
          position: absolute;
          bottom: -1px;
          right: -1px;
          width: 14px;
          height: 14px;
          background: var(--accent-blue);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
          border: 1.5px solid #020617;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .sel-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .reciter-sel-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .reciter-sel-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        .reciter-sel-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .reciter-sel-action {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.78rem;
          color: var(--accent-blue);
          font-weight: 600;
        }

        /* Search */
        .search-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 0.85rem;
          width: 100%;
          max-width: 340px;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        .search-wrap:focus-within {
          border-color: rgba(56, 189, 248, 0.3);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.08);
        }

        .search-wrap input {
          background: none;
          border: none;
          color: var(--text-primary);
          width: 100%;
          outline: none;
          font-size: 0.9rem;
        }

        .search-wrap input::placeholder {
          color: var(--text-secondary);
          opacity: 0.6;
        }

        .clear-search {
          color: var(--text-secondary);
          opacity: 0.6;
          transition: opacity 0.2s;
        }

        .clear-search:hover {
          opacity: 1;
        }

        /* Stats badges */
        .stats-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          padding: 0 0.25rem;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 2rem;
          font-size: 0.78rem;
          color: var(--text-secondary);
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .stat-badge strong {
          color: var(--accent-blue);
          font-weight: 700;
        }

        .view-toggle-wrap {
          display: flex;
          background: rgba(15, 23, 42, 0.4);
          padding: 3px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .view-btn {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          border: none;
        }

        .view-btn.active {
          background: rgba(56, 189, 248, 0.15);
          color: var(--accent-blue);
        }

        .view-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Lists */
        .surah-list {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .surah-list.grid {
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }

        .surah-list.list {
          grid-template-columns: 1fr;
          gap: 0.35rem;
        }

        /* Loading */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          height: 50vh;
        }

        .loading-state p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .pulse-ring {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(56, 189, 248, 0.1);
          border-top-color: var(--accent-blue);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Reader Modal */
        .reader-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #020617;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          overflow: hidden;
        }

        .reader-modal-content {
          width: 100vw;
          height: 100vh;
          background: #0f172a;
          position: relative;
          transform-origin: center center;
          animation: bookOpen 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          box-shadow: 0 0 100px rgba(0,0,0,0.5);
        }

        .reader-modal-overlay.closing .reader-modal-content {
          animation: bookClose 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes bookOpen {
          0% { 
            transform: scale(0.3) rotateY(-45deg); 
            opacity: 0;
            border-radius: 2rem;
          }
          100% { 
            transform: scale(1) rotateY(0); 
            opacity: 1;
            border-radius: 0;
          }
        }

        @keyframes bookClose {
          0% { 
            transform: scale(1) rotateY(0); 
            opacity: 1;
            border-radius: 0;
          }
          100% { 
            transform: scale(0.3) rotateY(45deg); 
            opacity: 0;
            border-radius: 2rem;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 640px) {
          .app-container {
            padding: 1rem 1rem 7rem;
          }
          .header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .search-wrap {
            max-width: 100%;
          }
          .logo h1 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </main>
  );
}
