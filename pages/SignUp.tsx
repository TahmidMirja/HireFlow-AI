
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { saveUserToN8n } from '../services/webhookService';

interface SignUpProps {
  onSignUp: (userData: { name: string; email: string }) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError("Please agree to the membership terms.");
      return;
    }

    if (formData.password.length > 0 && formData.password[0] === '0') {
      setError("Security Alert: Password cannot start with '0'.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await saveUserToN8n(formData);
      if (response && response.success === false) {
        setError(response.error);
        setIsLoading(false);
        return;
      }
      
      setTimeout(() => {
        onSignUp({ name: formData.name, email: formData.email });
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError("Critical network failure. Please verify your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[540px] animate-reveal">
        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100 relative">
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] mb-8 shadow-xl shadow-indigo-100 animate-bounce-subtle">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3">Professional Tier Access</p>
          </div>

          {error && (
            <div className="mb-8 p-6 bg-rose-50 border-l-4 border-rose-500 rounded-2xl animate-reveal">
               <div className="flex items-center gap-4">
                 <div className="bg-rose-100 p-1.5 rounded-full shrink-0">
                    <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                 </div>
                 <p className="text-xs font-black text-rose-700 leading-tight uppercase tracking-tight">{error}</p>
               </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-slate-900"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Phone</label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 000 000"
                        className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-slate-900"
                    />
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Email Address</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="name@email.com"
                className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-1">Password</label>
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Min. 6 chars (No '0' at start)"
                className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center space-x-4 py-3 group">
              <input
                  id="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={() => setAgreed(!agreed)}
                  className="w-6 h-6 text-indigo-600 border-slate-200 rounded-lg cursor-pointer transition-transform group-hover:scale-110"
              />
              <label htmlFor="terms" className="text-xs text-slate-500 font-bold cursor-pointer select-none">
                I accept the <span className="text-indigo-600 underline">Membership Terms</span>.
              </label>
            </div>

            <button
              disabled={isLoading || !agreed}
              type="submit"
              className={`w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center ${isLoading || !agreed ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                </div>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                Already joined? <Link to="/login" className="text-indigo-600 ml-1 font-black underline underline-offset-4 decoration-2">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
