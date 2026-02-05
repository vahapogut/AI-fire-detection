"use client";

import React, { useEffect, useState } from 'react';

interface Event {
  id: number;
  timestamp: string;
  type: string;
  confidence: number;
  snapshot_path: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal = ({ isOpen, onClose }: HistoryModalProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/history?limit=100");
      if (res.ok) {
        const json = await res.json();
        setEvents(json.events);
      }
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-2xl shadow-red-900/10">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">Olay Geçmişi</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex gap-6">
           {/* Detailed List */}
           <div className="flex-1 overflow-y-auto custom-scrollbar">
             {loading ? (
                <div className="flex justify-center items-center h-full text-gray-500">Yükleniyor...</div>
             ) : events.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">Kayıt bulunamadı.</div>
             ) : (
               <table className="w-full text-left text-sm text-gray-400">
                 <thead className="text-xs uppercase bg-white/5 text-gray-300 font-semibold sticky top-0 backdrop-blur-md">
                   <tr>
                     <th className="px-4 py-3 rounded-tl-lg">Zaman</th>
                     <th className="px-4 py-3">Tür</th>
                     <th className="px-4 py-3">Güven</th>
                     <th className="px-4 py-3 text-right rounded-tr-lg">İşlem</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {events.map((event) => (
                     <tr 
                        key={event.id} 
                        className="hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={() => setSelectedSnapshot(event.snapshot_path)}
                     >
                       <td className="px-4 py-3 font-mono text-white/80">{event.timestamp}</td>
                       <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded text-xs font-medium ${
                           event.type === 'fire' 
                             ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                             : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                         }`}>
                           {event.type.toUpperCase()}
                         </span>
                       </td>
                       <td className="px-4 py-3 text-white">
                         %{(event.confidence * 100).toFixed(1)}
                       </td>
                       <td className="px-4 py-3 text-right">
                         {event.snapshot_path && (
                            <button className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-blue-500/10 transition-colors">
                              Görüntüle
                            </button>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
           </div>

           {/* Preview Panel */}
           <div className="w-1/3 shrink-0 bg-black/20 rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center text-center">
              {selectedSnapshot ? (
                <div className="space-y-4 w-full">
                  <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg">
                    <img 
                      src={`http://localhost:8000${selectedSnapshot}`} 
                      alt="Preview" 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                  <div className="text-left">
                     <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Seçilen Kayıt</p>
                     <p className="text-white text-sm break-all font-mono">{selectedSnapshot.split('/').pop()}</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 space-y-2">
                  <svg className="w-12 h-12 mx-auto opacity-20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <p className="text-sm">Görüntülemek için listeden bir olaya tıklayın.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
