import React, { useState, useEffect } from 'react';
import { ResumeData, ProcessingStats, AnalysisMode } from '../types';

interface AnalysisDisplayProps {
  data: ResumeData | null;
  stats: ProcessingStats | null;
  mode: AnalysisMode;
  isLoading: boolean;
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data, stats, mode, isLoading }) => {
  const [blindMode, setBlindMode] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [loadingStage, setLoadingStage] = useState<string>("INITIALIZING");

  // Progress Bar Logic (Optimized for Flash Speed)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setProgress(0);
      setLoadingStage("ENGAGING HYBRID GRID...");
      
      interval = setInterval(() => {
        setProgress((prev) => {
          // Accelerated progress tick for Flash Model
          const jump = Math.random() * 8 + 2; // Jump 2-10% per tick
          const next = prev + jump;
          
          if (next > 95) return 95; // Hold at 95% waiting for actual response
          
          if (next > 15 && next < 40) setLoadingStage("EXTRACTING & VALIDATING...");
          if (next > 40 && next < 70) setLoadingStage("PROFILING EXECUTIVE DNA...");
          if (next > 70) setLoadingStage("FINALIZING INTELLIGENCE REPORT...");

          return next;
        });
      }, 150); // Faster tick interval
    } else {
      setProgress(100);
      setLoadingStage("COMPLETE");
    }

    return () => clearInterval(interval);
  }, [isLoading]);

  const handlePrint = () => {
    window.print();
  };

  // --- SCORE COLOR LOGIC (Dynamic) ---
  const getScoreColorConfig = (score: number) => {
      if (score >= 80) return { 
          text: 'text-emerald-700', 
          bg: 'bg-emerald-50', 
          border: 'border-emerald-200',
          stroke: '#047857', // emerald-700
          label: 'Excellent Fit',
          icon: '🌟'
      };
      if (score >= 70) return { 
          text: 'text-green-700', 
          bg: 'bg-green-50', 
          border: 'border-green-200',
          stroke: '#15803d', // green-700
          label: 'Good Fit',
          icon: '✅'
      };
      if (score >= 50) return { 
          text: 'text-amber-600', 
          bg: 'bg-amber-50', 
          border: 'border-amber-200',
          stroke: '#d97706', // amber-600
          label: 'Moderate Fit',
          icon: '⚠️'
      };
      return { 
          text: 'text-red-700', 
          bg: 'bg-red-50', 
          border: 'border-red-200',
          stroke: '#b91c1c', // red-700
          label: 'Low Fit',
          icon: '🛑'
      };
  };

  // --- BLIND MODE HELPERS ---
  const getMaskedName = (originalName: string) => {
      if (!blindMode) return originalName;
      return "Confidential Candidate (후보자 A)";
  };

  const getMaskedCompany = (originalName: string, maskedName?: string, index?: number) => {
      if (!blindMode) return originalName;
      // Prefer AI-generated masked name, fallback to generic
      if (maskedName) return maskedName;
      return index === 0 ? "Current Organization (Industry Leader)" : `Previous Organization ${index ? index + 1 : ''}`;
  };

  const getMaskedSchool = (originalSchool: string, maskedSchool?: string) => {
      if (!blindMode) return originalSchool;
      return maskedSchool || "Major Academic Institution";
  };

  // --- LOADING VIEW ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full bg-white rounded-lg shadow-xl p-12 max-w-2xl mx-auto mt-10">
        <div className="w-full text-center">
            <div className="text-8xl font-serif font-bold text-slate-900 mb-4 tabular-nums">
                {Math.round(progress)}<span className="text-4xl text-brand-gold ml-2">%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-8 relative">
                <div 
                    className="h-full bg-slate-900 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-gold animate-pulse mb-2">
                {loadingStage}
            </p>
            <p className="text-xs text-slate-400 font-mono">
                Processing confidential data on Secure Hybrid Cloud...
            </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const scoreConfig = getScoreColorConfig(data.jobMatch?.matchScore || 0);
  const isRefinementMode = mode === AnalysisMode.RESUME_REFINEMENT;

  // --- REPORT VIEW (Simpler, Cleaner, Integrated) ---
  return (
    <div className="flex justify-center w-full pb-20">
      
      {/* Toolbar */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50 no-print">
          <button 
            onClick={() => setBlindMode(!blindMode)} 
            className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl transition-all border flex items-center gap-2 ${blindMode ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-200'}`}
          >
              <span className={`w-2 h-2 rounded-full ${blindMode ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              {blindMode ? 'Blind Mode: ON' : 'Blind Mode: OFF'}
          </button>
           <button onClick={handlePrint} className="px-6 py-4 bg-brand-gold text-slate-900 rounded-full text-xs font-bold uppercase tracking-wider shadow-xl hover:bg-white border border-brand-gold transition-all">
              Download PDF
          </button>
      </div>

      {/* A4 Paper Canvas */}
      <div className="report-view w-[210mm] min-h-[297mm] bg-white text-black shadow-2xl relative mx-auto print:shadow-none print:w-full print:m-0 print:p-0 overflow-hidden">
          
          {/* Watermark for Blind Mode */}
          {blindMode && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                 <div className="text-[120px] font-black text-slate-100/50 -rotate-45 select-none whitespace-nowrap">
                     CONFIDENTIAL
                 </div>
              </div>
          )}
          {!blindMode && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                 <div className="text-[120px] font-black text-slate-50/50 -rotate-45 select-none whitespace-nowrap">
                     EXPERT LOUNGE
                 </div>
              </div>
          )}

          <div className="p-[20mm] relative z-10 flex flex-col h-full">
            
            {/* 1. HEADER */}
            <header className="border-b-[3px] border-black pb-4 mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-serif font-extrabold text-black uppercase tracking-tight leading-none mb-2">
                        {getMaskedName(data.candidateName)}
                    </h1>
                    <div className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.3em]">
                        {isRefinementMode ? 'Optimized Executive Resume' : 'Executive Intelligence Report'}
                    </div>
                </div>
                <div className="text-right">
                     <div className="text-2xl font-serif font-bold text-brand-gold italic">Expert Lounge</div>
                     <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {stats ? (
                           <span className={stats.costTier === 'High' ? 'text-brand-blue' : 'text-green-700'}>
                               Executed by {stats.modelUsed.replace('gemini-', '')} ({(stats.latencyMs / 1000).toFixed(1)}s)
                           </span>
                        ) : 'Generated by Gemini 3.0'}
                     </div>
                </div>
            </header>

            {/* STRATEGIC OVERVIEW - REMOVED from Report View as requested */}

            {/* 2. EXECUTIVE PROFILE (Integrated Section) */}
            <section className="mb-8">
                <div className="flex items-center mb-4">
                     <h2 className="text-sm font-extrabold text-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 flex-grow">
                        Executive Summary & AI Profiling
                     </h2>
                </div>
                
                <div className="bg-slate-50 p-6 border-l-4 border-brand-gold">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Left: AI Insights (Leadership & Competencies) */}
                        <div className="md:col-span-1 space-y-6 border-r border-slate-200 pr-6">
                            <div>
                                <div className="text-[10px] text-brand-gold font-extrabold uppercase tracking-wider mb-1">Leadership DNA</div>
                                <div className="text-lg font-serif font-bold text-black leading-tight">
                                    {data.leadershipStyle || "Analysis Pending"}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-brand-gold font-extrabold uppercase tracking-wider mb-2">Core Competencies</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.topSkills.map((skill, idx) => (
                                        <span key={idx} className="bg-white border border-slate-300 px-2 py-1 text-[10px] font-bold text-black rounded-sm shadow-sm">
                                            #{skill.replace(/_/g, ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Narrative Summary */}
                        <div className="md:col-span-2">
                             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Professional Narrative</div>
                             <p className="text-[13px] leading-relaxed font-sans font-medium text-justify text-gray-900 whitespace-pre-line">
                                {blindMode && data.maskedSummary ? data.maskedSummary : 
                                 (isRefinementMode && data.refinedSummary 
                                    ? data.refinedSummary 
                                    : data.professionalSummary)}
                            </p>
                            {blindMode && (
                                <p className="text-[9px] text-slate-400 mt-2 italic text-right">
                                    * Personal identifiers and specific names have been anonymized for confidentiality.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. EXPERIENCE & EDUCATION & CERTIFICATIONS GRID */}
            <div className="grid grid-cols-12 gap-8">
                
                {/* EXPERIENCE (8/12) */}
                <div className="col-span-8">
                    <h2 className="text-sm font-extrabold text-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 mb-4">
                        Professional Experience
                    </h2>
                    <div className="space-y-8">
                        {data.experience.map((exp, idx) => (
                            <div key={idx} className="relative pl-4 border-l-2 border-slate-200">
                                <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-slate-300 rounded-full border-2 border-white"></div>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-bold text-black">{exp.role}</h3>
                                    <span className="text-[10px] font-bold font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{exp.duration}</span>
                                </div>
                                
                                {/* Company Name Masking */}
                                <div className={`text-xs font-bold mb-3 ${blindMode ? 'text-slate-500 italic' : 'text-slate-800'}`}>
                                    {getMaskedCompany(exp.company, exp.maskedCompany, idx)}
                                </div>

                                {/* Content Logic: Refined vs Briefing */}
                                {isRefinementMode && exp.refinedContent ? (
                                    <div className="space-y-3">
                                        <div className="text-[11px] leading-relaxed text-justify text-gray-900 font-sans whitespace-pre-line">
                                            {exp.refinedContent}
                                        </div>
                                        {/* CRITIQUE REMOVED FROM REPORT VIEW */}
                                    </div>
                                ) : (
                                    <ul className="list-disc list-outside ml-3 space-y-1.5">
                                        {exp.keyAchievements.map((ach, i) => (
                                            <li key={i} className="text-[11px] leading-relaxed text-gray-900 font-sans">
                                                {ach}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN (4/12): Education + Professional Assets */}
                <div className="col-span-4 space-y-8">
                    {/* Education */}
                    <div>
                        <h2 className="text-sm font-extrabold text-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 mb-4">
                            Education
                        </h2>
                        <div className="space-y-4">
                             {data.education.map((edu, idx) => (
                                <div key={idx} className="bg-slate-50 p-4 border border-slate-100">
                                    {/* School Name Masking */}
                                    <div className={`text-xs font-bold mb-0.5 ${blindMode ? 'text-slate-500 italic' : 'text-black'}`}>
                                        {getMaskedSchool(edu.institution, edu.maskedInstitution)}
                                    </div>
                                    <div className="text-[11px] text-slate-700 italic mb-1">{edu.degree}</div>
                                    <div className="text-[10px] text-slate-500 font-mono font-bold">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NEW: Professional Assets (Certifications, Thesis, Books) */}
                    {data.certifications && data.certifications.length > 0 && (
                         <div>
                            <h2 className="text-sm font-extrabold text-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 mb-4">
                                Professional Assets
                            </h2>
                            <div className="space-y-3">
                                {data.certifications.map((cert, idx) => (
                                    <div key={idx} className="bg-white p-3 border-l-2 border-brand-gold">
                                        <div className="text-xs font-bold text-black mb-1">{cert.name}</div>
                                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                                            <span>{cert.issuer}</span>
                                            <span className="font-mono">{cert.year}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. JOB MATCH INTELLIGENCE (Separate Block) */}
            {data.jobMatch && (
                <section className="mt-8 pt-6 border-t border-slate-200 break-inside-avoid">
                     <h2 className={`text-sm font-extrabold uppercase tracking-[0.2em] mb-4 flex items-center ${scoreConfig.text}`}>
                        <span className={`w-2 h-2 mr-2 rounded-full ${scoreConfig.bg.replace('bg-', 'bg-')}`} style={{ backgroundColor: scoreConfig.stroke }}></span>
                        Job Match Intelligence
                     </h2>
                    
                    <div className={`border bg-white grid grid-cols-12 shadow-sm ${scoreConfig.border}`}>
                        
                        {/* Score Gauge */}
                        <div className={`col-span-2 ${scoreConfig.bg} p-4 flex flex-col items-center justify-center border-r ${scoreConfig.border}`}>
                            <div className="relative w-16 h-16 mb-2">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                                    <circle 
                                        cx="32" cy="32" r="28" 
                                        stroke={scoreConfig.stroke}
                                        strokeWidth="6" fill="transparent" 
                                        strokeDasharray={175}
                                        strokeDashoffset={175 - (175 * data.jobMatch.matchScore) / 100}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-xl font-bold ${scoreConfig.text}`}>{data.jobMatch.matchScore}</span>
                                </div>
                            </div>
                            <span className={`text-[9px] font-bold uppercase ${scoreConfig.text}`}>{scoreConfig.label}</span>
                        </div>

                        {/* Analysis & Gaps */}
                        <div className="col-span-10 grid grid-cols-2">
                             <div className="p-4 border-r border-slate-200">
                                 <div className="text-[10px] font-extrabold text-black uppercase mb-2">Analysis Summary & Strengths</div>
                                 <p className="text-[11px] text-gray-900 mb-3 font-medium">"{data.jobMatch.matchSummary}"</p>
                                 <ul className="space-y-1">
                                    {data.jobMatch.matchingStrengths.map((str, i) => (
                                        <li key={i} className={`text-[10px] font-bold flex items-start ${scoreConfig.text}`}>
                                            <span className="mr-1.5 text-xs">{scoreConfig.icon}</span> {str}
                                        </li>
                                    ))}
                                 </ul>
                             </div>
                             <div className="p-4 bg-red-50/30">
                                 <div className="text-[10px] font-extrabold text-red-700 uppercase mb-2">Gap Analysis / Risks</div>
                                 <ul className="space-y-1 mb-3">
                                    {data.jobMatch.gapAnalysis.map((gap, i) => (
                                        <li key={i} className="text-[10px] text-gray-800 flex items-start">
                                            <span className="text-red-500 mr-1.5 font-bold">!</span> {gap}
                                        </li>
                                    ))}
                                 </ul>
                             </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <div className="mt-auto pt-6 flex justify-between text-[9px] text-black font-mono border-t border-black">
                <span className="font-bold">CONFIDENTIAL & PROPRIETARY</span>
                <span className="font-bold">EXPERT LOUNGE EXECUTIVE SUITE</span>
                <span className="font-bold">PAGE 1 OF 1</span>
            </div>

          </div>
      </div>
    </div>
  );
};