import { useState, useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already set preferences
    const consentState = localStorage.getItem('cookie_consent');
    if (!consentState) {
      setIsVisible(true);
    } else {
      // If already granted in a previous session, inform Google Analytics
      if (consentState === 'granted') {
        updateConsent(true);
      }
    }
  }, []);

  const updateConsent = (granted: boolean) => {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied'
      });
    }
  };

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', 'granted');
    updateConsent(true);
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    localStorage.setItem('cookie_consent', 'denied');
    updateConsent(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 bg-[var(--bg-primary)] border-t border-[var(--sp-accent)]/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex-1 max-w-4xl text-sm sm:text-base text-[var(--text-primary)]">
        <p className="mb-2 font-semibold">We value your privacy</p>
        <p className="text-[var(--text-secondary)]">
          We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
        </p>
      </div>
      <div className="flex shrink-0 items-center justify-end gap-3 w-full sm:w-auto">
        <button 
          onClick={handleDeclineAll}
          className="sp-btn-glass text-sm flex-1 sm:flex-none whitespace-nowrap"
        >
          Decline All
        </button>
        <button 
          onClick={handleAcceptAll}
          className="sp-btn-primary text-sm flex-1 sm:flex-none whitespace-nowrap"
        >
          Accept All
        </button>
      </div>
    </div>
  );
};
