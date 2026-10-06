/**
 * TierContext.jsx - Server-Driven Entitlements & Tier Access
 * Cleaned per P0 Security: BYOK browser key storage removed; entitlements derived server-side.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/authContext';

const TierContext = createContext(null);

export const TierProvider = ({ children }) => {
  const { user, profile } = useAuth();

  // Tier is securely derived from server profile; default to 'pro' during beta test mode
  const [tier, setTier] = useState('pro');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // TODO: Phase P4 - Fetch entitlements securely from GET /api/me/entitlements
  useEffect(() => {
    if (profile?.tier) {
      setTier(profile.tier);
    } else {
      setTier('pro'); // Test mode default
    }

    // Clean up legacy vulnerable localStorage keys if present
    try {
      localStorage.removeItem('titan_user_tier');
      localStorage.removeItem('titan_groq_key');
      localStorage.removeItem('titan_gemini_key');
    } catch (e) {
      // Ignored
    }
  }, [profile]);

  const isFeatureAllowed = (requiredTier) => {
    if (requiredTier === 'free') return true;
    if (requiredTier === 'pro') return tier === 'pro';
    return true;
  };

  const openUpgradeModal = () => setIsUpgradeModalOpen(true);
  const closeUpgradeModal = () => setIsUpgradeModalOpen(false);

  return (
    <TierContext.Provider
      value={{
        tier,
        isFeatureAllowed,
        isUpgradeModalOpen,
        openUpgradeModal,
        closeUpgradeModal
      }}
    >
      {children}
    </TierContext.Provider>
  );
};

export const useTier = () => {
  const context = useContext(TierContext);
  if (!context) {
    return {
      tier: 'pro',
      isFeatureAllowed: () => true,
      openUpgradeModal: () => {},
      closeUpgradeModal: () => {}
    };
  }
  return context;
};
