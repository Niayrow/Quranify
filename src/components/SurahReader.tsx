"use client";

import React, { useEffect, useState, useRef } from "react";
import { Surah, Reciter } from "@/types/quran";

interface Verse {
    number: number;
    text: string;
    translation: string;
    transliteration: string;
    numberInSurah: number;
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
}

export default function SurahReader({ surah, reciter, currentTime, isPlaying, onVerseClick }: SurahReaderProps) {
    const [verses, setVerses] = useState<Verse[]>([]);
    const [timestamps, setTimestamps] = useState<Timestamp[]>([]);
    const [activeVerseNum, setActiveVerseNum] = useState<number>(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
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
            console.log("Loading Surah Reader data for surah:", surah.id, "reciter:", reciter?.name);
            try {
                // Fetch verses (Arabic + French + Transliteration)
                const res = await fetch(`https://api.alquran.cloud/v1/surah/${surah.id}/editions/quran-uthmani,fr.hamidullah,en.transliteration`);
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const data = await res.json();
                
                if (data.data && data.data.length >= 3) {
                    const arabic = data.data[0].ayahs;
                    const french = data.data[1].ayahs;
                    const phonetic = data.data[2].ayahs;

                    const merged: Verse[] = arabic.map((ayah: any, i: number) => ({
                        number: ayah.number,
                        numberInSurah: ayah.numberInSurah,
                        text: ayah.text,
                        translation: french[i]?.text || "",
                        transliteration: phonetic[i]?.text || "",
                    }));
                    setVerses(merged);
                }

                // Fetch timestamps if reciter has a folder
                if (reciter?.folder) {
                    const tsPath = `/timestamps/${reciter.folder}/${surah.id.toString().padStart(3, '0')}.txt`;
                    console.log("Fetching timestamps from:", tsPath);
                    const tsRes = await fetch(tsPath);
                    if (tsRes.ok) {
                        const text = await tsRes.text();
                        const lines = text.split('\n').filter(l => l.trim());
                        
                        const parsed: Timestamp[] = lines.map((line, i) => {
                            const match = line.match(/(\d+)\s*$/);
                            const endTime = match ? parseInt(match[1]) : 0;
                            const prevEndTime = i === 0 ? 0 : parseInt(lines[i-1].match(/(\d+)\s*$/)?.[1] || "0");
                            return {
                                verseNum: i + 1,
                                start: prevEndTime,
                                end: endTime
                            };
                        });
                        setTimestamps(parsed);
                    } else {
                        console.warn("No timestamps found for this reciter/surah");
                        setTimestamps([]);
                    }
                } else {
                    setTimestamps([]);
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

    // Sync active verse with currentTime
    useEffect(() => {
        if (timestamps.length === 0) return;
        
        const timeMs = currentTime * 1000;
        const active = timestamps.find(t => timeMs >= t.start && timeMs < t.end);
        
        if (active && active.verseNum !== activeVerseNum) {
            setActiveVerseNum(active.verseNum);
            
            // Scroll into view
            const el = verseRefs.current[active.verseNum];
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [currentTime, timestamps, activeVerseNum]);

    if (!surah) return null;

    return (
        <div className="surah-reader">
            <div className="reader-header-sticky">
                <div className="reader-info">
                    <h2>{surah.name_simple}</h2>
                    <div className="view-toggles">
                        <button className={`toggle-btn ${showArabic ? 'active' : ''}`} onClick={() => setShowArabic(!showArabic)}>AR</button>
                        <button className={`toggle-btn ${showPhonetic ? 'active' : ''}`} onClick={() => setShowPhonetic(!showPhonetic)}>PH</button>
                        <button className={`toggle-btn ${showFrench ? 'active' : ''}`} onClick={() => setShowFrench(!showFrench)}>FR</button>
                    </div>
                </div>
                <button className="close-reader" onClick={() => onVerseClick(-1)}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="reader-body">
                {loading ? (
                    <div className="reader-loading">
                        <div className="loader" />
                        <span>Chargement des versets...</span>
                    </div>
                ) : error ? (
                    <div className="reader-error">
                        <span>{error}</span>
                        <button onClick={() => window.location.reload()}>Réessayer</button>
                        <button className="close-btn" onClick={() => onVerseClick(-1)}>Fermer</button>
                    </div>
                ) : (
                    <div className="verses-container" ref={scrollContainerRef}>
                        {surah.id !== 1 && surah.id !== 9 && (
                            <div className="bismillah">
                                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                            </div>
                        )}
                        
                        {verses.map((verse) => {
                            const isActive = activeVerseNum === verse.numberInSurah;
                            return (
                                <div 
                                    key={verse.number}
                                    ref={el => { verseRefs.current[verse.numberInSurah] = el }}
                                    className={`verse-card ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        const ts = timestamps.find(t => t.verseNum === verse.numberInSurah);
                                        if (ts) onVerseClick(ts.start / 1000);
                                    }}
                                >
                                    <div className="verse-header">
                                        <span className="verse-num">{surah.id}:{verse.numberInSurah}</span>
                                        {isActive && isPlaying && <div className="playing-dot" />}
                                    </div>
                                    {showArabic && <p className="verse-arabic" dir="rtl">{verse.text}</p>}
                                    {showPhonetic && <p className="verse-phonetic">{verse.transliteration}</p>}
                                    {showFrench && <p className="verse-translation">{verse.translation}</p>}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style jsx>{`
                .surah-reader {
                    background: radial-gradient(circle at top center, #1e293b 0%, #020617 100%);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    width: 100vw;
                    height: 100vh;
                    position: relative;
                }

                .reader-header-sticky {
                    position: sticky;
                    top: 0;
                    z-index: 50;
                    background: rgba(2, 6, 23, 0.6);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }

                .reader-info {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .reader-info h2 {
                    font-size: 1.8rem;
                    font-weight: 800;
                    margin: 0;
                    background: linear-gradient(135deg, var(--accent-blue), #c4b5fd);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.5px;
                }

                .view-toggles {
                    display: flex;
                    gap: 0.4rem;
                    background: rgba(15, 23, 42, 0.6);
                    padding: 0.3rem;
                    border-radius: 100px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .toggle-btn {
                    padding: 0.4rem 0.8rem;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .toggle-btn.active {
                    background: var(--accent-blue);
                    color: #020617;
                    box-shadow: 0 2px 10px rgba(56, 189, 248, 0.3);
                }

                .toggle-btn:hover:not(.active) {
                    color: white;
                    background: rgba(255, 255, 255, 0.08);
                }

                .reader-body {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .reader-loading, .reader-error {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    color: var(--text-secondary);
                }

                .close-reader {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .close-reader:hover {
                    background: rgba(239, 68, 68, 0.15);
                    color: #f87171;
                    border-color: rgba(239, 68, 68, 0.3);
                    transform: rotate(90deg);
                }

                .loader {
                    width: 32px;
                    height: 32px;
                    border: 3px solid rgba(56, 189, 248, 0.1);
                    border-top-color: var(--accent-blue);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin { to { transform: rotate(360deg); } }

                .verses-container {
                    padding: 3rem 1.5rem 10rem;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 3rem;
                    scroll-behavior: smooth;
                    flex: 1;
                    max-width: 900px;
                    margin: 0 auto;
                    width: 100%;
                }

                .bismillah {
                    text-align: center;
                    font-size: 3rem;
                    color: rgba(255, 255, 255, 0.9);
                    margin: 1rem 0 4rem;
                    font-family: var(--font-amiri), serif;
                    text-shadow: 0 4px 20px rgba(56, 189, 248, 0.3);
                }

                .verse-card {
                    padding: 3rem;
                    border-radius: 1.5rem;
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                    position: relative;
                }

                .verse-card:hover {
                    background: rgba(30, 41, 59, 0.5);
                    border-color: rgba(255, 255, 255, 0.08);
                    transform: translateY(-2px);
                }

                .verse-card.active {
                    background: linear-gradient(145deg, rgba(56, 189, 248, 0.06), rgba(129, 140, 248, 0.06));
                    border-color: rgba(56, 189, 248, 0.3);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(56, 189, 248, 0.1);
                    transform: scale(1.02);
                }

                .verse-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 2rem;
                }

                .verse-num {
                    font-size: 0.8rem;
                    font-weight: 800;
                    color: var(--accent-blue);
                    background: rgba(56, 189, 248, 0.1);
                    padding: 0.3rem 0.8rem;
                    border-radius: 100px;
                    border: 1px solid rgba(56, 189, 248, 0.2);
                    letter-spacing: 1px;
                }

                .playing-dot {
                    width: 10px;
                    height: 10px;
                    background: var(--accent-blue);
                    border-radius: 50%;
                    box-shadow: 0 0 15px var(--accent-blue), 0 0 30px var(--accent-blue);
                    animation: pulse 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                @keyframes pulse {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }

                .verse-arabic {
                    font-size: 2.8rem;
                    line-height: 2.2;
                    color: rgba(255, 255, 255, 0.85);
                    margin-bottom: 2rem;
                    text-align: right;
                    font-family: var(--font-amiri), serif;
                    transition: color 0.3s;
                }

                .verse-card.active .verse-arabic {
                    color: #ffffff;
                    text-shadow: 0 0 1px rgba(255,255,255,0.2);
                }

                .verse-phonetic {
                    font-size: 1.1rem;
                    color: var(--accent-blue);
                    opacity: 0.9;
                    font-style: italic;
                    margin-bottom: 0.8rem;
                    line-height: 1.6;
                    letter-spacing: 0.2px;
                }

                .verse-translation {
                    font-size: 1.1rem;
                    color: var(--text-secondary);
                    line-height: 1.8;
                }

                @media (max-width: 640px) {
                    .verses-container { padding: 1.25rem; }
                    .verse-arabic { font-size: 1.75rem; }
                    .verse-card { padding: 1rem; }
                }
            `}</style>
        </div>
    );
}
