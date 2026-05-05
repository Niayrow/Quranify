"use client";

import React, { useEffect, useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Play, Pause, Repeat } from "lucide-react";
import { Surah, Reciter } from "@/types/quran";

interface Verse {
    number: number;
    text: string;
    translation: string;
    transliteration: string;
    numberInSurah: number;
    start: number;
    end: number;
}

interface Timestamp {
    verseNum: number;
    start: number;
    end: number;
}

interface SurahReaderProps {
    surah: Surah | null;
    reciter: Reciter | null;
    currentTime: number;
    isPlaying: boolean;
    onVerseClick: (time: number) => void;
    onClose: () => void;
    isLoopingVerse?: boolean;
    onToggleLoop?: (verseNum: number | null) => void;
    loopVerseNum?: number | null;
}

export default function SurahReader({ 
    surah, 
    reciter, 
    currentTime, 
    isPlaying, 
    onVerseClick, 
    onClose, 
    isLoopingVerse, 
    onToggleLoop, 
    loopVerseNum 
}: SurahReaderProps) {
    const [verses, setVerses] = useState<Verse[]>([]);
    const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
    const [activeVerseNum, setActiveVerseNum] = useState<number>(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [repeatCount, setRepeatCount] = useState(0);
    
    // View settings
    const [showArabic, setShowArabic] = useState(true);
    const [showPhonetic, setShowPhonetic] = useState(true);
    const [showFrench, setShowFrench] = useState(true);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    // Load verses and timestamps
    useEffect(() => {
        if (!surah) return;

        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.id}/editions/quran-uthmani,fr.hamidullah,en.transliteration`);
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const data = await res.json();
                
                let tsData: Timestamp[] = [];
                if (reciter?.folder) {
                    const tsPath = `/timestamps/${reciter.folder}/${surah.id.toString().padStart(3, '0')}.txt`;
                    const tsRes = await fetch(tsPath);
                    if (tsRes.ok) {
                        const text = await tsRes.text();
                        const lines = text.split('\n').filter(l => l.trim());
                        const isSpecialSurah = surah.id === 1 || surah.id === 9;
                        tsData = lines.map((line, i) => {
                            const match = line.match(/(\d+)\s*$/);
                            const endTime = match ? parseInt(match[1]) : 0;
                            const prevEndTime = i === 0 ? 0 : parseInt(lines[i-1].match(/(\d+)\s*$/)?.[1] || "0");
                            
                            // For most surahs, line 0 is Bismillah (verse 0)
                            // For Surah 1 and 9, line 0 is already verse 1
                            let verseNum = isSpecialSurah ? i + 1 : i;
                            
                            return { verseNum, start: prevEndTime, end: endTime };
                        });
                        setTimestamps(tsData);
                    }
                }

                if (data.data && data.data.length >= 3) {
                    const arabic = data.data[0].ayahs;
                    const french = data.data[1].ayahs;
                    const phonetic = data.data[2].ayahs;

                    const merged: Verse[] = arabic.map((ayah: any, i: number) => {
                        const ts = tsData.find(t => t.verseNum === ayah.numberInSurah);
                        return {
                            number: ayah.number,
                            numberInSurah: ayah.numberInSurah,
                            text: ayah.text,
                            translation: french[i]?.text || "",
                            transliteration: phonetic[i]?.text || "",
                            start: ts?.start || 0,
                            end: ts?.end || 0
                        };
                    });
                    setVerses(merged);
                }
            } catch (err: any) {
                console.error("Failed to load surah data", err);
                setError(err.message || "Erreur de chargement");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [surah?.id, reciter?.id]);

    // Repetition logic
    useEffect(() => {
        if (isLoopingVerse && loopVerseNum !== null) {
            const verse = verses.find(v => v.numberInSurah === loopVerseNum);
            if (verse && verse.end > 0 && currentTime * 1000 >= verse.end - 100) {
                onVerseClick(verse.start / 1000);
                setRepeatCount(prev => prev + 1);
            }
        } else {
            setRepeatCount(0);
        }
    }, [currentTime, isLoopingVerse, loopVerseNum, verses, onVerseClick]);

    // Sync active verse with currentTime
    useEffect(() => {
        if (timestamps.length === 0) {
            setActiveVerseNum(-1);
            return;
        }
        const timeMs = currentTime * 1000;
        
        // Find if we are in a specific verse
        const active = timestamps.find(t => timeMs >= t.start && timeMs < t.end);
        
        let newActiveNum = -1;
        if (active) {
            newActiveNum = active.verseNum;
        } else if (timeMs < timestamps[0].start) {
            // We are likely in the Bismillah preamble
            newActiveNum = 0; 
        }

        if (newActiveNum !== activeVerseNum) {
            setActiveVerseNum(newActiveNum);
            const el = newActiveNum === 0 
                ? document.getElementById('bismillah-card')
                : verseRefs.current[newActiveNum];
                
            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [currentTime, timestamps, activeVerseNum]);
 Josephson:

    if (!surah) return null;

    return (
        <div className="surah-reader">
            <div className="reader-header-sticky">
                <div className="header-main-row">
                    <div className="reader-info">
                        <div className="title-group">
                            <h2>{surah.name_simple}</h2>
                            <span className="reciter-mini">Récité par {reciter?.name}</span>
                        </div>
                    </div>
                    <button className="close-reader" onClick={onClose}>
                        <X size={22} />
                    </button>
                </div>
                
                <div className="reader-controls-row">
                    <div className="view-toggles">
                        <button 
                            className={`toggle-btn learn ${isLoopingVerse ? 'active' : ''}`} 
                            onClick={() => onToggleLoop?.(null)}
                            title="Mode Apprentissage"
                        >
                            <Repeat size={14} />
                            <span>BOUCLE</span>
                        </button>
                        <div className="divider" />
                        <button className={`toggle-btn ${showArabic ? 'active' : ''}`} onClick={() => setShowArabic(!showArabic)}>AR</button>
                        <button className={`toggle-btn ${showPhonetic ? 'active' : ''}`} onClick={() => setShowPhonetic(!showPhonetic)}>PH</button>
                        <button className={`toggle-btn ${showFrench ? 'active' : ''}`} onClick={() => setShowFrench(!showFrench)}>FR</button>
                    </div>
                </div>
            </div>


            <div className="reader-body">
                {loading ? (
                    <div className="reader-status">
                        <div className="loader" />
                        <span>Chargement des versets...</span>
                    </div>
                ) : error ? (
                    <div className="reader-status error">
                        <div className="error-icon">!</div>
                        <span>{error}</span>
                        <button onClick={onClose} className="error-close">Fermer</button>
                    </div>
                ) : (
                    <div className="verses-container" ref={scrollContainerRef}>
                        {surah.id !== 1 && surah.id !== 9 && (
                            <div 
                                id="bismillah-card"
                                className={`bismillah ${activeVerseNum === 0 ? 'active' : ''}`}
                            >
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                            </div>
                        )}
                        {verses.map((verse) => {
                            const isActive = activeVerseNum === verse.numberInSurah;
                            const isLooping = loopVerseNum === verse.numberInSurah;
                            return (
                                <div 
                                    key={verse.number}
                                    ref={el => { verseRefs.current[verse.numberInSurah] = el }}
                                    className={`verse-card ${isActive ? 'active' : ''} ${isLooping ? 'looping' : ''}`}
                                    onClick={() => {
                                        if (isLoopingVerse) onToggleLoop?.(verse.numberInSurah);
                                        onVerseClick(verse.start / 1000);
                                    }}
                                >
                                    <div className="verse-header">
                                        <span className="verse-num">{surah.id}:{verse.numberInSurah}</span>
                                        <div className="verse-actions">
                                            {isLooping && <div className="loop-badge"><Repeat size={10} /><span>Boucle #{repeatCount}</span></div>}
                                            {isActive && isPlaying && <div className="playing-dot" />}
                                        </div>
                                    </div>
                                    {showArabic && <p className="verse-arabic" dir="rtl">{verse.text}</p>}
                                    {showPhonetic && <p className="verse-phonetic">{verse.transliteration}</p>}
                                    {showFrench && <p className="verse-translation">{verse.translation}</p>}
                                </div>
                            );
                        })}
                        <div className="end-marker">Fin de la sourate</div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .surah-reader {
                    background: #020617;
                    background-image: 
                        radial-gradient(circle at 50% -20%, rgba(56, 189, 248, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 0% 100%, rgba(15, 23, 42, 0.5) 0%, transparent 50%);
                    width: 100vw;
                    height: 100vh;
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    color: white;
                }

                .reader-header-sticky {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    background: rgba(2, 6, 23, 0.85);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 1.25rem 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .header-main-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                }

                .reader-info {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    min-width: 0;
                }

                .reader-logo-mini {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    object-fit: cover;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .title-group {
                    min-width: 0;
                }

                .title-group h2 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(135deg, #38bdf8, #818cf8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .reciter-mini {
                    font-size: 0.8rem;
                    color: #94a3b8;
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: block;
                }

                .reader-controls-row {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                }


                .view-toggles {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    background: rgba(15, 23, 42, 0.6);
                    padding: 0.3rem;
                    border-radius: 100px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .divider {
                    width: 1px;
                    height: 16px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 0 0.2rem;
                }

                .toggle-btn {
                    padding: 0.4rem 0.8rem;
                    border-radius: 100px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .toggle-btn.active {
                    background: #38bdf8;
                    color: #020617;
                }

                .toggle-btn.learn.active {
                    background: #f59e0b;
                    color: #020617;
                    box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
                }

                .close-reader {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .close-reader:hover {
                    background: rgba(239, 68, 68, 0.15);
                    color: #f87171;
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .reader-body {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .reader-status {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    color: #94a3b8;
                }

                .loader {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(56, 189, 248, 0.1);
                    border-top-color: #38bdf8;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .verses-container {
                    padding: 3rem 1.5rem 15rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 2.5rem;
                    scroll-behavior: smooth;
                    flex: 1;
                    max-width: 800px;
                    margin: 0 auto;
                    width: 100%;
                }

                .bismillah {
                    text-align: center;
                    font-size: 2.5rem;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 3rem;
                    font-family: serif;
                    transition: all 0.4s;
                    padding: 1.5rem;
                    border-radius: 1.5rem;
                }

                .bismillah.active {
                    color: white;
                    background: rgba(56, 189, 248, 0.05);
                    text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);
                    transform: scale(1.05);
                }

                .verse-card {
                    padding: 2rem;
                    border-radius: 1.5rem;
                    background: rgba(15, 23, 42, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .verse-card.active {
                    background: rgba(56, 189, 248, 0.06);
                    border-color: rgba(56, 189, 248, 0.3);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }

                .verse-card.looping {
                    border-color: rgba(245, 158, 11, 0.4);
                    background: rgba(245, 158, 11, 0.05);
                }

                .verse-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                }

                .verse-num {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #38bdf8;
                    background: rgba(56, 189, 248, 0.1);
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                }

                .verse-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .loop-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.2rem 0.6rem;
                    background: rgba(245, 158, 11, 0.15);
                    border: 1px solid rgba(245, 158, 11, 0.3);
                    border-radius: 100px;
                    color: #f59e0b;
                    font-size: 0.6rem;
                    font-weight: 800;
                }

                .playing-dot {
                    width: 8px;
                    height: 8px;
                    background: #38bdf8;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #38bdf8;
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }

                .verse-arabic {
                    font-size: 2.2rem;
                    line-height: 2;
                    text-align: right;
                    color: #f8fafc;
                    margin-bottom: 1.5rem;
                    font-family: serif;
                }

                .verse-phonetic {
                    font-size: 1rem;
                    color: #38bdf8;
                    font-style: italic;
                    margin-bottom: 0.5rem;
                }

                .verse-translation {
                    font-size: 1rem;
                    color: #94a3b8;
                    line-height: 1.6;
                }

                .end-marker {
                    text-align: center;
                    padding: 4rem 0;
                    color: #475569;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }

                @media (max-width: 640px) {
                    .reader-header-sticky { 
                        padding: 1rem; 
                        gap: 0.75rem;
                    }
                    .header-main-row h2 { 
                        font-size: 1.3rem; 
                    }
                    .reciter-mini {
                        font-size: 0.7rem;
                    }
                    .view-toggles {
                        width: 100%;
                        justify-content: space-between;
                        padding: 0.25rem 0.5rem;
                    }
                    .toggle-btn {
                        padding: 0.4rem 0.6rem;
                        font-size: 0.65rem;
                    }
                    .view-toggles span { display: none; }
                    .verses-container { padding: 1.5rem 1rem 12rem; gap: 2rem; }
                    .verse-arabic { font-size: 1.8rem; line-height: 1.8; }
                    .verse-card { padding: 1.5rem; border-radius: 1.25rem; }
                }

            `}</style>
        </div>
    );
}
