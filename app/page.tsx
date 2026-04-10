"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, Hash, Bot, Activity, Globe, MessageSquare, 
  Power, Trash2, User, Crosshair, Terminal, Zap, 
  Cpu, Lock, CpuIcon
} from 'lucide-react';

// --- DARKFOX CORE V5.1 ---
// Copyright (c) 2026 DarkFox Co.

export default function Page() {
  // --- AUTH STATES ---
  const [isLogged, setIsLogged] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [authError, setAuthError] = useState("");
  
  // --- SYSTEM STATES ---
  const [chatRoom, setChatRoom] = useState("Global");
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [newMissionText, setNewMissionText] = useState<{ [key: string]: string }>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- USER PROFILE (Identity: Tobias / Sigma Dad) ---
  const currentUser = { 
    email: email || "admin@darkfox.co", 
    name: "TOBIAS", 
    role: "ADMIN", 
    job: "CEO & LEAD CODER" 
  };

  const allUsers = [
    { email: "denis@darkfox.co", name: "DENIS", role: "AGENT", currentMission: "Neural Decryption", status: "ONLINE" },
    { email: "liam@darkfox.co", name: "LIAM", role: "AGENT", currentMission: "Asset Acquisition", status: "ONLINE" },
    { email: "simon@darkfox.co", name: "SIMON", role: "AGENT", currentMission: "Bypass Firewalls", status: "OFFLINE" },
  ];

  // --- KERNEL LOGIC ---
  const addSystemLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 40));
  };

  const handleLogin = () => {
    if (!email || !password) {
      setAuthError("CREDENTIALS_REQUIRED");
      return;
    }
    setIsConnecting(true);
    addSystemLog("INITIATING_HANDSHAKE...");
    
    setTimeout(() => {
      setIsLogged(true);
      setIsConnecting(false);
      addSystemLog("ENCRYPTED_SESSION_ESTABLISHED");
      addSystemLog(`WELCOME BACK, SIGMA DAD.`);
    }, 1800);
  };

  const disconnect = () => {
    addSystemLog("TERMINATING_SESSION...");
    setTimeout(() => setIsLogged(false), 500);
  };

  // --- AI CORE - THE BRAIN (Fixed Model Endpoint) ---
  const fetchAIResponse = async (prompt: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      addSystemLog("ERR: API_KEY_VOID");
      return "ERROR: AI Core offline. API Key not found in Environment.";
    }

    try {
      // Wir nutzen hier v1beta und stellen sicher, dass das Model-Format stimmt
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        // Falls gemini-1.5-flash nicht geht, versuchen wir es mit einem Fallback-String
        console.error("AI_CORE_REJECTED:", data.error);
        addSystemLog(`CORE_ERR: ${data.error.status}`);
        return `SYSTEM_ERROR: ${data.error.message}`;
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      addSystemLog("CORE_CONNECTION_LOST");
      return "CRITICAL_FAILURE: Neural Link failed.";
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: inputMsg,
      sender: currentUser.name,
      senderEmail: currentUser.email,
      role: currentUser.role
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputMsg;
    setInputMsg("");
    setShowCommands(false);

    // AI Trigger
    if (chatRoom === "DarkFox_AI" || currentInput.startsWith("/ai ")) {
      setIsAITyping(true);
      addSystemLog("NEURAL_PROCESSING_START");
      
      const cleanPrompt = currentInput.startsWith("/ai ") ? currentInput.replace("/ai ", "") : currentInput;
      const response = await fetchAIResponse(cleanPrompt);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "DARKFOX_AI",
        senderEmail: "ai@darkfox.co",
        role: "AI_CORE"
      }]);
      
      setIsAITyping(false);
      addSystemLog("NEURAL_RESPONSE_RECEIVED");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAITyping]);

  // --- UI COMPONENTS ---
  const MissionCard = ({ agent }: { agent: any }) => (
    <div className="p-5 bg-black/60 rounded-[2rem] border border-zinc-800/40 hover:border-orange-600/30 transition-all group">
      <div className="flex justify-between items-start mb-3">
        <p className="text-[11px] font-black italic uppercase text-white">{agent.name}</p>
        <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`} />
      </div>
      <div className="bg-orange-600/5 border-l-2 border-orange-600 p-2 mb-4">
        <p className="text-[9px] text-orange-500 italic font-medium">“{agent.currentMission}”</p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <input 
          value={newMissionText[agent.email] || ""} 
          onChange={(e) => setNewMissionText(prev => ({ ...prev, [agent.email]: e.target.value }))}
          placeholder="NEW_TASK..." 
          className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-[10px] outline-none focus:border-orange-600/50" 
        />
        <button 
          onClick={() => { addSystemLog(`PUSH_MISSION -> ${agent.name}`); setNewMissionText(prev => ({ ...prev, [agent.email]: "" })); }}
          className="bg-zinc-800 p-2 px-3 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-black transition-colors"
        >
          Push
        </button>
      </div>
    </div>
  );

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 flex items-center justify-center font-mono p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/5 blur-[120px] rounded-full" />
      </div>

      {!isLogged ? (
        <div className="border-2 border-orange-600/20 p-12 rounded-[4rem] bg-black w-full max-w-md shadow-[0_0_100px_rgba(234,88,12,0.1)] relative z-10 backdrop-blur-md">
          <div className="mb-12 text-center">
            <div className="inline-block p-4 bg-orange-600/10 rounded-3xl mb-6">
              <Shield className="text-orange-600" size={40} />
            </div>
            <h1 className="text-7xl font-black italic text-orange-600 tracking-tighter uppercase leading-none">DarkFox</h1>
            <p className="text-[10px] text-zinc-600 mt-4 tracking-[0.5em] font-black uppercase">Terminal_System_v5.1</p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <User size={14} className="absolute left-5 top-5 text-zinc-600" />
              <input 
                type="email" placeholder="OPERATOR_ID" 
                className="w-full p-5 pl-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600/50 text-sm font-bold uppercase transition-all" 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-5 top-5 text-zinc-600" />
              <input 
                type="password" placeholder="SECURITY_CYPHER" 
                className="w-full p-5 pl-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600/50 text-sm transition-all" 
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            {authError && <p className="text-[10px] text-rose-500 font-black text-center uppercase tracking-widest">{authError}</p>}
            <button 
              onClick={handleLogin} disabled={isConnecting} 
              className="w-full bg-orange-600 p-6 rounded-2xl font-black italic uppercase text-black hover:bg-orange-500 transition-all shadow-[0_10px_20px_rgba(234,88,12,0.2)] mt-4 active:scale-95 disabled:opacity-50"
            >
              {isConnecting ? "HANDSHAKE..." : "ESTABLISH_LINK"}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[1600px] h-[94vh] grid grid-cols-12 gap-6 relative z-10 animate-in fade-in zoom-in duration-500">
          
          {/* LEFT: NETWORK NODES */}
          <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[3rem] p-8 flex-1 flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-orange-600 text-[11px] font-black tracking-widest uppercase flex items-center gap-3">
                  <Terminal size={14} /> Nodes_Active
                </h3>
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-orange-600/40 rounded-full animate-pulse" />
                  <div className="w-1 h-3 bg-orange-600/60 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-3 bg-orange-600 rounded-full animate-pulse delay-150" />
                </div>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                <button onClick={() => setChatRoom("Global")} className={`w-full p-5 rounded-[1.8rem] text-left border transition-all relative group ${chatRoom === "Global" ? 'bg-orange-600 text-black border-orange-600 shadow-lg shadow-orange-600/20' : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'}`}>
                  <Globe size={14} className={`absolute right-5 top-6 ${chatRoom === "Global" ? "text-black/40" : "text-zinc-700"}`} />
                  <p className="font-black text-xs italic uppercase">Global_Net</p>
                  <p className={`text-[8px] mt-1 font-bold ${chatRoom === "Global" ? "text-black/60" : "text-zinc-600"}`}>Public Encryption</p>
                </button>

                <button onClick={() => setChatRoom("DarkFox_AI")} className={`w-full p-5 rounded-[1.8rem] text-left border transition-all relative overflow-hidden group ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600 text-black border-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-zinc-900/30 border-zinc-800 hover:border-emerald-900/50'}`}>
                  <Bot size={14} className={`absolute right-5 top-6 ${chatRoom === "DarkFox_AI" ? "text-black/40" : "text-emerald-500"}`} />
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Cpu size={80} />
                  </div>
                  <p className="font-black text-xs italic uppercase">DarkFox_AI</p>
                  <p className={`text-[8px] mt-1 font-bold ${chatRoom === "DarkFox_AI" ? "text-black/60" : "text-zinc-600"}`}>System Core v5.1</p>
                </button>

                <div className="py-4 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-zinc-800/50" />
                  <span className="text-[9px] font-black text-zinc-600 uppercase">Agents</span>
                  <div className="h-[1px] flex-1 bg-zinc-800/50" />
                </div>

                {allUsers.map((u, i) => (
                  <button key={i} onClick={() => setChatRoom(u.email)} className={`w-full p-5 rounded-[1.8rem] text-left border transition-all group ${chatRoom === u.email ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-600'}`}>
                    <div className="flex justify-between items-center font-black text-xs uppercase italic">
                      {u.name} 
                      <div className={`w-2 h-2 rounded-full ${u.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* KERNEL LOGS */}
            <div className="bg-black border border-zinc-800/80 rounded-[2.5rem] p-7 h-52 flex flex-col shadow-2xl">
              <div className="text-zinc-600 font-black uppercase text-[10px] mb-4 flex items-center gap-3">
                <Activity size={14} className="text-zinc-700" /> Kernel_Logs
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar text-[10px] font-mono">
                {systemLogs.length === 0 && <div className="text-zinc-800 italic">No logs in buffer...</div>}
                {systemLogs.map((log, i) => (
                  <div key={i} className="text-zinc-500 leading-tight">
                    <span className="text-orange-900">»</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER: MAIN TERMINAL */}
          <div className="col-span-6 bg-zinc-900/10 border border-zinc-800/50 rounded-[4rem] flex flex-col overflow-hidden relative backdrop-blur-2xl shadow-2xl">
            <header className="p-10 border-b border-zinc-800/50 flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-[1.8rem] shadow-inner ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600/10 text-emerald-500' : 'bg-orange-600/10 text-orange-600'}`}>
                  {chatRoom === "Global" ? <Globe size={28} /> : chatRoom === "DarkFox_AI" ? <Cpu size={28} /> : <MessageSquare size={28} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                      {chatRoom === "Global" ? "Broadband" : chatRoom === "DarkFox_AI" ? "Neural_Link" : "Direct_Link"}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">Encrypted</span>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase mt-1 tracking-widest">Target_ID: {chatRoom}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={disconnect} className="p-4 bg-zinc-900/80 border border-zinc-800 text-zinc-600 rounded-2xl hover:text-rose-500 hover:border-rose-900/50 transition-all">
                  <Power size={18} />
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale">
                  <Zap size={60} className="mb-4 text-orange-600" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">Buffer_Empty_Wait_For_Transmission</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col group ${msg.senderEmail === currentUser.email ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-3 mb-3 ${msg.senderEmail === currentUser.email ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${msg.role === 'ADMIN' ? 'text-orange-600' : msg.role === 'AI_CORE' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                      {msg.role === 'AI_CORE' && <Bot size={12} />} {msg.sender}
                    </span>
                    <span className="text-[8px] text-zinc-800 font-bold">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className={`p-6 rounded-[2.5rem] text-[15px] leading-relaxed shadow-xl max-w-[85%] transition-all ${
                    msg.senderEmail === currentUser.email ? 'bg-orange-600 text-black font-bold rounded-tr-none' : 
                    msg.role === 'AI_CORE' ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-50 rounded-tl-none backdrop-blur-md' :
                    'bg-zinc-900/80 border border-zinc-800 text-zinc-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isAITyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 mb-3">
                    <Bot size={12} /> DarkFox_AI
                  </span>
                  <div className="p-6 rounded-[2.5rem] bg-emerald-900/10 border border-emerald-500/20 text-emerald-500/60 rounded-tl-none italic text-sm">
                    Synthesizing Neural Data...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-10 bg-black/40 border-t border-zinc-800/50 backdrop-blur-3xl">
              <form onSubmit={sendMessage} className="flex gap-4 relative">
                <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${chatRoom === 'DarkFox_AI' ? 'text-emerald-500' : 'text-orange-600'}`}>
                  <Terminal size={18} />
                </div>
                <input 
                  value={inputMsg} 
                  onChange={(e) => {
                    setInputMsg(e.target.value);
                    setShowCommands(e.target.value === '/');
                  }}
                  placeholder={chatRoom === "DarkFox_AI" ? "OPERATOR_INPUT_REQUIRED..." : "TRANSMIT_DATA (Type / for commands)..."} 
                  className="flex-1 bg-zinc-900/40 border border-zinc-800 p-6 pl-14 rounded-3xl outline-none focus:border-orange-600/40 text-sm font-medium transition-all placeholder:text-zinc-700"
                />
                <button 
                  type="submit" disabled={isAITyping} 
                  className={`p-6 px-12 rounded-3xl text-black font-black uppercase italic shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/20'}`}
                >
                  Transmit
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: INTEL & MISSION CONTROL */}
          <div className="col-span-3 space-y-6 flex flex-col h-full overflow-hidden">
            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5">
                 <CpuIcon size={120} />
               </div>
              <div className="flex items-center gap-3 text-orange-600 mb-8 font-black uppercase text-[11px] tracking-widest">
                <User size={16}/> Operator_Intel
              </div>
              <p className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-2">{currentUser.name}</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-8">Access_Level: Root_Admin</p>
              
              <div className="space-y-5 pt-8 border-t border-zinc-800/50">
                <div className="flex justify-between items-end">
                  <p className="text-[9px] text-zinc-700 uppercase font-black">Designation</p>
                  <p className="text-xs font-black text-orange-600 uppercase italic">{currentUser.job}</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[9px] text-zinc-700 uppercase font-black">Status</p>
                  <p className="text-xs font-black text-emerald-500 uppercase italic">Active_Link</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-zinc-800/50 rounded-[3rem] p-10 flex-1 flex flex-col overflow-hidden shadow-2xl">
              <h3 className="text-rose-600 text-[11px] font-black uppercase tracking-widest mb-8 flex items-center gap-3">
                <Crosshair size={16}/> Mission_Control
              </h3>
              <div className="space-y-5 overflow-y-auto pr-3 custom-scrollbar">
                {allUsers.map((agent, i) => (
                  <MissionCard key={i} agent={agent} />
                ))}
              </div>
            </div>
            
            <div className="bg-orange-600 rounded-[3rem] p-10 text-black text-center shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
               <p className="text-[10px] uppercase font-black tracking-[0.4em] mb-2 opacity-60">System Proprietary</p>
               <p className="text-3xl font-black italic uppercase tracking-tighter">DarkFox Co.</p>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        
        body { font-family: 'JetBrains Mono', monospace; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea580c; }
      `}</style>
    </div>
  );
}
