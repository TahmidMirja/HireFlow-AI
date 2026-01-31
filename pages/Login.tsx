
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { loginUserToN8n } from '../services/webhookService';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAuthorization = (val: any): boolean => {
    if (!val) return false;
    const rawString = JSON.stringify(val).toLowerCase();
    const successRegex = /(status|result|success)[\\"]*[:\s]*[\\"]*true/i;
    return successRegex.test(rawString);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
        const result = await loginUserToN8n({ email, password });
        if (verifyAuthorization(result)) {
          onLogin(email);
        } else {
          setError("Invalid credentials. Please try again.");
        }
    } catch (err) {
        setError("Connection timeout.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-[440px] animate-reveal">
        <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 shadow-sm">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 font-bold mt-2 text-[10px] uppercase tracking-widest">Secure Access</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl animate-reveal">
               <p className="text-xs font-black text-rose-600 uppercase tracking-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 focus:bg-white transition-all outline-none font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.956 9.956 0 0112 5c4.478 0 8.268-2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={isLoading}
              type="submit"
              className={`w-full py-5 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center ${isLoading ? 'opacity-80' : ''}`}
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                New here? <Link to="/signup" className="text-indigo-600 font-black ml-1 underline-offset-4 hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
