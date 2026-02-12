import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App'

// ── App-level cache version invalidation ──────────────────────────────────
// When the app version changes (new deploy), clear stale browser storage
// to prevent users from seeing outdated data.
const APP_CACHE_VERSION = import.meta.env.VITE_APP_VERSION || '0.0.0';
const STORED_VERSION_KEY = 'app-cache-version';

try {
  const storedVersion = localStorage.getItem(STORED_VERSION_KEY);
  if (storedVersion !== APP_CACHE_VERSION) {
    console.log(`🔄 App version changed (${storedVersion} → ${APP_CACHE_VERSION}). Clearing stale caches.`);
    // Preserve i18n language preference
    const savedLng = localStorage.getItem('i18nextLng');
    localStorage.clear();
    if (savedLng) localStorage.setItem('i18nextLng', savedLng);
    sessionStorage.clear();
    localStorage.setItem(STORED_VERSION_KEY, APP_CACHE_VERSION);
  }
} catch (e) {
  // Storage may be unavailable in some environments — ignore
}

// ── Debug utility: window.clearAppCache() ─────────────────────────────────
// Allows support staff / developers to force-clear all client caches from the
// browser console without needing a hard refresh.
declare global {
  interface Window {
    clearAppCache: () => void;
  }
}

window.clearAppCache = () => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    if ('caches' in window) {
      caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
    }
    console.log('✅ All client-side caches cleared. Reload the page to fetch fresh data.');
  } catch (e) {
    console.error('❌ Failed to clear caches:', e);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
