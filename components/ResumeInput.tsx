import React, { useState, useEffect } from 'react';
import { AnalysisMode, ParsedResumeData, OutputLanguage } from '../types';
import { runMatchAnalysisOnly } from '../services/geminiService';

interface ResumeInputProps {
  value: string;
  jdValue: string;
  mode: AnalysisMode;
  language: OutputLanguage;
  onLanguageChange: (lang: OutputLanguage) => void;
  onChange: (e: { target: { value: string } }) => void; // Mock event for compatibility
  onTextLoad: (text: string) => void;
  onJdChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
  initialData?: ParsedResumeData | null; // Optional parsed data
}

interface ExperienceItem {
  id: number;
  company: string;
  role: string;
  duration: string;
  description: string;
  critique?: string; // New: Local state for critique display
}

interface EducationItem {
  id: number;
  school: string;
  degree: string;
  year: string;
}

interface CertificationItem {
    id: number;
    name: string;
    issuer: string;
    year: string;
}

export const ResumeInput: React.FC<ResumeInputProps> = ({ 
  value, 
  jdValue, 
  mode,
  language,
  onLanguageChange,
  onJdChange,
  onChange,
  onSubmit, 
  isLoading, 
  disabled,
  initialData 
}) => {
  // --- Local State for Structured Form ---
  const [strategicOverview, setStrategicOverview] = useState<string>(''); // NEW
  
  const [basicInfo, setBasicInfo] = useState({ 
      name: '', title: '', email: '', phone: '', linkedin: '', location: '', summary: '' 
  });
  
  const [competencies, setCompetencies] = useState<string>(''); // Comma separated string for simplicity in UI

  const [experienceList, setExperienceList] = useState<ExperienceItem[]>([
    { id: 1, company: '', role: '', duration: '', description: '' }
  ]);
  
  const [educationList, setEducationList] = useState<EducationItem[]>([
    { id: 1, school: '', degree: '', year: '' }
  ]);

  const [certificationList, setCertificationList] = useState<CertificationItem[]>([
      { id: 1, name: '', issuer: '', year: ''}
  ]);

  // --- NEW: Job Match Structured State ---
  const [matchInfo, setMatchInfo] = useState({
    score: '0',
    summary: '',
    strengths: [''],
    gaps: ['']
  });
  
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [matchStats, setMatchStats] = useState<{latency: number, model: string} | null>(null);

  // --- Populating Form from Initial Data (Parsed File) ---
  useEffect(() => {
    if (initialData) {
        // Set Overview if available
        if (initialData.strategicOverview) {
            setStrategicOverview(initialData.strategicOverview);
        } else {
            setStrategicOverview('');
        }

        setBasicInfo({
            name: initialData.basicInfo.name || '',
            title: initialData.basicInfo.title || '',
            email: initialData.basicInfo.email || '',
            phone: initialData.basicInfo.phone || '',
            linkedin: initialData.basicInfo.linkedin || '',
            location: initialData.basicInfo.location || '',
            summary: initialData.basicInfo.summary || ''
        });

        if (initialData.competencies && initialData.competencies.length > 0) {
            setCompetencies(initialData.competencies.join(', '));
        } else {
            setCompetencies('');
        }
        
        if (initialData.experience && initialData.experience.length > 0) {
            setExperienceList(initialData.experience.map(exp => ({
                id: exp.id,
                company: exp.company,
                role: exp.role,
                duration: exp.duration,
                description: exp.description, // This is already REFINED if mode was Refinement
                critique: exp.critique // Pass critique to local state
            })));
        } else {
             setExperienceList([{ id: 1, company: '', role: '', duration: '', description: '' }]);
        }
        
        if (initialData.education && initialData.education.length > 0) {
            setEducationList(initialData.education);
        } else {
            setEducationList([{ id: 1, school: '', degree: '', year: '' }]);
        }

        if (initialData.certifications && initialData.certifications.length > 0) {
            setCertificationList(initialData.certifications);
        } else {
            setCertificationList([{ id: 1, name: '', issuer: '', year: ''}]);
        }

        // CRITICAL FIX: Only populate jobMatch if it exists AND JD is present.
        // Otherwise RESET it to defaults to clear previous file's data.
        if (initialData.jobMatch && jdValue && jdValue.trim().length > 0) {
            setMatchInfo({
                score: initialData.jobMatch.score || '0',
                summary: initialData.jobMatch.summary || '',
                strengths: initialData.jobMatch.strengths?.length ? initialData.jobMatch.strengths : [''],
                gaps: initialData.jobMatch.gaps?.length ? initialData.jobMatch.gaps : ['']
            });
        } else {
            // Reset if no match data found or JD is empty
            setMatchInfo({
                score: '0',
                summary: '',
                strengths: [''],
                gaps: ['']
            });
        }
    }
  }, [initialData]); // Only trigger when a NEW file is parsed

  // --- Dynamic Text Construction (Syncs with parent for analysis) ---
  useEffect(() => {
    const constructedResume = `
NAME: ${basicInfo.name}
CURRENT TITLE: ${basicInfo.title}
EMAIL: ${basicInfo.email}
PHONE: ${basicInfo.phone}
LINKEDIN: ${basicInfo.linkedin}
LOCATION: ${basicInfo.location}

PROFESSIONAL SUMMARY:
${basicInfo.summary}

CORE COMPETENCIES:
${competencies}

WORK EXPERIENCE:
${experienceList.map(exp => `
COMPANY: ${exp.company}
ROLE: ${exp.role}
DURATION: ${exp.duration}
DETAILS:
${exp.description}
`).join('\n')}

EDUCATION:
${educationList.map(edu => `${edu.degree}, ${edu.school} (${edu.year})`).join('\n')}

PROFESSIONAL ASSETS (Certifications, Publications, Patents):
${certificationList.map(cert => `${cert.name} - ${cert.issuer} (${cert.year})`).join('\n')}

JOB MATCH CONTEXT (User Input):
Score: ${matchInfo.score}
Strengths: ${matchInfo.strengths.join(', ')}
    `.trim();

    // Update parent state seamlessly
    onChange({ target: { value: constructedResume } });
  }, [basicInfo, competencies, experienceList, educationList, certificationList, matchInfo, onChange]);


  // --- Handlers ---
  const addExperience = () => {
    setExperienceList([...experienceList, { id: Date.now(), company: '', role: '', duration: '', description: '' }]);
  };

  const removeExperience = (id: number) => {
    if (experienceList.length > 1) {
      setExperienceList(experienceList.filter(e => e.id !== id));
    }
  };

  const updateExperience = (id: number, field: keyof ExperienceItem, val: string) => {
    setExperienceList(experienceList.map(e => e.id === id ? { ...e, [field]: val } : e));
  };

  const addEducation = () => {
    setEducationList([...educationList, { id: Date.now(), school: '', degree: '', year: '' }]);
  };

  const removeEducation = (id: number) => {
    if (educationList.length > 1) {
      setEducationList(educationList.filter(e => e.id !== id));
    }
  };

  const updateEducation = (id: number, field: keyof EducationItem, val: string) => {
    setEducationList(educationList.map(e => e.id === id ? { ...e, [field]: val } : e));
  };

  const addCertification = () => {
      setCertificationList([...certificationList, { id: Date.now(), name: '', issuer: '', year: ''}]);
  };

  const removeCertification = (id: number) => {
      if (certificationList.length > 1) {
          setCertificationList(certificationList.filter(e => e.id !== id));
      }
  };

  const updateCertification = (id: number, field: keyof CertificationItem, val: string) => {
      setCertificationList(certificationList.map(e => e.id === id ? { ...e, [field]: val } : e));
  };


  // Job Match Handlers
  const handleStrengthChange = (index: number, val: string) => {
    const newStrengths = [...matchInfo.strengths];
    newStrengths[index] = val;
    setMatchInfo({ ...matchInfo, strengths: newStrengths });
  };
  const addStrength = () => setMatchInfo({ ...matchInfo, strengths: [...matchInfo.strengths, ''] });
  const removeStrength = (index: number) => {
     if(matchInfo.strengths.length > 1) {
         setMatchInfo({ ...matchInfo, strengths: matchInfo.strengths.filter((_, i) => i !== index) });
     }
  };

  const handleGapChange = (index: number, val: string) => {
    const newGaps = [...matchInfo.gaps];
    newGaps[index] = val;
    setMatchInfo({ ...matchInfo, gaps: newGaps });
  };
  const addGap = () => setMatchInfo({ ...matchInfo, gaps: [...matchInfo.gaps, ''] });
  const removeGap = (index: number) => {
    if(matchInfo.gaps.length > 1) {
        setMatchInfo({ ...matchInfo, gaps: matchInfo.gaps.filter((_, i) => i !== index) });
    }
  };

  // --- TRIGGER MATCH ANALYSIS ---
  const handleRunMatch = async () => {
      if (!jdValue || jdValue.trim().length < 10) {
          alert("Job Description(JD)을 좌측 사이드바에 먼저 입력해주세요.");
          return;
      }
      
      setIsMatchLoading(true);
      setMatchStats(null);

      try {
          const currentResume = `
            ${basicInfo.name} - ${basicInfo.title}
            Summary: ${basicInfo.summary}
            Experience: ${experienceList.map(e => `${e.company} ${e.role} ${e.description}`).join('\n')}
          `;
          
          const result = await runMatchAnalysisOnly(currentResume, jdValue, language);
          
          setMatchInfo({
            score: result.data.score || '0',
            summary: result.data.summary || '',
            strengths: result.data.strengths?.length ? result.data.strengths : [''],
            gaps: result.data.gaps?.length ? result.data.gaps : ['']
          });

          setMatchStats({
              latency: result.stats.latencyMs,
              model: result.stats.modelUsed.replace('gemini-', '')
          });

      } catch (err) {
          alert("분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
          setIsMatchLoading(false);
      }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- SCORE COLOR LOGIC (Adapted for Dark Theme) ---
  const getScoreColorConfig = (scoreStr: string) => {
      const score = parseInt(scoreStr.replace(/[^0-9]/g, '')) || 0;
      if (score >= 80) return { 
          text: 'text-emerald-400', 
          stroke: '#34d399', // emerald-400
          label: 'Excellent Fit'
      };
      if (score >= 70) return { 
          text: 'text-green-400', 
          stroke: '#4ade80', // green-400
          label: 'Good Fit' 
      };
      if (score >= 50) return { 
          text: 'text-amber-400', 
          stroke: '#fbbf24', // amber-400
          label: 'Moderate Fit' 
      };
      return { 
          text: 'text-red-400', 
          stroke: '#f87171', // red-400
          label: 'Low Fit' 
      };
  };

  const scoreConfig = getScoreColorConfig(matchInfo.score);


  return (
    <div className="h-full flex flex-col items-center justify-start overflow-y-auto p-4 md:p-8 bg-slate-950 scroll-smooth print:bg-white print:p-0 print:h-auto print:overflow-visible">
      
      <div className="max-w-5xl w-full pb-20 space-y-6 animate-fade-in print:pb-0 print:space-y-4 print:w-full print:max-w-none">
        
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-end border-b border-slate-800 pb-4 print:border-black print:mb-6">
            <div>
                <h2 className="text-2xl font-serif font-bold text-white mb-1 print:text-black">
                    {mode === AnalysisMode.RESUME_REFINEMENT ? 'Executive Data Analysis' : 'Executive Data Builder'}
                </h2>
                <div className="hidden print:block text-sm text-gray-500 mt-1">Structured Resume Data</div>
            </div>
            
            <div className="text-right flex items-center gap-4 no-print">
                {/* Language Toggle */}
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Report Language</span>
                    <div className="flex items-center bg-slate-900 rounded-full p-1 border border-slate-700">
                        <button 
                            onClick={() => onLanguageChange('Korean')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'Korean' ? 'bg-brand-gold text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            KR
                        </button>
                        <button 
                            onClick={() => onLanguageChange('English')}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${language === 'English' ? 'bg-brand-gold text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
                        >
                            EN
                        </button>
                    </div>
                </div>

                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-sm border border-slate-700 hover:border-brand-gold transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print / PDF
                </button>
            </div>
        </div>

        {/* SECTION 0: STRATEGIC OVERVIEW (IF REFINEMENT) */}
        {strategicOverview && (
            <section className="bg-brand-gold/10 border-l-4 border-brand-gold p-6 rounded-r-sm shadow-lg no-print">
                <h3 className="text-xs font-bold text-brand-gold uppercase tracking-widest mb-3 flex items-center">
                    <span className="w-2 h-2 bg-brand-gold rounded-full mr-2"></span>
                    Consultant's Strategic Audit
                </h3>
                <p className="text-sm leading-relaxed text-slate-300 font-medium">
                    {strategicOverview}
                </p>
            </section>
        )}

        {/* SECTION 1: Identity & Contact (Grid Layout) */}
        <section className="bg-slate-900 border border-slate-800 rounded-sm p-5 shadow-lg print:bg-white print:border-black print:shadow-none print:p-0">
            <h3 className="text-sm font-bold text-brand-gold uppercase tracking-widest mb-4 flex items-center print:text-black print:mb-2 print:border-b print:border-black print:pb-1">
                <span className="w-2 h-2 bg-brand-gold mr-2 rounded-full print:hidden"></span> 01. Identity & Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 print:grid-cols-3">
                {/* Name */}
                <div>
                    <label className="block text-[11px] text-slate-500 mb-1 print:text-gray-600 print:font-bold">Candidate Name</label>
                    <input 
                        type="text" 
                        value={basicInfo.name}
                        onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors print:hidden"
                        placeholder="e.g. Gil-Dong Hong"
                    />
                    <div className="hidden print:block text-black text-sm p-1 border-b border-gray-200">{basicInfo.name || '-'}</div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-[11px] text-slate-500 mb-1 print:text-gray-600 print:font-bold">Current Title</label>
                    <input 
                        type="text" 
                        value={basicInfo.title}
                        onChange={(e) => setBasicInfo({...basicInfo, title: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors print:hidden"
                        placeholder="e.g. Chief Technology Officer"
                    />
                     <div className="hidden print:block text-black text-sm p-1 border-b border-gray-200">{basicInfo.title || '-'}</div>
                </div>

                 {/* Email */}
                 <div>
                    <label className="block text-[11px] text-slate-500 mb-1 print:text-gray-600 print:font-bold">Email</label>
                    <input 
                        type="email" 
                        value={basicInfo.email}
                        onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors print:hidden"
                        placeholder="For contact masking"
                    />
                     <div className="hidden print:block text-black text-sm p-1 border-b border-gray-200">{basicInfo.email || '-'}</div>
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-[11px] text-slate-500 mb-1 print:text-gray-600 print:font-bold">Phone</label>
                    <input 
                        type="tel" 
                        value={basicInfo.phone}
                        onChange={(e) => setBasicInfo({...basicInfo, phone: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors print:hidden"
                        placeholder="+82 10-0000-0000"
                    />
                     <div className="hidden print:block text-black text-sm p-1 border-b border-gray-200">{basicInfo.phone || '-'}</div>
                </div>

                {/* LinkedIn */}
                <div>
                    <label className="block text-[11px] text-slate-500 mb-1 print:text-gray-600 print:font-bold">LinkedIn / Portfolio URL</label>
                    <input 
                        type="text" 
                        value={basicInfo.linkedin}
                        onChange={(e) => setBasicInfo({...basicInfo, linkedin: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors print:hidden"
                        placeholder="linkedin.com/in/..."
                    />
                     <div className="hidden print:block text-black text-sm p-1 border-b border-gray-200">{basicInfo.linkedin || '-'}</div>
                </div>

                 {/* Location */}
                 <div>
                    <label className="block text-[11px] text-slate-500 mb-1 print:text-gray-600 print:font-bold">Location (City/Country)</label>
                    <input 
                        type="text" 
                        value={basicInfo.location}
                        onChange={(e) => setBasicInfo({...basicInfo, location: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors print:hidden"
                        placeholder="Seoul, South Korea"
                    />
                     <div className="hidden print:block text-black text-sm p-1 border-b border-gray-200">{basicInfo.location || '-'}</div>
                </div>
            </div>
        </section>

        {/* SECTION 2: Professional Branding (Summary + Competencies) */}
        <section className="bg-slate-900 border border-slate-800 rounded-sm p-5 shadow-lg print:bg-white print:border-black print:shadow-none print:p-0">
             <h3 className="text-sm font-bold text-brand-gold uppercase tracking-widest mb-4 flex items-center print:text-black print:mb-2 print:border-b print:border-black print:pb-1">
                <span className="w-2 h-2 bg-brand-gold mr-2 rounded-full print:hidden"></span> 02. Executive Branding
            </h3>

            <div className="space-y-4">
                {/* Summary */}
                <div>
                    <label className="block text-[11px] text-slate-500 mb-1 print:text-gray-600 print:font-bold">Professional Summary</label>
                    <textarea 
                        value={basicInfo.summary}
                        onChange={(e) => setBasicInfo({...basicInfo, summary: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 p-3 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors h-24 resize-y leading-relaxed print:hidden placeholder:text-slate-600"
                        placeholder="Experienced C-Level Executive with 15+ years in..."
                    />
                    <div className="hidden print:block text-black text-sm p-1 leading-relaxed whitespace-pre-wrap text-justify">{basicInfo.summary || '-'}</div>
                </div>

                {/* Core Competencies (Tag style input area) */}
                <div>
                    <label className="block text-[11px] text-slate-500 mb-1 print:text-gray-600 print:font-bold">Core Competencies (Searchable Keywords)</label>
                    <textarea
                        value={competencies}
                        onChange={(e) => setCompetencies(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 p-3 text-brand-gold font-medium text-sm focus:border-brand-gold focus:outline-none transition-colors print:hidden placeholder:text-slate-600 h-24 resize-y leading-relaxed"
                        placeholder="e.g. Strategic Planning, M&A, Digital Transformation, IPO, P&L Management (Comma separated)"
                    />
                    <div className="hidden print:block mt-1">
                        {competencies.split(',').map((tag, i) => (
                             <span key={i} className="inline-block bg-gray-200 rounded px-2 py-1 text-xs font-bold mr-2 mb-1 text-black">#{tag.trim()}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* SECTION 3: Career Progression */}
        <section className="bg-slate-900 border border-slate-800 rounded-sm p-5 shadow-lg print:bg-white print:border-black print:shadow-none print:p-0 print:break-inside-avoid">
             <div className="flex justify-between items-center mb-4 print:mb-2 print:border-b print:border-black print:pb-1">
                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-widest flex items-center print:text-black">
                    <span className="w-2 h-2 bg-brand-gold mr-2 rounded-full print:hidden"></span> 03. Professional Experience
                </h3>
                <button onClick={addExperience} className="text-[10px] text-slate-400 hover:text-white border border-slate-700 px-3 py-1 rounded hover:bg-slate-800 transition-colors no-print">
                    + Add Position
                </button>
            </div>

            <div className="space-y-4 print:space-y-6">
                {experienceList.map((exp, index) => (
                    <div key={exp.id} className="relative bg-slate-950 border border-slate-800 p-4 rounded-sm group print:bg-white print:border-none print:p-0 print:mb-4">
                        {experienceList.length > 1 && (
                            <button 
                                onClick={() => removeExperience(exp.id)}
                                className="absolute top-3 right-3 text-slate-600 hover:text-red-400 text-xs no-print"
                            >
                                Remove
                            </button>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 print:grid-cols-3 print:gap-2 print:mb-1">
                             <div>
                                <label className="block text-[10px] text-slate-500 uppercase mb-1 print:text-gray-600 print:font-bold">Company</label>
                                <input 
                                    type="text" 
                                    value={exp.company}
                                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 p-2 text-white text-sm focus:border-brand-blue focus:outline-none print:hidden"
                                />
                                <div className="hidden print:block text-black text-sm font-bold">{exp.company}</div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase mb-1 print:text-gray-600 print:font-bold">Role / Title</label>
                                <input 
                                    type="text" 
                                    value={exp.role}
                                    onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 p-2 text-white text-sm focus:border-brand-blue focus:outline-none print:hidden"
                                />
                                <div className="hidden print:block text-black text-sm italic">{exp.role}</div>
                            </div>
                             <div>
                                <label className="block text-[10px] text-slate-500 uppercase mb-1 print:text-gray-600 print:font-bold">Duration</label>
                                <input 
                                    type="text" 
                                    value={exp.duration}
                                    onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 p-2 text-white text-sm focus:border-brand-blue focus:outline-none print:hidden"
                                    placeholder="e.g. 2019 - Present"
                                />
                                <div className="hidden print:block text-black text-sm text-right">{exp.duration}</div>
                            </div>
                        </div>

                        {/* Description and Critique Side-by-Side in Builder */}
                        <div className="grid grid-cols-1 gap-4">
                             <div>
                                <label className="block text-[10px] text-slate-500 uppercase mb-1 print:text-gray-600 print:font-bold">Key Achievements & Responsibilities</label>
                                <textarea
                                    value={exp.description}
                                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 p-3 text-slate-300 text-sm focus:border-brand-blue focus:outline-none h-32 resize-y leading-relaxed print:hidden placeholder:text-slate-600"
                                    placeholder="• Spearheaded global expansion strategies...&#10;• Managed P&L of $50M..."
                                />
                                <div className="hidden print:block text-black text-sm leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-gray-200">{exp.description}</div>
                            </div>
                            
                            {/* CRITIQUE BOX - Only visible in Builder if present */}
                            {exp.critique && (
                                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-sm no-print">
                                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                                        Consultant Critique
                                    </h4>
                                    <p className="text-xs text-blue-200/80 italic leading-snug">{exp.critique}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* SECTION 4: Education */}
        <section className="bg-slate-900 border border-slate-800 rounded-sm p-5 shadow-lg print:bg-white print:border-black print:shadow-none print:p-0 print:break-inside-avoid">
             <div className="flex justify-between items-center mb-4 print:mb-2 print:border-b print:border-black print:pb-1">
                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-widest flex items-center print:text-black">
                    <span className="w-2 h-2 bg-brand-gold mr-2 rounded-full print:hidden"></span> 04. Education
                </h3>
                <button onClick={addEducation} className="text-[10px] text-slate-400 hover:text-white border border-slate-700 px-3 py-1 rounded hover:bg-slate-800 transition-colors no-print">
                    + Add Education
                </button>
            </div>
            <div className="space-y-3 print:space-y-1">
                 {educationList.map((edu, index) => (
                    <div key={edu.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950 p-3 border border-slate-800 items-end print:bg-white print:border-none print:p-1 print:grid-cols-12">
                         <div className="md:col-span-5 print:col-span-5">
                            <label className="block text-[10px] text-slate-500 uppercase mb-1 print:hidden">Institution</label>
                            <input 
                                type="text" 
                                value={edu.school}
                                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 p-2 text-white text-sm focus:border-brand-blue focus:outline-none print:hidden"
                                placeholder="University Name"
                            />
                            <div className="hidden print:block text-black text-sm font-bold">{edu.school}</div>
                         </div>
                         <div className="md:col-span-4 print:col-span-4">
                            <label className="block text-[10px] text-slate-500 uppercase mb-1 print:hidden">Degree</label>
                            <input 
                                type="text" 
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 p-2 text-white text-sm focus:border-brand-blue focus:outline-none print:hidden"
                                placeholder="Degree (MBA, PhD)"
                            />
                            <div className="hidden print:block text-black text-sm">{edu.degree}</div>
                         </div>
                         <div className="md:col-span-2 print:col-span-3 text-right">
                             <label className="block text-[10px] text-slate-500 uppercase mb-1 print:hidden">Year</label>
                            <input 
                                type="text" 
                                value={edu.year}
                                onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 p-2 text-white text-sm focus:border-brand-blue focus:outline-none print:hidden"
                                placeholder="Graduation Year"
                            />
                            <div className="hidden print:block text-black text-sm font-mono">{edu.year}</div>
                         </div>
                         <div className="md:col-span-1 text-right no-print">
                             {educationList.length > 1 && (
                                <button onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-400 font-bold text-lg mb-1">
                                    &times;
                                </button>
                             )}
                         </div>
                    </div>
                 ))}
            </div>
        </section>

        {/* SECTION 5: Professional Assets (Updated Title & Placeholders) */}
        <section className="bg-slate-900 border border-slate-800 rounded-sm p-5 shadow-lg print:bg-white print:border-black print:shadow-none print:p-0 print:break-inside-avoid">
             <div className="flex justify-between items-center mb-4 print:mb-2 print:border-b print:border-black print:pb-1">
                <h3 className="text-sm font-bold text-brand-gold uppercase tracking-widest flex items-center print:text-black">
                    <span className="w-2 h-2 bg-brand-gold mr-2 rounded-full print:hidden"></span> 05. Professional Assets (Certifications, Publications)
                </h3>
                <button onClick={addCertification} className="text-[10px] text-slate-400 hover:text-white border border-slate-700 px-3 py-1 rounded hover:bg-slate-800 transition-colors no-print">
                    + Add Item
                </button>
            </div>
            <div className="space-y-3 print:space-y-1">
                 {certificationList.map((cert, index) => (
                    <div key={cert.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-950 p-3 border border-slate-800 items-end print:bg-white print:border-none print:p-1 print:grid-cols-12">
                         <div className="md:col-span-5 print:col-span-5">
                            <label className="block text-[10px] text-slate-500 uppercase mb-1 print:hidden">Name / Title</label>
                            <input 
                                type="text" 
                                value={cert.name}
                                onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 p-2 text-white text-sm focus:border-brand-blue focus:outline-none print:hidden"
                                placeholder="e.g. CPA, Ph.D. Thesis: [Topic], Book: [Title]"
                            />
                            <div className="hidden print:block text-black text-sm font-bold">{cert.name}</div>
                         </div>
                         <div className="md:col-span-4 print:col-span-4">
                            <label className="block text-[10px] text-slate-500 uppercase mb-1 print:hidden">Issuer / Organization</label>
                            <input 
                                type="text" 
                                value={cert.issuer}
                                onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 p-2 text-white text-sm focus:border-brand-blue focus:outline-none print:hidden"
                                placeholder="e.g. AICPA, Seoul National Univ, Publisher"
                            />
                            <div className="hidden print:block text-black text-sm">{cert.issuer}</div>
                         </div>
                         <div className="md:col-span-2 print:col-span-3 text-right">
                             <label className="block text-[10px] text-slate-500 uppercase mb-1 print:hidden">Year</label>
                            <input 
                                type="text" 
                                value={cert.year}
                                onChange={(e) => updateCertification(cert.id, 'year', e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 p-2 text-white text-sm focus:border-brand-blue focus:outline-none print:hidden"
                                placeholder="Year"
                            />
                            <div className="hidden print:block text-black text-sm font-mono">{cert.year}</div>
                         </div>
                         <div className="md:col-span-1 text-right no-print">
                             {certificationList.length > 1 && (
                                <button onClick={() => removeCertification(cert.id)} className="text-red-500 hover:text-red-400 font-bold text-lg mb-1">
                                    &times;
                                </button>
                             )}
                         </div>
                    </div>
                 ))}
            </div>
        </section>

        {/* SECTION 6: Job Match Intelligence (Revamped Luxury Dark Theme) */}
        <section className="bg-slate-900 border border-brand-gold/30 rounded-sm p-6 shadow-2xl relative overflow-hidden print:bg-white print:border-black print:shadow-none print:p-0 print:break-inside-avoid">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none print:hidden"></div>
             
             {/* Loading Overlay */}
             {isMatchLoading && (
                 <div className="absolute inset-0 z-20 bg-slate-950/80 flex items-center justify-center flex-col backdrop-blur-sm animate-fade-in print:hidden">
                     <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-2"></div>
                     <span className="text-brand-gold text-xs font-bold tracking-widest uppercase animate-pulse">Analyzing Match...</span>
                 </div>
             )}

             <div className="flex justify-between items-start mb-6 print:mb-2 print:border-b print:border-black print:pb-1 relative z-10">
                <div>
                    <h3 className="text-sm font-bold text-brand-gold uppercase tracking-widest flex items-center print:text-black">
                        <span className="w-2 h-2 bg-brand-gold mr-2 rounded-full print:hidden shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span> 
                        06. Job Match Intelligence
                    </h3>
                    <p className="text-slate-400 mt-1 font-light tracking-wide text-[10px] print:hidden">
                        Gemini AI compares the resume against the Target JD to determine fit.
                    </p>
                </div>
                {/* Analyze Match Button Area */}
                <div className="flex items-center gap-3 no-print">
                     {matchStats && (
                         <div className="text-[10px] text-slate-500 animate-fade-in text-right">
                             <span className="block text-brand-gold font-bold">{matchStats.model} Active</span>
                             <span className="block font-mono">{(matchStats.latency / 1000).toFixed(2)}s</span>
                         </div>
                     )}
                    <button 
                        onClick={handleRunMatch}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-brand-gold text-brand-gold hover:text-slate-900 border border-brand-gold/30 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                    >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {matchInfo.score !== '0' ? 'Re-Analyze Match' : 'Analyze Match with AI'}
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. Score & Summary Card */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* Gauge Chart */}
                    <div className="bg-slate-950 border border-slate-800 p-6 rounded-sm flex flex-col items-center justify-center relative shadow-inner print:bg-white print:border-gray-200">
                        <div className="relative w-32 h-32">
                             <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                                <circle 
                                    cx="64" cy="64" r="56" 
                                    stroke={scoreConfig.stroke}
                                    strokeWidth="8" fill="transparent" 
                                    strokeDasharray={351}
                                    strokeDashoffset={351 - (351 * parseInt(matchInfo.score || '0')) / 100}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-3xl font-serif font-bold ${scoreConfig.text} print:text-black`}>{matchInfo.score}%</span>
                                <span className={`text-[9px] uppercase tracking-widest mt-1 ${scoreConfig.text} opacity-80 print:text-black`}>{scoreConfig.label}</span>
                            </div>
                        </div>
                    </div>

                    {/* Summary Input */}
                    <div className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-sm print:bg-white print:border-gray-200">
                        <label className="block text-[10px] font-bold text-brand-gold uppercase tracking-wider mb-2 print:text-black">
                            Executive Match Summary
                        </label>
                        <textarea
                            value={matchInfo.summary}
                            onChange={(e) => setMatchInfo({...matchInfo, summary: e.target.value})}
                            className="w-full h-32 bg-transparent text-slate-300 text-xs leading-relaxed resize-none focus:outline-none print:hidden scrollbar-hide"
                            placeholder="AI analysis summary..."
                        />
                        <div className="hidden print:block text-xs text-black leading-relaxed text-justify whitespace-pre-wrap">{matchInfo.summary}</div>
                    </div>
                </div>

                {/* 2. Strengths & Gaps (FULL WIDTH VERTICAL STACK) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Strengths */}
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-sm print:bg-white print:border-gray-200">
                         <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 print:border-gray-300">
                             <span className="text-green-500 text-xs">●</span>
                             <span className="text-sm font-bold text-white uppercase tracking-wider print:text-black">Matching Strengths</span>
                         </div>
                         <ul className="space-y-4">
                             {matchInfo.strengths.map((str, idx) => (
                                 <li key={idx} className="flex items-start gap-3">
                                     <span className="text-brand-gold mt-1.5 text-xs">✦</span>
                                     <textarea 
                                        value={str} 
                                        onChange={(e) => handleStrengthChange(idx, e.target.value)}
                                        className="flex-1 bg-slate-900/50 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:border-brand-gold focus:outline-none resize-none leading-relaxed print:hidden scrollbar-hide"
                                        rows={2}
                                        placeholder="Strength description..."
                                     />
                                     <span className="hidden print:block text-xs text-black">{str}</span>
                                     {/* Added Remove Button */}
                                     {matchInfo.strengths.length > 1 && (
                                        <button 
                                            onClick={() => removeStrength(idx)}
                                            className="text-slate-600 hover:text-red-400 mt-2 no-print"
                                            title="Remove Item"
                                        >
                                            &times;
                                        </button>
                                     )}
                                 </li>
                             ))}
                         </ul>
                         <button onClick={addStrength} className="mt-4 text-[10px] text-slate-400 hover:text-white uppercase tracking-wider border border-slate-700 px-3 py-1 rounded hover:bg-slate-800 transition-colors no-print">+ Add Strength</button>
                    </div>

                    {/* Gaps */}
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-sm print:bg-white print:border-gray-200">
                         <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 print:border-gray-300">
                             <span className="text-red-500 text-xs">●</span>
                             <span className="text-sm font-bold text-white uppercase tracking-wider print:text-black">Gap / Risks</span>
                         </div>
                         <ul className="space-y-4">
                             {matchInfo.gaps.map((gap, idx) => (
                                 <li key={idx} className="flex items-start gap-3">
                                     <span className="text-red-400 mt-1.5 text-xs">!</span>
                                     <textarea 
                                        value={gap} 
                                        onChange={(e) => handleGapChange(idx, e.target.value)}
                                        className="flex-1 bg-slate-900/50 border border-slate-800 rounded p-2 text-sm text-slate-300 focus:border-brand-gold focus:outline-none resize-none leading-relaxed print:hidden scrollbar-hide"
                                        rows={2}
                                        placeholder="Gap description..."
                                     />
                                     <span className="hidden print:block text-xs text-black">{gap}</span>
                                     {/* Added Remove Button */}
                                     {matchInfo.gaps.length > 1 && (
                                        <button 
                                            onClick={() => removeGap(idx)}
                                            className="text-slate-600 hover:text-red-400 mt-2 no-print"
                                            title="Remove Item"
                                        >
                                            &times;
                                        </button>
                                     )}
                                 </li>
                             ))}
                         </ul>
                         <button onClick={addGap} className="mt-4 text-[10px] text-slate-400 hover:text-white uppercase tracking-wider border border-slate-700 px-3 py-1 rounded hover:bg-slate-800 transition-colors no-print">+ Add Gap</button>
                    </div>

                </div>
            </div>
        </section>

        {/* Action Bar - Hidden in Print */}
        <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur-md p-4 border-t border-slate-800 flex justify-end no-print">
             <button
                onClick={onSubmit}
                disabled={isLoading || disabled || !basicInfo.name}
                className="px-12 py-4 bg-brand-gold hover:bg-white text-slate-900 text-sm font-bold uppercase tracking-[0.2em] rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
            >
                {isLoading ? 'Generating Report...' : 'Generate Analysis Report'}
            </button>
        </div>

      </div>
    </div>
  );
};