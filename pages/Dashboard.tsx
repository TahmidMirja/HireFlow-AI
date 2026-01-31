
import React, { useState, useEffect } from 'react';
import { UserProfile, GeneratedAsset } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
  user: UserProfile | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [recentAssets, setRecentAssets] = useState<GeneratedAsset[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('hireflow_history');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        // Sort by date descending
        setRecentAssets(history.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const openAsset = (asset: GeneratedAsset) => {
    if (asset.pdfData) {
      try {
        // CLEANING: Strict base64 character set filtering
        const cleanB64 = asset.pdfData.trim()
          .replace(/^data:application\/pdf;base64,/i, '')
          .replace(/[^A-Za-z0-9+/=]/g, '');

        if (!cleanB64) {
          alert("Document data is missing or invalid.");
          return;
        }

        const byteCharacters = atob(cleanB64);
        
        // Validation: Verify PDF signature (%PDF-)
        if (!byteCharacters.startsWith('%PDF-')) {
          console.warn("[Dashboard] Restored data is not a valid PDF binary.");
          alert("This document appears to be corrupted or saved in an invalid format.");
          return;
        }

        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (e) {
        console.error("PDF Restore Error:", e);
        alert("Fatal Error: Could not decode PDF data. It might be corrupted.");
      }
    } else {
      alert("No visual data found for this record.");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 md:py-20 animate-reveal">
      <header className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-slate-500 font-medium mt-2">Professional Log • Secure document storage active.</p>
        </div>
        <Link
          to="/generator"
          className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Build New Asset
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { label: "AI Generations", val: recentAssets.length, sub: "Successfully Created", color: "indigo" },
          { label: "Career Progress", val: user.jobsApplied, sub: "Targets Tracked", color: "emerald" },
          { label: "Status", val: user.plan.toUpperCase(), sub: "Account Tier", color: "amber" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover-card">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              <div className={`w-2.5 h-2.5 rounded-full bg-${stat.color}-500 shadow-sm shadow-${stat.color}-200`}></div>
            </div>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mt-3">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-10 py-9 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Professional Application Log</h2>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">SECURE HISTORY</span>
            </div>
            <div className="divide-y divide-slate-50">
              {recentAssets.length > 0 ? recentAssets.map((asset) => (
                <div key={asset.id} className="px-10 py-7 flex items-center group hover:bg-slate-50/50 transition-colors">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-7 transition-transform group-hover:scale-110 ${asset.type === 'cover_letter' ? 'bg-indigo-50 text-indigo-600' : 'bg-violet-50 text-violet-600'}`}>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {asset.type === 'cover_letter' 
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                    </svg>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-black text-slate-900">{asset.jobTitle || 'Career Asset'}</h4>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${asset.type === 'cover_letter' ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700'}`}>
                        {asset.type === 'cover_letter' ? 'Cover Letter' : 'Resume'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-400 mt-1">{asset.companyName || 'Corporate Target'} • {new Date(asset.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center ml-4">
                    <button 
                      onClick={() => openAsset(asset)}
                      className="px-6 py-3 bg-white border border-slate-200 text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      View Proof
                    </button>
                  </div>
                </div>
              )) : (
                <div className="px-10 py-24 text-center">
                  <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No professional records found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-10 rounded-[3rem] shadow-2xl text-white space-y-8">
            <h3 className="text-2xl font-black leading-tight">Master your career with HireFlow AI.</h3>
            <p className="text-indigo-100 font-medium opacity-80 leading-relaxed">Every document generated is a step closer to your dream role. We track your success so you can focus on the growth.</p>
            <button className="w-full bg-white text-indigo-900 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
              Upgrade to Premium
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
