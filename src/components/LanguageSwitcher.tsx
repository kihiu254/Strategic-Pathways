import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const LANGUAGE_OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Swahili' },
  { code: 'fr', label: 'Francais' },
  { code: 'es', label: 'Espanol' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: 'Chinese' },
  { code: 'ar', label: 'Arabic' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activeLanguageCode = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const currentLanguage =
    LANGUAGE_OPTIONS.find((language) => language.code === activeLanguageCode) || LANGUAGE_OPTIONS[0];

  const toggleLanguage = (code: string) => {
    void i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-light border border-[var(--sp-accent)]/10 text-[var(--text-primary)] hover:bg-[var(--sp-accent)]/5 transition-all text-sm font-medium"
      >
        <Globe size={14} className="text-[var(--sp-accent)]" />
        <span>{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-36 glass-panel border border-[var(--sp-accent)]/20 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {LANGUAGE_OPTIONS.map((language) => (
            <button
              key={language.code}
              onClick={() => toggleLanguage(language.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                activeLanguageCode === language.code
                  ? 'text-[var(--sp-accent)] bg-[var(--sp-accent)]/10'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
            >
              <span>{language.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
