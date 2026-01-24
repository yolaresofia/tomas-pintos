"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

type VideoPlayerProps = {
  previewVideoUrl: string;
  fullVideoUrl: string;
  alt?: string | null;
  isFullscreen?: boolean;
  title?: string;
};

function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
    /vimeo\.com\/channels\/\w+\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

type VimeoModalProps = {
  vimeoId: string;
  title: string;
  onClose: () => void;
};

function VimeoModal({ vimeoId, title, onClose }: VimeoModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUnmutedOnMobile, setHasUnmutedOnMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Fade in on mount and manage focus
  useEffect(() => {
    // Store previously focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      setIsVisible(true);
      // Focus the close button for accessibility
      closeButtonRef.current?.focus();
    }, 10);

    return () => {
      clearTimeout(timer);
      // Restore focus when modal closes
      previouslyFocusedRef.current?.focus();
    };
  }, []);

  // Handle closing with animation - fade out first, then exit fullscreen
  const handleAnimatedClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      // Exit fullscreen after fade animation completes
      if (document.fullscreenElement) {
        document.exitFullscreen().finally(() => {
          onClose();
        });
      } else {
        onClose();
      }
    }, 500); // Match the transition duration
  }, [isClosing, onClose]);

  useEffect(() => {
    const loadVimeoPlayer = async () => {
      // Dynamically import Vimeo Player
      const Player = (await import("@vimeo/player")).default;

      if (iframeRef.current) {
        const player = new Player(iframeRef.current);
        playerRef.current = player;

        player.on("loaded", () => {
          player.getDuration().then(setDuration);
        });

        player.on("timeupdate", (data: { seconds: number; percent: number }) => {
          setCurrentTime(data.seconds);
          setProgress(data.percent * 100);
        });

        player.on("play", () => setIsPlaying(true));
        player.on("pause", () => setIsPlaying(false));
        player.on("ended", () => setIsPlaying(false));
      }
    };

    loadVimeoPlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [vimeoId]);

  // Auto-enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      if (containerRef.current && !document.fullscreenElement) {
        try {
          await containerRef.current.requestFullscreen();
        } catch (err) {
          // Fullscreen request failed, continue without fullscreen
          console.warn("Could not enter fullscreen:", err);
        }
      }
    };

    // Small delay to ensure the container is rendered
    const timer = setTimeout(enterFullscreen, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);

      // Only handle close if user exited fullscreen externally (e.g., Escape key)
      // and we're not already in the process of closing
      if (!isNowFullscreen && !isClosing) {
        handleAnimatedClose();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.body.style.overflow = "";
    };
  }, [handleAnimatedClose, isClosing]);

  // Auto-hide controls after 2 seconds of inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  // Unmute on first interaction for mobile
  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasUnmutedOnMobile) return;

    // Only apply to mobile
    if (window.innerWidth >= 1100) return;

    const handleFirstInteraction = () => {
      if (playerRef.current && !hasUnmutedOnMobile) {
        playerRef.current.setMuted(false);
        playerRef.current.setVolume(1);
        setHasUnmutedOnMobile(true);
      }
    };

    container.addEventListener("touchstart", handleFirstInteraction, { once: true });
    container.addEventListener("click", handleFirstInteraction, { once: true });

    return () => {
      container.removeEventListener("touchstart", handleFirstInteraction);
      container.removeEventListener("click", handleFirstInteraction);
    };
  }, [hasUnmutedOnMobile]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = () => {
      resetHideTimer();
    };

    const handleTouchStart = () => {
      resetHideTimer();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("touchstart", handleTouchStart);

    // Start the initial timer
    resetHideTimer();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("touchstart", handleTouchStart);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [resetHideTimer]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    const newMuted = !isMuted;
    playerRef.current.setMuted(newMuted);
    setIsMuted(newMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!playerRef.current || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      playerRef.current.setCurrentTime(newTime);
    },
    [duration]
  );

  const handleClose = useCallback(() => {
    handleAnimatedClose();
  }, [handleAnimatedClose]);

  // Keyboard handler for modal
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    },
    [handleClose, togglePlay, toggleMute, toggleFullscreen]
  );

  const remainingTime = duration - currentTime;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Video player: ${title}`}
      onKeyDown={handleKeyDown}
      className={`fixed inset-0 z-50 flex flex-col bg-black transition-opacity duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&controls=0&background=0`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={title}
        />
        {/* Clickable overlay for play/pause */}
        <button
          className="absolute inset-0 cursor-pointer bg-transparent border-none w-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-inset"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        />
      </div>

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 min-[1100px]:px-6 py-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Mobile layout - justify-between, no progress bar */}
        <div className="flex min-[1100px]:hidden items-center justify-between text-white text-sm">
          {/* Left side - Title and Play/Pause */}
          <div className="flex items-center gap-3">
            <span className="font-medium min-w-0 truncate max-w-[120px]">
              {title}
            </span>
            <button
              onClick={togglePlay}
              className="hover:opacity-60 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <span className="tabular-nums flex-shrink-0">{formatTime(currentTime)}</span>
          </div>

          {/* Right side - Sound and Close */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="hover:opacity-60 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
              aria-label={isMuted ? "Unmute video" : "Mute video"}
            >
              Sound {isMuted ? "OFF" : "ON"}
            </button>
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="hover:opacity-60 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
              aria-label="Close video player"
            >
              Close
            </button>
          </div>
        </div>

        {/* Desktop layout - with progress bar */}
        <div className="hidden min-[1100px]:flex items-center gap-6 text-white text-sm">
          {/* Title */}
          <span className="font-medium min-w-0 truncate max-w-[200px]">
            {title}
          </span>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="hover:opacity-60 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Current Time */}
          <span className="tabular-nums flex-shrink-0">{formatTime(currentTime)}</span>

          {/* Progress Bar */}
          <div
            className="flex-1 h-[2px] bg-white/30 cursor-pointer relative group focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-4 focus:ring-offset-black rounded"
            onClick={handleProgressClick}
            role="slider"
            aria-label="Video progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            tabIndex={0}
          >
            <div
              className="absolute left-0 top-0 h-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Remaining Time */}
          <span className="tabular-nums flex-shrink-0" aria-hidden="true">{formatTime(remainingTime)}</span>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="hover:opacity-60 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            Sound {isMuted ? "OFF" : "ON"}
          </button>

          {/* Fullscreen/Close Toggle */}
          <button
            onClick={isFullscreen ? handleClose : toggleFullscreen}
            className="hover:opacity-60 transition-opacity flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
            aria-label={isFullscreen ? "Close video player" : "Enter fullscreen"}
          >
            {isFullscreen ? "Close" : "Fullscreen"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function VideoPlayer({
  previewVideoUrl,
  fullVideoUrl,
  alt: _alt,
  isFullscreen = false,
  title = "Video",
}: VideoPlayerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const vimeoId = extractVimeoId(fullVideoUrl);

  const handleClick = () => {
    if (vimeoId) {
      setIsModalOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <>
      <div
        className={`relative cursor-pointer touch-manipulation ${
          isFullscreen ? "w-full h-screen" : "w-full"
        }`}
        onClick={handleClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleClick();
        }}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Play video: ${title}`}
      >
        <video
          ref={videoRef}
          src={previewVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className={`object-cover pointer-events-none ${
            isFullscreen ? "w-full h-full" : "w-full h-auto"
          }`}
        />
      </div>
      {mounted && isModalOpen && vimeoId && (
        <VimeoModal
          vimeoId={vimeoId}
          title={title}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}