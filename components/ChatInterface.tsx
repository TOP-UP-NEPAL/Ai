
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { ChatMessage, FlowPhase, OrderStatus, GameType, Order, User } from '../types';

interface ChatInterfaceProps {
  currentUser: User;
  onQuotaExceeded?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUser, onQuotaExceeded }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<FlowPhase>(FlowPhase.INQUIRY);
  const [extractedData, setExtractedData] = useState<any>({});
  
  // Forms
  const [formUid, setFormUid] = useState('');
  const [formUsername, setFormUsername] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      handleSendMessage(`नमस्ते, मेरो इमेल ${currentUser.email} र नाम ${currentUser.name} हो। म गेम टपअप गर्न चाहन्छु।`);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textOverride?: string, imageBase64?: string) => {
    const userText = textOverride || input;
    if (!userText.trim() && !textOverride && !imageBase64) return;

    if (!textOverride || imageBase64) {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: userText || "Payment proof uploaded.",
        timestamp: Date.now(),
        imageUrl: imageBase64
      };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
    }

    setIsLoading(true);

    try {
      const history = messages.slice(-12).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const aiResponse = await geminiService.processMessage(userText, history, imageBase64);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse.message,
        timestamp: Date.now(),
        type: aiResponse.phase === 'DATA_COLLECTION' ? 'form_data' : 
              aiResponse.phase === 'PAYMENT_SELECTION' ? 'form_data' : // reusing form_data for selection buttons
              aiResponse.phase === 'PAYMENT' ? 'qr_display' : 
              aiResponse.phase === 'VERIFICATION' ? 'form_payment' : 'text'
      };

      setMessages(prev => [...prev, aiMsg]);
      setCurrentPhase(aiResponse.phase as FlowPhase);
      
      const combinedData = { ...extractedData, ...aiResponse.extractedData };
      setExtractedData(combinedData);

      // Save if verified/finalized
      if (aiResponse.phase === 'FINALIZED') {
        const order: Order = {
          id: `MT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          uid: combinedData.uid || 'N/A',
          username: combinedData.username || 'N/A',
          game: combinedData.game || GameType.FREE_FIRE,
          price: combinedData.price || 'N/A',
          amount: combinedData.numPrice || 0,
          transactionId: combinedData.transactionId || 'N/A',
          status: OrderStatus.PENDING,
          userEmail: currentUser.email,
          timestamp: Date.now(),
        };
        await dbService.saveOrder(order);
      }

    } catch (error: any) {
      console.error(error);
      if (error.message === 'QUOTA_EXCEEDED') {
        setMessages(prev => [...prev, { 
          id: 'err', 
          role: 'model', 
          text: "हाम्रो सर्भर अहिले व्यस्त छ (Quota Exceeded)। कृपया आफ्नो आफ्नै API Key प्रयोग गर्नुहोस् वा केही समय पछि प्रयास गर्नुहोस्।", 
          timestamp: Date.now() 
        }]);
        if (onQuotaExceeded) onQuotaExceeded();
      } else {
        setMessages(prev => [...prev, { id: 'err', role: 'model', text: "सर्भरसँग जडान हुन सकेन। कृपया फेरि प्रयास गर्नुहोस्।", timestamp: Date.now() }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSendMessage("Screenshot Uploaded for Verification", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-[780px] max-w-2xl mx-auto glass-panel rounded-[40px] overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.25)] border border-cyan-500/40 relative">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-xl p-6 border-b border-cyan-500/30 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-[20px] bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/30 rotate-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-slate-900 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
          </div>
          <div>
            <h2 className="gaming-font text-cyan-400 font-black tracking-widest text-xl">MERO TOPUP AI</h2>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Ready to Recharge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-10 scrollbar-hide bg-[#010409] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[88%] p-6 rounded-[32px] ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-br-none shadow-2xl border border-indigo-500/30' 
                : 'bg-slate-900/95 text-slate-200 border border-slate-800 rounded-bl-none shadow-xl backdrop-blur-md'
            }`}>
              {msg.imageUrl && (
                <div className="mb-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                  <img src={msg.imageUrl} alt="Payment Proof" className="max-h-60 object-contain w-full bg-black/40" />
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed font-semibold tracking-wide">{msg.text}</p>
              
              {/* Form: Data Collection */}
              {msg.role === 'model' && currentPhase === FlowPhase.DATA_COLLECTION && msg.type === 'form_data' && (
                <div className="mt-6 p-6 bg-slate-950/80 rounded-3xl border border-cyan-500/30 space-y-5">
                  <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] mb-2">Warrior Verification</div>
                  <input 
                    type="text" placeholder="Character UID" 
                    className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-sm focus:border-cyan-500 outline-none transition-all shadow-inner"
                    value={formUid} onChange={(e) => setFormUid(e.target.value)}
                  />
                  <input 
                    type="text" placeholder="In-Game Name" 
                    className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-sm focus:border-cyan-500 outline-none transition-all shadow-inner"
                    value={formUsername} onChange={(e) => setFormUsername(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      if(formUid && formUsername) {
                        handleSendMessage(`My UID: ${formUid}, Name: ${formUsername}`);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-xl shadow-cyan-600/20"
                  >
                    Confirm Identity
                  </button>
                </div>
              )}

              {/* Form: Payment Selection */}
              {msg.role === 'model' && currentPhase === FlowPhase.PAYMENT_SELECTION && (
                 <div className="mt-6 grid grid-cols-1 gap-3">
                   {['eSewa', 'Khalti', 'Mobile Banking'].map(method => (
                     <button
                       key={method}
                       onClick={() => handleSendMessage(`I choose ${method}`)}
                       className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-300 transition-all hover:border-cyan-500 flex items-center justify-between group"
                     >
                       <span>{method}</span>
                       <svg className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     </button>
                   ))}
                 </div>
              )}

              {/* QR Display */}
              {msg.role === 'model' && currentPhase === FlowPhase.PAYMENT && (
                <div className="mt-6 flex flex-col items-center">
                  <div className="relative p-6 bg-white rounded-[40px] shadow-2xl animate-pulse-cyan transform transition-transform hover:scale-105">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=esewa:9861513184&color=0-0-0`} 
                      alt="Payment QR" 
                      className="w-48 h-48" 
                    />
                    <div className="absolute inset-0 border-[6px] border-cyan-500 rounded-[40px] animate-ping opacity-10 pointer-events-none"></div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="gaming-font text-[11px] text-cyan-400 font-black tracking-[0.2em] mb-2 animate-bounce uppercase">
                      अहिले नै स्क्यान गर्नुहोस्
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Number: 9861513184</p>
                  </div>
                  
                  <label className="mt-6 w-full bg-slate-950/50 border-2 border-dashed border-slate-800 p-8 rounded-3xl flex flex-col items-center cursor-pointer hover:border-cyan-500/50 hover:bg-slate-950 transition-all group">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mb-3 group-hover:bg-cyan-500/10 transition-all">
                      <svg className="w-6 h-6 text-slate-500 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Upload Payment Screenshot</span>
                    <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                  </label>
                </div>
              )}
            </div>
            <span className="text-[9px] mt-2 opacity-30 px-4 uppercase font-black tracking-tighter">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/60 p-5 rounded-full flex items-center gap-2 shadow-xl border border-white/5">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 text-slate-200 focus:outline-none focus:border-cyan-500 transition-all text-sm shadow-inner font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading}
            className="bg-gradient-to-tr from-cyan-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 disabled:opacity-50 text-white px-10 py-4 rounded-2xl transition-all font-black gaming-font text-xs uppercase tracking-[0.2em] shadow-2xl shadow-cyan-600/20 active:scale-95"
          >
            SEND
          </button>
        </div>
      </div>
      
      {/* Decorative Corner Glows */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[60px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[60px] pointer-events-none"></div>
    </div>
  );
};

export default ChatInterface;
