"use client";

import CameraGrid from "@/components/CameraGrid";
import AlertPanel, { Alert } from "@/components/AlertPanel";
import StatsChart from "@/components/StatsChart";
import HistoryModal from "@/components/HistoryModal";
import SettingsModal from "@/components/SettingsModal";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t, language, setLanguage } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://localhost:8000/alerts");
        if (!res.ok) throw new Error("Backend unavailable");
        const data = await res.json();
        setAlerts(data.alerts);
        setError(false);
      } catch (error) {
        console.warn("Backend connection failed, retrying...");
        setError(true);
      }
    };

    // Initial fetch
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white p-4 md:p-6 lg:p-8 font-sans selection:bg-red-500/30">
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Navbar / Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            {t.header.title}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t.header.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
             onClick={() => setIsSettingsOpen(true)}
             className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            {t.header.settings}
          </button>
          
          <button 
             onClick={() => setIsHistoryOpen(true)}
             className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
            {t.header.history}
          </button>

          {/* Language Selector */}
          <div className="hidden md:flex items-center relative group">
             <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-colors text-sm font-medium uppercase font-mono">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
               {language}
             </button>
             {/* Dropdown menu */}
             <div className="absolute top-full right-0 mt-2 w-24 bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden flex flex-col shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${language === 'en' ? 'text-white font-bold bg-white/5' : 'text-gray-400'}`}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('tr')}
                  className={`px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${language === 'tr' ? 'text-white font-bold bg-white/5' : 'text-gray-400'}`}
                >
                  TR
                </button>
             </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-green-400">{t.header.systemActive}</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] overflow-hidden">
        {/* Video Feed Section - Takes 2/3 width */}
        <div className="lg:col-span-2 h-full flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 rounded-2xl overflow-hidden bg-black border border-gray-800 relative p-2">
            <CameraGrid />
          </div>
          
           {/* Bottom Stats Area (Under Video) */}
           <div className="h-48 rounded-2xl bg-gray-900/50 border border-white/5 overflow-hidden hidden lg:block">
              <StatsChart />
           </div>
        </div>

        {/* Sidebar / Alerts - Takes 1/3 width */}
        <div className="h-full flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 min-h-0 bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
            <AlertPanel alerts={alerts} error={error} />
          </div>
          
          {/* Daily Count Widget */}
          <div className="h-32 shrink-0 rounded-2xl bg-gray-900/50 border border-white/5 p-4 flex flex-col justify-center items-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-4xl font-bold text-white mb-2 relative z-10">{alerts.length}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest relative z-10">
              {t.stats.dailyCount}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};
