import React, { useRef } from 'react';
import { AnalysisMode } from '../types';
import mammoth from 'mammoth';

interface ModeSelectionProps {
  onSelect: (mode: AnalysisMode, fileInput?: string | { mimeType: string; data: string }) => void;
  onBack: () => void;
}

export const ModeSelection: React.FC<ModeSelectionProps> = ({ onSelect, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedModeRef = useRef<AnalysisMode | null>(null);

  const handleModeClick = (mode: AnalysisMode) => {
    selectedModeRef.current = mode;
    // Reset and click file input
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
        fileInputRef.current.click();
    }
  };

  const handleSkipUpload = (mode: AnalysisMode, e: React.MouseEvent) => {
      e.stopPropagation(); 
      onSelect(mode); // No content -> Manual Entry
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const mode = selectedModeRef.current;

    if (!mode) return;

    if (file) {
        // Handle PDF and Images (Multimodal)
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
             const reader = new FileReader();
             reader.onload = (event) => {
                 const result = event.target?.result as string;
                 // Strip "data:application/pdf;base64," prefix
                 const base64Data = result.split(',')[1];
                 onSelect(mode, { mimeType: file.type, data: base64Data });
             };
             reader.readAsDataURL(file);
        }
        // Handle DOCX (Word Files) using Mammoth
        else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                    .then((result) => {
                        const extractedText = result.value;
                        // const messages = result.messages; // Any warnings
                        onSelect(mode, extractedText);
                    })
                    .catch((err) => {
                        console.error("DOCX extraction error:", err);
                        alert("Word 파일 내용을 읽는 중 오류가 발생했습니다. 파일을 다시 확인하거나 텍스트를 복사해서 수동 입력을 이용해주세요.");
                    });
            };
            reader.readAsArrayBuffer(file);
        }
        // Handle Text Files
        else if (file.type === "text/plain" || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onSelect(mode, event.target.result as string);
                }
            };
            reader.readAsText(file);
        } else {
             alert("지원되는 파일 형식: PDF, DOCX (Word), TXT, 이미지.\n지원되지 않는 파일은 내용을 복사하여 'Manual Entry'를 이용해주세요.");
             onSelect(mode); // Proceed to manual entry empty
        }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 md:p-12 overflow-y-auto">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept=".pdf,.docx,.doc,.txt,.md,.json,image/*"
      />

      <div className="max-w-5xl mx-auto w-full">
        <button onClick={onBack} className="text-slate-500 hover:text-white mb-8 flex items-center text-sm transition-colors group">
          <span className="mr-2 group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Home
        </button>
        
        <div className="text-center mb-16">
            <span className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-2 block animate-fade-in">Strategic Intelligence</span>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4">Select Analysis Mode</h2>
            <p className="text-slate-400 font-light">분석 유형을 선택하고 파일(PDF, Word, TXT)을 업로드하면 즉시 분석이 시작됩니다.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mode 1: Executive Briefing */}
          <div 
            onClick={() => handleModeClick(AnalysisMode.EXECUTIVE_BRIEFING)}
            className="group relative bg-slate-900 border border-slate-800 rounded-sm p-10 cursor-pointer hover:border-brand-gold/60 transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)] flex flex-col"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-opacity duration-500">
               <svg className="w-40 h-40 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            </div>
            
            <div className="w-16 h-16 bg-slate-800 rounded-sm flex items-center justify-center mb-8 border border-slate-700 group-hover:border-brand-gold/50 text-brand-gold shadow-2xl transition-colors">
              <span className="text-2xl font-serif font-bold">01</span>
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-3 font-serif group-hover:text-brand-gold transition-colors">
                Executive Briefing
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Leadership Profiling</p>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-8 border-b border-slate-800 pb-8 min-h-[80px]">
              경력기술서를 <strong>핵심 역량</strong>과 <strong>리더십 스타일</strong> 위주로 압축하여 C-Level 채용에 적합한 브리핑 리포트를 생성합니다.
            </p>
            
            <div className="mt-auto space-y-3">
                 <button className="w-full py-4 bg-slate-800 text-brand-gold text-xs font-bold uppercase tracking-[0.2em] rounded-sm group-hover:bg-brand-gold group-hover:text-slate-900 transition-colors border border-slate-700 group-hover:border-brand-gold shadow-lg">
                    Upload & Start
                 </button>
                 <button 
                    onClick={(e) => handleSkipUpload(AnalysisMode.EXECUTIVE_BRIEFING, e)}
                    className="w-full text-slate-600 text-xs hover:text-slate-400 underline decoration-slate-700 underline-offset-4"
                 >
                    Manual Entry
                 </button>
            </div>
          </div>

          {/* Mode 2: Strategic Refinement */}
          <div 
            onClick={() => handleModeClick(AnalysisMode.RESUME_REFINEMENT)}
            className="group relative bg-slate-900 border border-slate-800 rounded-sm p-10 cursor-pointer hover:border-brand-blue/60 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-15 transition-opacity duration-500">
               <svg className="w-40 h-40 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
               </svg>
            </div>

            <div className="w-16 h-16 bg-slate-800 rounded-sm flex items-center justify-center mb-8 border border-slate-700 group-hover:border-brand-blue/50 text-brand-blue shadow-2xl transition-colors">
              <span className="text-2xl font-serif font-bold">02</span>
            </div>

            <h3 className="text-3xl font-bold text-white mb-3 font-serif group-hover:text-brand-blue transition-colors">
                Strategic Refinement
            </h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Resume Optimization</p>

            <p className="text-slate-400 text-sm leading-relaxed mb-8 border-b border-slate-800 pb-8 min-h-[80px]">
              이력서를 <strong>수치 중심(Quantified)</strong>의 성과 기술과 <strong>세련된 비즈니스 언어</strong>로 재구성(Rewriting)하여 전문성을 극대화합니다.
            </p>

            <div className="mt-auto space-y-3">
                 <button className="w-full py-4 bg-slate-800 text-brand-blue text-xs font-bold uppercase tracking-[0.2em] rounded-sm group-hover:bg-brand-blue group-hover:text-white transition-colors border border-slate-700 group-hover:border-brand-blue shadow-lg">
                    Upload & Start
                 </button>
                 <button 
                    onClick={(e) => handleSkipUpload(AnalysisMode.RESUME_REFINEMENT, e)}
                    className="w-full text-slate-600 text-xs hover:text-slate-400 underline decoration-slate-700 underline-offset-4"
                 >
                    Manual Entry
                 </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};