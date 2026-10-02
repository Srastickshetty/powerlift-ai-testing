import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./auth/authContext";
import { TierProvider } from "./context/TierContext";
import { registerSW } from 'virtual:pwa-register';
import "./styles/tokens.css";
import "./styles/tailwind.css";
import "./styles/pwa-lock.css";

// Auto-register service worker for offline app-shell booting
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[PWA]: New version available, auto-updating cache.');
    },
    onOfflineReady() {
      console.log('[PWA]: App ready for offline gym platform use.');
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <TierProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </TierProvider>
    </AuthProvider>
  </React.StrictMode>
);