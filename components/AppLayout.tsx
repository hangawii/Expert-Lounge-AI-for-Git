import React from 'react';

interface AppLayoutProps {
  children: React.ReactNode;
  jdText?: string;
  onJdChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, jdText, onJdChange }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-gold selection:text-slate-900 overflow-hidden print:h-auto print:overflow-visible print:bg-white">
      {/* Sidebar - Hidden on Print */}
      <aside className="w-[480px] bg-slate-900 border-r border-slate-800 hidden md:flex flex-col shadow-2xl flex-shrink-0 z-30 transition-all duration-300 print:hidden">
        <div className="p-6 border-b border-slate-800/50">
          <h1 className="text-2xl font-bold text-gradient-gold tracking-tight">
            Expert Lounge
          </h1>
          <p className="text-xs text-brand-bronze mt-1 uppercase tracking-widest font-sans font-medium">Premium Intelligence</p>
        </div>
        
        <nav className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Status Indicator */}
          <div className="px-4 py-3 bg-slate-800/80 rounded-lg border border-slate-700 text-sm text-slate-200 shadow-inner">
            <p className="font-bold text-brand-gold mb-1 font-serif tracking-wide">System Status</p>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-100 tracking-wide">Hybrid Intelligence Grid</span>
                  <span className="text-[9px] text-slate-400">Primary: Flash 3.0 / Fallback: Pro 3.0</span>
              </div>
            </div>
          </div>

          {/* JD Input Area */}
          <div className="pt-2">
             <label className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 block flex items-center justify-between">
                <span>Target JD Context</span>
                <span className="text-slate-400 text-[10px] font-normal lowercase">paste text below</span>
             </label>
             <textarea
                value={jdText || ''}
                onChange={onJdChange}
                disabled={!onJdChange}
                className="w-full h-[500px] bg-white border border-slate-300 rounded-sm p-4 text-sm text-slate-900 font-sans focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all resize-none leading-relaxed custom-scrollbar placeholder:text-slate-400 shadow-inner"
                placeholder="Paste the Job Description (JD) here...&#10;&#10;[Example]&#10;• Role: CTO&#10;• Requirements: IPO experience, Series B funding..."
             />
             <p className="text-[11px] text-slate-400 mt-2 leading-snug font-medium">
               * 입력된 JD는 <span className="text-brand-gold">Gap Analysis</span> 및 <span className="text-brand-gold">Fit Scoring</span>의 기준 데이터로 활용됩니다.
             </p>
          </div>
        </nav>

        <div className="p-6 text-xs text-slate-400 border-t border-slate-800/50">
          <p className="font-serif italic text-slate-500">&copy; 2026 Expert Lounge by YN Consulting Group</p>
          <p className="mt-1 font-medium text-slate-500">Powered by Gemini 3.0</p>
        </div>
      </aside>

      {/* Main Content - Allow overflow on print */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50 print:h-auto print:overflow-visible print:bg-white print:block">
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between flex-shrink-0 print:hidden">
          <div>
            <span className="text-lg font-bold text-gradient-gold tracking-tight font-serif">Expert Lounge</span>
            <span className="text-[10px] text-brand-bronze block uppercase tracking-wider">Premium AI</span>
          </div>
          <div className="flex items-center space-x-2">
             <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></span>
             <span className="text-[10px] text-slate-400">Hybrid Grid</span>
          </div>
        </div>
        
        {/* Children Container - Allow overflow on print */}
        <div className="flex-1 flex flex-col overflow-hidden relative print:h-auto print:overflow-visible print:block">
          {children}
        </div>
      </main>
    </div>
  );
};