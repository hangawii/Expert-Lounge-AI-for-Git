import React, { useState, useCallback } from 'react';
import { AppLayout } from './components/AppLayout';
import { LandingPage } from './components/LandingPage';
import { SignInForm } from './components/SignInForm';
import { ModeSelection } from './components/ModeSelection';
import { ResumeInput } from './components/ResumeInput';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { analyzeResume, parseRawResumeData } from './services/geminiService';
import { AnalysisMode, ResumeData, ProcessingStats, ParsedResumeData, OutputLanguage, UserProfile } from './types';

function Application() {
  // Navigation State
  const [view, setView] = useState<'landing' | 'auth' | 'mode' | 'app'>('landing');
  
  // Logic State
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>(AnalysisMode.EXECUTIVE_BRIEFING);
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>('Korean');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Data State
  const [inputText, setInputText] = useState<string>('');
  const [jdText, setJdText] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<ResumeData | null>(null);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parsing State (for Pre-filling the Form)
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsingProgress, setParsingProgress] = useState<number>(0);
  const [parsingTime, setParsingTime] = useState<number | null>(null);
  const [parsedFormData, setParsedFormData] = useState<ParsedResumeData | null>(null);

  // View Mode State (Input vs Report)
  const [isReportMode, setIsReportMode] = useState<boolean>(false);

  const handleSignInComplete = (userData: UserProfile) => {
    setUser(userData);
    setView('mode');
  };

  // --- Enforce Auth Check ---
  const handleStartAnalysis = () => {
    if (user) {
      setView('mode');
    } else {
      setView('auth');
    }
  };

  const executeAnalysis = useCallback(async (resume: string, mode: AnalysisMode, jd: string, lang: OutputLanguage) => {
    setError(null);
    setData(null);
    setStats(null);
    setIsLoading(true);

    try {
      const result = await analyzeResume(resume, mode, jd, lang);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
        setStats(result.stats);
      }
    } catch (err) {
      setError("시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleModeSelect = async (mode: AnalysisMode, fileInput?: string | { mimeType: string, data: string }) => {
    setSelectedMode(mode);
    setError(null);

    if (fileInput) {
        // --- NEW LOGIC: Parse File -> Populate Form ---
        setView('app');
        setIsReportMode(false); // Stay on Input Form
        setIsParsing(true);
        setParsingProgress(0);
        setParsingTime(null);
        setParsedFormData(null);

        // Simulate Progress
        const progressInterval = setInterval(() => {
            setParsingProgress(prev => {
                if (prev >= 90) return 90; // Hold at 90 until done
                // Random increment between 5 and 15
                return prev + Math.floor(Math.random() * 10) + 5;
            });
        }, 150);

        try {
            // 1. Extract Data (Pass jdText to trigger Match Analysis if available, and MODE for Refinement logic)
            const parseResult = await parseRawResumeData(fileInput, jdText, mode);
            
            clearInterval(progressInterval);
            setParsingProgress(100);

            // Small delay to let user see 100%
            setTimeout(() => {
                setIsParsing(false);
                
                if (parseResult.data) {
                    setParsingTime(parseResult.latency);
                    setParsedFormData(parseResult.data);
                    
                    // Auto-set Language if detected
                    if (parseResult.data.detectedLanguage) {
                        setOutputLanguage(parseResult.data.detectedLanguage);
                    }

                    // InputText will be updated by ResumeInput's useEffect when it receives parsedFormData
                } else {
                    setError("이력서 내용을 분석하지 못했습니다. 수동으로 입력해주세요.");
                    // If simple string fallback
                    if (typeof fileInput === 'string') {
                       setInputText(fileInput); 
                    }
                }
            }, 600);

        } catch (error) {
             clearInterval(progressInterval);
             setIsParsing(false);
             setError("파일 처리 중 오류가 발생했습니다.");
        }

    } else {
        // Manual entry mode
        setView('app');
        setIsReportMode(false);
        setIsLoading(false);
        setIsParsing(false);
        setParsedFormData(null);
        setParsingTime(null);
    }
  };

  const handleManualAnalyze = () => {
    if (!inputText.trim()) {
        alert("이력서 내용을 입력해주세요.");
        return;
    }
    setIsReportMode(true);
    // executeAnalysis is called, which sets isLoading=true
    executeAnalysis(inputText, selectedMode, jdText, outputLanguage);
  };

  // Back to Edit Mode
  const handleEditInput = () => {
    setIsReportMode(false);
  };

  // --- EXIT SESSION LOGIC ---
  const handleExitSession = () => {
    // 1. Reset Data State
    setUser(null);
    setInputText('');
    setJdText('');
    setData(null);
    setStats(null);
    setParsedFormData(null);
    
    // 2. Reset UI State
    setIsLoading(false);
    setIsParsing(false);
    setParsingProgress(0);
    setParsingTime(null);
    setIsReportMode(false);
    setError(null);
    
    // 3. Navigate to Landing
    setView('landing');
  };

  // --- VIEWS ---

  if (view === 'landing') {
    // Pass handleStartAnalysis instead of direct setView('mode')
    return <LandingPage onStart={handleStartAnalysis} onSignIn={() => setView('auth')} />;
  }

  if (view === 'auth') {
    return (
      <div className="relative">
        <LandingPage onStart={handleStartAnalysis} onSignIn={() => {}} />
        <SignInForm onComplete={handleSignInComplete} onCancel={() => setView('landing')} />
      </div>
    );
  }

  if (view === 'mode') {
      return (
          <AppLayout 
            jdText={jdText} 
            onJdChange={(e) => setJdText(e.target.value)}
          >
              <ModeSelection onSelect={handleModeSelect} onBack={() => setView('landing')} />
          </AppLayout>
      );
  }

  // --- MAIN APP VIEW ---
  return (
    <AppLayout
        jdText={jdText} 
        onJdChange={(e) => setJdText(e.target.value)}
    >
      {/* 
         Logic:
         1. If isReportMode is true -> Show AnalysisDisplay (Loading or Result)
         2. If isReportMode is false -> Show ResumeInput (Clean, full-screen input)
      */}
      
      {isReportMode ? (
        // --- REPORT MODE ---
        <div className="flex flex-col h-full bg-slate-200 relative">
            {/* Top Toolbar */}
            <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0 no-print z-20 shadow-md">
                <button 
                    onClick={handleEditInput}
                    disabled={isLoading}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLoading ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
                >
                    &larr; Edit Input / Upload New
                </button>
                <div className="text-white font-serif font-bold tracking-wide">
                    {selectedMode === AnalysisMode.EXECUTIVE_BRIEFING ? 'Executive Briefing' : 'Strategic Refinement'} Report
                </div>
                {/* Exit Session Button (Report Mode) */}
                <button 
                    onClick={handleExitSession}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-900/30 hover:border-red-500/50 bg-red-950/20 px-3 py-1.5 rounded-sm transition-all"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Exit Session
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                 {error && !isLoading && (
                    <div className="max-w-4xl mx-auto mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 shadow-md" role="alert">
                        <p className="font-bold">Analysis Error</p>
                        <p>{error}</p>
                    </div>
                )}
                <AnalysisDisplay 
                    data={data}
                    stats={stats}
                    mode={selectedMode}
                    isLoading={isLoading}
                />
            </div>
        </div>
      ) : (
        // --- INPUT MODE (Redesigned: Clean Full Page) ---
        <div className="flex flex-col h-full bg-slate-950 relative">
             {/* PARSING OVERLAY */}
             {isParsing && (
                 <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center flex-col animate-fade-in cursor-wait">
                     <div className="relative mb-6">
                        <div className="text-6xl font-serif font-bold text-white tabular-nums tracking-tighter">
                            {parsingProgress}<span className="text-2xl text-brand-gold ml-1">%</span>
                        </div>
                     </div>
                     
                     {/* Progress Bar */}
                     <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden mb-6 relative">
                        <div 
                            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-brand-bronze to-brand-gold transition-all duration-200 ease-out"
                            style={{ width: `${parsingProgress}%` }}
                        ></div>
                     </div>
                     
                     <h3 className="text-xl font-serif font-bold text-white mb-2 tracking-wide">Analyzing Resume Context</h3>
                     <p className="text-slate-400 text-sm font-light tracking-widest uppercase">Auto-completing Data Builder...</p>
                 </div>
             )}

             {/* Header */}
             <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('mode')} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 group">
                        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back
                    </button>
                    <div className="h-4 w-px bg-slate-800 mx-2"></div>
                    <span className="text-white font-bold font-serif text-lg">Input Intelligence Data</span>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Parsing Timer Badge */}
                    {parsingTime !== null && (
                        <div className="bg-slate-900 border border-brand-gold/30 rounded-full px-4 py-1.5 flex items-center animate-fade-in">
                            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full mr-2 animate-pulse"></span>
                            <span className="text-xs text-brand-gold font-mono">
                                Auto-Extracted in {(parsingTime / 1000).toFixed(2)}s
                            </span>
                        </div>
                    )}
                    
                    {/* Exit Session Button (Input Mode) */}
                    <button 
                        onClick={handleExitSession}
                        className="text-slate-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ml-2"
                        title="Reset All Data and Return to Home"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Exit
                    </button>
                </div>
             </div>

             {/* Main Input Container */}
             <div className="flex-1 overflow-hidden relative">
                <ResumeInput 
                    value={inputText}
                    jdValue={jdText}
                    mode={selectedMode}
                    language={outputLanguage}
                    onLanguageChange={setOutputLanguage}
                    onChange={(e) => setInputText(e.target.value)}
                    onTextLoad={(text) => setInputText(text)}
                    onJdChange={(e) => setJdText(e.target.value)}
                    onSubmit={handleManualAnalyze}
                    isLoading={isLoading}
                    disabled={isLoading || isParsing}
                    initialData={parsedFormData} // Pass parsed data here
                />
             </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Application;