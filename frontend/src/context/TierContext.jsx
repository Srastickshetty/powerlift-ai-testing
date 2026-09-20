/**
 * TierContext.jsx - Centralized Tier & BYOK Access State
 * Manages Free, BYOK, and Pro tiers with local key storage
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const TierContext = createContext(null);

export const TierProvider = ({ children }) => {
  const [tier, setTier] = useState(() => {
    return localStorage.getItem('titan_user_tier') || 'free';
  });

  const [groqKey, setGroqKey] = useState(() => {
    return localStorage.getItem('titan_groq_key') || '';
  });

  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('titan_gemini_key') || '';
  });

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Automatically update tier to 'byok' if personal keys are configured and tier was 'free'
  useEffect(() => {
    if ((groqKey || geminiKey) && tier === 'free') {
      setTier('byok');
      localStorage.setItem('titan_user_tier', 'byok');
    }
  }, [groqKey, geminiKey, tier]);

  const saveKeys = ({ groq, gemini }) => {
    if (groq !== undefined) {
      setGroqKey(groq);
      if (groq) localStorage.setItem('titan_groq_key', groq);
      else localStorage.removeItem('titan_groq_key');
    }
    if (gemini !== undefined) {
      setGeminiKey(gemini);
      if (gemini) localStorage.setItem('titan_gemini_key', gemini);
      else localStorage.removeItem('titan_gemini_key');
    }
    if (groq || gemini) {
      setTier('byok');
      localStorage.setItem('titan_user_tier', 'byok');
    }
  };

  const changeTier = (newTier) => {
    setTier(newTier);
    localStorage.setItem('titan_user_tier', newTier);
  };

  const isFeatureAllowed = (requiredTier) => {
    if (requiredTier === 'free') return true;
    if (requiredTier === 'byok') return tier === 'byok' || tier === 'pro' || !!(groqKey || geminiKey);
    if (requiredTier === 'pro') return tier === 'pro';
    return true;
  };

  return (
    <TierContext.Provider
      value={{
        tier,
        setTier: changeTier,
        groqKey,
        geminiKey,
        saveKeys,
        isBYOKConfigured: !!(groqKey || geminiKey),
        isFeatureAllowed,
        isKeyModalOpen,
        setIsKeyModalOpen,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen
      }}
    >
      {children}
    </TierContext.Provider>
  );
};

export const useTier = () => {
  const context = useContext(TierContext);
  if (!context) {
    // Fallback safe defaults if used outside provider
    return {
      tier: 'free',
      setTier: () => {},
      groqKey: '',
      geminiKey: '',
      saveKeys: () => {},
      isBYOKConfigured: false,
      isFeatureAllowed: () => true,
      isKeyModalOpen: false,
      setIsKeyModalOpen: () => {},
      isUpgradeModalOpen: false,
      setIsUpgradeModalOpen: () => {}
    };
  }
  return context;
};

export default TierContext;
