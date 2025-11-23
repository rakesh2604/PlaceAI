import { useState, useRef, useEffect } from 'react';

export default function PlacedAIVideo() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  const handleLoadedMetadata = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = (e) => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    // Force reload on mount to ensure correct path resolution
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  return (
    <div className="w-full flex justify-center mb-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* Video Container with Glow Effect */}
        <div className="relative group flex justify-center">
          {/* Soft Animated Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/10 via-indigo-400/10 to-pink-400/10 blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500" />
          
          {/* Video Wrapper */}
          <div className="relative w-full z-10">
            {isLoading && !hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-20 rounded-2xl">
                <div className="text-white text-lg">Loading video…</div>
              </div>
            )}
            
            {hasError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-20 rounded-2xl">
                <div className="text-white text-center px-4">
                  <p className="text-lg mb-2">Failed to load video</p>
                  <p className="text-sm text-gray-400">Please check your connection and try again.</p>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              src="/videos/placedai_intro.mp4"
              className="relative z-10 w-full max-w-6xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 backdrop-blur-sm"
              controls
              preload="metadata"
              style={{ 
                display: isLoading || hasError ? 'none' : 'block',
                aspectRatio: "16/9"
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Description */}
        <p className="text-center text-dark-600 dark:text-dark-300 mt-4 text-base">
          This intro video gives a quick overview of how PlacedAI helps you prepare for real interviews.
        </p>
      </div>
    </div>
  );
}
