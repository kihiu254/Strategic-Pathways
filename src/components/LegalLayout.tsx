import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import Navigation from '../sections/Navigation';
import Footer from '../sections/Footer';

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ children, title, lastUpdated }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Reusing existing Navigation with simple setup */}
      <Navigation currentPage="legal" />

      <main className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--sp-accent)] bg-[var(--bg-secondary)]/30 px-4 py-2 rounded-xl transition-all mb-8 border border-[var(--sp-accent)]/10"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-[#C89F5E] to-transparent" />
              <span className="sp-label text-sm tracking-widest uppercase">Legal Document</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-6">
              {title}
            </h1>
            <div className="flex items-center gap-2 text-[var(--text-secondary)]/60 text-sm">
              <Clock size={14} />
              <span>Last Updated: {lastUpdated}</span>
            </div>
          </header>

          {/* Content Area */}
          <div className="glass-panel p-8 lg:p-12 prose prose-invert prose-gold max-w-none">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalLayout;
