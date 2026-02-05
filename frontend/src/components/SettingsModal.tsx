"use client";

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'email' | 'telegram'>('email');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [settings, setSettings] = useState({
    // Email
    email_enabled: "false",
    smtp_server: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_password: "",
    receiver_email: "",
    
    // Telegram
    telegram_enabled: "false",
    telegram_bot_token: "",
    telegram_chat_id: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("http://localhost:8000/settings");
      if (res.ok) {
        const json = await res.json();
        setSettings(prev => ({ ...prev, ...json.settings }));
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? "true" : "false") : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // Save all settings one by one (could be optimized to bulk save)
      for (const [key, value] of Object.entries(settings)) {
        await fetch("http://localhost:8000/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value })
        });
      }
      setMessage({ text: t.settings.saved, type: 'success' });
    } catch (error) {
      setMessage({ text: "Error saving settings", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("http://localhost:8000/test-notification", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
          setMessage({ text: t.settings.testSent, type: 'success' });
      } else {
          setMessage({ text: "Test failed: " + json.message, type: 'error' });
      }
    } catch (error) {
       setMessage({ text: "Test connection failed.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
          <h2 className="text-xl font-bold text-white">{t.settings.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'email' ? 'bg-white/5 text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            {t.settings.emailTab}
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'telegram' ? 'bg-white/5 text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            {t.settings.telegramTab}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-200">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="email_enabled"
                  name="email_enabled"
                  checked={settings.email_enabled === "true"}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-red-500 focus:ring-red-500"
                />
                <label htmlFor="email_enabled" className="text-white text-sm font-medium">{t.settings.enableEmail}</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase">{t.settings.smtpServer}</label>
                  <input type="text" name="smtp_server" value={settings.smtp_server} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-red-500 outline-none" placeholder="smtp.gmail.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 uppercase">{t.settings.smtpPort}</label>
                  <input type="text" name="smtp_port" value={settings.smtp_port} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-red-500 outline-none" placeholder="587" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">{t.settings.senderEmail}</label>
                <input type="email" name="smtp_user" value={settings.smtp_user} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-red-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">{t.settings.senderPassword}</label>
                <input type="password" name="smtp_password" value={settings.smtp_password} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-red-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">{t.settings.receiverEmail}</label>
                <input type="email" name="receiver_email" value={settings.receiver_email} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-red-500 outline-none" />
              </div>
            </div>
          )}

          {activeTab === 'telegram' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-200">
               <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="telegram_enabled"
                  name="telegram_enabled"
                  checked={settings.telegram_enabled === "true"}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="telegram_enabled" className="text-white text-sm font-medium">{t.settings.enableTelegram}</label>
              </div>

              <div className="bg-blue-500/10 p-3 rounded text-xs text-blue-300 mb-4 whitespace-pre-line">
                {t.settings.telegramHelp}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">{t.settings.botToken}</label>
                <input type="text" name="telegram_bot_token" value={settings.telegram_bot_token} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500 uppercase">{t.settings.chatId}</label>
                <input type="text" name="telegram_chat_id" value={settings.telegram_chat_id} onChange={handleChange} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white text-sm focus:border-blue-500 outline-none" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
            <button 
              onClick={handleTest}
              disabled={loading}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm transition-colors disabled:opacity-50"
            >
              {t.settings.test}
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {t.settings.save}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
