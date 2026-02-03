
import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import StatusTracker from './components/StatusTracker';
import { User } from './types';

// Define the expected AIStudio interface to ensure compatibility with global declarations.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Declaring aistudio as the AIStudio type to match the existing global definition.
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [view, setView] = useState<'chat' | 'track'>('chat');
  const [user, setUser] = useState<User | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Check for API Key on mount
  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      } else {
        setHasApiKey(true); // Fallback for outside AI Studio environment
      }
    };
    checkKey();

    const saved = localStorage.getItem('mero_topup_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume success per instructions
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail && loginName) {
      const newUser = { email: loginEmail, name: loginName };
      setUser(newUser);
      localStorage.setItem('mero_topup_user', JSON.stringify(newUser));
    }
  };

  if (hasApiKey === false) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-10 rounded-[40px] border border-cyan-500/20 shadow-2xl text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-[24px] flex items-center justify-center mb-6 shadow-xl mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="gaming-font text-2xl font-black text-white mb-4">API QUOTA REQUIRED</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Mero Topup's AI engine is currently busy. To continue with premium speed, please select your own API key from a paid GCP project.
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white py-4 rounded-2xl font-black gaming-font text-xs uppercase tracking-widest shadow-xl transition-all"
          >
            Select API Key
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block mt-4 text-[10px] text-cyan-400 font-bold uppercase tracking-widest hover:underline">
            Learn about API Billing
          </a>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel p-10 rounded-[40px] border border-cyan-500/20 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-cyan-400 rounded-[24px] flex items-center justify-center mb-6 shadow-xl shadow-cyan-500/20 rotate-6">
              <span className="gaming-font font-black text-3xl text-white">M</span>
            </div>
            <h1 className="gaming-font text-3xl font-black text-white tracking-tighter text-center">
              MERO<span className="text-cyan-400">TOPUP</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-2">Elite Gaming Hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Warrior Name</label>
              <input 
                required type="text" placeholder="Enter your name" 
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-slate-200 outline-none focus:border-cyan-500 transition-all text-sm"
                value={loginName} onChange={e => setLoginName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">E-mail Address</label>
              <input 
                required type="email" placeholder="example@gmail.com" 
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-slate-200 outline-none focus:border-cyan-500 transition-all text-sm"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-tr from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black gaming-font text-xs uppercase tracking-widest shadow-xl shadow-cyan-600/20 transition-all transform active:scale-95"
            >
              Enter Hub
            </button>
          </form>
          
          <div className="mt-10 text-center">
            <button onClick={handleSelectKey} className="text-[10px] text-cyan-400 font-black uppercase tracking-widest mb-4 block mx-auto hover:text-cyan-300">
              Change API Key
            </button>
            <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest leading-loose">
              By entering, you agree to our terms of manual verification for secure transactions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 pb-12 selection:bg-cyan-500 selection:text-white bg-[#020617]">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-cyan-600/5 rounded-full blur-[150px] animate-pulse [animation-delay:3s]"></div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 px-8 py-5 mb-10 shadow-2xl backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-500/30 transform rotate-12 transition-transform hover:rotate-0">
              <span className="gaming-font font-bold text-2xl text-white">M</span>
            </div>
            <div>
               <h1 className="gaming-font text-2xl font-black tracking-tighter text-white">
                MERO<span className="text-cyan-400">TOPUP</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Secured by Grand AI Engine</p>
            </div>
          </div>
          
          <div className="flex bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => setView('chat')}
              className={`px-10 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] ${
                view === 'chat' ? 'bg-cyan-600 text-white shadow-2xl shadow-cyan-500/20 scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Order
            </button>
            <button
              onClick={() => setView('track')}
              className={`px-10 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-[0.2em] ${
                view === 'track' ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 scale-105' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Track
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-white/10">
             <div className="text-right">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user.name}</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={handleSelectKey} className="text-[9px] text-cyan-400 hover:text-cyan-300 font-bold uppercase">Change Key</button>
                  <button onClick={() => { localStorage.removeItem('mero_topup_user'); setUser(null); }} className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase">Log Out</button>
                </div>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center">
                <span className="text-sm font-black text-slate-500">{user.name[0]}</span>
             </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 max-w-7xl">
        {view === 'chat' ? (
          <div className="grid lg:grid-cols-2 gap-20 items-center py-12">
            <div className="order-2 lg:order-1 animate-in fade-in slide-in-from-left-12 duration-1000">
              <div className="inline-block px-5 py-2 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 mb-10 shadow-lg shadow-cyan-500/5">
                <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em]">AI Verified Transactions</span>
              </div>
              <h2 className="gaming-font text-6xl sm:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
                SMART <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">RECHARGE</span>
              </h2>
              <p className="text-slate-400 text-xl mb-12 max-w-lg leading-relaxed font-medium">
                Our Grand AI Engine automatically scans your payments and verifies your game IDs in real-time. Secure, fast, and reliable.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-12">
                 {[
                   { icon: '🚀', title: 'FASTEST', desc: '1-5 Min Delivery' },
                   { icon: '🛡️', title: 'SECURE', desc: 'AI Protection' }
                 ].map((item, idx) => (
                   <div key={idx} className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
                     <span className="text-3xl mb-4 block">{item.icon}</span>
                     <h4 className="gaming-font text-white text-sm font-black tracking-widest mb-1">{item.title}</h4>
                     <p className="text-slate-500 text-[10px] font-bold uppercase">{item.desc}</p>
                   </div>
                 ))}
              </div>
              
              <button 
                onClick={() => setView('chat')}
                className="group relative bg-white text-slate-950 px-12 py-5 rounded-2xl font-black gaming-font uppercase tracking-widest hover:bg-cyan-400 transition-all hover:scale-105 shadow-2xl shadow-white/10"
              >
                Start Recharge
                <div className="absolute inset-0 rounded-2xl bg-white opacity-20 blur-xl group-hover:opacity-40 transition-opacity"></div>
              </button>
            </div>
            
            <div className="order-1 lg:order-2">
              <ChatInterface currentUser={user} onQuotaExceeded={() => setHasApiKey(false)} />
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <StatusTracker />
          </div>
        )}
      </main>

      <footer className="mt-32 border-t border-white/5 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
          <div className="flex gap-12 mb-12 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             <img src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp" alt="eSewa" className="h-8" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Khalti_Logo.png" alt="Khalti" className="h-8" />
             <span className="gaming-font text-white/50 text-xl font-black tracking-widest">VISA</span>
          </div>
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.4em] font-black text-center mb-4">
            &copy; {new Date().getFullYear()} Mero Topup Nepal. Created by Vishal Ghimire.
          </p>
          <div className="flex gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
