"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "../locales/en";
import { tr } from "../locales/tr";

type Language = "en" | "tr";
type Translations = typeof en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("http://localhost:8000/settings");
        if (res.ok) {
          const settings = await res.json();
          // Backend keys might match what we save. 
          // We will use 'system_language' key for backend storage to avoid conflict if any
          if (settings.system_language) {
            setLanguage(settings.system_language as Language);
          }
        }
      } catch (error) {
        console.error("Failed to load language settings", error);
      }
    };
    loadSettings();
  }, []);

  const handleSetLanguage = async (lang: Language) => {
    setLanguage(lang);
    try {
      await fetch("http://localhost:8000/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "system_language", value: lang }),
      });
    } catch (error) {
      console.error("Failed to save language setting", error);
    }
  };

  const t = language === "tr" ? tr : en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
