import React, { useEffect } from 'react';

interface CoreStrengthsPageProps {
  onStart: () => void;
}

export const CoreStrengthsPage: React.FC<CoreStrengthsPageProps> = ({ onStart }) => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans overflow-y-auto selection:bg-brand-gold selection:text-slate-900 animate-fade-in">
      
      {/* Header/Nav */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="text-xl font-bold font-serif text-white">
                Expert Lounge <span className="text-brand-gold italic">AI</span>
            </div>
            <button onClick={onStart} className="text-sm font-medium text-brand-gold hover:text-white transition-colors">
                Skip to Analysis &rarr;
            </button>
        </div>
      </header>

      {/* Intro Header */}
      <section className="pt-28 md:pt-32 pb-12 md:pb-16 text-center px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-serif leading-tight">
            Uncompromising Quality<br/>
            <span className="text-gradient-gold">For Executive Talent</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
            Expert Lounge AI는 단순한 자동화를 넘어, 시니어 전문가의 가치를 온전히 이해하고 증명하기 위해 설계되었습니다.
        </p>
      </section>

      {/* Core Strengths Section */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Strength 1 */}
            <div className="group relative bg-slate-900/50 p-1 rounded-xl h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
              <div className="relative h-full bg-slate-900 border border-slate-800 group-hover:border-brand-gold/50 p-6 md:p-8 rounded-lg transition-colors duration-300 flex flex-col">
                <div className="w-14 h-14 bg-gradient-to-br from-brand-gold to-brand-bronze rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-brand-gold/20">
                  <span className="text-slate-900 text-xl font-bold font-serif">01</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4 font-serif">시니어 특화 맥락 이해<br/><span className="text-xs md:text-sm font-sans font-normal text-brand-gold/80">(Executive Context Awareness)</span></h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                  단순한 키워드 추출을 넘어, 시니어급 인사에게 필수적인 <strong className="text-brand-gold font-medium">'관리자로서의 리더십 스타일'</strong>과 <strong className="text-brand-gold font-medium">'최근 10년 내의 핵심 성과'</strong>를 집중 분석합니다.
                </p>
                <div className="pt-4 border-t border-slate-800">
                  <p className="text-slate-500 text-xs">방대한 경력 중 산업군 내 독보적인 전문성을 찾아내어 3~5줄의 Executive Summary로 제공합니다.</p>
                </div>
              </div>
            </div>

            {/* Strength 2 */}
            <div className="group relative bg-slate-900/50 p-1 rounded-xl h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
               <div className="relative h-full bg-slate-900 border border-slate-800 group-hover:border-brand-gold/50 p-6 md:p-8 rounded-lg transition-colors duration-300 flex flex-col">
                <div className="w-14 h-14 bg-slate-800 border border-brand-gold/30 rounded-lg flex items-center justify-center mb-6">
                   <span className="text-brand-gold text-xl font-bold font-serif">02</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4 font-serif">데이터 보안 및 비식별화<br/><span className="text-xs md:text-sm font-sans font-normal text-brand-gold/80">(Privacy by Design)</span></h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                  헤드헌팅 업무의 특성을 반영하여 클릭 한 번으로 이름, 연락처 등 개인정보를 마스킹하는 <strong className="text-brand-gold font-medium">'블라인드 모드(Blind Mode)'</strong>를 지원합니다.
                </p>
                 <div className="pt-4 border-t border-slate-800">
                  <p className="text-slate-500 text-xs">보안이 생명인 시니어 채용 시장에서 안심하고 리포트를 공유할 수 있습니다.</p>
                </div>
              </div>
            </div>

            {/* Strength 3 */}
            <div className="group relative bg-slate-900/50 p-1 rounded-xl h-full">
               <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
               <div className="relative h-full bg-slate-900 border border-slate-800 group-hover:border-brand-gold/50 p-6 md:p-8 rounded-lg transition-colors duration-300 flex flex-col">
                <div className="w-14 h-14 bg-slate-800 border border-brand-gold/30 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-brand-gold text-xl font-bold font-serif">03</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4 font-serif">멀티 포맷 및 문서 자동화<br/><span className="text-xs md:text-sm font-sans font-normal text-brand-gold/80">(Seamless Automation)</span></h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                  PDF, 이미지는 물론 MS Word(DOCX)와 텍스트 파일까지 모든 형태의 이력서를 인식합니다. 
                </p>
                 <div className="pt-4 border-t border-slate-800">
                  <p className="text-slate-500 text-xs">분석 결과는 즉시 전문가용 PDF 리포트로 변환되어 기업 고객에게 전달 가능한 완성형 문서를 생성합니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
           <h2 className="text-3xl font-bold text-center mb-16 text-white font-serif">
            Workflow Process
          </h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-stretch gap-6 group">
              <div className="md:w-1/3 text-left md:pr-10 flex flex-col justify-center">
                 <h3 className="text-xl md:text-2xl font-bold text-brand-gold mb-2 font-serif">01. Resume Analysis</h3>
                 <p className="text-slate-400 text-sm">지능형 이력서 분석</p>
              </div>
              <div className="hidden md:block w-px bg-slate-800 relative">
                 <div className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 bg-brand-bronze rounded-full border-4 border-slate-900 group-hover:bg-brand-gold transition-colors"></div>
              </div>
              <div className="md:w-2/3 bg-slate-950 border border-slate-800 p-6 rounded-lg group-hover:border-brand-gold/30 transition-colors">
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-3">✦</span>
                    <span><strong>스킬 맵핑:</strong> #공정자동화, #M&A경험 등 핵심 전문성을 태그 형태로 시각화하여 후보자의 강점을 즉각 파악합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-3">✦</span>
                    <span><strong>경력 타임라인 요약:</strong> 복잡한 이직 이력 속에서 성장의 궤적을 요약하여 전달합니다.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-stretch gap-6 group">
               <div className="md:w-1/3 text-left md:pr-10 flex flex-col justify-center">
                 <h3 className="text-xl md:text-2xl font-bold text-brand-gold mb-2 font-serif">02. AI Job Match</h3>
                 <p className="text-slate-400 text-sm">직무 적합도 정밀 매칭</p>
              </div>
              <div className="hidden md:block w-px bg-slate-800 relative">
                 <div className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 bg-brand-bronze rounded-full border-4 border-slate-900 group-hover:bg-brand-gold transition-colors"></div>
              </div>
              <div className="md:w-2/3 bg-slate-950 border border-slate-800 p-6 rounded-lg group-hover:border-brand-gold/30 transition-colors">
                 <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-3">✦</span>
                    <span><strong>매칭 스코어링:</strong> 채용 공고(JD)와 후보자의 역량을 대조하여 합격 가능성을 %로 산출합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-3">✦</span>
                    <span><strong>Gap 분석:</strong> 공고 요건 중 후보자가 보완해야 할 점이나 면접에서 검증해야 할 역량 부족분(Gap)을 AI가 미리 짚어줍니다.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-stretch gap-6 group">
               <div className="md:w-1/3 text-left md:pr-10 flex flex-col justify-center">
                 <h3 className="text-xl md:text-2xl font-bold text-brand-gold mb-2 font-serif">03. Smart Refinement</h3>
                 <p className="text-slate-400 text-sm">전문가 이력서 수정/보완</p>
              </div>
               <div className="hidden md:block w-px bg-slate-800 relative">
                 <div className="absolute top-1/2 -mt-2 -ml-2 w-4 h-4 bg-brand-bronze rounded-full border-4 border-slate-900 group-hover:bg-brand-gold transition-colors"></div>
              </div>
              <div className="md:w-2/3 bg-slate-950 border border-slate-800 p-6 rounded-lg group-hover:border-brand-gold/30 transition-colors">
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-3">✦</span>
                    <span><strong>성과 수치화:</strong> 모호한 표현을 "매출 170억에서 290억으로 증대"와 같이 헤드헌터가 선호하는 수치 중심 문장으로 재구성합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-gold mr-3">✦</span>
                    <span><strong>오탈자 및 문장 교정:</strong> 전문가로서의 신뢰도를 높이기 위해 비문과 오탈자를 수정하고 비즈니스 매너에 맞는 고급 어휘로 다듬어줍니다.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Value Cards */}
      <section className="py-16 md:py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-16 text-white font-serif">기대 효과</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-8 rounded-sm border border-slate-800 hover:border-brand-gold/50 transition-colors shadow-lg">
                    <h4 className="text-lg md:text-xl font-bold text-white mb-4 font-serif border-b border-brand-bronze/30 pb-2">헤드헌터</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">이력서 검토 및 리포트 작성 시간을 <span className="text-brand-gold font-bold">80% 이상 단축</span>하여 더 많은 후보자 발굴에 집중할 수 있습니다.</p>
                </div>
                 <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-8 rounded-sm border border-slate-800 hover:border-brand-gold/50 transition-colors shadow-lg">
                    <h4 className="text-lg md:text-xl font-bold text-white mb-4 font-serif border-b border-brand-bronze/30 pb-2">시니어 후보자</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">자신의 숨겨진 강점을 발견하고, 최신 채용 트렌드에 맞는 세련된 이력서로 <span className="text-brand-gold font-bold">자신을 브랜딩</span>할 수 있습니다.</p>
                </div>
                 <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 md:p-8 rounded-sm border border-slate-800 hover:border-brand-gold/50 transition-colors shadow-lg">
                    <h4 className="text-lg md:text-xl font-bold text-white mb-4 font-serif border-b border-brand-bronze/30 pb-2">플랫폼 운영자</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">Expert Lounge만의 독보적인 기술적 장벽을 구축하여 단순 구인구직 사이트를 넘어선 <span className="text-brand-gold font-bold">'커리어 컨설팅 플랫폼'</span>으로 도약합니다.</p>
                </div>
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 font-serif">
                Ready to Experience Excellence?
            </h2>
            <p className="text-slate-400 mb-12 text-lg font-light">
              지금 바로 Expert Lounge AI의 강력한 분석 엔진을 경험해보세요.
            </p>
            <button 
                onClick={onStart}
                className="px-12 py-4 bg-brand-gold text-slate-900 font-bold tracking-widest uppercase hover:bg-white hover:text-slate-900 transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)] rounded-sm w-full md:w-auto"
            >
                Start Free Analysis
            </button>
        </div>
      </section>

      <footer className="py-8 bg-slate-950 text-center text-slate-600 text-xs border-t border-slate-900">
        <p className="font-serif">&copy; 2026 Expert Lounge by YN Consulting Group. All rights reserved.</p>
      </footer>
    </div>
  );
};