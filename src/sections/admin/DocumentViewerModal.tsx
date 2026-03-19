import React from 'react';
import { 
  X, FileText, ExternalLink, Download 
} from 'lucide-react';
import type { DocumentViewerData } from './types';

interface DocumentViewerModalProps {
  viewingDocs: DocumentViewerData | null;
  setViewingDocs: (docs: DocumentViewerData | null) => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  viewingDocs,
  setViewingDocs
}) => {
  if (!viewingDocs) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="admin-doc-modal glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[var(--sp-accent)]/20 rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-white/5 border-b border-white/10 p-6 flex justify-between items-center bg-gradient-to-r from-[var(--sp-accent)]/10 to-transparent">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{viewingDocs.name}'s Documents</h3>
            <p className="text-[var(--text-secondary)] text-sm opacity-70 font-medium">{viewingDocs.email}</p>
          </div>
          <button 
            onClick={() => setViewingDocs(null)}
            className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
            aria-label="Close document viewer"
            title="Close document viewer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 gap-4">
            {viewingDocs.docs && Object.keys(viewingDocs.docs).length > 0 ? (
              Object.entries(viewingDocs.docs).map(([key, value]: [string, unknown]) => {
                if (typeof value !== 'string' || value === '') return null;
                
                const docName = key.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                
                return (
                  <div key={key} className="glass-light rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/5 hover:border-[var(--sp-accent)]/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[var(--sp-accent)]/10 rounded-xl group-hover:scale-110 transition-transform">
                        <FileText className="text-[var(--sp-accent)] w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-[var(--text-primary)] font-bold transition-colors group-hover:text-[var(--sp-accent)]">{docName}</h4>
                        <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest opacity-60">Verification Credentials</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sp-btn-glass flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold"
                      >
                        <ExternalLink size={16} />
                        View Source
                      </a>
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = value;
                          link.download = `${viewingDocs.name}_${docName}.pdf`;
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="sp-btn-primary flex items-center justify-center gap-2 px-6 py-2 text-xs font-bold shadow-lg shadow-[var(--sp-accent)]/20"
                      >
                        <Download size={16} />
                        Download PDF
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-[24px] border border-dashed border-white/10">
                <FileText className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-20" />
                <p className="text-[var(--text-secondary)] font-medium">No archived documents found for this profile.</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6 bg-white/5 border-t border-white/10 flex justify-end">
          <button onClick={() => setViewingDocs(null)} className="sp-btn-glass px-8 py-2 font-bold">Close Workspace</button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;
