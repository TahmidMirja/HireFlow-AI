
import React, { useState } from 'react';

const About: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-24 md:py-32 animate-reveal">
      <div className="space-y-24">
        {/* VISION SECTION */}
        <header className="space-y-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em]">
            Digital Identity Architected
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            The next chapter of your <span className="text-indigo-600">career</span> starts here.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
            HireFlow AI is a high-performance career companion designed to eliminate the friction of job applications through intelligent automation and refined AI synthesis.
          </p>
        </header>

        {/* FOUNDER & INFO CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">Platform Architect</h3>
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-indigo-100">
                TM
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">Tahmid Mirja</p>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-1">Lead Visionary</p>
              </div>
            </div>
          </div>
          <div className="p-10 bg-slate-900 rounded-[3rem] shadow-2xl flex flex-col justify-between text-white">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10">Application Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-xs font-bold text-slate-400">Stable Build</span>
                <span className="text-xs font-black uppercase tracking-widest">v1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400">Core Engine</span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* CORE MISSION */}
        <section className="bg-white p-12 md:p-20 rounded-[4rem] border border-slate-100 space-y-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">The Intersection of Logic & Ambition.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <p className="text-slate-500 font-medium leading-relaxed">
              In a world where generic applications get ignored, HireFlow AI provides a competitive edge. We don't just generate text; we synthesize your professional identity with the specific needs of modern employers. 
            </p>
            <p className="text-slate-500 font-medium leading-relaxed">
              Created by Tahmid Mirja, this platform represents a fundamental shift in how candidates approach the job market. We believe talent deserves to be heard clearly and professionally.
            </p>
          </div>
        </section>

        {/* CONTACT US SYSTEM */}
        <section id="contact" className="space-y-12 pt-12 border-t border-slate-100">
           <div className="text-center space-y-4">
             <h2 className="text-3xl font-black text-slate-900">Connect with the Lab.</h2>
             <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Inquiries & Support Channels</p>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
             <div className="lg:col-span-2 space-y-8">
               <div className="space-y-6">
                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Our HQ</h4>
                 <p className="text-slate-500 font-medium leading-loose">
                   Digital First Infrastructure<br />
                   Operated Globally by Mirja Tech<br />
                   support@hireflow-ai.com
                 </p>
               </div>
               <div className="flex space-x-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  </div>
               </div>
             </div>

             <div className="lg:col-span-3">
               {submitted ? (
                 <div className="p-10 bg-emerald-50 border border-emerald-100 rounded-[3rem] text-center space-y-4 animate-reveal">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h3 className="text-xl font-black text-emerald-900">Message Received.</h3>
                    <p className="text-emerald-700 text-sm font-bold uppercase tracking-tight">The Architect will review your query within 24 hours.</p>
                 </div>
               ) : (
                 <form onSubmit={handleContactSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input required type="text" placeholder="John Doe" className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                        <input required type="email" placeholder="name@company.com" className="w-full px-7 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-bold" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                      <textarea required placeholder="How can HireFlow AI accelerate your professional journey?" className="w-full h-40 px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all font-medium text-slate-700 resize-none" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-black hover:-translate-y-1 transition-all">
                     Transmit Message
                   </button>
                 </form>
               )}
             </div>
           </div>
        </section>

        <footer className="pt-12 text-center opacity-40">
           <p className="text-[10px] font-black uppercase tracking-[0.8em]">HireFlow AI Engine v1.0 • Built with Passion</p>
        </footer>
      </div>
    </div>
  );
};

export default About;
