"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "./lib/firebase";
import { 
  ref, 
  onValue, 
  set, 
  push, 
  remove, 
  serverTimestamp, 
  update 
} from "firebase/database";
import { 
  Shield, 
  Activity, 
  Code2, 
  Trash2, 
  Power,
  User,
  Crosshair,
  Wallet,
  ExternalLink,
  MessageSquare,
  Terminal,
  Cpu,
  Globe,
  Database,
  ShieldCheck,
  Zap,
  AlertCircle,
  Hash,
  Lock
} from "lucide-react";

/**
 * @project DarkFox Terminal V3
 * @version 4.0.6
 * @copyright 2026 DarkFox Co.
 * @developer Sigma Dad
 */

export default function DarkFoxTerminalV3() {
  // --- AUTHENTICATION STATE ---
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // --- SYSTEM & INTERFACE STATE ---
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [chatRoom, setChatRoom] = useState("Global"); 
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [newMissionText, setNewMissionText] = useState<Record<string, string>>({});
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // --- REFERENCES ---
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addSystemLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  const getRailwayUsers = () => {
    try {
      const rawData = process.env.NEXT_PUBLIC_USER_DATA;
      if (!rawData) return [];
      return JSON.parse(rawData);
    } catch (e) {
      console.error("CRITICAL_ENV_FAILURE:", e);
      return [];
    }
  };

  // --- HELPER: URL DETECTION & RENDERING ---
  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-orange-400 underline hover:text-orange-300 inline-flex items-center gap-1 transition-colors underline-offset-4"
          >
            {part} <ExternalLink size={12} />
          </a>
        );
      }
      return part;
    });
  };

  // --- REALTIME DATA SYNCHRONIZATION ---
  useEffect(() => {
    if (isLogged && user) {
      const usersRef = ref(db, 'users');
      const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data);
          setAllUsers(list);
          const me = list.find((u: any) => u.email === user.email);
          if (me) setUser(me);
        }
      });

      const chatPath = chatRoom === "Global" 
        ? "chats/global" 
        : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
      
      const msgRef = ref(db, chatPath);
      const unsubscribeChat = onValue(msgRef, (snapshot) => {
        const data = snapshot.val();
        const msgList = data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : [];
        setMessages(msgList);
        setTimeout(scrollToBottom, 100);
      });

      return () => {
        unsubscribeUsers();
        unsubscribeChat();
      };
    }
  }, [isLogged, chatRoom, user?.email]);

  // --- CORE TERMINAL ACTIONS ---
  const handleLogin = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    addSystemLog("INITIATING HANDSHAKE...");
    
    setTimeout(async () => {
      const users = getRailwayUsers();
      const foundUser = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && String(u.pw) === String(password)
      );

      if (foundUser) {
        const userKey = foundUser.email.replace(/\./g, ',');
        const initialData = { 
          ...foundUser, 
          status: "ONLINE",
          lastSeen: serverTimestamp(),
          currentMission: foundUser.currentMission || "Awaiting Orders" 
        };
        
        try {
          await set(ref(db, `users/${userKey}`), initialData);
          setUser(initialData);
          setIsLogged(true);
          addSystemLog(`AUTH_SUCCESS: Welcome ${foundUser.name}.`);
        } catch (dbError) {
          addSystemLog("DATABASE_FAIL: Check Firebase permissions.");
        }
      } else {
        addSystemLog("AUTH_FAILURE: Access Keys invalid.");
        alert("UNAUTHORIZED: Check your credentials.");
      }
      setIsConnecting(false);
    }, 1200);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const chatPath = chatRoom === "Global" 
      ? "chats/global" 
      : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;

    await set(push(ref(db, chatPath)), {
      sender: user.name,
      senderEmail: user.email,
      text: inputMsg,
      timestamp: serverTimestamp(),
      role: user.role
    });
    setInputMsg("");
  };

  const deleteMessage = async (msgId: string) => {
    const chatPath = chatRoom === "Global" 
      ? "chats/global" 
      : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
    
    try {
      await remove(ref(db, `${chatPath}/${msgId}`));
      addSystemLog(`MSG_DELETED: ${msgId.substring(0, 8)}`);
    } catch (e) {
      addSystemLog("DELETE_FAILED: Permission denied.");
    }
  };

  const purgeChat = async () => {
    if (user.role !== "ADMIN") return;
    if (confirm("DANGER: WIPE ENTIRE CHANNEL HISTORY?")) {
      const chatPath = chatRoom === "Global" 
        ? "chats/global" 
        : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
      await remove(ref(db, chatPath));
      addSystemLog("CRITICAL: CHANNEL_PURGED");
    }
  };

  const updateMission = async (targetUserEmail: string) => {
    const missionText = newMissionText[targetUserEmail];
    if (!missionText?.trim()) return;

    const userKey = targetUserEmail.replace(/\./g, ',');
    await update(ref(db, `users/${userKey}`), { currentMission: missionText });
    setNewMissionText(prev => ({ ...prev, [targetUserEmail]: "" }));
    addSystemLog(`MISSION_UPDATED: ${targetUserEmail}`);
  };

  const disconnect = async () => {
    const userKey = user.email.replace(/\./g, ',');
    await update(ref(db, `users/${userKey}`), { status: "OFFLINE" });
    setIsLogged(false);
    addSystemLog("DISCONNECTED.");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex items-center justify-center font-mono p-4 overflow-hidden relative selection:bg-orange-600/30">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {!isLogged ? (
        /* --- LOGIN UI --- */
        <div className="border-2 border-orange-600/30 p-12 rounded-[3.5rem] bg-black w-full max-w-md shadow-[0_0_80px_rgba(234,88,12,0.15)] relative z-10">
          <div className="mb-12 text-center">
            <div className="flex justify-center mb-4 text-orange-600 animate-pulse">
              <Terminal size={48} />
            </div>
            <h1 className="text-7xl font-black italic text-orange-600 tracking-tighter uppercase">DarkFox</h1>
            <p className="text-[10px] text-zinc-600 mt-3 tracking-[0.4em] font-bold uppercase">Core Terminal V4.0.6</p>
          </div>
          <div className="space-y-5">
            <div className="relative group">
               <input 
                type="email" placeholder="USER_ID" 
                className="w-full p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600 text-sm font-bold uppercase transition-all"
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="relative group">
              <input 
                type="password" placeholder="SECURITY_KEY" 
                className="w-full p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600 text-sm transition-all"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
              />
            </div>
            <button 
              onClick={handleLogin} disabled={isConnecting}
              className="w-full bg-orange-600 p-5 rounded-2xl font-black italic uppercase text-black hover:bg-orange-500 transition-all shadow-lg mt-4 active:scale-95 disabled:opacity-50"
            >
              {isConnecting ? "HANDSHAKE..." : "CONNECT TO CORE"}
            </button>
          </div>
          <div className="mt-8 pt-8 border-t border-zinc-900 flex justify-between items-center opacity-30">
            <ShieldCheck size={16} />
            <span className="text-[8px] font-bold tracking-widest uppercase">Encrypted Connection</span>
            <Cpu size={16} />
          </div>
        </div>
      ) : (
        /* --- MAIN TERMINAL UI --- */
        <div className="w-full max-w-7xl h-[92vh] grid grid-cols-12 gap-5 relative z-10">
          
          {/* LEFT: CREW & LOGS */}
          <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-6 flex-1 flex flex-col overflow-hidden backdrop-blur-md shadow-xl">
              <h3 className="text-orange-600 text-[11px] font-black tracking-widest uppercase mb-6 flex items-center gap-2">
                <Shield size={14} /> Crew_Nodes
              </h3>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                <button 
                  onClick={() => setChatRoom("Global")}
                  className={`w-full p-5 rounded-2xl text-left border transition-all relative overflow-hidden group ${chatRoom === "Global" ? 'bg-orange-600 text-black border-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)]' : 'bg-zinc-900/20 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <Hash size={12} className={`absolute right-4 top-4 ${chatRoom === "Global" ? "text-black/40" : "text-zinc-700"}`} />
                  <p className="font-black text-xs italic uppercase">Global_Net</p>
                  <p className={`text-[8px] mt-1 font-bold ${chatRoom === "Global" ? "text-black/50" : "text-zinc-600"}`}>Primary Signal</p>
                </button>
                {allUsers.filter(u => u.email !== user.email).map((u, i) => (
                  <button key={i} onClick={() => setChatRoom(u.email)} className={`w-full p-5 rounded-2xl text-left border transition-all ${chatRoom === u.email ? 'bg-zinc-100 text-black border-white shadow-xl' : 'bg-zinc-900/20 border-zinc-800 hover:bg-zinc-800/40'}`}>
                    <div className="flex justify-between items-center font-black text-xs uppercase italic">
                      {u.name} <div className={`w-2 h-2 rounded-full ${u.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`} />
                    </div>
                    <p className={`text-[8px] mt-1 font-bold ${chatRoom === u.email ? "text-black/50" : "text-zinc-600"}`}>{u.job}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-black border border-zinc-800 rounded-[2.5rem] p-6 h-48 overflow-hidden text-[10px] shadow-2xl">
              <div className="text-zinc-600 font-bold uppercase mb-2 flex items-center gap-2"><Activity size={12}/> Kernel_Logs</div>
              <div className="space-y-1 overflow-y-auto h-32 scrollbar-hide text-zinc-500 font-mono">
                {systemLogs.map((log, i) => <div key={i} className="flex gap-2"><span className="text-orange-900 shrink-0">»</span> <span className="truncate">{log}</span></div>)}
              </div>
            </div>
          </div>

          {/* CENTER: MAIN CHAT PANEL */}
          <div className="col-span-6 bg-zinc-900/10 border border-zinc-800/60 rounded-[3.5rem] flex flex-col overflow-hidden relative backdrop-blur-xl shadow-2xl">
            <header className="p-8 border-b border-zinc-800/60 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-600/10 rounded-2xl text-orange-600">
                  {chatRoom === "Global" ? <Globe size={24} /> : <MessageSquare size={24} />}
                </div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter leading-none">
                    {chatRoom === "Global" ? "Broadband" : "Direct_Link"}
                  </h2>
                  <p className="text-[9px] text-zinc-500 uppercase font-black mt-1 tracking-widest italic flex items-center gap-1">
                    <ShieldCheck size={10} className="text-emerald-500"/> E2E_Encrypted
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {user.role === "ADMIN" && (
                  <button onClick={purgeChat} className="p-3 px-6 bg-rose-900/10 border border-rose-900/30 text-rose-500 rounded-xl text-[10px] font-black hover:bg-rose-900/30 transition-all uppercase italic">Purge</button>
                )}
                <button onClick={disconnect} className="p-3 px-6 bg-zinc-900/80 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-black hover:bg-zinc-800 hover:text-rose-500 transition-all uppercase italic">
                   <Power size={14} />
                </button>
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col group ${msg.senderEmail === user.email ? 'items-end text-right' : 'items-start text-left'}`}>
                  <div className={`flex items-center gap-2 mb-2 ${msg.senderEmail === user.email ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${msg.role === 'ADMIN' ? 'text-orange-600' : 'text-zinc-600'}`}>
                      {msg.sender}
                    </span>
                    {(user.role === "ADMIN" || msg.senderEmail === user.email) && (
                      <button 
                        onClick={() => deleteMessage(msg.id)} 
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 text-zinc-700 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className={`p-5 rounded-[2rem] text-[14px] leading-relaxed shadow-lg transition-transform group-hover:scale-[1.01] max-w-[85%] ${
                    msg.senderEmail === user.email 
                    ? 'bg-orange-600 text-black font-bold rounded-tr-none' 
                    : 'bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 rounded-tl-none backdrop-blur-sm'
                  }`}>
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-8 bg-black/60 border-t border-zinc-800/60 flex gap-4 backdrop-blur-2xl">
              <input 
                value={inputMsg} onChange={(e) => setInputMsg(e.target.value)}
                placeholder="TRANSMIT_DATA..." 
                className="flex-1 bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-orange-600/40 text-sm font-medium transition-all"
              />
              <button type="submit" className="bg-orange-600 p-5 px-10 rounded-2xl text-black font-black uppercase italic shadow-xl shadow-orange-600/10 hover:bg-orange-500 hover:scale-105 transition-all active:scale-95">
                Transmit
              </button>
            </form>
          </div>

          {/* RIGHT: INTEL & PROFILE */}
          <div className="col-span-3 space-y-5 flex flex-col h-full overflow-hidden">
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 text-orange-600 mb-6 font-black uppercase tracking-widest text-[10px]">
                <User size={14}/> ID_Entity
              </div>
              <p className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{user.name}</p>
              
              <div className="mt-8 pt-6 border-t border-zinc-800/60 space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[9px] text-zinc-600 uppercase font-black">Role</p>
                  <p className="text-xs font-black text-orange-600 uppercase italic">{user.job}</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[9px] text-zinc-600 uppercase font-black">Credits</p>
                  <p className="text-xs font-black text-zinc-100 flex items-center gap-2">
                    <Wallet size={12} className="text-orange-600"/> {user.balance?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {user.role === "ADMIN" && (
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8 flex-1 flex flex-col overflow-hidden shadow-xl backdrop-blur-md">
                <h3 className="text-rose-600 text-[11px] font-black uppercase mb-6 flex items-center gap-2">
                  <Crosshair size={14}/> Mission_Control
                </h3>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {allUsers.filter(u => u.role !== 'ADMIN').map((agent, i) => (
                    <div key={i} className="p-5 bg-black/60 rounded-[2rem] border border-zinc-800/40 hover:border-orange-600/20 transition-all">
                      <p className="text-[11px] font-black italic uppercase text-white mb-2">{agent.name}</p>
                      <div className="bg-orange-600/5 border-l-2 border-orange-600 p-2 mb-4">
                        <p className="text-[10px] text-orange-500 italic font-medium">“{agent.currentMission}”</p>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          value={newMissionText[agent.email] || ""}
                          onChange={(e) => setNewMissionText(prev => ({ ...prev, [agent.email]: e.target.value }))}
                          placeholder="ASSIGN..." className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-[10px] outline-none focus:border-orange-600/30 font-bold"
                        />
                        <button onClick={() => updateMission(agent.email)} className="bg-zinc-800 p-2 px-3 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-black transition-all">Push</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-orange-600 rounded-[2.5rem] p-8 text-black text-center font-black italic relative overflow-hidden group shadow-2xl">
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
               <p className="text-[10px] uppercase tracking-widest relative z-10 mb-1">Authenticated by</p>
               <p className="text-2xl font-black italic uppercase tracking-tighter relative z-10">DarkFox Co.</p>
               <div className="text-[8px] mt-2 opacity-60">EST. 2026 / CORE_V4</div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea3a0c; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes pulse-fast { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-fast { animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}
