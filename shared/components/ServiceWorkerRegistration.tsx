'use client';

import { useEffect } from 'react';

/**
 * Registers the audio caching service worker
 * This component should be included in the root layout
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker after page load to not block initial render
      window.addEventListener('load', () => {
        const register = async () => {
          try {
            const registrations =
              await navigator.serviceWorker.getRegistrations();

            await Promise.all(
              registrations
                .filter(reg => reg.active?.scriptURL.endsWith('/sw.js'))
                .filter(reg => new URL(reg.scope).pathname === '/')
                .map(reg => reg.unregister())
            );

            const registration = await navigator.serviceWorker.register(
              '/sw.js',
              {
                scope: '/sounds/'
              }
            );

            console.warn('Audio SW registered:', registration.scope);

            setInterval(
              () => {
                registration.update();
              },
              60 * 60 * 1000
            );
          } catch (error) {
            console.warn('Audio SW registration failed:', error);
          }
        };

        void register();
      });
    }
  }, []);

  return null;
}

/**
 * Utility to manually cache an audio file
 */
export const cacheAudioFile = (url: string) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_AUDIO',
      url
    });
  }
};

/**
 * Utility to clear the audio cache
 */
export const clearAudioCache = () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_AUDIO_CACHE'
    });
  }
};
