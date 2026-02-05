"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

// Define types
export interface Alert {
  id?: number;
  timestamp: string;
  type: string;
  confidence: number;
  snapshot?: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  error: boolean;
}

const AlertPanel = ({ alerts, error }: AlertPanelProps) => {
  const { t } = useLanguage();
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  // Audio effect
  useEffect(() => {
    if (alerts.length > 0 && isSoundEnabled) {
      const latest = alerts[0];
      // Play sound only if confidence is high and it's a recent alert (top of list)
      if (latest.confidence > 0.6) {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.volume = 0.5;
        audio.play().catch(e => console.warn("Audio play failed", e));
      }
    }
  }, [alerts, isSoundEnabled]);

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden p-4 items-center justify-center text-center">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mb-2" />
        <h3 className="text-sm font-bold text-white">{t.common.loading}</h3>
        <p className="text-xs text-gray-500 mt-1">{t.common.waitingBackend}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {selectedSnapshot && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedSnapshot(null)}
        >
          <div className="relative max-w-4xl w-full bg-gray-900 rounded-2xl overflow-hidden border border-white/10">
            <button 
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors"
              onClick={() => setSelectedSnapshot(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <img src={`http://localhost:8000${selectedSnapshot}`} alt="Event Snapshot" className="w-full h-auto" />
            <div className="p-4 bg-black/50 absolute bottom-0 w-full backdrop-blur-md">
              <p className="text-white text-sm font-medium">{t.common.snapshotView}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white tracking-wide">
            {t.alerts.title}
          </h3>
          <span className="text-xs font-mono text-gray-500">
            {alerts.length} {t.alerts.event}
          </span>
        </div>
        <button
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className={`p-2 rounded-lg transition-colors ${
            isSoundEnabled 
              ? "bg-white/10 text-white hover:bg-white/20" 
              : "text-gray-500 hover:text-white hover:bg-white/5"
          }`}
          title={isSoundEnabled ? t.common.mute : t.common.unmute}
        >
          {isSoundEnabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-0">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-sm">
            {t.common.noDetections}
            <br />
            {t.common.systemNormal}
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`group flex items-start gap-4 p-3 rounded-xl border ${
                alert.type === "fire"
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-orange-500/10 border-orange-500/20"
              } transition-all hover:bg-white/5 animate-in slide-in-from-right-2 cursor-pointer`}
              onClick={() => alert.snapshot && setSelectedSnapshot(alert.snapshot)}
            >
              <div
                className={`w-2 h-2 mt-2 rounded-full ${
                  alert.type === "fire" ? "bg-red-500" : "bg-orange-500"
                } animate-pulse`}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-semibold text-white capitalize">
                    {alert.type === "fire" ? t.alerts.fireDetected : alert.type === "smoke" ? t.alerts.smokeDetected : `${alert.type} ${t.alerts.event}`}
                  </h4>
                  <span className="text-xs text-gray-500 font-mono">
                    {alert.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-white/60">
                    {t.alerts.confidence}: %{(alert.confidence * 100).toFixed(1)}
                  </p>
                  {alert.snapshot && (
                    <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      {t.history.viewSnapshot}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
