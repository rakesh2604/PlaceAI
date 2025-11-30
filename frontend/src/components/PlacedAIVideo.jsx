import { useRef, useEffect } from 'react';

export default function PlacedAIVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    // Ensure video loads when component mounts
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  return (
    <div className="w-full flex justify-center mb-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* Video Container with Glow Effect */}
        <div className="relative group flex justify-center">
          {/* Soft Animated Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/10 via-indigo-400/10 to-pink-400/10 blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500" />
          
          {/* Video Wrapper */}
          <div className="relative w-full z-10 bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10">
            <video
              ref={videoRef}
              className="w-full h-auto rounded-2xl"
              controls
              playsInline
              preload="metadata"
              src="/videos/placedai_intro.mp4"
              style={{ 
                width: '100%',
                aspectRatio: "16/9",
                display: 'block' 
              }}
            >
              <p className="text-white text-center p-4">
                Your browser does not support the video tag. 
                <a href="/videos/placedai_intro.mp4" target="_blank" className="underline text-blue-400 ml-2">
                  Click here to watch directly
                </a>
              </p>
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