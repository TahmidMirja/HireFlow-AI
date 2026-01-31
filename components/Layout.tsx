
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  user: any;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, isAuthenticated, user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', private: true },
    { name: 'Generator', path: '/generator', private: true },
    { name: 'Pricing', path: '/pricing', private: false },
    { name: 'About', path: '/about', private: false },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-700">
      <nav className="glass sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-12">
              <Link to="/" className="flex items-center group">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center mr-3 group-hover:rotate-6 transition-transform shadow-lg shadow-indigo-100">
                  <span className="text-white font-black text-xl">H</span>
                </div>
                <span className="text-xl font-extrabold tracking-tighter text-slate-900">
                  HireFlow<span className="text-indigo-600">AI</span>
                </span>
              </Link>
              <div className="hidden md:flex space-x-10">
                {navItems.filter(item => !item.private || isAuthenticated).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-bold transition-all ${
                      location.pathname === item.path
                        ? 'text-indigo-600'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900 leading-none">{user?.name}</span>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">
                      {user?.plan === 'premium' ? '✨ Premium Tier' : 'Free Member'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-100 pt-24 pb-12 no-print">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-6 space-y-8">
              <Link to="/" className="flex items-center group">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white font-black text-lg">H</span>
                </div>
                <span className="text-lg font-black tracking-tighter text-slate-900">HireFlow AI</span>
              </Link>
              <p className="text-slate-500 text-lg leading-relaxed max-w-md font-medium">
                Eliminating the friction of professional growth. Built for the ambitious job seeker, architected by <span className="text-slate-900 font-bold">Tahmid Mirja</span>.
              </p>
            </div>
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Platform</h3>
              <ul className="space-y-4">
                <li><Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Dashboard</Link></li>
                <li><Link to="/generator" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Generator</Link></li>
                <li><Link to="/pricing" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Pricing</Link></li>
                <li><Link to="/about" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Legal</h3>
              <ul className="space-y-4">
                <li><Link to="/privacy" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} HireFlow AI — Version 1.0.0
            </p>
            <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Made by Tahmid Mirja</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
