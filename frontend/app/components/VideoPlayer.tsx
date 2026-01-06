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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

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

      // Close modal when exiting fullscreen (user pressed Escape or clicked Close)
      if (!isNowFullscreen) {
        onClose();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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
    if (document.fullscreenElement) {
      document.exitFullscreen().then(onClose);
    } else {
      onClose();
    }
  }, [onClose]);

  const remainingTime = duration - currentTime;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0&controls=0&background=0`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
        {/* Clickable overlay for play/pause */}
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        />
      </div>

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-6 text-white text-sm">
          {/* Title */}
          <span className="font-medium min-w-0 truncate max-w-[200px]">
            {title}
          </span>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="hover:opacity-60 transition-opacity flex-shrink-0"
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
            className="flex-1 h-[2px] bg-white/30 cursor-pointer relative group"
            onClick={handleProgressClick}
          >
            <div
              className="absolute left-0 top-0 h-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Remaining Time */}
          <span className="tabular-nums flex-shrink-0">{formatTime(remainingTime)}</span>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="hover:opacity-60 transition-opacity flex-shrink-0"
          >
            Sound {isMuted ? "OFF" : "ON"}
          </button>

          {/* Fullscreen/Close Toggle */}
          <button
            onClick={isFullscreen ? handleClose : toggleFullscreen}
            className="hover:opacity-60 transition-opacity flex-shrink-0"
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
  alt,
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

  return (
    <>
      <div
        className={`relative cursor-pointer ${
          isFullscreen ? "w-full h-screen" : "w-full"
        }`}
        onClick={handleClick}
      >
        <video
          ref={videoRef}
          src={previewVideoUrl}
          autoPlay
          loop
          muted
          playsInline
          className={`object-cover ${
            isFullscreen ? "w-full h-full" : "w-full h-auto"
          }`}
          aria-label={alt || "Video preview"}
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