import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisMode, ResumeData, ProcessingStats, AnalysisResult, ParsedResumeData, OutputLanguage } from "../types";

// --- Configuration ---
const API_KEY = process.env.API_KEY || ''; 

// Model Definitions
const MODEL_PRO = 'gemini-3-pro-preview';
const MODEL_FAST = 'gemini-3-flash-preview'; 

// --- DYNAMIC SYSTEM INSTRUCTIONS ---
const getBriefingInstruction = (lang: OutputLanguage) => `
You are a Senior Partner at a Top-tier Executive Search Firm (e.g., Korn Ferry, Egon Zehnder).
Your task is to analyze a candidate's resume and generate a "Confidential Executive Briefing".

### CRITICAL LANGUAGE RULE:
**ALL OUTPUT MUST BE IN ${lang === 'Korean' ? 'KOREAN (한국어)' : 'ENGLISH'}.**
Use professional, high-level business ${lang === 'Korean' ? 'Korean' : 'English'} suitable for C-Level executives.

### 1. LEADERSHIP PROFILING
- Analyze the candidate's career trajectory to determine their **Leadership DNA**.
- Format: ${lang === 'Korean' ? 'Korean Description (English Term)' : 'English Description'}. e.g., "전략적 비전가 (Strategic Visionary)".

### 2. EXECUTIVE SUMMARY (CRITICAL)
- Write a 3-5 sentence narrative summary in **${lang === 'Korean' ? 'KOREAN' : 'ENGLISH'}**.
- **CONSTRAINT:** Focus STRICTLY on the **last 10 years** of their career. 
- Highlight P&L responsibility, team size, strategic pivots, and major exits/mergers.

### 3. CONFIDENTIALITY & MASKING (BLIND MODE)
To support blind hiring, generate **Anonymized Versions** of key identifiers:
- **maskedCompany:** Replace specific company names with [Industry] + [Scale/Position] descriptions.
  - Ex: "Samsung Electronics" -> "Global Top-tier Consumer Electronics Company"
  - Ex: "Hyundai Motor" -> "Major Domestic Automotive Manufacturer"
- **maskedInstitution:** Replace university names with [Region] + [Tier] descriptions.
  - Ex: "Seoul National Univ" -> "Top-tier University in Seoul"
  - Ex: "Georgia Tech" -> "Prestigious US Engineering University"
- **maskedSummary:** Rewrite the Executive Summary to remove ALL specific company names, school names, and personal identifiers, replacing them with generic context (e.g., "Led a global team at a major tech firm...").

### 4. JOB MATCH INTELLIGENCE (If JD Provided)
- **Match Score:** Calculate a strict compatibility score (0-100).
- **Analysis Summary:** Provide a 1-sentence verdict on the fit.
- **Matching Strengths:** List 3 key areas where the candidate perfectly matches the JD.
- **Gap Analysis:** Identify *real* missing skills or risks.

### 5. CORE COMPETENCIES (Keyword Mapping)
- Extract 5-7 hashtags that represent their "Unique Selling Points".
`;

const getRefinementInstruction = (lang: OutputLanguage) => `
You are a specialized Executive Resume Consultant.
Your goal is to "Strategically Refine" the user's resume for a C-Level or VP role.

### CRITICAL LANGUAGE RULE:
**ALL OUTPUT MUST BE IN ${lang === 'Korean' ? 'KOREAN (한국어)' : 'ENGLISH'}.**
Refine the content into high-quality Business ${lang === 'Korean' ? 'Korean' : 'English'}.

### 1. REFINED SUMMARY
- Rewrite the Professional Summary to be punchy, quantified, and forward-looking.
- Focus on "Value Proposition" rather than just history.

### 2. EXPERIENCE REFINEMENT (STAR Method)
- For each role, rewrite the description.
- **Quantify Everything:** If a number is missing, infer a likely metric placeholder (e.g., "[Increased revenue by X%]") or emphasize the *scale* of the achievement.
- Use strong action verbs.
- Remove passive voice.

### 3. FINAL OUTPUT
- Produce a clean, polished version suitable for immediate submission.
- Do NOT include critique notes in this final output (critiques were already handled in the builder phase).
`;

// Schema for FINAL Analysis
const getResumeSchema = (lang: OutputLanguage): Schema => ({
  type: Type.OBJECT,
  properties: {
    candidateName: { type: Type.STRING },
    email: { type: Type.STRING },
    phone: { type: Type.STRING },
    
    // Briefing Fields
    professionalSummary: { type: Type.STRING, description: `Executive summary in ${lang}.` },
    maskedSummary: { type: Type.STRING, description: `Anonymized summary for blind mode in ${lang}. Remove specific company/school names.` },
    
    leadershipStyle: { type: Type.STRING, description: `High-level leadership archetype description in ${lang}.` },
    topSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-7 Unique Selling Point hashtags." },
    
    // Refinement Fields
    refinedSummary: { type: Type.STRING, description: `Polished, value-prop driven summary in ${lang}.` },
    // Removed strategicOverview and critique from Final Report Schema as requested

    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          maskedCompany: { type: Type.STRING, description: `Anonymized company name (Industry + Scale) in ${lang}.` },
          role: { type: Type.STRING },
          duration: { type: Type.STRING },
          keyAchievements: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Original bullet points."
          },
          refinedContent: {
            type: Type.STRING,
            description: `A completely rewritten, quantified, and result-oriented paragraph in ${lang}.`
          }
        }
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          maskedInstitution: { type: Type.STRING, description: `Anonymized institution name (Tier + Region) in ${lang}.` },
          degree: { type: Type.STRING },
          year: { type: Type.STRING }
        }
      }
    },
    certifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          issuer: { type: Type.STRING },
          year: { type: Type.STRING }
        }
      },
      description: "List of professional certifications, board memberships, patents, publications, or thesis titles."
    },
    jobMatch: {
      type: Type.OBJECT,
      properties: {
        matchScore: { type: Type.INTEGER },
        matchSummary: { type: Type.STRING, description: `A brief sentence summarizing the overall fit in ${lang}.` },
        matchingStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: `List of 3 key strengths matching the JD in ${lang}.` },
        gapAnalysis: { type: Type.ARRAY, items: { type: Type.STRING }, description: `List of missing skills or experience gaps in ${lang}.` }
      },
      description: "Only populate if a JD is provided in the input."
    },
    riskAnalysis: {
      type: Type.OBJECT,
      properties: {
        detectedGaps: { type: Type.BOOLEAN },
        flags: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  },
  required: ["candidateName", "experience", "education"]
});

// Schema for PARSING (Builder Form)
const parsingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    detectedLanguage: { 
        type: Type.STRING, 
        enum: ["Korean", "English"], 
        description: "Identify the primary language of the resume." 
    },
    strategicOverview: { 
        type: Type.STRING, 
        description: "A high-level audit of the resume. What is lacking? What needs improvement? (Only if mode is Refinement)" 
    },
    basicInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        title: { type: Type.STRING },
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        location: { type: Type.STRING },
        summary: { type: Type.STRING } // This should be the REFINED summary if mode is Refinement
      }
    },
    competencies: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of core competencies or skills."
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          duration: { type: Type.STRING },
          description: { 
            type: Type.STRING, 
            description: "Full description text. If Refinement Mode, this MUST be the REWRITTEN/IMPROVED version." 
          },
          critique: { 
            type: Type.STRING, 
            description: "Specific feedback/critique for this role. Why was it changed? (Only if mode is Refinement)" 
          }
        }
      }
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          school: { type: Type.STRING },
          degree: { type: Type.STRING },
          year: { type: Type.STRING }
        }
      }
    },
    certifications: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                issuer: { type: Type.STRING },
                year: { type: Type.STRING }
            }
        },
        description: "Certifications, Thesis, Books, Patents, Awards."
    },
    jobMatch: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.STRING },
        summary: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        gaps: { type: Type.ARRAY, items: { type: Type.STRING } }
      }
    }
  }
};

const measureLatency = async <T,>(fn: () => Promise<T>): Promise<[T, number]> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return [result, Math.round(end - start)];
};

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- UTILS: Clean JSON ---
const cleanAndParseJson = (text: string): any => {
    // Robust cleanup: find the first '{' and last '}'
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
        throw new Error("No JSON object found in response");
    }

    const jsonString = text.substring(startIndex, endIndex + 1);
    
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        // Attempt to heal common LLM JSON syntax errors (missing commas)
        console.warn("Initial JSON parse failed, attempting auto-repair...", e);
        try {
            // Fix: Missing commas between array items (e.g. "Item 1" "Item 2" -> "Item 1", "Item 2")
            // Fix: Trailing commas
            const healed = jsonString
                .replace(/("\s*)\n(\s*")/g, '$1,$2') // Add comma between strings on newlines
                .replace(/,(\s*[}\]])/g, '$1');    // Remove trailing commas
                
            return JSON.parse(healed);
        } catch (healError) {
             throw new Error("JSON Parsing Failed: " + (e as Error).message);
        }
    }
}

// --- FUNCTION 1: Raw Resume Parsing + Initial Refinement (For Data Builder) ---
export const parseRawResumeData = async (
    fileInput: string | { mimeType: string, data: string },
    jdText?: string,
    mode: AnalysisMode = AnalysisMode.EXECUTIVE_BRIEFING // Mode is now passed
): Promise<{ data: ParsedResumeData | null, latency: number, error?: string }> => {
  if (!API_KEY) return { data: null, latency: 0, error: "API Key Missing" };

  try {
    let prompt = `
      You are a specialized resume parser and executive recruiter.
      Extract structured data from the following RESUME or DOCUMENT.
      
      RULES:
      1. Return strictly JSON matching the schema.
      2. **DETECT LANGUAGE:** Identify if the resume is 'Korean' or 'English'.
      3. **PROFESSIONAL ASSETS:** Extract Certifications, Thesis, Books, Patents.
      4. **FORMATTING:** Ensure all arrays have commas between items. Do not use trailing commas.
    `;

    // --- REFINEMENT LOGIC INJECTION ---
    if (mode === AnalysisMode.RESUME_REFINEMENT) {
        prompt += `
        
        [MODE: STRATEGIC REFINEMENT]
        Do NOT just extract. **AUDIT AND REFINE** the content immediately.
        1. **strategicOverview:** Provide a global critique of the original resume (What's bad? What needs fixing?).
        2. **experience.description:** This field must contain the **REWRITTEN / IMPROVED** version of the experience, using STAR method and quantification. Do not return the original text.
        3. **experience.critique:** Provide specific notes on what you changed and why (e.g. "Added metrics", "Changed passive voice").
        4. **basicInfo.summary:** Rewrite the summary to be an Executive Value Proposition.
        `;
    } else {
        prompt += `
        For 'description' in experience, preserve the original formatting (bullet points) as a single string.
        `;
    }

    if (jdText && jdText.trim().length > 0) {
        prompt += `
        [JOB DESCRIPTION CONTEXT]
        Compare against this JD for Job Match section:
        ${jdText.substring(0, 5000)}
        `;
    }
    prompt += `\nRETURN JSON ONLY.`;

    const contents = [];
    if (typeof fileInput === 'string') {
        contents.push({ role: 'user', parts: [{ text: prompt + "\n\nRESUME TEXT:\n" + fileInput.substring(0, 30000) }] });
    } else {
        contents.push({ role: 'user', parts: [
            { text: prompt },
            { inlineData: { mimeType: fileInput.mimeType, data: fileInput.data } }
        ]});
    }

    const [data, latency] = await measureLatency(async () => {
      const response = await ai.models.generateContent({
        model: MODEL_FAST, // Use Flash for parsing/initial refinement
        contents: contents as any,
        config: {
          responseMimeType: "application/json",
          responseSchema: parsingSchema,
          temperature: 0.0, // Reduced from 0.2 to 0.0 to minimize syntax errors
          // OPTIMIZATION: Disable thinking budget for parsing speed
          thinkingConfig: { thinkingBudget: 0 },
        }
      });
      return cleanAndParseJson(response.text || "{}");
    });

    // Map to ParsedResumeData
    const formattedData: ParsedResumeData = {
      detectedLanguage: data.detectedLanguage || 'Korean', 
      strategicOverview: data.strategicOverview, // Capture Global Critique
      basicInfo: {
          name: data.basicInfo?.name || '',
          title: data.basicInfo?.title || '',
          email: data.basicInfo?.email || '',
          phone: data.basicInfo?.phone || '',
          linkedin: data.basicInfo?.linkedin || '',
          location: data.basicInfo?.location || '',
          summary: data.basicInfo?.summary || ''
      },
      competencies: data.competencies || [],
      experience: (data.experience || []).map((exp: any, idx: number) => ({
        id: Date.now() + idx,
        company: exp.company || '',
        role: exp.role || '',
        duration: exp.duration || '',
        description: exp.description || '',
        critique: exp.critique // Capture Specific Critique
      })),
      education: (data.education || []).map((edu: any, idx: number) => ({
        id: Date.now() + idx + 100,
        school: edu.school || '',
        degree: edu.degree || '',
        year: edu.year || ''
      })),
      certifications: (data.certifications || []).map((cert: any, idx: number) => ({
          id: Date.now() + idx + 200,
          name: cert.name || '',
          issuer: cert.issuer || '',
          year: cert.year || ''
      })),
      jobMatch: data.jobMatch ? {
          score: data.jobMatch.score || '0',
          summary: data.jobMatch.summary || '',
          strengths: data.jobMatch.strengths || [],
          gaps: data.jobMatch.gaps || []
      } : undefined
    };

    // --- CRITICAL FIX: Explicitly remove jobMatch if JD was not provided ---
    if (!jdText || jdText.trim().length === 0) {
        formattedData.jobMatch = undefined;
    }

    return { data: formattedData, latency };

  } catch (err: any) {
    console.error("Parsing Error:", err);
    return { data: null, latency: 0, error: err.message };
  }
};

// ... (Rest of geminiService.ts - analyzeResume - remains mostly same but instruction updated above) ...
// --- Helper: Standalone Match Analysis (UPDATED: Hybrid & Dynamic Language) ---
export const runMatchAnalysisOnly = async (
    resumeText: string, 
    jdText: string, 
    language: OutputLanguage
): Promise<{ data: any, stats: ProcessingStats }> => {
     if (!API_KEY) throw new Error("API Key Missing");
     
     const prompt = `
     ACT AS: Senior Executive Recruiter.
     TASK: Rapid Job Fit Analysis.
     
     RESUME:
     ${resumeText.substring(0, 20000)}
     
     TARGET JD:
     ${jdText.substring(0, 10000)}
     
     INSTRUCTION:
     Compare the resume against the JD requirements.
     **OUTPUT LANGUAGE: ${language === 'Korean' ? 'KOREAN (한국어)' : 'ENGLISH'}**
     
     1. Match Score: 0-100 (Be strict, look for keywords).
     2. Summary: One sentence executive verdict in ${language}.
     3. Strengths: Top 3 matching skills in ${language}.
     4. Gaps: Top 2 missing requirements in ${language}.
     
     RETURN JSON ONLY.
     `;
     
     const attempt = async (model: string) => {
         const config: any = {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                    gaps: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            },
            temperature: 0.1
         };

         // OPTIMIZATION: Disable thinking budget for Flash model
         if (model === MODEL_FAST) {
             config.thinkingConfig = { thinkingBudget: 0 };
         }

         const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: config
         });
         return cleanAndParseJson(response.text || "{}");
     };

     // Hybrid Strategy
     try {
         // 1. Try Flash (Fast)
         const [data, latency] = await measureLatency(() => attempt(MODEL_FAST));
         return { data, stats: { modelUsed: MODEL_FAST, latencyMs: latency, costTier: 'Low' } };
     } catch (e) {
         console.warn("Match Analysis Flash Failed, fallback to Pro", e);
         // 2. Fallback to Pro (Robust)
         const [data, latency] = await measureLatency(() => attempt(MODEL_PRO));
         return { data, stats: { modelUsed: MODEL_PRO, latencyMs: latency, costTier: 'High' } };
     }
}


// --- FUNCTION 2: Final Intelligence Analysis (HYBRID ARCHITECTURE) ---
export const analyzeResume = async (
  resumeText: string, 
  mode: AnalysisMode, 
  jdText?: string,
  language: OutputLanguage = 'Korean'
): Promise<AnalysisResult> => {
  if (!API_KEY) {
    return { data: null, stats: null, error: "API Key is missing." };
  }

  const isRefinement = mode === AnalysisMode.RESUME_REFINEMENT;
  const systemInstruction = isRefinement 
    ? getRefinementInstruction(language) 
    : getBriefingInstruction(language);
  
  const outputLangPrompt = language === 'Korean' ? 'OUTPUT IN KOREAN.' : 'OUTPUT IN ENGLISH.';

  let userPrompt = `CANDIDATE RESUME TEXT:\n${resumeText}\n`;
  if (jdText && jdText.trim().length > 0) {
    userPrompt += `\nTARGET JOB DESCRIPTION (JD):\n${jdText}\n`;
    userPrompt += `\nINSTRUCTION: Perform a deep-dive match analysis against this JD. ${outputLangPrompt}`;
  } else {
      userPrompt += `\nNO JD PROVIDED: Focus on general executive profiling. ${outputLangPrompt}`;
  }

  console.log(`[ExpertLounge] Hybrid Analysis Started. Mode: ${mode}, Lang: ${language}`);

  // --- STRATEGY: Primary (Flash) -> Fallback (Pro) ---
  const attemptAnalysis = async (modelName: string): Promise<ResumeData> => {
      const config: any = {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: getResumeSchema(language),
          temperature: 0.2, 
      };

      // OPTIMIZATION: Disable thinking budget for Flash model
      if (modelName === MODEL_FAST) {
          config.thinkingConfig = { thinkingBudget: 0 };
      }

      const response = await ai.models.generateContent({
        model: modelName,
        contents: userPrompt,
        config: config
      });
      if (!response.text) throw new Error("Empty response from model");
      return cleanAndParseJson(response.text) as ResumeData;
  };

  try {
    // 1. ATTEMPT PRIMARY: Flash (Speed Optimized)
    console.log(`[ExpertLounge] Attempting Primary Model: ${MODEL_FAST}`);
    const [data, latency] = await measureLatency(async () => {
        return await attemptAnalysis(MODEL_FAST);
    });

    // 2. CROSS-VALIDATION (Audit)
    // Simple check: If critical data is missing, force fallback
    if (!data.candidateName || data.experience.length === 0) {
        throw new Error("Primary model returned incomplete data. Triggering fallback.");
    }

    return { 
      data, 
      stats: {
        modelUsed: MODEL_FAST, // Explicitly state Flash was used
        latencyMs: latency,
        costTier: 'Low'
      } 
    };

  } catch (flashError: any) {
    console.warn(`[ExpertLounge] Primary Model Failed: ${flashError.message}. Switching to Secondary (Pro).`);
    
    // 3. FALLBACK: Pro (Quality/Recovery Optimized)
    try {
        const [dataPro, latencyPro] = await measureLatency(async () => {
            return await attemptAnalysis(MODEL_PRO);
        });

        return {
            data: dataPro,
            stats: {
                modelUsed: MODEL_PRO, // Explicitly state Pro was used
                latencyMs: latencyPro,
                costTier: 'High'
            }
        };
    } catch (proError: any) {
        console.error("Critical Failure: Both models failed.", proError);
        return { 
            data: null, 
            stats: null, 
            error: "Complex Analysis Failed. Please try simplifying the input or try again." 
        };
    }
  }
};
