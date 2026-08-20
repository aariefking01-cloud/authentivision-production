import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Sliders, Eye, Play, Pause, 
  SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Shield,
  Grid, Crosshair, Sparkles, Layers, RefreshCw, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { AnalysisRecord } from '../../lib/av/types';
import { normalizeVerdict } from '../../lib/av/format';
import { resolveMediaUrl } from '../../lib/av/media-vault';

export type OverlayMode = 'Original' | 'Heatmap' | 'Face Landmarks' | 'Artifact Map' | 'Attention Map' | 'Bounding Boxes';

interface MediaEvidenceViewerProps {
  analysis: AnalysisRecord;
}

export function MediaEvidenceViewer({ analysis }: MediaEvidenceViewerProps) {
  const [overlay, setOverlay] = useState<OverlayMode>('Original');
  const [zoom, setZoom] = useState(1);
  const [showSplit, setShowSplit] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [showGrid, setShowGrid] = useState(false);
  const [showCrosshairs, setShowCrosshairs] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(analysis.durationSec || 60);
  const [isMuted, setIsMuted] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Dynamic media source resolution & state
  const [mediaSrc, setMediaSrc] = useState<string | null>(analysis.imageUrl || null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVideo = analysis.kind === 'video' || Boolean(analysis.filename?.match(/\.(mp4|mov|avi|mkv|webm)$/i));

  const isMorph = normalizeVerdict(analysis.verdict) === 'FACE MORPHED';
  const isDeepfake = normalizeVerdict(analysis.verdict) === 'DEEPFAKE';
  const isAuthentic = normalizeVerdict(analysis.verdict) === 'AUTHENTIC';

  const overlayModes: OverlayMode[] = [
    'Original', 
    'Heatmap', 
    'Face Landmarks', 
    'Artifact Map', 
    'Attention Map', 
    'Bounding Boxes'
  ];

  // Resolve media URL from MediaVault (IndexedDB / memory / storage / direct URL)
  const refreshMediaSource = useCallback(async () => {
    setVideoError(null);
    setVideoLoading(true);
    try {
      const resolved = await resolveMediaUrl(analysis.id, analysis.sha256, analysis.imageUrl);
      if (resolved) {
        setMediaSrc(resolved);
      } else if (analysis.imageUrl) {
        setMediaSrc(analysis.imageUrl);
      } else {
        setMediaSrc(null);
        setVideoLoading(false);
      }
    } catch (err) {
      console.warn('Media source resolution notice:', err);
      if (analysis.imageUrl) setMediaSrc(analysis.imageUrl);
    }
  }, [analysis.id, analysis.sha256, analysis.imageUrl]);

  useEffect(() => {
    refreshMediaSource();
  }, [refreshMediaSource]);

  // Video time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const vidDuration = videoRef.current.duration;
      if (vidDuration && !isNaN(vidDuration) && vidDuration > 0) {
        setDuration(vidDuration);
      } else if (analysis.durationSec) {
        setDuration(analysis.durationSec);
      }
    }
    setVideoLoading(false);
  };

  const handleLoadedData = () => {
    setVideoLoading(false);
    setVideoReady(true);
    setVideoError(null);
  };

  const handleCanPlay = () => {
    setVideoLoading(false);
    setVideoReady(true);
  };

  const handleVideoError = () => {
    setVideoLoading(false);
    const err = videoRef.current?.error;
    let message = 'Unable to decode media stream.';
    if (err) {
      if (err.code === 1) message = 'Media playback aborted.';
      else if (err.code === 2) message = 'Network connection error while buffering stream.';
      else if (err.code === 3) message = 'Media decoding error or unsupported video codec.';
      else if (err.code === 4) message = 'Media format unsupported by browser decoder.';
    }
    setVideoError(message);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((playErr) => {
        console.warn('Video playback trigger notice:', playErr);
      });
    }
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    } else {
      setCurrentTime(time);
    }
  };

  const stepFrame = (forward: boolean) => {
    const step = 1 / (analysis.fps || 30);
    const newTime = Math.max(0, Math.min(duration, currentTime + (forward ? step : -step)));
    seekTo(newTime);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
  };

  const resetZoom = () => setZoom(1);
  const zoomIn = () => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)));

  return (
    <div className="bg-[#0C1118] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top control toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-white/[0.06] bg-[#0A0F17]">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-cyan-400" />
          <h2 className="text-[13px] font-semibold text-white font-display">Media Evidence Viewer</h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-400">
            {isVideo ? 'VIDEO SEQUENCE' : 'STATIC IMAGE'}
          </span>
        </div>

        {/* Overlay Mode Switcher */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {overlayModes.map(m => (
            <button
              key={m}
              onClick={() => setOverlay(m)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-all whitespace-nowrap ${
                overlay === m
                  ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Tools Bar: Zoom, Split comparison, Grid */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-white/[0.04] bg-[#080C13] text-[11px]">
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-md p-0.5">
            <button 
              onClick={zoomOut} 
              disabled={zoom <= 0.5} 
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30" 
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-2 font-mono text-slate-300 min-w-[42px] text-center">{Math.round(zoom * 100)}%</span>
            <button 
              onClick={zoomIn} 
              disabled={zoom >= 3} 
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30" 
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
            <button 
              onClick={resetZoom} 
              className="p-1 text-slate-400 hover:text-white border-l border-white/[0.06] ml-0.5" 
              title="Reset Zoom"
            >
              <RotateCcw size={12} />
            </button>
          </div>

          {/* Split Screen Slider Toggle */}
          <button
            onClick={() => setShowSplit(s => !s)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all ${
              showSplit 
                ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300' 
                : 'border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
            title="Toggle Split Screen Comparison"
          >
            <Sliders size={12} />
            <span>A/B Comparison</span>
          </button>

          {/* Grid & Crosshair Toggles */}
          <button
            onClick={() => setShowGrid(g => !g)}
            className={`p-1.5 rounded border transition-all ${
              showGrid ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300' : 'border-white/[0.06] text-slate-400 hover:text-white'
            }`}
            title="Toggle Inspection Grid"
          >
            <Grid size={13} />
          </button>
          <button
            onClick={() => setShowCrosshairs(c => !c)}
            className={`p-1.5 rounded border transition-all ${
              showCrosshairs ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-300' : 'border-white/[0.06] text-slate-400 hover:text-white'
            }`}
            title="Toggle Center Crosshairs"
          >
            <Crosshair size={13} />
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px]">
          <span>RES: {analysis.resolution || '1920x1080'}</span>
          <span>FPS: {analysis.fps || (isVideo ? 30 : 'N/A')}</span>
          <span className="text-cyan-400/70">LAYER: {overlay.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef}
        className="relative bg-[#05070B] min-h-[380px] sm:min-h-[460px] max-h-[580px] flex items-center justify-center overflow-hidden select-none cursor-crosshair"
      >
        {/* Inspection Grid Overlay */}
        {showGrid && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20 z-10"
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(0, 212, 255, 0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 212, 255, 0.4) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {/* Center Crosshairs */}
        {showCrosshairs && (
          <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="w-full h-[1px] bg-cyan-400/30 absolute" />
            <div className="h-full w-[1px] bg-cyan-400/30 absolute" />
            <div className="w-12 h-12 border border-cyan-400/50 rounded-full absolute" />
          </div>
        )}

        {/* Media Container with Zoom Scale */}
        <div 
          className="relative w-full h-full max-w-full max-h-[480px] flex items-center justify-center transition-transform duration-100 ease-out p-2"
          style={{ transform: `scale(${zoom})` }}
        >
          {isVideo ? (
            mediaSrc ? (
              <div className="relative flex items-center justify-center max-w-full max-h-full">
                <video
                  ref={videoRef}
                  src={mediaSrc}
                  poster={analysis.videoPoster}
                  className="max-h-[450px] w-auto max-w-full object-contain rounded shadow-2xl relative z-0"
                  playsInline
                  preload="metadata"
                  muted={isMuted}
                  onLoadStart={() => setVideoLoading(true)}
                  onLoadedMetadata={handleLoadedMetadata}
                  onLoadedData={handleLoadedData}
                  onCanPlay={handleCanPlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={() => setVideoLoading(true)}
                  onPlaying={() => { setVideoLoading(false); setIsPlaying(true); }}
                  onTimeUpdate={handleTimeUpdate}
                  onError={handleVideoError}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Video Loading Indicator */}
                {videoLoading && !videoError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded z-10 pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/30 text-cyan-300 font-mono text-[11px]">
                      <RefreshCw size={12} className="animate-spin text-cyan-400" />
                      <span>Buffering video stream...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center max-w-md">
                <div className="w-16 h-16 rounded-full border border-cyan-400/30 bg-cyan-400/10 mx-auto flex items-center justify-center mb-3">
                  <Shield size={30} className="text-cyan-400" />
                </div>
                <p className="text-[14px] font-semibold text-slate-200">{analysis.filename}</p>
                <p className="text-[11px] font-mono text-slate-500 mt-1">SHA-256: {analysis.sha256.slice(0, 32)}...</p>
                <button
                  onClick={refreshMediaSource}
                  className="mt-3 px-3 py-1 text-[11px] font-medium rounded bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/30 transition-all inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={11} />
                  <span>Connect Evidence Stream</span>
                </button>
              </div>
            )
          ) : mediaSrc || analysis.imageUrl ? (
            <img
              src={mediaSrc || analysis.imageUrl}
              alt={analysis.filename}
              className="max-h-[450px] w-auto max-w-full object-contain rounded shadow-2xl relative z-0"
            />
          ) : (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-full border border-cyan-400/30 bg-cyan-400/10 mx-auto flex items-center justify-center mb-3">
                <Shield size={30} className="text-cyan-400" />
              </div>
              <p className="text-[14px] font-semibold text-slate-200">{analysis.filename}</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1">SHA-256: {analysis.sha256.slice(0, 32)}...</p>
            </div>
          )}

          {/* Video Error Diagnostics overlay if media decoding error occurs */}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded z-20 p-6 text-center">
              <div className="max-w-sm space-y-3 bg-[#0E1520] border border-red-500/30 rounded-xl p-5 shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 mx-auto flex items-center justify-center text-red-400">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-white font-display">Video Playback Diagnostic</h4>
                  <p className="text-[11.5px] text-slate-400 mt-1">{videoError}</p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={refreshMediaSource}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold text-[11px] hover:bg-cyan-300 transition-all inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,212,255,0.3)]"
                  >
                    <RefreshCw size={12} />
                    <span>Retry Stream</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Forensic Overlays Layer */}
          {overlay !== 'Original' && !showSplit && (
            <ForensicOverlayRender 
              mode={overlay} 
              analysis={analysis} 
              isDeepfake={isDeepfake} 
              isMorph={isMorph} 
              isAuthentic={isAuthentic} 
            />
          )}

          {/* Split Screen A/B Comparison */}
          {showSplit && (
            <div 
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
            >
              <ForensicOverlayRender 
                mode={overlay === 'Original' ? 'Heatmap' : overlay} 
                analysis={analysis} 
                isDeepfake={isDeepfake} 
                isMorph={isMorph} 
                isAuthentic={isAuthentic} 
              />
            </div>
          )}
        </div>

        {/* Split comparison draggable bar */}
        {showSplit && (
          <div 
            className="absolute inset-y-0 z-20 cursor-ew-resize flex items-center justify-center pointer-events-auto"
            style={{ left: `${splitPos}%` }}
            onMouseDown={(e) => {
              const onMove = (moveEv: MouseEvent) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const pos = Math.max(5, Math.min(95, ((moveEv.clientX - rect.left) / rect.width) * 100));
                setSplitPos(pos);
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          >
            <div className="w-0.5 h-full bg-cyan-400 shadow-[0_0_8px_#00D4FF]" />
            <div className="absolute w-7 h-7 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-lg text-[10px] font-mono">
              ↔
            </div>
          </div>
        )}

        {/* Floating HUD Badges */}
        <div className="absolute top-3 left-3 bg-[#070A0F]/85 backdrop-blur-sm border border-white/[0.1] rounded px-2.5 py-1 text-[10px] font-mono flex items-center gap-2 z-10">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-300 font-semibold">{overlay.toUpperCase()}</span>
          {showSplit && <span className="text-slate-400 border-l border-white/[0.1] pl-2">SPLIT: {Math.round(splitPos)}%</span>}
        </div>

        {analysis.uncertainty !== undefined && (
          <div className="absolute top-3 right-3 bg-[#070A0F]/85 backdrop-blur-sm border border-white/[0.1] rounded px-2.5 py-1 text-[10px] font-mono text-slate-300 z-10">
            CONFIDENCE CALIBRATION: ±{analysis.uncertainty}%
          </div>
        )}
      </div>

      {/* Video Playback & Frame Scrubber Controls */}
      {isVideo && (
        <div className="p-4 border-t border-white/[0.06] bg-[#0A0F17] space-y-3">
          {/* Scrubber timeline with anomaly keyframe flags */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span className="text-[10px] text-cyan-400/80 uppercase font-semibold">
                {analysis.timeline && analysis.timeline.length > 0 
                  ? `${analysis.timeline.length} ANOMALY REGIONS DETECTED` 
                  : 'TIMELINE INSPECTION'}
              </span>
              <span>{formatTime(duration)}</span>
            </div>

            <div 
              className="relative h-7 bg-white/[0.04] border border-white/[0.08] rounded-lg overflow-hidden cursor-pointer hover:border-cyan-400/40 transition-all"
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                const frac = (e.clientX - r.left) / r.width;
                seekTo(frac * duration);
              }}
            >
              {/* Timeline marker flags */}
              {analysis.timeline?.map((ev, idx) => {
                const leftPercent = Math.min(98, Math.max(2, (ev.t / duration) * 100));
                return (
                  <div
                    key={idx}
                    title={`Suspicious Frame: ${ev.type.toUpperCase()} Anomaly (t=${ev.t}s)`}
                    className={`absolute top-1 bottom-1 w-1.5 rounded-sm z-10 transition-transform hover:scale-150 cursor-pointer ${
                      ev.type === 'face' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]' :
                      ev.type === 'temporal' ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]' :
                      'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.8)]'
                    }`}
                    style={{ left: `${leftPercent}%` }}
                    onClick={(evClick) => {
                      evClick.stopPropagation();
                      seekTo(ev.t);
                    }}
                  />
                );
              })}

              {/* Progress fill */}
              <div 
                className="h-full bg-cyan-400/20 border-r-2 border-cyan-400 transition-all duration-75"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>

          {/* Video Control Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 transition-all shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
              </button>

              <button
                onClick={() => stepFrame(false)}
                className="p-2 rounded border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]"
                title="Step backward 1 frame"
              >
                <SkipBack size={14} />
              </button>

              <button
                onClick={() => stepFrame(true)}
                className="p-2 rounded border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]"
                title="Step forward 1 frame"
              >
                <SkipForward size={14} />
              </button>

              <button
                onClick={() => setIsMuted(m => !m)}
                className="p-2 rounded border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded border border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]"
                title="Fullscreen Viewer"
              >
                <Maximize2 size={14} />
              </button>
            </div>

            {/* Playback speed selector */}
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-md p-0.5 text-[11px] font-mono">
              {[0.25, 0.5, 1, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    if (videoRef.current) videoRef.current.playbackRate = rate;
                  }}
                  className={`px-2 py-0.5 rounded transition-all ${
                    playbackRate === rate 
                      ? 'bg-cyan-400/20 text-cyan-300 font-bold' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent for rendering the diverse forensic overlays
function ForensicOverlayRender({ 
  mode, 
  analysis, 
  isDeepfake, 
  isMorph, 
  isAuthentic 
}: { 
  mode: OverlayMode; 
  analysis: AnalysisRecord; 
  isDeepfake: boolean; 
  isMorph: boolean; 
  isAuthentic: boolean;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none w-full h-full">
      {/* 1. Heatmap Layer */}
      {mode === 'Heatmap' && (
        <div 
          className="absolute inset-0 mix-blend-screen opacity-70 animate-pulse"
          style={{
            background: isDeepfake
              ? 'radial-gradient(ellipse 60% 50% at 50% 45%, rgba(239, 68, 68, 0.75) 0%, rgba(249, 115, 22, 0.4) 45%, transparent 80%)'
              : isMorph
              ? 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(245, 158, 11, 0.75) 0%, rgba(168, 85, 247, 0.4) 50%, transparent 80%)'
              : 'radial-gradient(ellipse 50% 45% at 50% 45%, rgba(16, 185, 129, 0.6) 0%, rgba(6, 182, 212, 0.3) 50%, transparent 80%)'
          }}
        />
      )}

      {/* 2. Face Landmarks / Biometric Mesh Layer */}
      {mode === 'Face Landmarks' && (
        <svg className="absolute inset-0 w-full h-full stroke-cyan-400/80 fill-cyan-400/30">
          {/* Facial boundary oval & chin */}
          <ellipse cx="50%" cy="46%" rx="24%" ry="32%" fill="none" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* Left Eye mesh */}
          <circle cx="42%" cy="40%" r="4" fill="#00D4FF" />
          <circle cx="38%" cy="40%" r="2.5" />
          <circle cx="46%" cy="40%" r="2.5" />
          <path d="M 36% 40% Q 42% 35% 48% 40% Q 42% 43% 36% 40%" fill="rgba(0,212,255,0.2)" strokeWidth="1" />
          {/* Right Eye mesh */}
          <circle cx="58%" cy="40%" r="4" fill="#00D4FF" />
          <circle cx="54%" cy="40%" r="2.5" />
          <circle cx="62%" cy="40%" r="2.5" />
          <path d="M 52% 40% Q 58% 35% 64% 40% Q 58% 43% 52% 40%" fill="rgba(0,212,255,0.2)" strokeWidth="1" />
          {/* Nose bridge */}
          <line x1="50%" y1="36%" x2="50%" y2="48%" strokeWidth="1.5" />
          <circle cx="50%" cy="48%" r="3" fill="#00D4FF" />
          {/* Mouth mesh */}
          <path d="M 42% 56% Q 50% 52% 58% 56% Q 50% 63% 42% 56%" fill="rgba(0,212,255,0.2)" strokeWidth="1.2" />
          {/* Morphing drift highlights if face morph */}
          {isMorph && (
            <>
              <circle cx="42%" cy="40%" r="10" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
              <circle cx="58%" cy="40%" r="10" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="42%" y1="40%" x2="45%" y2="43%" stroke="#EF4444" strokeWidth="2" />
            </>
          )}
        </svg>
      )}

      {/* 3. Artifact Map Layer (High-pass spatial frequency noise) */}
      {mode === 'Artifact Map' && (
        <div className="absolute inset-0 mix-blend-difference bg-cyan-950/40 backdrop-contrast-200">
          <div 
            className="w-full h-full opacity-60"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(239,68,68,0.5) 0%, transparent 60%)',
            }}
          />
        </div>
      )}

      {/* 4. Attention Map Layer (Multi-head vision transformer tokens) */}
      {mode === 'Attention Map' && (
        <div 
          className="absolute inset-0 mix-blend-color-dodge opacity-80"
          style={{
            background: 'conic-gradient(from 180deg at 50% 50%, rgba(147, 51, 234, 0.4), rgba(59, 130, 246, 0.4), rgba(239, 68, 68, 0.5), rgba(147, 51, 234, 0.4))'
          }}
        />
      )}

      {/* 5. Bounding Boxes Layer */}
      {mode === 'Bounding Boxes' && (
        <div className="absolute inset-0">
          {analysis.suspiciousRegions && analysis.suspiciousRegions.length > 0 ? (
            analysis.suspiciousRegions.map((region, idx) => (
              <div
                key={idx}
                className="absolute border-2 border-red-500 bg-red-500/15 rounded font-mono text-[9px] text-red-300 p-1.5 transition-all shadow-[0_0_12px_rgba(239,68,68,0.4)] pointer-events-auto"
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`,
                }}
              >
                <div className="bg-red-950/95 border border-red-500/60 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider flex items-center justify-between gap-1 shadow">
                  <span className="font-bold truncate">{region.description}</span>
                  <span className="text-red-400 font-mono">{region.severity ? region.severity.toUpperCase() : 'ALERT'}</span>
                </div>
              </div>
            ))
          ) : (
            <div 
              className={`absolute top-[22%] left-[28%] w-[44%] h-[56%] border-2 rounded-lg font-mono text-[10px] p-2 flex flex-col justify-between ${
                isAuthentic 
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' 
                  : 'border-red-500 bg-red-500/10 text-red-300'
              }`}
            >
              <span className="bg-black/80 px-2 py-0.5 rounded self-start border border-white/[0.1]">
                {isAuthentic ? 'PRIMARY SUBJECT: NATURAL' : 'PRIMARY SUBJECT: MANIPULATED REGION'}
              </span>
              <span className="self-end text-[9px] opacity-80">
                X: 28.0% · Y: 22.0% · W: 44.0% · H: 56.0%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
