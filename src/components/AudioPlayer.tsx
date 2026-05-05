"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Shuffle,
  ChevronDown, BookOpen, Clock
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string | null;
  surahName: string;
  surahArabic?: string;
  reciterName: string;
  reciterImage?: string;
  surahNumber?: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onPlayStateChange?: (playing: boolean) => void;
  onTimeUpdate?: (time: number) => void;
  audioRef?: React.MutableRefObject<HTMLAudioElement | null>;
  onOpenReader?: () => void;
}

export default function AudioPlayer({
  audioUrl, surahName, surahArabic, reciterName, reciterImage, surahNumber, onNext, onPrevious, onPlayStateChange, onTimeUpdate, audioRef: externalAudioRef, onOpenReader
}: AudioPlayerProps) {
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = externalAudioRef || internalAudioRef;
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // in minutes
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // in seconds

  // Visualizer Refs
  const visualizerCanvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const isSourceConnected = useRef(false);



  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return "0:00";
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Wake Lock
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err: any) {
        console.error(err?.message);
      }
    };
    if (isPlaying) requestWakeLock();
    else if (wakeLock) { wakeLock.release(); wakeLock = null; }
    return () => { if (wakeLock) wakeLock.release(); };
  }, [isPlaying]);

  // Auto-play on URL change
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch(() => { });
      setIsPlaying(true);
    }
  }, [audioUrl]);

  // Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Media Session API (Lockscreen Controls & Notifications)
  useEffect(() => {
    if ('mediaSession' in navigator && audioUrl) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: surahName,
        artist: reciterName,
        album: 'Quranify',
        artwork: [
          { src: reciterImage || '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        audioRef.current?.play();
        setIsPlaying(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        audioRef.current?.pause();
        setIsPlaying(false);
      });
      if (onPrevious) {
        navigator.mediaSession.setActionHandler('previoustrack', () => onPrevious());
      }
      if (onNext) {
        navigator.mediaSession.setActionHandler('nexttrack', () => onNext());
      }
      
      return () => {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      };
    }
  }, [audioUrl, surahName, reciterName, reciterImage, onNext, onPrevious]);

  // Sync playback state with Media Session
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Sleep Timer logic
  useEffect(() => {
    let interval: any;
    if (timeLeft !== null && timeLeft > 0 && isPlaying) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev <= 1) {
            audioRef.current?.pause();
            setIsPlaying(false);
            setSleepTimer(null);
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timeLeft, isPlaying]);

  const toggleSleepTimer = () => {
    const options = [null, 15, 30, 45, 60];
    const currentIndex = options.indexOf(sleepTimer);
    const nextValue = options[(currentIndex + 1) % options.length];
    setSleepTimer(nextValue);
    setTimeLeft(nextValue ? nextValue * 60 : null);
  };

  const renderVisualizer = useCallback(() => {
    if (!analyserRef.current || !visualizerCanvasRef.current) return;
    const canvas = visualizerCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      requestAnimationFrame(draw);
      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + (dataArray[i] / 255) * 0.7})`;

        const radius = 2;
        const y = canvas.height - barHeight;

        if (barHeight > 2) {
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth - 3, barHeight, radius);
          ctx.fill();
        }

        x += barWidth;
      }
    };
    draw();
  }, []);

  const initVisualizer = useCallback(() => {
    if (!audioRef.current || isSourceConnected.current) {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return;
    }

    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      const audioCtx = new AudioContextClass();
      const analyser = audioCtx.createAnalyser();

      const source = audioCtx.createMediaElementSource(audioRef.current);
      isSourceConnected.current = true;

      source.connect(analyser);
      analyser.connect(audioCtx.destination);

      analyser.fftSize = 64;
      analyserRef.current = analyser;
      audioCtxRef.current = audioCtx;
      sourceRef.current = source;

      renderVisualizer();
    } catch (e) {
      console.warn("Visualizer init failed", e);
    }
  }, [renderVisualizer]);


  // Ensure visualizer is ready when playing starts from anywhere
  useEffect(() => {
    if (isPlaying) {
      initVisualizer();
    }
  }, [isPlaying, initVisualizer]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => { });
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);



  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      setCurrentTime(cur);
      setProgress(dur > 0 ? (cur / dur) * 100 : 0);
      if (onTimeUpdate) onTimeUpdate(cur);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const seekTime = (pct / 100) * audioRef.current.duration;
    audioRef.current.currentTime = seekTime;
    setProgress(pct);
    setCurrentTime(seekTime);
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
      }
    } else if (onNext) {
      onNext();
    } else {
      setIsPlaying(false);
    }
  };

  // Media Session API for lock screen controls
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: surahName,
        artist: reciterName,
        album: 'Quranify',
      });
      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => onPrevious?.());
      navigator.mediaSession.setActionHandler('nexttrack', () => onNext?.());
    }
  }, [surahName, reciterName, togglePlay, onNext, onPrevious]);

  if (!audioUrl) return null;

  return (
    <>
      <div className={`player-bar ${isExpanded ? 'expanded' : ''}`}>
        {/* Progress line on top of bar */}
        <div className="progress-top" ref={progressRef} onClick={handleProgressClick}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              <div className="progress-glow" />
            </div>
            <div className="progress-thumb" style={{ left: `${progress}%` }} />
          </div>
        </div>

        <div className="player-content">
          {/* Left: Surah info */}
          <div className="player-left">
            <div className="surah-badge">
              {reciterImage ? (
                <img src={reciterImage} alt="" className="player-avatar-img" />
              ) : (
                <span>{surahNumber || "—"}</span>
              )}
            </div>
            <div className="player-info">
              <div className="player-title-row">
                <div className="player-title">{surahName}</div>
                {isPlaying && (
                  <div className="player-visualizer">
                    <canvas ref={visualizerCanvasRef} width="60" height="20" />
                  </div>
                )}
              </div>
              <div className="player-subtitle">{reciterName}</div>
            </div>
          </div>


          {/* Center: Controls */}
          <div className="player-center">
            <button
              className="reader-trigger"
              onClick={onOpenReader}
              title="Ouvrir le suivi de lecture"
            >
              <BookOpen size={18} />
            </button>
            <button
              className={`ctrl-btn small ${isShuffle ? 'active' : ''}`}
              onClick={() => setIsShuffle(!isShuffle)}
              title="Aléatoire"
            >
              <Shuffle size={16} />
            </button>
            <button className="ctrl-btn" onClick={onPrevious} title="Précédent">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <button className="play-main" onClick={togglePlay}>
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
            </button>
            <button className="ctrl-btn" onClick={onNext} title="Suivant">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button
              className={`ctrl-btn small sleep-timer-btn ${sleepTimer ? 'active' : ''}`}
              onClick={toggleSleepTimer}
              title={sleepTimer ? `Minuteur : ${Math.ceil(timeLeft! / 60)}m restants` : "Minuteur de veille"}
            >
              <Clock size={16} className={sleepTimer ? 'pulse-icon' : ''} />
              {sleepTimer && (
                <div className="timer-display">
                  <span>{Math.ceil(timeLeft! / 60)}</span>
                  <span className="unit">m</span>
                </div>
              )}
            </button>
            <button
              className={`ctrl-btn small ${playbackSpeed !== 1 ? 'active' : ''}`}
              onClick={() => {
                const speeds = [1, 1.25, 1.5, 2, 0.75];
                const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                setPlaybackSpeed(speeds[nextIndex]);
              }}
              title="Vitesse de lecture"
            >
              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{playbackSpeed}x</span>
            </button>
            <button
              className={`ctrl-btn small ${isRepeat ? 'active' : ''}`}
              onClick={() => setIsRepeat(!isRepeat)}
              title="Répéter"
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Right: Time + Volume */}
          <div className="player-right">
            <div className="time-info">
              <span className="time-current">{formatTime(currentTime)}</span>
              <span className="time-sep">/</span>
              <span className="time-total">{formatTime(duration)}</span>
            </div>
            <div className="volume-wrap">
              <button className="ctrl-btn small" onClick={() => setIsMuted(!isMuted)}>
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <div className="volume-track">
                <input
                  type="range" min="0" max="100" value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                  className="volume-slider"
                />
              </div>
            </div>
          </div>

          {/* Mobile expand button */}
          <button
            className="expand-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronDown size={20} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        {/* Mobile expanded controls */}
        {isExpanded && (
          <div className="mobile-expanded">
            <div className="mobile-time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="mobile-extra">
              <button
                className="reader-trigger"
                onClick={onOpenReader}
              >
                <BookOpen size={20} />
              </button>
              <button
                className={`ctrl-btn small ${isShuffle ? 'active' : ''}`}
                onClick={() => setIsShuffle(!isShuffle)}
              >
                <Shuffle size={18} />
              </button>
              <button
                className={`ctrl-btn small ${isRepeat ? 'active' : ''}`}
                onClick={() => setIsRepeat(!isRepeat)}
              >
                <Repeat size={18} />
              </button>
              <button
                className={`ctrl-btn small ${playbackSpeed !== 1 ? 'active' : ''}`}
                onClick={() => {
                  const speeds = [1, 1.25, 1.5, 2, 0.75];
                  const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                  setPlaybackSpeed(speeds[nextIndex]);
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{playbackSpeed}x</span>
              </button>
              <button
                className={`ctrl-btn small sleep-timer-btn ${sleepTimer ? 'active' : ''}`}
                onClick={toggleSleepTimer}
              >
                <Clock size={18} className={sleepTimer ? 'pulse-icon' : ''} />
                {sleepTimer && (
                  <div className="timer-display mobile">
                    <span>{Math.ceil(timeLeft! / 60)}</span>
                    <span className="unit">m</span>
                  </div>
                )}
              </button>
              <div className="mobile-volume">
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <input
                  type="range" min="0" max="100" value={isMuted ? 0 : volume}
                  onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                  className="volume-slider"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => { setIsPlaying(true); onPlayStateChange?.(true); }}
        onPause={() => { setIsPlaying(false); onPlayStateChange?.(false); }}
      />


      <style jsx>{`
        .player-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 3000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.4);
        }

        /* Progress on top */
        .progress-top {
          position: absolute;
          top: -4px;
          left: 0;
          right: 0;
          height: 8px;
          cursor: pointer;
          z-index: 10;
          padding: 2px 0;
        }

        .progress-track {
          position: relative;
          width: 100%;
          height: 3px;
          background: rgba(148, 163, 184, 0.15);
          border-radius: 4px;
          transition: height 0.15s;
        }

        .progress-top:hover .progress-track {
          height: 5px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          border-radius: 4px;
          position: relative;
          transition: width 0.1s linear;
        }

        .progress-glow {
          position: absolute;
          right: 0;
          top: -4px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--accent-blue);
          filter: blur(6px);
          opacity: 0.6;
        }

        .progress-thumb {
          position: absolute;
          top: 50%;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: white;
          transform: translate(-50%, -50%) scale(0);
          transition: transform 0.15s;
          box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
        }

        .progress-top:hover .progress-thumb {
          transform: translate(-50%, -50%) scale(1);
        }

        /* Main content layout */
        .player-content {
          display: flex;
          align-items: center;
          padding: 0.65rem 1.5rem;
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Left */
        .player-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex: 1;
          min-width: 0;
        }

        .surah-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(129, 140, 248, 0.2));
          border: 1px solid rgba(56, 189, 248, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .player-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .surah-badge span {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent-blue);
        }

        .player-info {
          min-width: 0;
        }

        .player-title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .player-visualizer {
          display: flex;
          align-items: center;
          opacity: 0.8;
          padding-bottom: 2px;
        }

        .player-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .player-subtitle {
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }


        /* Center controls */
        .player-center {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .reader-trigger {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          color: var(--accent-blue);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          margin-right: 0.5rem;
        }

        .reader-trigger:hover {
          background: rgba(56, 189, 248, 0.2);
          transform: translateY(-1px);
        }

        .ctrl-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all 0.2s;
          flex-shrink: 0;
          position: relative; /* Added for badge positioning */
        }

        .ctrl-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.06);
        }

        .ctrl-btn.small {
          width: 30px;
          height: 30px;
        }

        .ctrl-btn.active {
          color: var(--accent-blue);
        }

        .play-main {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--accent-blue);
          color: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .play-main:hover {
          transform: scale(1.08);
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.35);
        }

        .play-main:active {
          transform: scale(0.95);
        }

        .sleep-timer-btn.active {
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: var(--accent-blue);
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
        }

        .timer-display {
          position: absolute;
          top: -10px;
          right: -8px;
          background: var(--accent-blue);
          color: #020617;
          font-size: 10px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 8px;
          display: flex;
          align-items: baseline;
          gap: 1px;
          border: 2px solid #0f172a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          z-index: 5;
          animation: badgeIn 0.3s cubic-bezier(0.17, 0.67, 0.83, 0.67);
        }

        .timer-display .unit {
          font-size: 7px;
          opacity: 0.8;
        }

        .pulse-icon {
          animation: timerPulse 2s infinite;
        }

        @keyframes timerPulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        @keyframes badgeIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        /* Right */
        .player-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          justify-content: flex-end;
        }

        .time-info {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 0.75rem;
          font-family: 'Geist Mono', monospace;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .time-current { color: var(--text-primary); }
        .time-sep { opacity: 0.4; }

        .volume-wrap {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .volume-track {
          width: 90px;
        }

        .volume-slider {
          width: 100%;
          height: 4px;
          accent-color: var(--accent-blue);
          cursor: pointer;
        }

        .expand-btn {
          display: none;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all 0.2s;
        }

        /* Mobile expanded */
        .mobile-expanded {
          display: none;
          padding: 0.5rem 1.5rem 0.75rem;
        }

        .mobile-time {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          font-family: monospace;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .mobile-extra {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
        }

        .mobile-volume {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .mobile-volume .volume-slider {
          width: 80px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .player-content {
            padding: 0.5rem 1rem;
            gap: 0.75rem;
          }

          .player-right {
            display: none;
          }

          .player-center .small {
            display: none;
          }

          .expand-btn {
            display: flex;
          }

          .player-bar.expanded .mobile-expanded {
            display: block;
          }

          .play-main {
            width: 40px;
            height: 40px;
          }

          .ctrl-btn {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </>
  );
}
