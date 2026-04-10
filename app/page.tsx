"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, Hash, Bot, Activity, Globe, MessageSquare, 
  Power, Trash2, User, Crosshair, Terminal, Zap, 
  Cpu, Lock, Send, ChevronRight, AlertCircle, 
  FileText, ExternalLink, Github, Database, Layers
} from 'lucide-react';

// --- DARKFOX CORE V5.3 (FULL-SCALE & OMNI-LINK) ---
// AUTHORIZED ACCESS ONLY - PROPERTY OF DARKFOX CO. 2026

export default function Page() {
  // --- SESSION STATES ---
  const [isLogged, setIsLogged] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // --- CHAT & ROUTING STATES ---
  const [chatRoom, setChatRoom] = useState("Global");
  const [allMessages, setAllMessages] = useState<{ [key: string]: any[] }>({
    "Global": [],
    "DarkFox_AI": [],
    "denis@darkfox.co": [],
    "liam@darkfox.co": [],
    "simon@darkfox.co": []
  });

  // --- SYSTEM STATES ---
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [newMissionText, setNewMissionText] = useState<{ [key: string]: string }>({});
  const [uptime, setUptime] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- IDENTITY DATA (SIGMA DAD) ---
  const currentUser = { 
    email: email || "admin@darkfox.co", 
    name: "TOBIAS", 
    role: "ADMIN", 
    job: "CEO & LEAD CODER" 
  };

  const agents = [
    { email: "denis@darkfox.co", name: "DENIS", role: "AGENT", mission: "Data Scraping", status: "ONLINE", load: "42%" },
    { email: "liam@darkfox.co", name: "LIAM", role: "AGENT", mission: "Proxy Routing", status: "ONLINE", load: "18%" },
    { email: "simon@darkfox.co", name: "SIMON", role: "AGENT", mission: "Deep Web Analysis", status: "OFFLINE", load: "0%" },
  ];

  // --- SYSTEM LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const addSystemLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  const handleLogin = () => {
    if (!email || !password) return;
    setIsConnecting(true);
    addSystemLog("AUTH_INIT: Attempting Secure Handshake...");
    setTimeout(() => {
      setIsLogged(true);
      setIsConnecting(false);
      addSystemLog("CONNECTION_ESTABLISHED: Welcome, Sigma Dad.");
    }, 1500);
  };

  // --- AI CORE REPAIR (v1 STABLE) ---
  const fetchAIResponse = async (prompt: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      addSystemLog("CRITICAL: API_KEY_MISSING");
      return "ERROR: Neural Link offline. Please check System Environment.";
    }

    try {
      // Nutze den stabilen v1 Endpoint um den "v1beta not found" Fehler zu umgehen
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, topK: 1, topP: 1, maxOutputTokens: 2048 }
        })
      });

      const data = await response.json();
      
      if (data.error) {
        addSystemLog(`AI_REJECTION: ${data.error.code}`);
        return `SYSTEM_ERROR: ${data.error.message}`;
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      addSystemLog("NETWORK_TIMEOUT: AI Core unreachable.");
      return "CRITICAL_FAILURE: Neural Link connection timed out.";
    }
  };

  // --- TRANSMISSION LOGIC ---
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const currentRoomID = chatRoom;
    const rawInput = inputMsg;
    setInputMsg("");
    setShowCommands(false);

    const userMessage = {
      id: Date.now().toString(),
      text: rawInput,
      sender: currentUser.name,
      senderEmail: currentUser.email,
      role: currentUser.role,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAllMessages(prev => ({
      ...prev,
      [currentRoomID]: [...(prev[currentRoomID] || []), userMessage]
    }));

    // AI Core Processing
    if (currentRoomID === "DarkFox_AI" || rawInput.startsWith("/ai ")) {
      setIsAITyping(true);
      addSystemLog("AI_REQUEST: Processing Neural Pulse...");
      
      const cleanPrompt = rawInput.startsWith("/ai ") ? rawInput.replace("/ai ", "") : rawInput;
      const aiResponseText = await fetchAIResponse(cleanPrompt);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: "DARKFOX_AI",
        senderEmail: "ai@darkfox.co",
        role: "AI_CORE",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAllMessages(prev => ({
        ...prev,
        [currentRoomID]: [...(prev[currentRoomID] || []), aiMessage]
      }));
      setIsAITyping(false);
      addSystemLog("AI_RESPONSE: Data stream complete.");
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, isAITyping, chatRoom]);

  // --- RENDER UI ---
  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 flex items-center justify-center font-mono p-4 overflow-hidden relative selection:bg-orange-600/40">
      
      {/* Visual background layers for that "Lead Coder" look */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#ea580c05,transparent_70%)]" />
         <div className="absolute top-[20%] left-[10%] w-[1px] h-[60%] bg-gradient-to-b from-transparent via-orange-600/20 to-transparent" />
         <div className="absolute top-[20%] right-[10%] w-[1px] h-[60%] bg-gradient-to-b from-transparent via-emerald-600/20 to-transparent" />
      </div>

      {!isLogged ? (
        <div className="border border-orange-600/30 p-16 rounded-[4rem] bg-black/60 backdrop-blur-3xl w-full max-w-md shadow-[0_0_100px_rgba(234,88,12,0.1)] relative z-10 animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-12">
            <div className="inline-block mb-6 p-5 bg-orange-600/10 rounded-full">
              <Shield size={48} className="text-orange-600" />
            </div>
            <h1 className="text-7xl font-black italic text-orange-600 tracking-tighter uppercase leading-none">DarkFox</h1>
            <p className="text-[10px] text-zinc-600 mt-4 tracking-[0.6em] font-black uppercase">Core_System_v5.3</p>
          </div>
          <div className="space-y-5">
            <div className="group">
              <input type="email" placeholder="OPERATOR_ID" className="w-full p-6 bg-zinc-900/40 border border-zinc-800 group-hover:border-zinc-700 rounded-3xl outline-none focus:border-orange-600/50 text-sm font-bold uppercase transition-all" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="group">
              <input type="password" placeholder="SECURITY_CYPHER" className="w-full p-6 bg-zinc-900/40 border border-zinc-800 group-hover:border-zinc-700 rounded-3xl outline-none focus:border-orange-600/50 text-sm transition-all" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            </div>
            <button onClick={handleLogin} disabled={isConnecting} className="w-full bg-orange-600 p-6 rounded-3xl font-black italic uppercase text-black hover:bg-orange-500 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
              {isConnecting ? "AUTHORIZING..." : <><Zap size={18} /> ESTABLISH_LINK</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[1750px] h-[96vh] grid grid-cols-12 gap-6 relative z-10">
          
          {/* COLUMN 1: NAVIGATION & NETWORKS */}
          <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-[3rem] p-8 flex-1 flex flex-col overflow-hidden backdrop-blur-xl">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-orange-600 text-[11px] font-black tracking-[0.3em] uppercase flex items-center gap-3">
                  <Terminal size={14} /> System_Nodes
                </h3>
                <span className="text-[9px] text-zinc-700 font-bold px-2 py-1 bg-zinc-800/40 rounded-lg">v5.3-STABLE</span>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                <button onClick={() => setChatRoom("Global")} className={`w-full p-5 rounded-3xl text-left border transition-all flex items-center justify-between group ${chatRoom === "Global" ? 'bg-orange-600 text-black border-orange-600 shadow-lg shadow-orange-600/20' : 'bg-black/40 border-zinc-800 hover:border-zinc-700'}`}>
                  <div className="flex items-center gap-4">
                    <Globe size={18} />
                    <div>
                      <p className="font-black text-xs italic uppercase">Global_Net</p>
                      <p className={`text-[8px] font-bold ${chatRoom === "Global" ? 'text-black/60' : 'text-zinc-600'}`}>Broadband Broadcast</p>
                    </div>
                  </div>
                </button>

                <button onClick={() => setChatRoom("DarkFox_AI")} className={`w-full p-5 rounded-3xl text-left border transition-all flex items-center justify-between relative overflow-hidden group ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600 text-black border-emerald-600 shadow-lg shadow-emerald-600/20' : 'bg-black/40 border-zinc-800 hover:border-emerald-900/30'}`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <Bot size={18} />
                    <div>
                      <p className="font-black text-xs italic uppercase">DarkFox_AI</p>
                      <p className={`text-[8px] font-bold ${chatRoom === "DarkFox_AI" ? 'text-black/60' : 'text-zinc-600'}`}>Neural Interface</p>
                    </div>
                  </div>
                  <Cpu size={40} className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${chatRoom === "DarkFox_AI" ? 'text-black' : 'text-emerald-500'}`} />
                </button>

                <div className="py-6 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-zinc-800/40" />
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Active_Agents</span>
                  <div className="h-[1px] flex-1 bg-zinc-800/40" />
                </div>

                {agents.map((agent, i) => (
                  <button key={i} onClick={() => setChatRoom(agent.email)} className={`w-full p-5 rounded-3xl text-left border transition-all flex items-center justify-between group ${chatRoom === agent.email ? 'bg-white text-black border-white shadow-lg' : 'bg-black/40 border-zinc-800 hover:border-zinc-600'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${chatRoom === agent.email ? 'bg-black/10' : 'bg-zinc-900'}`}>
                        <User size={16} className={agent.status === 'ONLINE' ? 'text-emerald-500' : 'text-zinc-700'} />
                      </div>
                      <div>
                        <p className="font-black text-xs italic uppercase">{agent.name}</p>
                        <p className={`text-[8px] font-bold ${chatRoom === agent.email ? 'text-black/60' : 'text-zinc-600'}`}>{agent.status}</p>
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* KERNEL BUFFER */}
            <div className="bg-black border border-zinc-800/60 rounded-[3rem] p-8 h-60 flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-zinc-500 font-black uppercase text-[10px]">
                  <Activity size={14} className="text-orange-600" /> Kernel_Logs
                </div>
                <div className="flex gap-1">
                   <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[10px] text-zinc-600 custom-scrollbar">
                {systemLogs.length === 0 && <div className="italic opacity-30">Waiting for system events...</div>}
                {systemLogs.map((log, i) => (
                  <div key={i} className="leading-tight break-all border-l border-zinc-900 pl-3">
                    <span className="text-orange-900/60 mr-2">HEX_{i.toString(16).toUpperCase()}</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: COMMAND TERMINAL (CENTER) */}
          <div className="col-span-6 bg-zinc-900/5 border border-zinc-800/40 rounded-[4rem] flex flex-col overflow-hidden relative backdrop-blur-3xl shadow-2xl">
            <header className="p-10 border-b border-zinc-800/40 flex justify-between items-center bg-black/30">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-3xl shadow-inner ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600/10 text-emerald-500 shadow-emerald-500/5' : 'bg-orange-600/10 text-orange-600 shadow-orange-600/5'}`}>
                  {chatRoom === "Global" ? <Globe size={30} /> : chatRoom === "DarkFox_AI" ? <Layers size={30} /> : <MessageSquare size={30} />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                      {chatRoom === "Global" ? "Broadband_Sync" : chatRoom === "DarkFox_AI" ? "Neural_Matrix" : "Private_Tunnel"}
                    </h2>
                    <div className="px-2 py-0.5 rounded-md bg-zinc-800/50 text-[8px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-700">Level_4_Enc</div>
                  </div>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                    <Database size={10} /> Active_Room_Hash: {chatRoom.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => { addSystemLog("PURGING_ROOM_BUFFER..."); setAllMessages(p => ({...p, [chatRoom]: []}))}} className="p-4 bg-zinc-900/50 border border-zinc-800 text-zinc-600 rounded-2xl hover:text-orange-500 hover:border-orange-900/40 transition-all">
                  <Trash2 size={20} />
                </button>
                <button onClick={() => setIsLogged(false)} className="p-4 bg-zinc-900/50 border border-zinc-800 text-zinc-500 rounded-2xl hover:text-rose-500 hover:border-rose-900/40 transition-all">
                  <Power size={20} />
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar scroll-smooth">
              {(allMessages[chatRoom] || []).length === 0 && !isAITyping && (
                <div className="h-full flex flex-col items-center justify-center grayscale opacity-10">
                   <Terminal size={120} className="mb-6" />
                   <p className="text-sm font-black uppercase tracking-[0.5em]">Establishing_Data_Bridge...</p>
                </div>
              )}

              {(allMessages[chatRoom] || []).map((msg) => (
                <div key={msg.id} className={`flex flex-col group ${msg.senderEmail === currentUser.email ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-4 mb-3 ${msg.senderEmail === currentUser.email ? 'flex-row-reverse' : ''}`}>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${msg.role === 'ADMIN' ? 'text-orange-600' : msg.role === 'AI_CORE' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[8px] text-zinc-800 font-bold px-2 py-1 bg-zinc-900/50 rounded-lg">{msg.timestamp}</span>
                  </div>
                  <div className={`p-7 rounded-[2.8rem] text-[15px] leading-relaxed max-w-[85%] shadow-xl transition-all hover:scale-[1.01] ${
                    msg.senderEmail === currentUser.email ? 'bg-orange-600 text-black font-bold rounded-tr-none' : 
                    msg.role === 'AI_CORE' ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-50 rounded-tl-none backdrop-blur-md' :
                    'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isAITyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-3 mb-3">
                    <Bot size={14} /> Neural_Sync
                  </span>
                  <div className="p-7 rounded-[2.8rem] bg-emerald-900/5 border border-emerald-500/20 text-emerald-500/40 rounded-tl-none italic text-sm">
                    Reconstructing Neural Packets...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-10 bg-black/40 border-t border-zinc-800/40 backdrop-blur-3xl">
              <form onSubmit={sendMessage} className="flex gap-4 relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-600 opacity-40">
                  <Terminal size={20} />
                </div>
                <input 
                  value={inputMsg} 
                  onChange={(e) => { setInputMsg(e.target.value); setShowCommands(e.target.value === '/'); }}
                  placeholder={`TRANSMIT_TO_${chatRoom.split('@')[0].toUpperCase()}...`} 
                  className="flex-1 bg-zinc-900/50 border border-zinc-800 p-6 pl-16 rounded-3xl outline-none focus:border-orange-600/40 text-sm font-medium transition-all placeholder:text-zinc-800"
                />
                <button type="submit" disabled={isAITyping} className={`p-6 px-14 rounded-3xl text-black font-black uppercase italic shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-orange-600 hover:bg-orange-500'}`}>
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>

          {/* COLUMN 3: OPS & MISSION CONTROL (RIGHT) */}
          <div className="col-span-3 space-y-6 flex flex-col h-full overflow-hidden">
            {/* OPERATOR CARD */}
            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-[3rem] p-10 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Shield size={120} />
              </div>
              <div className="flex items-center gap-4 text-orange-600 mb-8 font-black uppercase text-[11px] tracking-widest">
                <User size={18}/> Operator_Intel
              </div>
              <p className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-3">{currentUser.name}</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-10">Access: Root_Admin_Sigma</p>
              
              <div className="space-y-6 pt-10 border-t border-zinc-800/40">
                <div className="flex justify-between items-end">
                  <p className="text-[9px] text-zinc-700 uppercase font-black">Role</p>
                  <p className="text-xs font-black text-orange-600 uppercase italic">{currentUser.job}</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[9px] text-zinc-700 uppercase font-black">Link_Uptime</p>
                  <p className="text-xs font-black text-emerald-500 uppercase italic">{Math.floor(uptime/60)}m {uptime%60}s</p>
                </div>
              </div>
            </div>

            {/* MISSION CONTROL */}
            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-[3rem] p-10 flex-1 flex flex-col overflow-hidden shadow-xl">
              <h3 className="text-rose-600 text-[11px] font-black uppercase tracking-widest mb-8 flex items-center gap-4">
                <Crosshair size={18}/> Active_Ops
              </h3>
              <div className="space-y-5 overflow-y-auto pr-3 custom-scrollbar">
                {agents.map((agent, i) => (
                  <div key={i} className="p-6 bg-black/40 rounded-[2.5rem] border border-zinc-800/40 hover:border-orange-600/20 transition-all group">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[12px] font-black italic uppercase text-white">{agent.name}</p>
                      <span className="text-[9px] font-black text-zinc-700">{agent.load} LOAD</span>
                    </div>
                    <div className="bg-orange-600/5 border-l-2 border-orange-600 p-3 mb-5">
                      <p className="text-[10px] text-orange-500 italic font-medium tracking-tight">“{agent.mission}”</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input 
                        value={newMissionText[agent.email] || ""} 
                        onChange={(e) => setNewMissionText(prev => ({ ...prev, [agent.email]: e.target.value }))}
                        placeholder="ASSIGN..." 
                        className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-2xl text-[10px] outline-none" 
                      />
                      <button onClick={() => { addSystemLog(`PUSH_TASK_UPDATE -> ${agent.name}`); setNewMissionText(p => ({...p, [agent.email]: ""}))}} className="bg-zinc-800 p-3 px-4 rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-black">Push</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SYSTEM ACTIONS & UPDATE LOG */}
            <div className="space-y-4">
               <a 
                 href="https://github.com/DarkFox-Co/DarkFox-Terminal/blob/main/update-log.txt" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-full bg-zinc-900/50 border border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between hover:border-orange-600/50 transition-all group"
               >
                 <div className="flex items-center gap-4 text-zinc-400 group-hover:text-orange-500 transition-colors">
                    <FileText size={20} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Open_Update_Log</span>
                 </div>
                 <ExternalLink size={16} className="text-zinc-700 group-hover:text-orange-600" />
               </a>

               <div className="bg-orange-600 rounded-[2.5rem] p-10 text-black text-center shadow-[0_0_50px_rgba(234,88,12,0.15)] relative overflow-hidden">
                  <Github size={60} className="absolute -left-4 -bottom-4 opacity-10" />
                  <p className="text-[10px] uppercase font-black tracking-[0.4em] mb-2 opacity-60 italic">Property of</p>
                  <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">DarkFox Co.</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM STYLES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        
        body { font-family: 'JetBrains Mono', monospace; background-color: #020202; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea580c; }
        
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </div>
  );
}
