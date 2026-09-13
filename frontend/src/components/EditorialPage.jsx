import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Volume2, VolumeX, Maximize } from 'lucide-react';

const getOptimizedVideoUrl = (url) => {
  if (!url) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
};

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const optimizedUrl = getOptimizedVideoUrl(secureUrl);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullScreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, []);

  return (
    <div 
      className="relative w-full rounded-2xl overflow-hidden bg-black border border-white/[0.1] shadow-2xl group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={optimizedUrl}
        preload="metadata"
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="w-full aspect-video bg-black cursor-pointer object-cover"
      />

      {/* Floating Center Play Button when paused */}
      {!isPlaying && (
        <button
          onClick={togglePlayPause}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all"
        >
          <Play className="w-7 h-7 fill-white translate-x-0.5" />
        </button>
      )}

      {/* Modern Control Bar Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-200 ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Scrubber track */}
        <div className="relative w-full mb-3 flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              if (videoRef.current) {
                videoRef.current.currentTime = Number(e.target.value);
              }
            }}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayPause}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="font-mono text-zinc-400 text-[11px]">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            onClick={handleFullScreen}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editorial;