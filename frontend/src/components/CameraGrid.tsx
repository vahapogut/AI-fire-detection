"use client";

import React, { useEffect, useState } from 'react';

interface Camera {
  id: number;
  name: string;
  source: string;
}

const CameraGrid = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCamSource, setNewCamSource] = useState("");
  const [newCamName, setNewCamName] = useState("");

  const fetchCameras = async () => {
    try {
      const res = await fetch("http://localhost:8000/cameras");
      const data = await res.json();
      setCameras(data.cameras);
    } catch (e) {
      console.error("Failed to fetch cameras");
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleAddCamera = async () => {
    if (!newCamSource) return;
    
    try {
      await fetch("http://localhost:8000/cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: newCamSource, name: newCamName || `Kamera ${cameras.length + 1}` })
      });
      setIsAdding(false);
      setNewCamSource("");
      setNewCamName("");
      fetchCameras();
    } catch (e) {
      alert("Kamera eklenemedi");
    }
  };

  const handleDeleteCamera = async (id: number) => {
    if(!confirm("Kamerayı silmek istediğinize emin misiniz?")) return;
    try {
      await fetch(`http://localhost:8000/cameras/${id}`, { method: "DELETE" });
      fetchCameras();
    } catch (e) {
      alert("Silinemedi");
    }
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-4 px-2">
         <h2 className="text-white font-bold">Aktif Kameralar ({cameras.length})</h2>
         <button 
           onClick={() => setIsAdding(true)}
           className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white transition-colors"
         >
           + Kamera Ekle
         </button>
       </div>

       {/* Add Camera Form */}
       {isAdding && (
         <div className="mb-4 p-4 bg-gray-900 border border-white/10 rounded-xl space-y-3 animate-in slide-in-from-top-2">
            <h3 className="text-sm text-white font-medium">Yeni Kamera Ekle</h3>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Kamera Adı (Örn: Giriş)" 
                className="bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs outline-none focus:border-blue-500"
                value={newCamName}
                onChange={(e) => setNewCamName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Kaynak (0, 1, rtsp://...)" 
                className="bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-xs outline-none focus:border-blue-500"
                value={newCamSource}
                onChange={(e) => setNewCamSource(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 text-gray-400 hover:text-white text-xs"
              >
                İptal
              </button>
              <button 
                onClick={handleAddCamera}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs"
              >
                Kaydet
              </button>
            </div>
         </div>
       )}

       <div className={`grid gap-4 flex-1 overflow-y-auto min-h-0 ${cameras.length <= 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
         {cameras.map((cam) => (
           <div key={cam.id} className="relative rounded-xl overflow-hidden bg-black border border-gray-800 group">
             {/* Delete Button */}
             {cam.id !== 0 && ( // Prevent deleting default camera 0 accidentally if desired, or allow all
               <button 
                onClick={() => handleDeleteCamera(cam.id)}
                className="absolute top-2 right-2 z-10 p-1 bg-red-500/80 text-white rounded hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Kamerayı Sil"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
               </button>
             )}
             
             {/* Verification Badge */}
             <div className="absolute top-2 left-2 z-10 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/5">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-medium text-white/90">{cam.name}</span>
             </div>

             <img 
               src={`http://localhost:8000/video_feed/${cam.id}`} 
               alt={cam.name}
               className="w-full h-full object-contain" // object-contain to preserve aspect ratio
             />
           </div>
         ))}
       </div>
    </div>
  );
};

export default CameraGrid;
