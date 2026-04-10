"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, Hash, Bot, Activity, Globe, MessageSquare, 
  Power, Trash2, User, Crosshair, Terminal, Zap, 
  Cpu, Lock, Send, ChevronRight, AlertCircle, 
  FileText, ExternalLink, Github, Database, Layers,
  Radio, HardDrive, Wifi, Code, CpuIcon, Binary, 
  Settings, RefreshCcw, Eye, EyeOff, BarChart3
} from 'lucide-react';

// --- DARKFOX CORE V5.6 (OVERLOAD EDITION) ---
// DESIGNED FOR DARKFOX CO. 2026
// LEAD CODER: TOBIAS (SIGMA DAD)
// INTEGRITY: LEVEL 9 CLEARANCE

export default function Page() {
  // --- SESSION & AUTHENTICATION ---
  const [isLogged, setIsLogged] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  // --- ADVANCED OMNI-CHANNEL STORAGE ---
  const [chatRoom, setChatRoom] = useState("Global");
  const [allMessages, setAllMessages] = useState<{ [key: string]: any[] }>({
    "Global": [],
    "DarkFox_AI": [],
    "denis@darkfox.co": [],
    "liam@darkfox.co": [],
    "simon@darkfox.co": []
  });

  // --- ANALYTICS & SYSTEM STATES ---
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [newMissionText, setNewMissionText] = useState<{ [key: string]: string }>({});
  const [uptime, setUptime] = useState(0);
  const [ramUsage, setRamUsage] = useState(45);
  const [cpuTemp, setCpuTemp] = useState(42);
  const [netSpeed, setNetSpeed] = useState(940);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- CORE IDENTITY ---
  const currentUser = { 
    email: email || "admin@darkfox.co", 
    name: "TOBIAS", 
    role: "ADMIN", 
    job: "CEO & LEAD CODER" 
  };

  const agents = [
    { email: "denis@darkfox.co", name: "DENIS", role: "AGENT", mission: "Neural Bypass", status: "ONLINE", activity: "High", load: "62%" },
    { email: "liam@darkfox.co", name: "LIAM", role: "AGENT", mission: "Asset Cryptography", status: "ONLINE", activity: "Idle", load: "14%" },
    { email: "simon@darkfox.co", name: "SIMON", role: "AGENT", mission: "SQL Injection", status: "OFFLINE", activity: "None", load: "0%" },
  ];

  // --- SYSTEM KERNEL LOOP ---
  useEffect(() => {
    const timer = setInterval(() => {
      setUptime(prev => prev + 1);
      // Simuliere schwankende System-Werte
      setRamUsage(prev => Math.min(95, Math.max(30, prev + (Math.random() * 4 - 2))));
      setCpuTemp(prev => Math.min(80, Math.max(35, prev + (Math.random() * 2 - 1))));
      if (Math.random() > 0.7) setNetSpeed(Math.floor(Math.random() * 150) + 800);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addSystemLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 60));
  };

  const handleLogin = () => {
    if (!email || !password) return;
    setIsConnecting(true);
    addSystemLog("AUTH_SERVICE: Requesting encrypted handshake...");
    setTimeout(() => {
      setIsLogged(true);
      setIsConnecting(false);
      addSystemLog("TERMINAL_READY: Sigma Dad authorized.");
    }, 1800);
  };

  // --- AI ENGINE (v1beta STABLE) ---
  const fetchAIResponse = async (prompt: string) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      addSystemLog("CRITICAL_ERR: API_KEY_MISSING");
      return "ERROR: AI Core offline. Missing Credentials.";
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 2048 }
        })
      });

      const data = await response.json();
      if (data.error) {
        addSystemLog(`API_FAIL: ${data.error.message}`);
        return `SYSTEM_ERROR: ${data.error.message}`;
      }
      return data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      addSystemLog("NETWORK_FAULT: Transmission interrupted.");
      return "FATAL_ERROR: Connection to Neural Link lost.";
    }
  };

  // --- TRANSMISSION SERVICE ---
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const currentRoomID = chatRoom;
    const msgText = inputMsg;
    setInputMsg("");

    const userMessage = {
      id: Date.now().toString(),
      text: msgText,
      sender: currentUser.name,
      senderEmail: currentUser.email,
      role: currentUser.role,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAllMessages(prev => ({
      ...prev,
      [currentRoomID]: [...(prev[currentRoomID] || []), userMessage]
    }));

    if (currentRoomID === "DarkFox_AI" || msgText.startsWith("/ai ")) {
      setIsAITyping(true);
      addSystemLog(`AI_SYNC: Executing neural query for ${currentUser.name}`);
      const cleanPrompt = msgText.startsWith("/ai ") ? msgText.replace("/ai ", "") : msgText;
      const aiResult = await fetchAIResponse(cleanPrompt);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResult,
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
      addSystemLog("BUFFER_UPDATE: AI stream synchronized.");
    } else {
      addSystemLog(`PACKET_SENT: Room ${currentRoomID}`);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, isAITyping, chatRoom]);

  // --- UI COMPONENTS ---
  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 flex items-center justify-center font-mono p-4 overflow-hidden relative selection:bg-orange-600/30">
      
      {/* MATRIX STYLE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/50 to-transparent animate-pulse" />

      {!isLogged ? (
        <div className="border border-orange-600/20 p-20 rounded-[5rem] bg-black/40 backdrop-blur-3xl w-full max-w-lg shadow-[0_0_100px_rgba(234,88,12,0.05)] relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-12">
            <div className="bg-orange-600/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-orange-600/20">
              <Shield className="text-orange-600" size={48} />
            </div>
            <h1 className="text-7xl font-black italic text-orange-600 tracking-tighter uppercase leading-none">DarkFox</h1>
            <p className="text-[10px] text-zinc-700 mt-5 tracking-[0.8em] font-black uppercase italic">Overload_System_v5.6</p>
          </div>
          
          <div className="space-y-6">
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-800" size={18} />
              <input type="email" placeholder="OPERATOR_ID" className="w-full p-6 pl-14 bg-zinc-950/50 border border-zinc-900 rounded-3xl outline-none focus:border-orange-600/40 text-sm font-bold uppercase transition-all" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-800" size={18} />
              <input type={showPass ? "text" : "password"} placeholder="SECURITY_CYPHER" className="w-full p-6 pl-14 bg-zinc-950/50 border border-zinc-900 rounded-3xl outline-none focus:border-orange-600/40 text-sm transition-all" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-orange-600 transition-colors">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button onClick={handleLogin} disabled={isConnecting} className="w-full bg-orange-600 p-6 rounded-3xl font-black italic uppercase text-black hover:bg-orange-500 transition-all shadow-xl flex items-center justify-center gap-4 group">
              {isConnecting ? "AUTHORIZING..." : <><Zap size={20} className="group-hover:scale-125 transition-transform" /> START_SESSION</>}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[1850px] h-[97vh] grid grid-cols-12 gap-6 relative z-10">
          
          {/* NAVIGATION COLUMN */}
          <div className="col-span-3 flex flex-col gap-6 overflow-hidden h-full">
            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-[3.5rem] p-8 flex-1 flex flex-col overflow-hidden backdrop-blur-2xl">
              <div className="flex justify-between items-center mb-10 px-2">
                <h3 className="text-orange-600 text-[11px] font-black tracking-[0.4em] uppercase flex items-center gap-3">
                  <Binary size={16} /> Nodes
                </h3>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-900" />
                </div>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                <button onClick={() => setChatRoom("Global")} className={`w-full p-6 rounded-[2.5rem] text-left border transition-all flex items-center justify-between group ${chatRoom === "Global" ? 'bg-orange-600 text-black border-orange-600 shadow-xl shadow-orange-600/10' : 'bg-black/40 border-zinc-900 hover:border-zinc-700'}`}>
                  <div className="flex items-center gap-4">
                    <Globe size={20} />
                    <div>
                      <p className="font-black text-xs italic uppercase">Global_Sync</p>
                      <p className={`text-[8px] font-bold ${chatRoom === "Global" ? 'text-black/50' : 'text-zinc-700'}`}>Broadcast Channel</p>
                    </div>
                  </div>
                </button>

                <button onClick={() => setChatRoom("DarkFox_AI")} className={`w-full p-6 rounded-[2.5rem] text-left border transition-all flex items-center justify-between group relative overflow-hidden ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600 text-black border-emerald-600' : 'bg-black/40 border-zinc-900 hover:border-emerald-900/40'}`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <Bot size={20} />
                    <span className="font-black text-xs italic uppercase">Neural_Core</span>
                  </div>
                  <Cpu size={40} className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform" />
                </button>

                <div className="py-8 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                  <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">Crew_Secure</span>
                  <div className="h-[1px] flex-1 bg-zinc-900" />
                </div>

                {agents.map((agent, i) => (
                  <button key={i} onClick={() => setChatRoom(agent.email)} className={`w-full p-5 rounded-[2.2rem] text-left border transition-all flex items-center justify-between group ${chatRoom === agent.email ? 'bg-zinc-100 text-black border-white shadow-xl' : 'bg-black/40 border-zinc-900 hover:border-zinc-700'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${chatRoom === agent.email ? 'bg-black/5' : 'bg-zinc-950'}`}>
                        <User size={18} className={agent.status === 'ONLINE' ? 'text-emerald-500' : 'text-zinc-800'} />
                      </div>
                      <span className="font-black text-xs italic uppercase tracking-tighter">{agent.name}</span>
                    </div>
                    {agent.status === 'ONLINE' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>

            {/* SYSTEM ANALYTICS WINDOW */}
            <div className="bg-black border border-zinc-800/60 rounded-[3.5rem] p-10 h-72 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-zinc-600 font-black uppercase text-[10px]">
                  <Activity size={14} className="text-orange-600" /> Kernel_Buffer
                </div>
                <RefreshCcw size={12} className="text-zinc-800 animate-spin-slow" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[9px] text-zinc-700 custom-scrollbar">
                {systemLogs.map((log, i) => (
                  <div key={i} className="flex gap-3 border-l border-zinc-900 pl-3">
                    <span className="text-orange-950/50">#{i}</span>
                    <span className="text-zinc-500">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER TERMINAL */}
          <div className="col-span-6 bg-zinc-900/5 border border-zinc-800/40 rounded-[4.5rem] flex flex-col overflow-hidden relative backdrop-blur-3xl shadow-2xl">
            <header className="p-12 border-b border-zinc-800/40 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-8">
                <div className={`p-6 rounded-[2.5rem] shadow-2xl ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600/10 text-emerald-500 shadow-emerald-500/5' : 'bg-orange-600/10 text-orange-600 shadow-orange-600/5'}`}>
                  {chatRoom === "Global" ? <Globe size={32} /> : chatRoom === "DarkFox_AI" ? <Layers size={32} /> : <MessageSquare size={32} />}
                </div>
                <div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">
                      {chatRoom.split('@')[0].toUpperCase()}
                    </h2>
                    <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[8px] font-black text-zinc-500 uppercase tracking-widest animate-pulse">Live_Connection</span>
                  </div>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                    <Database size={12} /> Buffer_ID: {chatRoom.length > 15 ? chatRoom.substring(0, 15) + '...' : chatRoom}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setAllMessages(p => ({...p, [chatRoom]: []}))} className="p-5 bg-zinc-950 border border-zinc-900 text-zinc-700 rounded-3xl hover:text-orange-500 transition-all">
                  <Trash2 size={22} />
                </button>
                <button onClick={() => setIsLogged(false)} className="p-5 bg-zinc-950 border border-zinc-900 text-zinc-700 rounded-3xl hover:text-rose-500 transition-all">
                  <Power size={22} />
                </button>
              </div>
            </header>
            
            {/* CHAT AREA */}
            <div className="flex-1 overflow-y-auto p-14 space-y-12 custom-scrollbar">
              {(allMessages[chatRoom] || []).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-[0.03] grayscale">
                   <Terminal size={150} />
                   <h4 className="text-2xl font-black mt-8 uppercase tracking-[1em]">Establishing_Link</h4>
                </div>
              )}

              {(allMessages[chatRoom] || []).map((msg) => (
                <div key={msg.id} className={`flex flex-col group ${msg.senderEmail === currentUser.email ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-center gap-4 mb-4 ${msg.senderEmail === currentUser.email ? 'flex-row-reverse' : ''}`}>
                    <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${msg.role === 'ADMIN' ? 'bg-orange-600/10 text-orange-600' : msg.role === 'AI_CORE' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-zinc-900 text-zinc-600'}`}>
                      {msg.sender}
                    </div>
                    <span className="text-[9px] text-zinc-800 font-bold">{msg.timestamp}</span>
                  </div>
                  <div className={`p-8 rounded-[3.5rem] text-[16px] leading-relaxed max-w-[85%] shadow-2xl transition-all hover:scale-[1.01] ${
                    msg.senderEmail === currentUser.email ? 'bg-orange-600 text-black font-bold rounded-tr-none shadow-orange-600/10' : 
                    msg.role === 'AI_CORE' ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-50 rounded-tl-none backdrop-blur-md' :
                    'bg-zinc-900 border border-zinc-800/60 text-zinc-300 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isAITyping && (
                <div className="flex flex-col items-start animate-pulse">
                  <div className="flex items-center gap-4 mb-4">
                    <Bot size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Neural_Compute</span>
                  </div>
                  <div className="p-8 rounded-[3.5rem] bg-emerald-900/5 border border-emerald-500/10 text-emerald-500/30 rounded-tl-none italic text-sm">
                    Re-Routing Data Streams through encrypted node...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="p-12 bg-black/40 border-t border-zinc-800/40 backdrop-blur-3xl">
              <form onSubmit={sendMessage} className="flex gap-6 relative">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-orange-600/30">
                  <Code size={24} />
                </div>
                <input 
                  value={inputMsg} 
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder={`EXECUTE_TRANSMISSION_TO_${chatRoom.toUpperCase()}...`} 
                  className="flex-1 bg-zinc-950/50 border border-zinc-800 p-7 pl-20 rounded-[2.5rem] outline-none focus:border-orange-600/40 text-sm font-medium transition-all placeholder:text-zinc-900"
                />
                <button type="submit" disabled={isAITyping} className={`p-7 px-16 rounded-[2.5rem] text-black font-black uppercase italic shadow-2xl transition-all active:scale-95 disabled:opacity-20 ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/10'}`}>
                  <Send size={24} />
                </button>
              </form>
            </div>
          </div>

          {/* INTEL PANEL (RIGHT) */}
          <div className="col-span-3 space-y-6 flex flex-col h-full overflow-hidden">
            
            {/* OPERATOR STATS */}
            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.1] transition-all">
                <Shield size={140} />
              </div>
              <div className="flex items-center gap-4 text-orange-600 mb-10 font-black uppercase text-[11px] tracking-widest">
                <User size={20}/> Admin_Profile
              </div>
              <p className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none mb-4">{currentUser.name}</p>
              <p className="text-[11px] text-zinc-700 font-bold uppercase tracking-[0.4em] mb-12">Authorized_Sigma_Dad</p>
              
              <div className="space-y-6 pt-10 border-t border-zinc-800/40">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-800 font-black uppercase">Role_Clearance</span>
                  <span className="text-xs font-black text-orange-600 uppercase italic">Lead_Coder</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-800 font-black uppercase">Net_Speed</span>
                  <span className="text-xs font-black text-emerald-500">{netSpeed} MB/S</span>
                </div>
                <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-orange-600 h-full transition-all duration-1000" style={{ width: `${ramUsage}%` }} />
                </div>
              </div>
            </div>

            {/* LIVE OPS MONITOR */}
            <div className="bg-zinc-900/10 border border-zinc-800/40 rounded-[3.5rem] p-10 flex-1 flex flex-col overflow-hidden shadow-2xl">
              <h3 className="text-rose-600 text-[11px] font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                <Crosshair size={20}/> Active_Ops
              </h3>
              <div className="space-y-6 overflow-y-auto pr-3 custom-scrollbar">
                {agents.map((agent, i) => (
                  <div key={i} className="p-8 bg-black/60 rounded-[3rem] border border-zinc-900 hover:border-orange-600/30 transition-all group">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-[14px] font-black italic uppercase text-white tracking-tighter">{agent.name}</p>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] font-black text-zinc-800">{agent.load}</span>
                         <div className={`w-2 h-2 rounded-full ${agent.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-900'}`} />
                      </div>
                    </div>
                    <div className="bg-orange-600/5 border-l-4 border-orange-600 p-4 mb-6">
                      <p className="text-[11px] text-orange-500 italic font-bold">» {agent.mission}</p>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <input 
                        value={newMissionText[agent.email] || ""} 
                        onChange={(e) => setNewMissionText(prev => ({ ...prev, [agent.email]: e.target.value }))}
                        placeholder="RE-ASSIGN..." 
                        className="flex-1 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-[10px] outline-none" 
                      />
                      <button onClick={() => { addSystemLog(`PUSH_CMD -> ${agent.name}`); setNewMissionText(p => ({...p, [agent.email]: ""}))}} className="bg-zinc-900 p-4 px-6 rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-black transition-colors">PUSH</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="space-y-5">
              <a 
                href="https://github.com/DarkFox-Co/DarkFox-Terminal/blob/main/update-log.txt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full bg-zinc-950 border border-zinc-800 p-8 rounded-[3rem] flex items-center justify-between hover:border-orange-600/40 transition-all group"
              >
                <div className="flex items-center gap-5 text-zinc-500 group-hover:text-orange-500">
                  <FileText size={24} />
                  <span className="text-[12px] font-black uppercase tracking-[0.2em] italic">Access_Update_Log</span>
                </div>
                <ExternalLink size={18} className="text-zinc-800 group-hover:text-orange-600" />
              </a>

              <div className="bg-orange-600 rounded-[3.5rem] p-12 text-black text-center shadow-[0_0_60px_rgba(234,88,12,0.1)] relative overflow-hidden group">
                 <Github size={80} className="absolute -left-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform" />
                 <p className="text-[10px] uppercase font-black tracking-[0.5em] mb-3 opacity-40 italic">Unauthorized access is prohibited</p>
                 <p className="text-4xl font-black italic uppercase tracking-tighter leading-none">DarkFox Co.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM SYSTEM STYLES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        body { font-family: 'JetBrains Mono', monospace; background-color: #020202; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea580c; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
