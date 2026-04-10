"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Shield, Hash, Bot, Activity, Globe, MessageSquare, Power, Trash2, User, Crosshair } from 'lucide-react';

export default function Page() {
  // --- STATES ---
  const [isLogged, setIsLogged] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [chatRoom, setChatRoom] = useState("Global");
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [newMissionText, setNewMissionText] = useState<{ [key: string]: string }>({});
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- MOCK DATA (Anpassen an dein Backend falls nötig) ---
  const user = { email: email, name: "TOBIAS", role: "ADMIN", job: "CEO & LEAD CODER" };
  const allUsers = [
    { email: "tobias@darkfox.co", name: "TOBIAS", role: "ADMIN", currentMission: "None", status: "ONLINE" },
    { email: "denis@darkfox.co", name: "DENIS", role: "AGENT", currentMission: "None", status: "ONLINE" },
    { email: "liam@darkfox.co", name: "LIAM", role: "AGENT", currentMission: "None", status: "ONLINE" },
    { email: "simon@darkfox.co", name: "SIMON", role: "AGENT", currentMission: "None", status: "ONLINE" },
  ];

  // --- FUNKTIONEN ---
  const handleLogin = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsLogged(true);
      setIsConnecting(false);
      addSystemLog("AUTH_SUCCESS: Admin logged in.");
    }, 1500);
  };

  const disconnect = () => {
    setIsLogged(false);
    setEmail("");
    setPassword("");
  };

  const addSystemLog = (log: string) => {
    setSystemLogs(prev => [`[${new Date().toLocaleTimeString()}] ${log}`, ...prev].slice(0, 50));
  };

  const purgeChat = () => setMessages([]);
  const deleteMessage = (id: string) => setMessages(messages.filter(m => m.id !== id));
  const updateMission = (agentEmail: string) => {
    addSystemLog(`MISSION_UPDATE: Transmitted to ${agentEmail}`);
    setNewMissionText(prev => ({ ...prev, [agentEmail]: "" }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMsg(e.target.value);
    setShowCommands(e.target.value === '/');
  };

  const selectCommand = (cmd: string) => {
    setInputMsg(cmd + " ");
    setShowCommands(false);
  };

  const renderMessageText = (text: string) => {
    return text; // Link-Erkennung deaktiviert laut V5.0 Wunsch
  };

  // --- AI CORE FUNKTION (Repariert) ---
  const fetchAIResponse = async (prompt: string, isDirectChat: boolean = false) => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      addSystemLog("ERR: MISSING_GEMINI_API_KEY");
      return "ERROR: AI Core offline. Missing API Key in Variables.";
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("GEMINI_API_ERROR:", data.error);
        addSystemLog(`API_ERR: ${data.error.message.substring(0, 20)}...`);
        throw new Error(data.error.message);
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      console.error("AI_FETCH_FAILED:", error);
      addSystemLog("AI_CORE_CRASHED");
      return `SYSTEM ERROR: Verbindung fehlgeschlagen. (${error.message || "Unknown Error"})`;
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    
    const newMsg = { 
      id: Date.now().toString(), 
      text: inputMsg, 
      sender: user.name, 
      senderEmail: user.email, 
      role: user.role 
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputMsg("");
    setShowCommands(false);
    
    if (chatRoom === "DarkFox_AI" || inputMsg.startsWith("/ai ")) {
      setIsAITyping(true);
      const aiPrompt = inputMsg.startsWith("/ai ") ? inputMsg.replace("/ai ", "") : inputMsg;
      
      const aiResponse = await fetchAIResponse(aiPrompt);
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: aiResponse, 
        sender: "DARKFOX_AI", 
        senderEmail: "ai@darkfox.co", 
        role: "AI_CORE" 
      }]);
      setIsAITyping(false);
    }
  };

  // Auto-Scroll für Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAITyping]);


  // --- UI RENDER (Reparierte Klammern) ---
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex items-center justify-center font-mono p-4 overflow-hidden relative selection:bg-orange-600/30">
      
      {!isLogged ? (
        <div className="border-2 border-orange-600/30 p-12 rounded-[3.5rem] bg-black w-full max-w-md shadow-[0_0_80px_rgba(234,88,12,0.15)] relative z-10">
          <div className="mb-12 text-center">
            <h1 className="text-7xl font-black italic text-orange-600 tracking-tighter uppercase">DarkFox</h1>
            <p className="text-[10px] text-zinc-600 mt-3 tracking-[0.4em] font-bold uppercase">Core Terminal V5</p>
          </div>
          <div className="space-y-5">
            <input type="email" placeholder="USER_ID" className="w-full p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600 text-sm font-bold uppercase transition-all" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="SECURITY_KEY" className="w-full p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600 text-sm transition-all" onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
            <button onClick={handleLogin} disabled={isConnecting} className="w-full bg-orange-600 p-5 rounded-2xl font-black italic uppercase text-black hover:bg-orange-500 transition-all shadow-lg mt-4 active:scale-95 disabled:opacity-50">{isConnecting ? "HANDSHAKE..." : "CONNECT TO CORE"}</button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl h-[92vh] grid grid-cols-12 gap-5 relative z-10">
          
          {/* LEFT: CREW & AI */}
          <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-6 flex-1 flex flex-col overflow-hidden backdrop-blur-md shadow-xl">
              <h3 className="text-orange-600 text-[11px] font-black tracking-widest uppercase mb-6 flex items-center gap-2">
                <Shield size={14} /> Network_Nodes
              </h3>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Global Net */}
                <button onClick={() => setChatRoom("Global")} className={`w-full p-4 rounded-2xl text-left border transition-all relative overflow-hidden ${chatRoom === "Global" ? 'bg-orange-600 text-black border-orange-600' : 'bg-zinc-900/20 border-zinc-800'}`}>
                  <Hash size={12} className={`absolute right-4 top-4 ${chatRoom === "Global" ? "text-black/40" : "text-zinc-700"}`} />
                  <p className="font-black text-xs italic uppercase">Global_Net</p>
                </button>

                {/* AI Core Button */}
                <button onClick={() => setChatRoom("DarkFox_AI")} className={`w-full p-4 rounded-2xl text-left border transition-all relative overflow-hidden ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600 text-black border-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-zinc-900/20 border-zinc-800'}`}>
                  <Bot size={12} className={`absolute right-4 top-4 ${chatRoom === "DarkFox_AI" ? "text-black/40" : "text-emerald-600"}`} />
                  <p className="font-black text-xs italic uppercase flex items-center gap-2">DarkFox_AI</p>
                  <p className={`text-[8px] mt-1 font-bold ${chatRoom === "DarkFox_AI" ? "text-black/60" : "text-zinc-500"}`}>System Core</p>
                </button>

                <div className="h-[1px] w-full bg-zinc-800/60 my-2"></div>

                {/* Crew Members */}
                {allUsers.filter(u => u.email !== user.email).map((u, i) => (
                  <button key={i} onClick={() => setChatRoom(u.email)} className={`w-full p-4 rounded-2xl text-left border transition-all ${chatRoom === u.email ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-900/20 border-zinc-800'}`}>
                    <div className="flex justify-between items-center font-black text-xs uppercase italic">{u.name} <div className={`w-2 h-2 rounded-full ${u.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-700'}`} /></div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-black border border-zinc-800 rounded-[2.5rem] p-6 h-40 overflow-hidden text-[10px] shadow-2xl">
              <div className="text-zinc-600 font-bold uppercase mb-2 flex items-center gap-2"><Activity size={12}/> Kernel_Logs</div>
              <div className="space-y-1 overflow-y-auto h-24 scrollbar-hide text-zinc-500 font-mono">
                {systemLogs.map((log, i) => <div key={i} className="truncate">» {log}</div>)}
              </div>
            </div>
          </div>

          {/* CENTER: CHAT PANEL */}
          <div className="col-span-6 bg-zinc-900/10 border border-zinc-800/60 rounded-[3.5rem] flex flex-col overflow-hidden relative backdrop-blur-xl shadow-2xl">
            <header className="p-8 border-b border-zinc-800/60 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${chatRoom === "DarkFox_AI" ? 'bg-emerald-600/10 text-emerald-500' : 'bg-orange-600/10 text-orange-600'}`}>
                  {chatRoom === "Global" ? <Globe size={24} /> : chatRoom === "DarkFox_AI" ? <Bot size={24} /> : <MessageSquare size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">
                    {chatRoom === "Global" ? "Broadband" : chatRoom === "DarkFox_AI" ? "Neural_Link" : "Direct_Link"}
                  </h2>
                </div>
              </div>
              <div className="flex gap-3">
                {user.role === "ADMIN" && <button onClick={purgeChat} className="p-3 px-6 bg-rose-900/10 border border-rose-900/30 text-rose-500 rounded-xl text-[10px] font-black uppercase italic">Purge</button>}
                <button onClick={disconnect} className="p-3 px-6 bg-zinc-900/80 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-black uppercase italic"><Power size={14} /></button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col group ${msg.senderEmail === user.email ? 'items-end text-right' : 'items-start text-left'}`}>
                  <div className={`flex items-center gap-2 mb-2 ${msg.senderEmail === user.email ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${msg.role === 'ADMIN' ? 'text-orange-600' : msg.role === 'AI_CORE' ? 'text-emerald-500' : 'text-zinc-600'}`}>
                      {msg.role === 'AI_CORE' && <Bot size={10} />} {msg.sender}
                    </span>
                    {(user.role === "ADMIN" || msg.senderEmail === user.email) && (
                      <button onClick={() => deleteMessage(msg.id)} className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 text-zinc-700"><Trash2 size={12} /></button>
                    )}
                  </div>
                  <div className={`p-5 rounded-[2rem] text-[14px] leading-relaxed shadow-lg max-w-[85%] ${
                    msg.senderEmail === user.email ? 'bg-orange-600 text-black font-bold rounded-tr-none' : 
                    msg.role === 'AI_CORE' ? 'bg-emerald-900/20 border border-emerald-500/30 text-emerald-50 rounded-tl-none' :
                    'bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 rounded-tl-none'
                  }`}>
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              ))}
              
              {isAITyping && (
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1 mb-2"><Bot size={10} /> DarkFox_AI</span>
                  <div className="p-5 rounded-[2rem] bg-emerald-900/10 border border-emerald-500/20 text-emerald-500/50 rounded-tl-none italic text-sm animate-pulse">Processing Neural Request...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="relative p-8 bg-black/60 border-t border-zinc-800/60 backdrop-blur-2xl">
              
              {/* DISCORD-STYLE COMMAND MENU */}
              {showCommands && chatRoom !== "DarkFox_AI" && (
                <div className="absolute bottom-full left-8 mb-2 w-72 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 text-[10px] font-black uppercase text-zinc-500 bg-black/40 border-b border-zinc-800">Commands</div>
                  <button onClick={() => selectCommand("/ai")} className="w-full flex items-center gap-3 p-4 hover:bg-zinc-800 text-left transition-colors">
                    <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-500"><Bot size={14}/></div>
                    <div>
                      <p className="text-xs font-bold text-white">/ai [message]</p>
                      <p className="text-[10px] text-zinc-500 mt-1">Ask the DarkFox System AI</p>
                    </div>
                  </button>
                </div>
              )}

              <form onSubmit={sendMessage} className="flex gap-4">
                <input 
                  value={inputMsg} onChange={handleInputChange}
                  placeholder={chatRoom === "DarkFox_AI" ? "ASK THE CORE..." : "TRANSMIT_DATA (Type / for commands)..."} 
                  className="flex-1 bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-orange-600/40 text-sm font-medium transition-all"
                />
                <button type="submit" disabled={isAITyping} className={`p-5 px-10 rounded-2xl text-black font-black uppercase italic shadow-xl transition-all active:scale-95 ${chatRoom === "DarkFox_AI" ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/10' : 'bg-orange-600 hover:bg-orange-500 shadow-orange-600/10'}`}>
                  Transmit
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: INTEL */}
          <div className="col-span-3 space-y-5 flex flex-col h-full overflow-hidden">
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8 shadow-xl">
              <div className="flex items-center gap-2 text-orange-600 mb-6 font-black uppercase text-[10px]"><User size={14}/> ID_Entity</div>
              <p className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{user.name}</p>
              <div className="mt-8 pt-6 border-t border-zinc-800/60 space-y-4">
                <div className="flex justify-between items-end"><p className="text-[9px] text-zinc-600 uppercase font-black">Role</p><p className="text-xs font-black text-orange-600 uppercase italic">{user.job}</p></div>
              </div>
            </div>

            {user.role === "ADMIN" && (
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8 flex-1 flex flex-col overflow-hidden shadow-xl">
                <h3 className="text-rose-600 text-[11px] font-black uppercase mb-6 flex items-center gap-2"><Crosshair size={14}/> Mission_Control</h3>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {allUsers.filter(u => u.role !== 'ADMIN').map((agent, i) => (
                    <div key={i} className="p-5 bg-black/60 rounded-[2rem] border border-zinc-800/40">
                      <p className="text-[11px] font-black italic uppercase text-white mb-2">{agent.name}</p>
                      <div className="bg-orange-600/5 border-l-2 border-orange-600 p-2 mb-4"><p className="text-[10px] text-orange-500 italic font-medium">“{agent.currentMission}”</p></div>
                      <div className="flex gap-2">
                        <input value={newMissionText[agent.email] || ""} onChange={(e) => setNewMissionText(prev => ({ ...prev, [agent.email]: e.target.value }))} placeholder="ASSIGN..." className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-[10px] outline-none" />
                        <button onClick={() => updateMission(agent.email)} className="bg-zinc-800 p-2 px-3 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-black">Push</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-orange-600 rounded-[2.5rem] p-8 text-black text-center font-black italic shadow-2xl">
               <p className="text-[10px] uppercase tracking-widest mb-1">Authenticated by</p>
               <p className="text-2xl font-black italic uppercase tracking-tighter">DarkFox Co.</p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; height: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea3a0c; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
