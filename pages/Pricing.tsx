
import React from 'react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Free Member",
      price: "0",
      features: ["3 Monthly Generations", "Standard Templates", "Community Support", "Basic n8n Export"],
      button: "Current Plan",
      featured: false,
      color: "bg-slate-50 text-slate-900"
    },
    {
      name: "Professional Tier",
      price: "19",
      features: ["Unlimited Generations", "Premium ATS Templates", "Priority Processing", "Full Career Dashboard", "LinkedIn Bio Tool"],
      button: "Get Started Pro",
      featured: true,
      color: "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
    },
    {
      name: "Enterprise Hub",
      price: "Custom",
      features: ["Custom Webhook Access", "API Integration (v1)", "Brand Identity Tools", "Dedicated Account Lead", "Team Collaboration"],
      button: "Contact Architect",
      featured: false,
      color: "bg-slate-900 text-white"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 animate-reveal">
      <div className="text-center space-y-6 mb-24">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Investment Strategy</h4>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Invest in your <span className="text-indigo-600">trajectory.</span>
        </h1>
        <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto font-medium">
          Choose a tier that matches your career velocity. No hidden fees, just pure professional edge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div key={i} className={`p-10 md:p-12 rounded-[3.5rem] border border-slate-100 flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${plan.featured ? 'scale-105 ring-4 ring-indigo-50/50 relative z-10' : 'bg-white'}`}>
            {plan.featured && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
            )}
            <div>
              <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-widest">{plan.name}</h3>
              <div className="mb-10">
                <span className="text-5xl font-black text-slate-900 tracking-tighter">${plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-400 font-bold ml-2">/ month</span>}
              </div>
              <ul className="space-y-6 mb-12">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center text-sm font-bold text-slate-500">
                    <svg className="w-5 h-5 text-indigo-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            <Link 
              to={plan.price === "Custom" ? "/about" : "/signup"}
              className={`w-full py-5 rounded-2xl text-center font-black text-sm uppercase tracking-widest transition-all ${plan.color}`}
            >
              {plan.button}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-32 p-12 bg-slate-50 rounded-[4rem] text-center border border-slate-100">
        <h3 className="text-2xl font-black text-slate-900 mb-4">Frequently Asked Questions</h3>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-10">Transparent Policies</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left max-w-4xl mx-auto">
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs">Can I cancel anytime?</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Yes, all subscriptions are month-to-month. You can downgrade or cancel from your dashboard settings instantly.</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-black text-slate-900 uppercase tracking-tight text-xs">What templates are available?</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">Pro members get access to 15+ modern templates tailored for Finance, Tech, Healthcare, and Creative roles.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
