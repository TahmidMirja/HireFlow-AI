
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-[#fafbfc]">
      {/* HERO SECTION */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-24 md:py-40">
          <div className="text-center space-y-8 animate-reveal">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
              <span className="w-2 h-2 rounded-full bg-indigo-500 mr-3"></span>
              The Next-Gen Career Suite is Live
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tighter leading-[1.1] max-w-4xl mx-auto">
              Master your career <br className="hidden md:block" /> with <span className="text-indigo-600">HireFlow AI.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
              Eliminate the friction of job hunting. Tailored, context-aware documents built for the modern workforce.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
              >
                Join Now Free
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-900 font-bold rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full pointer-events-none overflow-hidden opacity-50">
          <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[70%] bg-indigo-100 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[60%] bg-violet-100 rounded-full blur-[120px]"></div>
        </div>
      </div>

      {/* FEATURE CARDS */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "AI Cover Letters",
              desc: "Write letters that recruiters actually read. Tailored perfectly to every job post.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
              color: "text-indigo-600",
              bg: "bg-indigo-50"
            },
            {
              title: "Resume Summaries",
              desc: "Punchy intro bios that pass ATS filters and grab immediate human attention.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
              color: "text-violet-600",
              bg: "bg-violet-50"
            },
            {
              title: "Smart Tracking",
              desc: "Integrated logs to monitor your application velocity and career success.",
              icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />,
              color: "text-emerald-600",
              bg: "bg-emerald-50"
            }
          ].map((feature, i) => (
            <div key={i} className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <svg className={`w-7 h-7 ${feature.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {feature.icon}
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
