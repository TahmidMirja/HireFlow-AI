
import React, { useState, useRef, useEffect } from 'react';
import { generateViaMaincore } from '../services/webhookService';
import { UserProfile, GeneratedAsset } from '../types';

interface GeneratorProps {
  user: UserProfile | null;
  onAssetCreated: () => void;
}

const Generator: React.FC<GeneratorProps> = ({ user, onAssetCreated }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'cover_letter' | 'resume_summary'>('cover_letter');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: '',
    country: '',
    address: '',  
    jobPosting: '',
    resumeText: '',
    companyName: '',
    jobTitle: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const convertToBlob = (base64: string) => {
    try {
      // 1. Aggressive cleaning of base64 string to remove LLM artifacts
      let cleanContent = base64.trim()
        .replace(/^data:application\/pdf;base64,/i, '')
        .replace(/```[a-z0-9]*\s?/gi, '') // Remove markdown code blocks like ```html
        .replace(/```/g, '')
        .replace(/[^A-Za-z0-9+/=]/g, ''); // Remove any non-base64 characters

      if (!cleanContent) return null;
                                
      const binaryString = atob(cleanContent);
      
      // 2. Validation: Check for PDF signature (%PDF-)
      if (!binaryString.startsWith('%PDF-') && !cleanContent.startsWith('JVBER')) {
        console.warn("[Document] Data does not appear to be a valid PDF binary.");
        if (binaryString.length < 1000) {
           setError("Synthesis Error: Server returned an invalid response instead of a PDF.");
           return null;
        }
      }

      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes], { type: 'application/pdf' });
    } catch (e) {
      console.error("[Document] Binary decoding failed:", e);
      return null;
    }
  };

  const addToHistory = (base64: string, data: any) => {
    try {
      const historyString = localStorage.getItem('hireflow_history');
      let history: GeneratedAsset[] = historyString ? JSON.parse(historyString) : [];
      
      const cleanB64 = base64.trim()
        .replace(/^data:application\/pdf;base64,/i, '')
        .replace(/[^A-Za-z0-9+/=]/g, '');

      const newAsset: GeneratedAsset = {
        id: `asset_${Date.now()}`,
        type: type,
        content: `${type === 'cover_letter' ? 'Cover Letter' : 'Resume'} for ${data.jobTitle || 'Opportunity'}`,
        jobTitle: data.jobTitle || (type === 'cover_letter' ? 'Cover Letter' : 'Resume'),
        companyName: data.companyName || 'Corporate Target',
        date: new Date().toISOString(),
        pdfData: cleanB64
      };

      history.push(newAsset);
      if (history.length > 20) history.shift();
      localStorage.setItem('hireflow_history', JSON.stringify(history));
    } catch (e) {
      console.error("History persistence error:", e);
    }
  };

  const extractPdfData = async (res: any) => {
    // Case 1: n8n returns a direct binary Blob
    if (res instanceof Blob) {
      const textSample = await res.slice(0, 100).text();
      if (textSample.trim().startsWith('{')) {
        try {
          const err = JSON.parse(textSample);
          setError(err.message || err.error || 'Server error during synthesis.');
          return null;
        } catch {}
      }
      
      const reader = new FileReader();
      const b64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(res);
      });
      const base64 = await b64Promise;
      addToHistory(base64, formData);
      return URL.createObjectURL(res);
    }
    
    // Case 2: n8n returns JSON with a base64 field
    const findBinaryString = (obj: any): string | null => {
      if (!obj) return null;
      if (typeof obj === 'string' && obj.length > 200) {
          if (obj.includes('JVBER') || obj.includes('base64')) return obj;
      }
      if (typeof obj === 'object') {
        if (obj.data && typeof obj.data === 'string') return obj.data;
        if (obj.content && typeof obj.content === 'string') return obj.content;
        for (const k in obj) {
          const found = findBinaryString(obj[k]);
          if (found) return found;
        }
      }
      return null;
    };

    const dataString = findBinaryString(res);
    if (dataString) {
      const blob = convertToBlob(dataString);
      if (blob) {
        addToHistory(dataString, formData);
        return URL.createObjectURL(blob);
      }
    }
    return null;
  };

  const handleGenerate = async () => {
    if (!formData.fullName || !formData.jobPosting) {
      setError('Required: Full Name and Job Description.');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      let base64Resume = '';
      if (resumeFile) {
        base64Resume = await fileToBase64(resumeFile);
      }

      const response = await generateViaMaincore({
        ...formData,
        action: 'maincore',
        type: type,
        resumeAttachment: base64Resume,
        resumeFileName: resumeFile?.name || 'none'
      });
      
      const url = await extractPdfData(response);
      if (url) {
        setPdfUrl(url);
        setStep(3);
        onAssetCreated();
      } else if (!error) {
        setError('The server failed to return a valid PDF. Check your n8n workflow output.');
      }
    } catch (err: any) {
      setError(err.message || 'Synthesis server timed out. Ensure n8n is active.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `HireFlow_${type}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 animate-reveal">
      {/* STEP INDICATOR */}
      <div className="mb-16 flex justify-center items-center space-x-6 no-print">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-14 h-14 rounded-3xl flex items-center justify-center font-black transition-all duration-700 ${step === s ? 'bg-indigo-600 text-white shadow-2xl scale-110' : step > s ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-200'}`}>
              {s}
            </div>
            {s < 3 && <div className={`w-16 h-1.5 rounded-full transition-all duration-700 ${step > s ? 'bg-indigo-600' : 'bg-slate-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <button onClick={() => { setType('cover_letter'); setStep(2); }} className="p-12 bg-white rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left group">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl group-hover:rotate-6 transition-transform">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 0 -2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">AI Cover Letter Architect</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-lg">Engineer a high-conversion cover letter perfectly aligned to your target job posting.</p>
          </button>
          
          <button onClick={() => { setType('resume_summary'); setStep(2); }} className="p-12 bg-white rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all text-left group">
            <div className="w-20 h-20 bg-violet-600 text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl group-hover:rotate-6 transition-transform">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">AI Professional Resume Architect</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-lg">Synthesize your history into a world-class resume optimized for ATS and recruiters.</p>
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-reveal space-y-10">
          {type === 'cover_letter' ? (
            /* COVER LETTER ARCHITECT FORM */
            <div className="bg-white p-12 md:p-20 rounded-[4.5rem] shadow-2xl border border-slate-50">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                
                {/* LEFT COLUMN: PERSONAL INFO */}
                <div className="xl:col-span-5 space-y-10">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">Personal & Contact Identity</h4>
                    <p className="text-[11px] font-bold text-slate-400">Essential for your professional cover letter.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Full Name</label>
                      <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Tahmid Mirja" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Email Address</label>
                      <input name="email" value={formData.email} onChange={handleInputChange} placeholder="name@domain.com" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Phone Number</label>
                      <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+880..." className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">City & Country</label>
                      <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Dhaka, Bangladesh" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Full Mailing Address</label>
                    <input name="address" value={formData.address} onChange={handleInputChange} placeholder="House #, Road #, Area, Post Code" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                  </div>

                  <div className="bg-indigo-600/10 p-10 rounded-[2.5rem] border border-indigo-100/50">
                    <h5 className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.3em] mb-4">Pro Synthesis Tip</h5>
                    <p className="text-[11px] font-bold text-indigo-900 leading-relaxed uppercase tracking-tight opacity-70">
                      "A tailored narrative increases success rates. If artifacts appear, try refining your Job Posting text to be cleaner."
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN: JOB INFO */}
                <div className="xl:col-span-7 space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Target Job Title</label>
                      <input name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="Senior Software Engineer" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Target Company</label>
                      <input name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Google / Microsoft" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Job Post Description</label>
                    <textarea name="jobPosting" value={formData.jobPosting} onChange={handleInputChange} placeholder="Paste the full job ad here." className="w-full h-64 px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700 resize-none shadow-inner leading-relaxed" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Resume Text Form (Optional)</label>
                    <textarea name="resumeText" value={formData.resumeText} onChange={handleInputChange} placeholder="Optionally paste additional resume text for deeper context." className="w-full h-40 px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700 resize-none shadow-inner leading-relaxed" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Resume Attachment (Reference PDF)</label>
                        <div onClick={() => fileInputRef.current?.click()} className={`w-full py-6 border border-dashed border-slate-200 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50 ${resumeFile ? 'border-indigo-400 bg-indigo-50/10' : ''}`}>
                          <input type="file" ref={fileInputRef} onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="hidden" accept=".pdf" />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${resumeFile ? 'text-indigo-600' : 'text-slate-400'}`}>
                            {resumeFile ? `Selected: ${resumeFile.name}` : 'Click to Upload PDF'}
                          </span>
                        </div>
                     </div>
                     <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl text-white flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black text-sm">AI</div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest leading-none">Smart Synthesis Active</p>
                          <p className="text-[9px] font-bold mt-1.5 uppercase tracking-tight opacity-70">Tailoring Narrative</p>
                        </div>
                     </div>
                  </div>

                  {error && <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-[10px] uppercase tracking-widest text-center shadow-sm">{error}</div>}

                  <div className="pt-10 flex flex-col items-center gap-6">
                    <button onClick={handleGenerate} disabled={isGenerating} className={`w-full max-w-md py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center ${isGenerating ? 'opacity-50 grayscale' : ''}`}>
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Architecting...
                        </>
                      ) : 'Synthesize Cover Letter'}
                    </button>
                    <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-900 transition-colors">Abort & Return</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* RESUME ARCHITECT FORM - UNCHANGED AS REQUESTED */
            <div className="bg-white p-12 md:p-20 rounded-[4.5rem] shadow-2xl border border-slate-50">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                
                {/* LEFT COLUMN: PERSONAL INFO & CHECKLIST */}
                <div className="xl:col-span-5 space-y-10">
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600">Personal & Contact Identity</h4>
                    <p className="text-[11px] font-bold text-slate-400">Essential for your official professional profile.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Full Name</label>
                      <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Tahmid Mirja" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Email Address</label>
                      <input name="email" value={formData.email} onChange={handleInputChange} placeholder="name@domain.com" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Phone Number</label>
                      <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+880..." className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">City & Country</label>
                      <input name="city" value={formData.city} onChange={handleInputChange} placeholder="Dhaka, Bangladesh" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Full Mailing Address</label>
                    <input name="address" value={formData.address} onChange={handleInputChange} placeholder="House #, Road #, Area, Post Code" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                  </div>

                  <div className="bg-[#0f172a] p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-white">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                     <div className="flex items-center gap-4 relative z-10 mb-8">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg">9</div>
                        <h4 className="text-xs font-black uppercase tracking-widest">Master Resume Checklist</h4>
                     </div>
                     <div className="space-y-3.5 text-[9px] font-bold text-slate-300 leading-relaxed uppercase tracking-widest relative z-10">
                        <p className="flex items-start gap-3"><span className="text-indigo-400 font-black">1.</span> Portfolio Links (LinkedIn/GitHub)</p>
                        <p className="flex items-start gap-3"><span className="text-indigo-400 font-black">2.</span> Professional Summary (2-3 Sentences)</p>
                        <p className="flex items-start gap-3"><span className="text-indigo-400 font-black">3.</span> Work History (Roles & Achievements)</p>
                        <p className="flex items-start gap-3"><span className="text-indigo-400 font-black">4.</span> Education (Degrees & Institution)</p>
                        <p className="flex items-start gap-3"><span className="text-indigo-400 font-black">5.</span> Skills (Technical & Soft Skills)</p>
                        <p className="flex items-start gap-3"><span className="text-indigo-400 font-black">6.</span> Notable Projects & Your Role</p>
                        <p className="flex items-start gap-3"><span className="text-indigo-400 font-black">7.</span> Training & Certifications</p>
                        <p className="flex items-start gap-3"><span className="text-indigo-400 font-black">8.</span> Languages & Proficiency</p>
                        <p className="flex items-start gap-3"><span className="text-indigo-400 font-black">9.</span> Volunteer & Achievements</p>
                     </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: JOB INFO & TEXT AREAS */}
                <div className="xl:col-span-7 space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Target Job Title</label>
                      <input name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="Senior Software Engineer" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Target Company</label>
                      <input name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Google / Microsoft" className="w-full px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-slate-900" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Professional Background & Profile Data</label>
                    <textarea name="resumeText" value={formData.resumeText} onChange={handleInputChange} placeholder="Input all your details here (Experience, Education, Skills, etc.)." className="w-full h-[380px] px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700 resize-none shadow-inner leading-relaxed" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Target Job Description</label>
                    <textarea name="jobPosting" value={formData.jobPosting} onChange={handleInputChange} placeholder="Paste the full job ad here." className="w-full h-48 px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700 resize-none shadow-inner leading-relaxed" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Ref. Previous Resume (Optional PDF)</label>
                        <div onClick={() => fileInputRef.current?.click()} className={`w-full py-6 border border-slate-100 rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50 ${resumeFile ? 'border-indigo-200' : ''}`}>
                          <input type="file" ref={fileInputRef} onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="hidden" accept=".pdf" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {resumeFile ? resumeFile.name : 'Click to Reference Old Resume'}
                          </span>
                        </div>
                     </div>
                     <div className="bg-indigo-600/90 p-6 rounded-[2rem] shadow-xl text-white flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black text-sm">AI</div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest leading-none">Smart Synthesis Active</p>
                        </div>
                     </div>
                  </div>

                  {error && <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-[10px] uppercase tracking-widest text-center shadow-sm">{error}</div>}

                  <div className="pt-10 flex flex-col items-center gap-6">
                    <button onClick={handleGenerate} disabled={isGenerating} className={`w-full max-md py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center ${isGenerating ? 'opacity-50' : ''}`}>
                      {isGenerating ? 'Architecting...' : 'Synthesize Master Resume'}
                    </button>
                    <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-900 transition-colors">Abort & Return</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="animate-reveal flex flex-col items-center">
          <div className="w-full max-w-4xl bg-white p-12 md:p-32 rounded-[5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] text-center space-y-16">
            <div className="space-y-8">
              <div className="w-32 h-32 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-100 transform rotate-3 transition-transform hover:rotate-0">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Synthesis Complete.</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.6em]">Professional History Updated</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-8">
              {pdfUrl && (
                <button onClick={() => window.open(pdfUrl, '_blank')} className="w-full max-w-lg py-10 bg-indigo-600 text-white font-black rounded-[2.5rem] text-2xl uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center group">
                  View Final Proof
                </button>
              )}
              <div className="flex gap-6 w-full max-w-lg">
                <button onClick={handleDownload} className="flex-1 py-6 bg-slate-900 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest shadow-lg hover:bg-black transition-all">Download PDF</button>
                <button onClick={() => setStep(2)} className="flex-1 py-6 bg-white border border-slate-200 text-slate-500 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Modify Input</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Generator;
