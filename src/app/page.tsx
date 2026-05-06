"use client";

import React, { useEffect, useState, useRef } from "react";
import { Surah, Reciter } from "@/types/quran";
import SurahCard from "@/components/SurahCard";
import AudioPlayer from "@/components/AudioPlayer";
import ReciterSelect from "@/components/ReciterSelect";
import SurahReader from "@/components/SurahReader";
import RadioMode from "@/components/RadioMode";
import DynamicBackground, { ThemeType } from "@/components/DynamicBackground";
import StatsModal from "@/components/StatsModal";
import { Search, Music2, Users, BookOpen, X, Mic, ChevronRight, Heart, Play, Shuffle, Volume2, MicOff, Radio, Palette, Activity } from "lucide-react";





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
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [lastSession, setLastSession] = useState<{ surahId: number, reciterId: number, time: number } | null>(null);
  const [isLoopingVerse, setIsLoopingVerse] = useState(false);

  // Stats State
  const [listeningStats, setListeningStats] = useState({ total: 0, today: 0 });
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Radio Settings
  const [radioReciterIds, setRadioReciterIds] = useState<number[]>([]);
  const [radioScope, setRadioScope] = useState<'all' | 'juz_amma'>('all');

  // History State
  const [history, setHistory] = useState<{ surahId: number, reciterId: number }[]>([]);




  const [loopVerseNum, setLoopVerseNum] = useState<number | null>(null);

  // Voice Search State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  // Radio State
  const [isRadioMode, setIsRadioMode] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<ThemeType>("classic");

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Offline/Download State
  const [isOnline, setIsOnline] = useState(true);
  const [downloadedIds, setDownloadedIds] = useState<number[]>([]);






  useEffect(() => {
    fetch("https://api.quran.com/api/v4/chapters?language=fr")
      .then((res) => res.json())
      .then((data) => {
        setSurahs(data.chapters);
        setFilteredSurahs(data.chapters);
        setLoading(false);
      });

    // Load favorites
    const savedFavs = localStorage.getItem("quranify_favs");
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }

    // Load last session
    const savedSession = localStorage.getItem("quranify_last_session");
    if (savedSession) {
      try { setLastSession(JSON.parse(savedSession)); } catch (e) {}
    }

    // Load saved reciter
    const savedReciterId = localStorage.getItem("quranify_reciter_id");
    if (savedReciterId) {
      const reciter = reciters.find(r => r.id === parseInt(savedReciterId));
      if (reciter) setSelectedReciter(reciter);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem("quranify_theme") as ThemeType;
    if (savedTheme) setTheme(savedTheme);

    // Load listening stats
    const totalSec = parseInt(localStorage.getItem("quranify_total_sec") || "0");
    const todayKey = new Date().toISOString().split('T')[0];
    const todaySec = parseInt(localStorage.getItem(`quranify_stats_${todayKey}`) || "0");
    setListeningStats({ total: totalSec, today: todaySec });

    // Load radio reciters
    const savedRadioReciters = localStorage.getItem("quranify_radio_reciters");
    if (savedRadioReciters) {
      try { setRadioReciterIds(JSON.parse(savedRadioReciters)); } catch (e) {}
    } else {
      setRadioReciterIds(POPULAR_RECITERS.map(r => r.id));
    }

    const savedScope = localStorage.getItem("quranify_radio_scope") as 'all' | 'juz_amma';
    if (savedScope) setRadioScope(savedScope);

    // Load history
    const savedHistory = localStorage.getItem("quranify_history");
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }

    // Register SW with forced update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.update(); // Force check for new SW version
      }).catch(() => {});
    }


    // Handle PWA Install
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });

    // Handle Online/Offline
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Load downloads metadata
    const savedDownloads = localStorage.getItem("quranify_downloads");
    if (savedDownloads) {
      try { setDownloadedIds(JSON.parse(savedDownloads)); } catch (e) {}
    }
  }, []);








  useEffect(() => {
    const filtered = surahs.filter(
      (s) => {
        // If offline, only show downloaded
        if (!isOnline && !downloadedIds.includes(s.id)) return false;

        const matchesSearch = s.name_simple.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toString() === search;
        const matchesFavorite = showOnlyFavorites ? favorites.includes(s.id) : true;
        return matchesSearch && matchesFavorite;
      }
    );
    setFilteredSurahs(filtered);
  }, [search, surahs, favorites, showOnlyFavorites, isOnline, downloadedIds]);

  // We call updateAudio directly in selectors now for speed

  // Listening Time Tracker
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setListeningStats(prev => {
          const newToday = prev.today + 1;
          const newTotal = prev.total + 1;
          
          // Save periodically to localStorage every 10 seconds
          if (newToday % 10 === 0) {
            const todayKey = new Date().toISOString().split('T')[0];
            localStorage.setItem("quranify_total_sec", newTotal.toString());
            localStorage.setItem(`quranify_stats_${todayKey}`, newToday.toString());
          }
          
          return { total: newTotal, today: newToday };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);


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
      updateAudio(surah, selectedReciter);
      
      // Update history
      setHistory(prev => {
        const newItem = { surahId: surah.id, reciterId: selectedReciter.id };
        // Remove duplicate if exists
        const filtered = prev.filter(item => !(item.surahId === surah.id && item.reciterId === selectedReciter.id));
        const newHistory = [newItem, ...filtered].slice(0, 10); // Keep last 10
        localStorage.setItem("quranify_history", JSON.stringify(newHistory));
        return newHistory;
      });
    }
  };


  const handleNext = () => {
    if (isRadioMode) {
      handleRadioNext();
      return;
    }
    if (!selectedSurah) return;
    const currentIndex = surahs.findIndex((s) => s.id === selectedSurah.id);
    if (currentIndex < surahs.length - 1) {
      const nextSurah = surahs[currentIndex + 1];
      setSelectedSurah(nextSurah);
      updateAudio(nextSurah, selectedReciter);
    }
  };

  const handleRadioNext = () => {
    if (surahs.length === 0) return;
    
    // Pick from allowed reciters
    const allowedReciters = reciters.filter(r => radioReciterIds.includes(r.id));
    const pool = allowedReciters.length > 0 ? allowedReciters : reciters;
    
    const randomReciterIndex = Math.floor(Math.random() * pool.length);
    setSelectedReciter(pool[randomReciterIndex]);

    // Respect the selected scope
    let targetSurahs = radioScope === 'juz_amma' ? surahs.filter(s => s.id >= 78) : surahs;
    
    // Fallback just in case
    if (targetSurahs.length === 0) targetSurahs = surahs;

    const randomSurahIndex = Math.floor(Math.random() * targetSurahs.length);
    handleSelectSurah(targetSurahs[randomSurahIndex]);
  };


  const toggleRadioReciter = (id: number) => {
    setRadioReciterIds(prev => {
      const newVal = prev.includes(id) 
        ? prev.filter(rid => rid !== id) 
        : [...prev, id];
      localStorage.setItem("quranify_radio_reciters", JSON.stringify(newVal));
      return newVal;
    });
  };

  const handleSetRadioScope = (scope: 'all' | 'juz_amma') => {
    setRadioScope(scope);
    localStorage.setItem("quranify_radio_scope", scope);
  };

  const handleSelectAllRadio = () => {

    const allIds = reciters.map(r => r.id);
    setRadioReciterIds(allIds);
    localStorage.setItem("quranify_radio_reciters", JSON.stringify(allIds));
  };

  const handleDeselectAllRadio = () => {
    setRadioReciterIds([]);
    localStorage.setItem("quranify_radio_reciters", JSON.stringify([]));
  };




  const handlePrevious = () => {
    if (!selectedSurah) return;
    const currentIndex = surahs.findIndex((s) => s.id === selectedSurah.id);
    if (currentIndex > 0) {
      const prevSurah = surahs[currentIndex - 1];
      setSelectedSurah(prevSurah);
      updateAudio(prevSurah, selectedReciter);
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

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("quranify_favs", JSON.stringify(next));
      return next;
    });
  };

  const saveSession = (time: number) => {
    if (selectedSurah && selectedReciter) {
      const session = {
        surahId: selectedSurah.id,
        reciterId: selectedReciter.id,
        time: time
      };
      localStorage.setItem("quranify_last_session", JSON.stringify(session));
    }
  };

  const handleResume = () => {
    if (!lastSession) return;
    const surah = surahs.find(s => s.id === lastSession.surahId);
    const reciter = reciters.find(r => r.id === lastSession.reciterId);
    if (surah && reciter) {
      setSelectedReciter(reciter);
      setSelectedSurah(surah);
      // We need to wait for audio to load then seek
      setTimeout(() => {
        if (playerAudioRef.current) {
          playerAudioRef.current.currentTime = lastSession.time;
          playerAudioRef.current.play().catch(() => {});
        }
      }, 500);
      setLastSession(null); // Clear after resume
    }
  };

  const handleReciterSelect = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    localStorage.setItem("quranify_reciter_id", reciter.id.toString());
  };

  const handleRandom = () => {
    if (surahs.length === 0) return;
    const randomIndex = Math.floor(Math.random() * surahs.length);
    handleSelectSurah(surahs[randomIndex]);
  };

  const handleToggleLoop = (verseNum: number | null) => {
    if (verseNum === null) {
      setIsLoopingVerse(!isLoopingVerse);
      if (isLoopingVerse) setLoopVerseNum(null);
    } else {
      setLoopVerseNum(verseNum);
      setIsLoopingVerse(true);
    }
  };

  // Voice Search Logic
  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript("");
      setVoiceFeedback(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      finalTranscript = transcript;
      setVoiceTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      processVoiceCommand(finalTranscript);
    };

    recognition.start();
  };

  const processVoiceCommand = (rawCommand: string) => {
    const command = rawCommand.toLowerCase().trim();
    if (!command) return;

    // Normalize strings to ignore accents, hyphens, and apostrophes
    const normalize = (str: string) => str.toLowerCase().replace(/[-']/g, ' ').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedCommand = normalize(command);

    // Search for Surahs
    const foundSurah = surahs.find(s => {
      const name = normalize(s.name_simple);
      const nameNoAl = name.replace(/^al\s+/, '');
      return normalizedCommand.includes(name) || 
             normalizedCommand.includes(nameNoAl) ||
             (normalizedCommand.includes("sourate") && normalizedCommand.includes(s.id.toString()));
    });

    if (foundSurah) {
      setVoiceFeedback(`Lancement de la sourate ${foundSurah.name_simple}...`);
      handleSelectSurah(foundSurah);
      return;
    }

    // Search for Reciters
    const foundReciter = reciters.find(r => {
      const name = normalize(r.name);
      const parts = name.split(' ');
      // Match if the spoken text contains any significant part of the reciter's name (e.g., "husary", "sudais")
      const hasMatch = parts.some(p => p.length > 3 && normalizedCommand.includes(p)) || normalizedCommand.includes(name);
      return hasMatch;
    });

    if (foundReciter) {
      setVoiceFeedback(`Sélection du récitateur ${foundReciter.name}...`);
      handleReciterSelect(foundReciter);
      return;
    }

    setVoiceFeedback(`Je n'ai pas trouvé de résultat pour: "${rawCommand}"`);
    setTimeout(() => setVoiceFeedback(null), 4000);
  };

  const cycleTheme = () => {
    const themes: ThemeType[] = ["classic", "starry", "desert", "mist"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    localStorage.setItem("quranify_theme", nextTheme);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    }
  };

  const handleDownloadSurah = async (surahId: number) => {
    try {
      const url = `${selectedReciter.server}${surahId.toString().padStart(3, '0')}.mp3`;
      const cache = await caches.open('quranify-audio');
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      await cache.put(url, response);
      
      setDownloadedIds(prev => {
        if (prev.includes(surahId)) return prev;
        const next = [...prev, surahId];
        localStorage.setItem("quranify_downloads", JSON.stringify(next));
        return next;
      });
    } catch (e) {
      console.error("Download failed", e);
      alert("Erreur lors du téléchargement. Veuillez vérifier votre connexion.");
    }
  };



  return (
    <main className="app-container">
      <DynamicBackground theme={theme} />
      {/* Header */}
      <header className="header">
        <div className="header-top">
          <div className="logo-group">
            <div className="logo">
              <h1>Quranify</h1>
            </div>
            {showInstallBtn && (
              <button className="install-btn" onClick={handleInstallClick}>
                Installer l'app
              </button>
            )}
          </div>

          
          <div className="search-wrap">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={isOnline ? "Sourate, nom ou numéro..." : "Recherche hors ligne..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {!isOnline && (
              <div className="offline-badge" title="Vous êtes hors ligne">
                MODE HORS LIGNE
              </div>
            )}
            <button 
              className={`voice-search-btn ${isListening ? 'active' : ''}`}
              onClick={startVoiceSearch}
              title="Recherche vocale"
            >
              <Mic size={18} />
            </button>
            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="header-actions">
          <button 
            className={`header-action-btn ${isRadioMode ? 'active-radio' : ''}`}
            onClick={() => {
              if (!isRadioMode) {
                if (!isPlaying && surahs.length > 0) {
                  handleRadioNext(); // Start immediately if not playing
                }
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
                setIsRadioMode(true);
              } else {
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                }
                setIsRadioMode(false);
              }
            }}
            title="Mode Radio Coran"
          >
            <Radio size={18} className={isRadioMode ? "radio-icon-anim" : ""} />
            <span className="hidden sm:inline">Radio</span>
          </button>

          <button 
            className="header-action-btn"
            onClick={cycleTheme}
            title="Changer de thème atmosphérique"
          >
            <Palette size={18} />
            <span className="hidden sm:inline">
              {theme === 'classic' && 'Classique'}
              {theme === 'starry' && 'Nuit'}
              {theme === 'desert' && 'Désert'}
              {theme === 'mist' && 'Brume'}
            </span>
          </button>

          <button 
            className="header-action-btn"
            onClick={handleRandom}
            title="Sourate aléatoire"
          >
            <Shuffle size={18} />
            <span className="hidden sm:inline">Hasard</span>
          </button>

          <button 
            className={`fav-toggle-btn ${showOnlyFavorites ? 'active' : ''}`}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            title={showOnlyFavorites ? "Voir tout" : "Voir mes favoris"}
          >
            <Heart size={18} fill={showOnlyFavorites ? "currentColor" : "none"} />
            <span className="hidden sm:inline">Favoris</span>
          </button>


          <button 
            className="header-action-btn"
            onClick={() => setIsStatsOpen(true)}
            title="Statistiques d'écoute"
          >
            <Activity size={18} />
            <span className="hidden sm:inline">Activité</span>
          </button>

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

      {/* Stats bar */}
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

      {/* Listening History */}
      {!showOnlyFavorites && !search && history.length > 0 && (
        <section className="history-section">
          <div className="history-header">
            <h3>Récemment écouté</h3>
            <button className="history-clear" onClick={() => { setHistory([]); localStorage.removeItem("quranify_history"); }}>
              Effacer
            </button>
          </div>
          <div className="history-scroll">
            {history.map((item, idx) => {
              const s = surahs.find(surah => surah.id === item.surahId);
              const r = reciters.find(reciter => reciter.id === item.reciterId);
              if (!s || !r) return null;
              
              return (
                <div 
                  key={`${item.surahId}-${item.reciterId}-${idx}`} 
                  className="history-card" 
                  onClick={() => {
                    setSelectedReciter(r);
                    handleSelectSurah(s);
                  }}
                >
                   <div className="history-avatar">
                     {r.image ? <img src={r.image} alt="" /> : <Mic size={14} />}
                     <div className="history-play-overlay">
                       <Play size={14} fill="currentColor" />
                     </div>
                   </div>
                   <div className="history-info">
                     <span className="h-surah">{s.name_simple}</span>
                     <span className="h-reciter">{r.name.split(' ').pop()}</span>
                   </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Resume Banner */}
      {lastSession && !selectedSurah && (
        <div className="resume-banner" onClick={handleResume}>
          <div className="resume-content">
            <div className="resume-icon">
              <Play size={16} fill="currentColor" />
            </div>
            <div className="resume-info">
              <span className="resume-label">Continuer l'écoute</span>
              <span className="resume-name">
                {surahs.find(s => s.id === lastSession.surahId)?.name_simple} · {reciters.find(r => r.id === lastSession.reciterId)?.name}
              </span>
            </div>
          </div>
          <button className="resume-close" onClick={(e) => { e.stopPropagation(); setLastSession(null); }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-logo-wrap">
            <img src="/logo.png" alt="Quranify Logo" className="loading-logo" />
            <div className="pulse-ring" />
          </div>
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
              isFavorite={favorites.includes(surah.id)}
              onToggleFavorite={toggleFavorite}
              compact={viewMode === 'list'}
              isDownloaded={downloadedIds.includes(surah.id)}
              onDownload={handleDownloadSurah}
              isOnline={isOnline}
            />

          ))}
          {showOnlyFavorites && filteredSurahs.length === 0 && (
            <div className="empty-favs">
              <Heart size={40} className="empty-favs-icon" />
              <p>Vous n'avez pas encore de favoris.</p>
              <button onClick={() => setShowOnlyFavorites(false)}>Parcourir tout</button>
            </div>
          )}
        </div>
      )}

      {/* Footer / Credits */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-line">
            Audio: <a href="https://mp3quran.net" target="_blank" rel="noopener noreferrer">mp3quran.net</a> | 
            (C) <a href="http://versebyversequran.com" target="_blank" rel="noopener noreferrer">VerseByVerseQuran.com</a> | 
            <a href="http://versebyversequran.com/site/license" target="_blank" rel="noopener noreferrer">Full License</a>
          </p>
          <p className="footer-author">
            Créé avec ❤️ par <a href="https://sofianeweb.fr" target="_blank" rel="noopener noreferrer">sofianeweb.fr</a>
          </p>

        </div>
      </footer>

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
        onTimeUpdate={(time) => {
          setPlayerTime(time);
          if (Math.floor(time) % 5 === 0) saveSession(time); // Save every 5s
        }}
        audioRef={playerAudioRef}
        onOpenReader={() => setIsReaderOpen(true)}
      />

      {/* Reader Modal */}
      {isReaderOpen && selectedSurah && (
        <div className="reader-modal-overlay">
          <div className="reader-modal-content">
            <SurahReader 
              surah={selectedSurah}
              reciter={selectedReciter}
              currentTime={playerTime}
              isPlaying={isPlaying}
              onVerseClick={handleVerseClick}
              onClose={() => setIsReaderOpen(false)}
              isLoopingVerse={isLoopingVerse}
              onToggleLoop={handleToggleLoop}
              loopVerseNum={loopVerseNum}
            />
          </div>
        </div>
      )}






      {/* Reciter panel */}
      <ReciterSelect 
        reciters={reciters}
        selectedReciterId={selectedReciter.id}
        onSelect={handleReciterSelect}
        isOpen={isReciterOpen}
        onClose={() => setIsReciterOpen(false)}
      />


      {/* Radio Overlay */}
      {isRadioMode && (
        <RadioMode 
          surah={selectedSurah}
          reciter={selectedReciter}
          isPlaying={isPlaying}
          onClose={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
            setIsRadioMode(false);
          }}
          onNext={handleRadioNext}
          onTogglePlay={() => {
            if (playerAudioRef.current) {
              if (isPlaying) playerAudioRef.current.pause();
              else playerAudioRef.current.play().catch(() => {});
            } else if (!selectedSurah) {
              handleRadioNext();
            }
          }}
          allReciters={reciters}
          selectedReciterIds={radioReciterIds}
          onToggleReciter={toggleRadioReciter}
          onSelectAll={handleSelectAllRadio}
          onDeselectAll={handleDeselectAllRadio}
          radioScope={radioScope}
          onSetRadioScope={handleSetRadioScope}
        />



      )}

      {/* Stats Modal */}
      {isStatsOpen && (
        <StatsModal 
          totalSeconds={listeningStats.total}
          todaySeconds={listeningStats.today}
          onClose={() => setIsStatsOpen(false)}
        />
      )}

      {/* Voice Search Overlay */}

      {isListening && (
        <div className="voice-overlay">
          <div className="voice-content">
            <div className="voice-waves">
              <div className="wave" /><div className="wave" /><div className="wave" /><div className="wave" /><div className="wave" />
            </div>
            <p className="voice-text">{voiceTranscript || "Je vous écoute..."}</p>
            <p className="voice-hint">Dites "Sourate Al-Mulk" ou "Abdul Basit"</p>
          </div>
        </div>
      )}

      {voiceFeedback && (
        <div className="voice-toast">
          <Volume2 size={16} />
          <span>{voiceFeedback}</span>
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
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          width: 100%;
          flex-wrap: wrap;
        }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .install-btn {
          background: var(--accent-blue);
          color: #020617;
          border: none;
          padding: 0.4rem 1rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px var(--accent-blue-glow);
          animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .install-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 20px var(--accent-blue-glow);
        }

        @keyframes bounceIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .header-actions {

          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
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
          flex: 1;
          max-width: 400px;
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

        .offline-badge {
          background: #ef4444;
          color: white;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          letter-spacing: 1px;
          animation: pulse-red 2s infinite;
          white-space: nowrap;
        }

        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
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

        /* History Section */
        .history-section {
          margin-bottom: 2rem;
          padding: 0 0.25rem;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .history-header h3 {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.8;
        }

        .history-clear {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.75rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .history-clear:hover {
          color: var(--accent-blue);
        }

        .history-scroll {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .history-scroll::-webkit-scrollbar {
          display: none;
        }

        .history-card {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem 0.5rem 0.6rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .history-card:hover {
          background: rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .history-avatar {
          position: relative;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .history-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .history-play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(56, 189, 248, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #020617;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .history-card:hover .history-play-overlay {
          opacity: 1;
        }

        .history-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .h-surah {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1;
        }

        .h-reciter {
          font-size: 0.65rem;
          color: var(--text-secondary);
          opacity: 0.8;
        }


        /* Resume Banner */
        .resume-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.25rem;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.1));
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 1.25rem;
          margin-bottom: 1.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          animation: slideUp 0.5s ease-out;
        }

        .resume-banner:hover {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.15));
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(56, 189, 248, 0.1);
        }

        .resume-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .resume-icon {
          width: 36px;
          height: 36px;
          background: var(--accent-blue);
          color: var(--bg-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
        }

        .resume-info {
          display: flex;
          flex-direction: column;
        }

        .resume-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          color: var(--accent-blue);
          opacity: 0.8;
        }

        .resume-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .resume-close {
          color: var(--text-secondary);
          opacity: 0.5;
          padding: 0.5rem;
          transition: all 0.2s;
        }

        .resume-close:hover {
          color: #f87171;
          opacity: 1;
        }

        .view-toggle-wrap {
          display: flex;
          background: rgba(15, 23, 42, 0.4);
          padding: 3px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .fav-toggle-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .fav-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #f87171;
        }

        .fav-toggle-btn.active {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        .fav-toggle-btn span {
          display: inline-block;
        }

        .header-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .header-action-btn:hover {
          background: rgba(56, 189, 248, 0.1);
          color: var(--accent-blue);
          border-color: rgba(56, 189, 248, 0.2);
        }

        .header-action-btn.active-radio {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.2);
        }

        .radio-icon-anim {
          animation: pulseRadio 2s infinite;
        }

        @keyframes pulseRadio {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
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
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .surah-list.grid {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .surah-list.list {
          grid-template-columns: 1fr;
          gap: 0.35rem;
        }

        .empty-favs {
          grid-column: 1 / -1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-favs-icon {
          margin-bottom: 1rem;
          opacity: 0.15;
          color: #f87171;
        }

        .empty-favs p {
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .empty-favs button {
          padding: 0.6rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .empty-favs button:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
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

        .loading-logo-wrap {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-logo {
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 12px;
          z-index: 1;
        }

        .pulse-ring {
          position: absolute;
          inset: 0;
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

        .reader-overlay {
          position: fixed;
          inset: 0;
          z-index: 5000;
          background: #020617;
          animation: readerFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes readerFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .app-container {
            padding: 1rem 1rem 7rem;
          }
          .header-top {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .logo {
            justify-content: center;
            width: 100%;
          }
          .search-wrap {
            max-width: 100%;
            width: 100%;
          }
          .header-actions {
            justify-content: center;
          }
          .logo h1 {
            font-size: 1.25rem;
          }
        }

        /* Footer */
        .app-footer {
          margin-top: 4rem;
          padding: 3rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          background: rgba(15, 23, 42, 0.2);
          border-radius: 2rem 2rem 0 0;
        }

        .footer-content {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          text-align: center;
        }

        .footer-line {
          font-size: 0.75rem;
          color: var(--text-secondary);
          opacity: 0.6;
        }

        .footer-author {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .app-footer a {

          color: var(--text-primary);
          text-decoration: none;
          border-bottom: 1px solid rgba(56, 189, 248, 0.3);
          transition: all 0.2s;
        }

        .app-footer a:hover {
          color: var(--accent-blue);
          border-color: var(--accent-blue);
        }

        .footer-credits {
          padding: 1.5rem;
          background: rgba(2, 6, 23, 0.4);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.03);
        }

        .disclaimer-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #f87171;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
        }

        .disclaimer-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }

        .disclaimer-note {
          font-size: 0.7rem;
          color: var(--text-secondary);
          opacity: 0.5;
          font-style: italic;
          line-height: 1.4;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 0.75rem;
          color: var(--text-secondary);
          opacity: 0.6;
        }

        @media (max-width: 640px) {
          .app-footer {
            padding: 2rem 1rem;
            margin-bottom: 5rem; /* Space for player */
          }
          .footer-main {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

      `}</style>
    </main>
  );
}
