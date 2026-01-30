import React, { useState } from 'react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface SignInFormProps {
  onComplete: (userData: UserProfile) => void;
  onCancel: () => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';

export const SignInForm: React.FC<SignInFormProps> = ({ onComplete, onCancel }) => {
  const [mode, setMode] = useState<AuthMode>('LOGIN');
  
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    department: '',
    email: '',
    phone: '',
    password: '',
    agreed: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear general error
    if (generalError) setGeneralError(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Common Validation
    if (!formData.email.trim()) newErrors.email = "이메일을 입력해주세요.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "유효한 이메일 형식이 아닙니다.";
    
    if (!formData.password.trim()) newErrors.password = "비밀번호를 입력해주세요.";
    else if (mode === 'REGISTER' && formData.password.length < 4) newErrors.password = "비밀번호는 4자 이상이어야 합니다.";

    // Registration Only Validation
    if (mode === 'REGISTER') {
        if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
        if (!formData.company.trim()) newErrors.company = "현재 소속(회사명)을 입력해주세요.";
        if (!formData.phone.trim()) newErrors.phone = "연락처를 입력해주세요.";
        if (!formData.agreed) newErrors.agreed = "개인정보 수집 및 이용에 동의해야 합니다.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      setGeneralError(null);

      try {
        let userProfile: UserProfile;

        if (mode === 'REGISTER') {
            userProfile = await authService.register({
                name: formData.name,
                company: formData.company,
                department: formData.department,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });
        } else {
            userProfile = await authService.login(formData.email, formData.password);
        }
        
        onComplete(userProfile);

      } catch (error: any) {
        console.error("Auth error:", error);
        setGeneralError(error.message || "오류가 발생했습니다. 다시 시도해주세요.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-brand-gold/30 rounded-lg shadow-2xl max-w-md w-full overflow-hidden relative flex flex-col">
        {/* Decorative Top Line */}
        <div className="h-1 bg-gradient-to-r from-brand-bronze via-brand-gold to-brand-bronze w-full"></div>
        
        {/* TABS */}
        <div className="flex border-b border-slate-800">
            <button 
                onClick={() => setMode('LOGIN')}
                className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors ${mode === 'LOGIN' ? 'text-brand-gold bg-slate-800/50 border-b-2 border-brand-gold' : 'text-slate-500 hover:text-white'}`}
            >
                Member Login
            </button>
            <button 
                onClick={() => setMode('REGISTER')}
                className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors ${mode === 'REGISTER' ? 'text-brand-gold bg-slate-800/50 border-b-2 border-brand-gold' : 'text-slate-500 hover:text-white'}`}
            >
                New Membership
            </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-serif text-white mb-2">
                {mode === 'LOGIN' ? 'Welcome Back' : 'Join Expert Lounge'}
            </h2>
            <p className="text-slate-400 text-sm">
                {mode === 'LOGIN' 
                    ? '등록된 이메일과 비밀번호로 입장하세요.' 
                    : '전문가 리포트 생성을 위해 기본 정보를 등록합니다.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* --- REGISTER FIELDS --- */}
            {mode === 'REGISTER' && (
                <>
                <div>
                    <label className="block text-xs font-semibold text-brand-gold mb-1">이름 *</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        placeholder="홍길동"
                        disabled={isSubmitting}
                        className={`w-full bg-slate-800 border ${errors.name ? 'border-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors disabled:opacity-50`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                </>
            )}

            {/* --- COMMON FIELDS (Email & Password) --- */}
            <div>
              <label className="block text-xs font-semibold text-brand-gold mb-1">이메일 (ID) *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="example@company.com"
                disabled={isSubmitting}
                className={`w-full bg-slate-800 border ${errors.email ? 'border-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors disabled:opacity-50`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-gold mb-1">비밀번호 *</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange}
                placeholder={mode === 'REGISTER' ? "4자 이상 입력" : "비밀번호 입력"}
                disabled={isSubmitting}
                className={`w-full bg-slate-800 border ${errors.password ? 'border-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors disabled:opacity-50 font-mono`}
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* --- REGISTER FIELDS CONTINUED --- */}
            {mode === 'REGISTER' && (
                <>
                <div>
                    <label className="block text-xs font-semibold text-brand-gold mb-1">연락처 *</label>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange}
                        placeholder="010-1234-5678"
                        disabled={isSubmitting}
                        className={`w-full bg-slate-800 border ${errors.phone ? 'border-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors disabled:opacity-50`}
                    />
                    {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-brand-gold mb-1">소속(회사명) *</label>
                        <input 
                            type="text" 
                            name="company" 
                            value={formData.company} 
                            onChange={handleChange}
                            placeholder="Current Company"
                            disabled={isSubmitting}
                            className={`w-full bg-slate-800 border ${errors.company ? 'border-red-500' : 'border-slate-700'} rounded p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors disabled:opacity-50`}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-brand-gold mb-1">부서/직책</label>
                        <input 
                            type="text" 
                            name="department" 
                            value={formData.department} 
                            onChange={handleChange}
                            placeholder="기획팀 / 이사"
                            disabled={isSubmitting}
                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-brand-gold focus:outline-none transition-colors disabled:opacity-50"
                        />
                    </div>
                </div>
                {errors.company && <p className="text-red-400 text-xs">{errors.company}</p>}

                {/* Privacy Checkbox */}
                <div className="mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-start">
                        <input 
                            type="checkbox" 
                            name="agreed"
                            id="privacy-agree"
                            checked={formData.agreed}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            className="mt-1 mr-2 accent-brand-gold cursor-pointer"
                        />
                        <label htmlFor="privacy-agree" className="text-xs text-slate-300 cursor-pointer leading-relaxed">
                            <span className="font-bold text-white">[필수] 개인정보 수집 및 이용 동의</span><br/>
                            <span className="text-[10px] text-slate-500">
                            서비스 이용, 리포트 제공, 비즈니스 안내를 위해 정보를 수집합니다.
                            </span>
                        </label>
                    </div>
                    {errors.agreed && <p className="text-red-400 text-xs mt-1 ml-5">{errors.agreed}</p>}
                </div>
                </>
            )}

            {/* General Error Message */}
            {generalError && (
                <div className="p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-xs text-center">
                    {generalError}
                </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button 
                type="button" 
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 py-3 border border-slate-700 rounded text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 py-3 bg-brand-gold text-slate-900 rounded text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors shadow-lg disabled:bg-slate-600 disabled:text-slate-400 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                   mode === 'LOGIN' ? 'Enter Lounge' : 'Register & Enter'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};