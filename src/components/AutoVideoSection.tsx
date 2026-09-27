import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
} from 'lucide-react';

interface AutoVideoSectionProps {
  videoUrl?: string;
  videoPoster?: string;
  videoTitle?: string;
  videoDescription?: string;
}

export const AutoVideoSection: React.FC<AutoVideoSectionProps> = ({
  videoUrl = '/videos/video.mp4',
  videoPoster,
  videoTitle,
  videoDescription,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lazy-load state: null initially to prevent downloading during initial page load
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Ref to track if audio was successfully enabled so it is never re-muted
  const audioEnabledRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(true);
  isMutedRef.current = isMuted;

  // Unmute function to enable audio safely
  const enableAudio = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video
      .play()
      .then(() => {
        audioEnabledRef.current = true;
        setIsMuted(false);
        setIsPlaying(true);
        setHasInteracted(true);
      })
      .catch(() => {
        // If unmuted playback still restricted, leave muted state
      });
  }, []);

  // 1. Lazy-load via IntersectionObserver when 3rd section approaches viewport (~600px margin)
  useEffect(() => {
    const target = sectionRef.current;
    if (!target || videoSrc) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          const resolvedSrc = videoUrl || '/videos/video.mp4';
          setVideoSrc(resolvedSrc);

          const video = videoRef.current;
          if (video) {
            video.src = resolvedSrc;
            video.load();

            // Attempt unmuted playback first
            video.muted = false;
            const playPromise = video.play();

            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  // Browser permitted unmuted autoplay!
                  audioEnabledRef.current = true;
                  setIsMuted(false);
                  setIsPlaying(true);
                })
                .catch(() => {
                  // Browser autoplay policy requires initial mute
                  // Gracefully fall back to muted playback without attempting to bypass policy
                  video.muted = true;
                  setIsMuted(true);
                  video
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
                });
            }
          }

          observer.disconnect();
        }
      },
      {
        rootMargin: '600px 0px',
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [videoUrl, videoSrc]);

  // 2. Set up one-time legitimate user interaction listener to unmute if initially blocked
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (audioEnabledRef.current) return;
      enableAudio();
    };

    const interactionEvents = ['click', 'touchstart', 'pointerdown', 'keydown'] as const;
    interactionEvents.forEach((event) => {
      window.addEventListener(event, handleFirstInteraction, { once: true, passive: true });
    });

    return () => {
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [enableAudio]);

  // 3. Play / Pause based on visibility in viewport (respects audio state, never re-mutes)
  useEffect(() => {
    const target = sectionRef.current;
    if (!target || !videoSrc) return;

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const video = videoRef.current;
        if (!video) return;

        if (entry.isIntersecting) {
          // Preserve current unmuted state; do NOT force muted=true after audio was enabled
          video.muted = isMutedRef.current;
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              // If unmuted play failed and audio hasn't been enabled yet, try muted
              if (!audioEnabledRef.current) {
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => setIsPlaying(true)).catch(() => {});
              }
            });
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      {
        threshold: 0.15,
      }
    );

    visibilityObserver.observe(target);

    return () => {
      visibilityObserver.disconnect();
    };
  }, [videoSrc]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const targetMuted = !isMuted;
    video.muted = targetMuted;
    setIsMuted(targetMuted);
    setHasInteracted(true);

    if (!targetMuted) {
      audioEnabledRef.current = true;
      video.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const cur = video.currentTime;
    const dur = video.duration || 1;
    setCurrentTime(cur);
    setProgress((cur / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration || 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pos * (video.duration || 1);
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <section ref={sectionRef} id="video" className="py-20 md:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Behind The Wheel</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display mb-4">
            Mahi Beast
          </h2>
        </div>

        {/* Responsive Video Container: Adapts naturally across 320px to 4K without cropping or overflow */}
        <div className="w-full max-w-5xl mx-auto">
          <div
            ref={containerRef}
            className="relative group rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-white/[0.12] shadow-[0_25px_60px_rgba(0,0,0,0.65)] bg-black w-full"
            style={{
              width: '100%',
              maxWidth: '100%',
              aspectRatio: '16 / 9',
            }}
          >
            <video
              ref={videoRef}
              poster={videoPoster}
              autoPlay
              playsInline
              muted={isMuted}
              loop
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
              className="block w-full h-full max-w-full object-contain cursor-pointer transform-gpu select-none"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
              }}
            >
              {videoSrc && <source src={videoSrc} type="video/mp4" />}
            </video>

            {/* Subtle Audio Status Hint (only displayed while muted before user audio enablement) */}
            {isMuted && !hasInteracted && isPlaying && (
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-black/70 hover:bg-black/90 text-white text-[11px] sm:text-xs font-semibold backdrop-blur-xl border border-white/20 shadow-lg transition-all active:scale-95"
                  aria-label="Unmute audio"
                >
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                  <span>Tap to Unmute</span>
                </button>
              </div>
            )}

            {/* Sleek Overlay Controls (mobile touch-friendly & desktop hover) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-20">
              {/* Progress Scrubber */}
              <div
                onClick={handleSeek}
                className="w-full h-1.5 hover:h-2.5 bg-white/25 rounded-full cursor-pointer transition-all mb-3 relative overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </button>

                  <span className="text-[11px] sm:text-xs text-slate-300 tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFullScreen}
                    className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors active:scale-95"
                    aria-label="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
