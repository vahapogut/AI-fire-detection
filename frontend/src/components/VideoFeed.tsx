"use client";

import React, { useState, useEffect } from "react";

const VideoFeed = () => {
  const [loading, setLoading] = useState(true);
  const videoUrl = "http://localhost:8000/video_feed";

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-black">
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 z-10 hidden md:block">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-widest uppercase">
            Canlı Kamera 01
          </span>
        </div>
      </div>

      {/* Video Stream */}
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <img
          src={videoUrl}
          alt="Canlı Video Akışı"
          className="w-full h-full object-contain"
          onLoad={() => setLoading(false)}
          onError={() => setLoading(true)}
        />
        
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 gap-2">
            <div className="w-8 h-8 border-2 border-red-500/50 border-t-red-500 rounded-full animate-spin" />
            <span className="text-sm">Bağlantı kuruluyor...</span>
          </div>
        )}
      </div>

      {/* Footer Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-between items-end">
          <div className="text-xs text-gray-400 font-mono">
            FPS: 24.1 | RES: 1080p | AI: YOLOv8
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
