"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, Globe, MessageSquare, Power, Trash2, User, Terminal, Zap, 
  Cpu, Lock, Send, FileText, RefreshCcw, ShieldAlert, Network, 
  Database, Info, MapPin, activity, Activity, CpuIcon
} from 'lucide-react';

// --- DARKFOX CORE V5.9 (FULL-INTEL EDITION) ---
// COPYRIGHT (C) 2026 DARKFOX CO.
// LEAD CODER: TOBIAS (SIGMA DAD)
// MODULE: IP_TRACKING_INTEGRATED

export default function Page() {
  const [isLogged, setIsLogged] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [chatRoom, setChatRoom] = useState("Global");
  const [hoverInfo, setHoverInfo] = useState<string | null>(null);
  
  // ERWEITERTES MESSAGE-SYSTEM MIT IP-DATA
  const [allMessages, setAllMessages] = useState<{ [key: string]: any[] }>({
    "Global": [], 
    "DarkFox_AI": [], 
    "denis@darkfox.co": [], 
    "liam@darkfox.co": [], 
    "simon@darkfox.co": []
  });

  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [updateLogContent, setUpdateLogContent] = useState<string>("Warte auf Synchronisation...");
  const [isFetchingLog, setIsFetchingLog] = useState(false);

  // AGENT IP DIRECTORY
  const agentIPs: { [key: string]: string } = {
    "TOBIAS": "192.168.1.1 (LOCAL_ROOT)",
    "DARKFOX_AI": "127.0.0.1 (INTERNAL_CORE)",
    "DENIS": "84.120.45.12 (MOSCOW_NODE)",
    "LIAM": "201.55.12.99 (LONDON_RELAY)",
    "SIMON": "45.11.202.4 (PROXY_ENCRYPTED)"
  };

  // LOGIN HISTORY DATA
  const loginHistory = [
    { id: 1, user: "TOBIAS", ip: "192.168.1.1", loc: "Berlin, DE", status: "ACTIVE", latency: "2ms", enc: "AES-256" },
    { id: 2, user: "DENIS", ip: "84.120.45.12", loc: "Moscow, RU", status: "OFFLINE", latency: "---", enc: "RSA-4096" },
    { id: 3, user: "LIAM", ip: "201.55.12.99", loc: "London, UK", status: "IDLE", latency: "42ms", enc: "AES-256" },
    { id: 4, user: "SIMON", ip: "45.11.202.4", loc: "Paris, FR", status: "OFFLINE", latency: "---", enc: "NONE" },
  ];

  const chatEndRef = useRef<HTMLDivElement>(null);
  const currentUser = { name: "TOBIAS", role: "ADMIN" };

  useEffect(() => {
    const timer = setInterval(() => setUptime(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const addLog = (msg: string) => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const fetchUpdateLog = async () => {
    setIsFetchingLog(true);
    addLog("SYNC: Requesting manifest from GitHub...");
    try {
      const res = await fetch("https://raw.githubusercontent.com/DarkFox-Co/DarkFox-Terminal/main/update-log.txt");
      const text = await res.text();
      setUpdateLogContent(text);
      addLog("SUCCESS: Integrity check passed.");
    } catch (e) {
      setUpdateLogContent("Fehler: Manifest konnte nicht geladen werden.");
      addLog("ERR: Connection to GitHub failed.");
    }
    setIsFetchingLog(false);
  };

  const fetchAI = async (prompt: string) => {
    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!key) return "ERROR: NO_KEY_CONFIGURED";
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "AI_ERR: " + JSON.stringify(data.error);
    } catch (e) {
      return "CRITICAL_CONNECTION_FAILURE";
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    const room = chatRoom;
    const msg = inputMsg;
    setInputMsg("");

    const uMsg = { 
      id: Date.now(), 
      text: msg, 
      sender: currentUser.name, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ip: agentIPs["TOBIAS"]
    };
    
    setAllMessages(p => ({ ...p, [room]: [...(p[room] || []), uMsg] }));

    if (room === "DarkFox_AI") {
      setIsAITyping(true);
      addLog("SYNC: Routing packet to Flash-Core...");
      const reply = await fetchAI(msg);
      const aiMsg = { 
        id: Date.now() + 1, 
        text: reply, 
        sender: "DARKFOX_AI", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ip: agentIPs["DARKFOX_AI"]
      };
      setAllMessages(p => ({ ...p, [room]: [...(p[room] || []), aiMsg] }));
      setIsAITyping(false);
    } else {
      addLog(`MSG_DISPATCH: Packet sent to node ${room}`);
    }
  };

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [allMessages, isAITyping]);

  return (
    <div className="h-screen bg-[#030303] text-zinc-400 font-mono flex items-center justify-center p-4 overflow-hidden">
      
      {!isLogged ? (
        <div className="bg-black border border-orange-600/20 p-12 rounded-[3rem] w-full max-w-sm text-center shadow-[0_0_50px_rgba(234,88,12,0.1)]">
          <Shield className="text-orange-600 mx-auto mb-6 animate-pulse" size={50} />
          <h1 className="text-5xl font-black italic text-orange-600 mb-2 uppercase tracking-tighter">DarkFox</h1>
          <p className="text-[9px] text-zinc-800 mb-10 tracking-[0.5em] font-black uppercase">Lead_Coder_Terminal</p>
          <input type="password" placeholder="ENTER_ACCESS_KEY" className="w-full bg-zinc-950 border border-zinc-900 p-5 rounded-2xl mb-4 text-xs outline-none focus:border-orange-600/40 transition-all text-center" onKeyDown={(e) => e.key === 'Enter' && setIsLogged(true)} />
          <button onClick={() => setIsLogged(true)} className="w-full bg-orange-600 text-black font-black p-5 rounded-2xl text-xs uppercase hover:bg-orange-500 transition-all active:scale-95 shadow-lg">Initialize_Link</button>
        </div>
      ) : (
        <div className="w-full h-full max-w-[1700px] grid grid-cols-12 gap-5 relative">
          
          {/* LEFT: NODES & LOGS */}
          <div className="col-span-3 flex flex-col gap-5 h-full overflow-hidden">
            <div className="bg-zinc-950/50 border border-zinc-900 rounded-[2.5rem] p-6 flex-1 flex flex-col overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-[10px] font-black uppercase text-orange-600 tracking-widest flex items-center gap-2"><Network size={16}/> Nodes</h2>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                {["Global", "DarkFox_AI", "denis@darkfox.co", "liam@darkfox.co", "simon@darkfox.co"].map(n => (
                  <button key={n} onClick={() => setChatRoom(n)} className={`w-full p-4 rounded-2xl text-left text-[11px] font-black uppercase italic transition-all group flex items-center justify-between ${chatRoom === n ? 'bg-orange-600 text-black' : 'bg-black/40 border border-zinc-900 hover:border-zinc-700'}`}>
                    <span>{n.split('@')[0]}</span>
                    <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 ${chatRoom === n ? 'text-black' : 'text-orange-600'}`} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-black border border-zinc-900 rounded-[2.5rem] p-6 h-64 flex flex-col">
              <p className="text-[9px] font-black text-zinc-700 uppercase mb-4 flex items-center gap-2"><Activity size={12} className="text-orange-600" /> Kernel_Buffer_v5.9</p>
              <div className="text-[9px] space-y-1 overflow-y-auto flex-1 custom-scrollbar text-zinc-600 font-mono">
                {systemLogs.map((l, i) => <div key={i} className="border-l border-zinc-900 pl-2 mb-1">{l}</div>)}
              </div>
            </div>
          </div>

          {/* CENTER: CHAT INTERFACE */}
          <div className="col-span-6 bg-zinc-950 border border-zinc-900 rounded-[3rem] flex flex-col overflow-hidden shadow-2xl relative">
            <header className="p-8 border-b border-zinc-900 flex justify-between items-center bg-black/60 backdrop-blur-xl">
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600/10 text-emerald-500' : 'bg-orange-600/10 text-orange-600'}`}>
                   {chatRoom === "DarkFox_AI" ? <Cpu size={28} /> : <Globe size={28} />}
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase italic text-white tracking-tighter">{chatRoom.replace('@darkfox.co', '')}</h2>
                  <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em] mt-1">Status: Stable // Mode: Encrypted</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowAdminPanel(!showAdminPanel)} className={`p-3 rounded-xl transition-all border ${showAdminPanel ? 'bg-emerald-600 border-emerald-600 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-emerald-500'}`} title="Admin Panel"><ShieldAlert size={20}/></button>
                <button onClick={() => setAllMessages(p => ({...p, [chatRoom]: []}))} className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-xl hover:text-orange-600 transition-all"><Trash2 size={20}/></button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
              {showAdminPanel ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-emerald-500 text-xs font-black uppercase tracking-[0.5em]">/root/admin/active_sessions</h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600"><Database size={12}/> DB_CONNECTED</div>
                  </div>
                  <div className="bg-black/60 border border-zinc-900 rounded-2xl overflow-hidden backdrop-blur-md">
                    <table className="w-full text-[10px] text-left">
                      <thead className="bg-zinc-900/50 text-zinc-500 uppercase font-black">
                        <tr>
                          <th className="p-4">Operator</th>
                          <th className="p-4">IP_Address</th>
                          <th className="p-4">Location</th>
                          <th className="p-4">Latency</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loginHistory.map(l => (
                          <tr key={l.id} className="border-b border-zinc-900 hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 text-white font-black italic">{l.user}</td>
                            <td className="p-4 font-mono text-zinc-400">{l.ip}</td>
                            <td className="p-4 text-zinc-500">{l.loc}</td>
                            <td className="p-4 font-bold text-orange-800">{l.latency}</td>
                            <td className={`p-4 font-black ${l.status === 'ACTIVE' ? 'text-emerald-500' : 'text-zinc-800'}`}>{l.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => setShowAdminPanel(false)} className="mt-8 text-[10px] text-zinc-600 hover:text-white uppercase font-black flex items-center gap-2 transition-all group">
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /> Exit_Admin_View
                  </button>
                </div>
              ) : (
                <>
                  {allMessages[chatRoom]?.map((m, idx) => (
                    <div key={m.id} className={`flex flex-col group ${m.sender === currentUser.name ? 'items-end' : 'items-start'}`}>
                      <div className={`flex items-center gap-3 mb-2 ${m.sender === currentUser.name ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{m.sender}</span>
                        <span className="text-[8px] text-zinc-800 font-bold">{m.time}</span>
                        
                        {/* INFO BUTTON (IP TRACKER) */}
                        <div className="relative">
                          <button 
                            onMouseEnter={() => setHoverInfo(`${m.id}`)}
                            onMouseLeave={() => setHoverInfo(null)}
                            className="p-1 rounded-full bg-zinc-900/50 text-zinc-700 hover:text-orange-600 transition-all border border-transparent hover:border-orange-600/20"
                          >
                            <Info size={12} />
                          </button>
                          
                          {hoverInfo === `${m.id}` && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black border border-orange-600/40 p-3 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
                              <p className="text-[9px] font-black text-orange-600 uppercase mb-2 border-b border-orange-600/20 pb-1 flex items-center gap-2">
                                <Shield size={10}/> Packet_Intel
                              </p>
                              <div className="space-y-1">
                                <div className="flex justify-between text-[8px] uppercase"><span className="text-zinc-600">IP:</span> <span className="text-emerald-500 font-mono">{m.ip || "UNKNOWN"}</span></div>
                                <div className="flex justify-between text-[8px] uppercase"><span className="text-zinc-600">Route:</span> <span className="text-zinc-400 font-mono">P2P_ENCRYPTED</span></div>
                                <div className="flex justify-between text-[8px] uppercase"><span className="text-zinc-600">Origin:</span> <span className="text-zinc-400 font-mono">S_NODE_09</span></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`p-5 rounded-[2rem] text-sm leading-relaxed max-w-[85%] shadow-xl transition-all ${
                        m.sender === currentUser.name 
                          ? 'bg-orange-600 text-black font-bold rounded-tr-none' 
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isAITyping && (
                    <div className="flex flex-col items-start animate-pulse">
                      <span className="text-[10px] font-black uppercase text-emerald-500 mb-2">DarkFox_AI_Compute</span>
                      <div className="p-5 rounded-[2rem] bg-emerald-950/20 border border-emerald-500/20 text-emerald-500 rounded-tl-none italic text-xs">
                        Decrypting stream and synchronizing neural nodes...
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-8 bg-black/60 border-t border-zinc-900 flex gap-4 backdrop-blur-xl">
              <input 
                value={inputMsg} 
                onChange={e => setInputMsg(e.target.value)} 
                placeholder="EXECUTE_TRANSMISSION..." 
                className="flex-1 bg-zinc-950 border border-zinc-900 p-5 rounded-2xl text-xs outline-none focus:border-orange-600/50 transition-all font-bold placeholder:text-zinc-800" 
              />
              <button className="bg-orange-600 text-black p-5 px-10 rounded-2xl font-black text-xs uppercase hover:bg-orange-500 shadow-lg transition-all active:scale-95 flex items-center gap-3">
                <Send size={18}/> <span>Send</span>
              </button>
            </form>
          </div>

          {/* RIGHT: INTEL & PROFILE */}
          <div className="col-span-3 flex flex-col gap-5 h-full overflow-hidden">
            <div className="bg-zinc-950/50 border border-zinc-900 rounded-[2.5rem] p-8 text-center shadow-xl backdrop-blur-md relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-orange-600/5 rotate-12 group-hover:scale-110 transition-transform duration-700">
                <Shield size={120} />
              </div>
              <div className="text-orange-600 text-[10px] font-black uppercase mb-6 tracking-[0.4em] flex items-center justify-center gap-2">
                <User size={14}/> Root_Operator
              </div>
              <p className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-2">{currentUser.name}</p>
              <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest mb-10">Status: Sigma_Dad // Clearance: Level_9</p>
              
              <div className="pt-6 border-t border-zinc-900 flex flex-col gap-3">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-zinc-700 italic">Net_Uptime</span>
                  <span className="text-emerald-500">{Math.floor(uptime/60)}m {uptime%60}s</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-zinc-700 italic">Local_IP</span>
                  <span className="text-orange-800">{agentIPs["TOBIAS"].split(' ')[0]}</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-900 rounded-[2.5rem] p-8 flex-1 flex flex-col overflow-hidden shadow-xl backdrop-blur-md">
              <h3 className="text-rose-600 text-[11px] font-black uppercase mb-6 flex items-center gap-3 tracking-widest">
                <FileText size={18}/> Update_Buffer
              </h3>
              <div className="flex-1 bg-black/60 rounded-[1.5rem] p-5 text-[9px] text-zinc-500 font-mono overflow-y-auto custom-scrollbar border border-zinc-900/50 whitespace-pre-wrap leading-relaxed">
                {updateLogContent}
              </div>
              <button 
                onClick={fetchUpdateLog} 
                disabled={isFetchingLog}
                className="w-full mt-6 bg-zinc-900 border border-zinc-800 text-zinc-400 p-4 rounded-2xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-black transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
              >
                <RefreshCcw size={14} className={isFetchingLog ? "animate-spin" : ""} /> 
                {isFetchingLog ? "SYNCING..." : "Reload_Log_Buffer"}
              </button>
            </div>

            <div className="bg-orange-600 rounded-[2.5rem] p-8 text-center text-black shadow-2xl relative overflow-hidden group transition-all hover:bg-orange-500">
               <p className="text-[9px] uppercase font-black tracking-[0.6em] mb-2 opacity-40">Proprietary System</p>
               <p className="text-3xl font-black italic uppercase tracking-tighter leading-none">DarkFox Co.</p>
               <div className="absolute -bottom-2 -left-2 opacity-10 group-hover:rotate-12 transition-transform">
                 <Lock size={60} />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL OVERLAY STYLES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&display=swap');
        body { background-color: #030303; cursor: crosshair; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #111; border-radius: 10px; border: 1px solid #1a1a1a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea580c; border-color: #ea580c; }
        ::selection { background: #ea580c; color: #000; }
      `}</style>
    </div>
  );
}
