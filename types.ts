
// Define the specific analysis modes
export enum AnalysisMode {
  EXECUTIVE_BRIEFING = 'EXECUTIVE_BRIEFING', // Mode 1: Summary + Match
  RESUME_REFINEMENT = 'RESUME_REFINEMENT',   // Mode 2: Rewrite + Polish
}

export type OutputLanguage = 'Korean' | 'English';

export interface UserProfile {
  name: string;
  company: string;
  department?: string;
  email: string;
  phone: string;
}

// Structured Output Schema Types
export interface WorkExperience {
  company: string;
  maskedCompany?: string; // New: AI-generated anonymous name (e.g. "Global Auto Giant")
  role: string;
  duration: string;
  keyAchievements: string[];
  refinedContent?: string; // For Refinement Mode
  critique?: string;       // NEW: AI's specific feedback on this role (Hidden in print)
}

export interface Education {
  institution: string;
  maskedInstitution?: string; // New: AI-generated anonymous name (e.g. "Top-tier KR Univ")
  degree: string;
  year: string;
}

export interface Certification {
  name: string;   // e.g. "Ph.D. Thesis: AI Ethics" or "CPA"
  issuer: string; // e.g. "Seoul National Univ" or "AICPA"
  year: string;
}

export interface JobMatchAnalysis {
  matchScore: number; // 0-100
  matchSummary: string; // New: Short summary of the fit
  matchingStrengths: string[]; // New: List of matched strengths
  gapAnalysis: string[]; // Areas to improve
}

export interface ResumeData {
  // Common
  candidateName: string;
  email?: string;
  phone?: string;
  
  // Executive Briefing Specific
  professionalSummary: string;
  maskedSummary?: string; // New: Anonymized summary for Blind Mode
  
  leadershipStyle?: string; // Analysis of leadership type
  topSkills: string[]; // Keywords/Tags
  
  // Refinement Specific
  refinedSummary?: string; // Rewritten summary
  strategicOverview?: string; // NEW: Overall critique/strategy for the resume
  
  experience: WorkExperience[];
  education: Education[];
  certifications?: Certification[]; // New: Professional Assets
  
  // Job Match (Optional)
  jobMatch?: JobMatchAnalysis;
  
  riskAnalysis?: {
    detectedGaps: boolean;
    flags: string[];
  };
}

// --- NEW: Data structure for the Input Builder Form ---
export interface ParsedResumeData {
  detectedLanguage?: OutputLanguage; // Auto-detected language
  strategicOverview?: string; // NEW: Global critique shown in Builder
  basicInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;     // Added
    linkedin: string;  // Added
    location: string;  // Added
    summary: string;
  };
  competencies: string[]; // Added: Extracted Key Skills
  experience: Array<{
    id: number;
    company: string;
    role: string;
    duration: string;
    description: string;
    critique?: string; // NEW: Specific critique shown in Builder
  }>;
  education: Array<{
    id: number;
    school: string;
    degree: string;
    year: string;
  }>;
  certifications: Array<{ // Added: Certs/Awards/Board
    id: number;
    name: string;
    issuer: string;
    year: string;
  }>;
  // Added Structured Job Match Data
  jobMatch?: {
    score: string;
    summary: string;
    strengths: string[];
    gaps: string[];
  }
}

export interface ProcessingStats {
  modelUsed: string;
  latencyMs: number;
  costTier: 'Low' | 'High';
}

export interface AnalysisResult {
  data: ResumeData | null;
  stats: ProcessingStats | null;
  error?: string;
}