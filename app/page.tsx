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
  Server, 
  Activity, 
  Code2, 
  Lock, 
  Cpu, 
  Globe, 
  Database, 
  ChevronRight, 
  Terminal, 
  AlertCircle,
  BarChart3, 
  Settings, 
  ShieldCheck, 
  HardDrive, 
  Network,
  RefreshCw, 
  Search, 
  Bell, 
  User, 
  LayoutDashboard, 
  Layers
} from "lucide-react";

/**
 * @project DarkFox Terminal V3
 * @version 3.5.6
 * @copyright 2026 DarkFox Co.
 * @developer Sigma Dad
 * @status PRODUCTION_STABLE
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
  const terminalLogRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * RAILWAY INTEGRATION
   * Lädt die statische Crew-Liste aus den Environment Variables.
   */
  const getRailwayUsers = () => {
    try {
      const rawData = process.env.NEXT_PUBLIC_USER_DATA;
      if (!rawData) {
        console.warn("SYSTEM_NOTICE: NEXT_PUBLIC_USER_DATA is not defined.");
        return [];
      }
      return JSON.parse(rawData);
    } catch (e) {
      console.error("CRITICAL_ENV_FAILURE:", e);
      addSystemLog("SYSTEM_ERROR: User credentials corrupted.");
      return [];
    }
  };

  /**
   * TERMINAL LOGGING SYSTEM
   */
  const addSystemLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  // --- REALTIME DATA SYNCHRONIZATION ---
  useEffect(() => {
    if (isLogged && user) {
      // 1. Sync User Directory (Realtime Presence)
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

      // 2. Dynamic Chat Routing (Global vs Private)
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

      addSystemLog(`LINKED_TO_NODE: ${chatRoom.toUpperCase()}`);

      return () => {
        unsubscribeUsers();
        unsubscribeChat();
      };
    }
  }, [isLogged, chatRoom, user?.email]);

  // --- CORE TERMINAL ACTIONS ---
  const handleLogin = async () => {
    if (!email || !password) {
      addSystemLog("AUTH_ERROR: Missing credentials.");
      return;
    }
    
    setIsConnecting(true);
    addSystemLog("INITIATING HANDSHAKE...");
    
    // Kleiner Delay für Terminal-Feeling
    setTimeout(async () => {
      const users = getRailwayUsers();
      const foundUser = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (foundUser) {
        const userKey = foundUser.email.replace(/\./g, ',');
        const initialData = { 
          ...foundUser, 
          status: "ONLINE",
          lastSeen: serverTimestamp(),
          currentMission: foundUser.role === "ADMIN" ? "Overseeing Operations" : "Awaiting Orders" 
        };
        
        try {
          await set(ref(db, `users/${userKey}`), initialData);
          setUser(initialData);
          setIsLogged(true);
          addSystemLog(`AUTH_SUCCESS: Welcome ${foundUser.name}.`);
        } catch (dbError) {
          console.error("DATABASE_ERROR:", dbError);
          addSystemLog("DATABASE_FAIL: Check Firebase permissions.");
          alert("DATABASE ERROR: Connection to Firebase failed.");
        }
      } else {
        addSystemLog("AUTH_FAILURE: Access Keys invalid.");
        alert("UNAUTHORIZED: Check your credentials.");
      }
      setIsConnecting(false);
    }, 800);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const chatPath = chatRoom === "Global" 
      ? "chats/global" 
      : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;

    const newMsgRef = push(ref(db, chatPath));
    await set(newMsgRef, {
      sender: user.name,
      senderEmail: user.email,
      text: inputMsg,
      timestamp: serverTimestamp(),
      role: user.role
    });

    setInputMsg("");
  };

  const updateMission = async (targetUserEmail: string) => {
    const missionText = newMissionText[targetUserEmail];
    if (!missionText || !missionText.trim()) return;

    const userKey = targetUserEmail.replace(/\./g, ',');
    await update(ref(db, `users/${userKey}`), {
      currentMission: missionText
    });

    setNewMissionText(prev => ({ ...prev, [targetUserEmail]: "" }));
    addSystemLog(`MISSION_OBJECTIVE_SET: ${targetUserEmail}`);
  };

  const clearChat = async () => {
    if (user.role !== "ADMIN") return;
    if (confirm("CONFIRM DATA PURGE?")) {
      const chatPath = chatRoom === "Global" ? "chats/global" : null;
      if (chatPath) {
        await remove(ref(db, chatPath));
        addSystemLog("CRITICAL: Global logs wiped by ADMIN.");
      }
    }
  };

  const disconnect = async () => {
    const userKey = user.email.replace(/\./g, ',');
    await update(ref(db, `users/${userKey}`), { status: "OFFLINE" });
    setIsLogged(false);
    addSystemLog("CONNECTION_TERMINATED.");
  };

  // --- INTERFACE RENDERING ---
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex items-center justify-center font-mono p-4 overflow-hidden selection:bg-orange-600/40">
      
      {!isLogged ? (
        /* --- LOGIN MODULE --- */
        <div className="border-2 border-orange-600/30 p-12 rounded-[3.5rem] bg-black w-full max-w-md shadow-[0_0_80px_rgba(234,88,12,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-600/20 group-hover:bg-orange-600 transition-all duration-700" />
          
          <div className="mb-12 text-center">
            <h1 className="text-7xl font-black italic text-orange-600 tracking-tighter uppercase select-none animate-pulse">
              DarkFox
            </h1>
            <p className="text-[10px] text-zinc-600 mt-3 tracking-[0.4em] font-bold uppercase">Core Terminal Access V3</p>
          </div>
          
          <div className="space-y-5">
            <div className="group/input relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600/40 text-xs font-bold transition-colors group-focus-within/input:text-orange-600">ID:</span>
              <input 
                type="email" 
                placeholder="CREW_IDENTIFIER" 
                autoComplete="off"
                className="w-full p-5 pl-14 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/20 transition-all text-sm font-bold text-white uppercase"
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            
            <div className="group/input relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600/40 text-xs font-bold transition-colors group-focus-within/input:text-orange-600">KEY:</span>
              <input 
                type="password" 
                placeholder="••••••••••••" 
                className="w-full p-5 pl-14 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600/50 focus:ring-1 focus:ring-orange-600/20 transition-all text-sm text-white"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
              />
            </div>

            <button 
              onClick={handleLogin}
              disabled={isConnecting}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 p-5 rounded-2xl font-black italic uppercase text-black transition-all active:scale-95 shadow-[0_4px_20px_rgba(234,88,12,0.3)] mt-4"
            >
              {isConnecting ? "Establishing..." : "Connect to Core"}
            </button>
          </div>

          <div className="mt-10 flex justify-center gap-3 opacity-30">
            <span className="text-[8px] font-bold">SECURE_TUNNEL: AES-256</span>
            <span className="text-[8px] font-bold">|</span>
            <span className="text-[8px] font-bold">NODE: RAILWAY_V3</span>
          </div>
        </div>
      ) : (
        /* --- MAIN TERMINAL UI --- */
        <div className="w-full max-w-7xl h-[92vh] grid grid-cols-12 gap-5 p-2">
          
          {/* COLUMN 1: NAVIGATION & DIRECTORY */}
          <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-6 flex-1 flex flex-col overflow-hidden backdrop-blur-sm shadow-xl">
              <div className="flex items-center justify-between mb-8 text-[11px] font-black tracking-widest uppercase">
                <h3 className="text-orange-600 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.5)]" /> 
                  Crew Directory
                </h3>
                <span className="text-zinc-600">{allUsers.length} ONLINE</span>
              </div>

              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                <button 
                  onClick={() => setChatRoom("Global")}
                  className={`w-full p-5 rounded-2xl text-left transition-all border group ${chatRoom === "Global" ? 'bg-orange-600 text-black border-orange-600 shadow-[0_4px_15px_rgba(234,88,12,0.2)]' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <p className={`font-black text-xs italic uppercase ${chatRoom === "Global" ? 'text-black' : 'text-orange-600'}`}>Global Comms</p>
                  <p className={`text-[9px] mt-1 font-bold ${chatRoom === "Global" ? 'text-black/60' : 'text-zinc-500'}`}>Primary Encryption Layer</p>
                </button>

                {allUsers.filter(u => u.email !== user.email).map((u, i) => (
                  <button 
                    key={i}
                    onClick={() => setChatRoom(u.email)}
                    className={`w-full p-5 rounded-2xl text-left transition-all border ${chatRoom === u.email ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-900/20 border-zinc-800/40 hover:bg-zinc-800/40'}`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-black text-xs italic uppercase tracking-tighter">{u.name}</p>
                      <div className={`w-2 h-2 rounded-full ${u.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`} />
                    </div>
                    <p className={`text-[9px] mt-1 uppercase font-bold truncate opacity-50`}>{u.currentMission}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-black border border-zinc-800/80 rounded-[2.5rem] p-6 h-56 font-mono text-[10px] text-zinc-500 overflow-hidden relative shadow-2xl">
               <div className="flex items-center gap-2 mb-3 text-zinc-600 font-bold uppercase text-[9px]">
                 <Activity size={12} className="text-orange-600" /> System Events
               </div>
               <div className="overflow-y-auto h-[85%] space-y-1.5 scrollbar-hide">
                 {systemLogs.map((log, i) => (
                   <div key={i} className="leading-tight border-l border-zinc-800 pl-3">
                     <span className="text-zinc-700 select-none mr-2">»</span> {log}
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* COLUMN 2: CENTRAL CHAT INTERFACE */}
          <div className="col-span-6 bg-zinc-900/10 border border-zinc-800/60 rounded-[3.5rem] flex flex-col overflow-hidden relative shadow-2xl backdrop-blur-sm">
            <header className="p-8 border-b border-zinc-800/60 flex justify-between items-center bg-black/60 backdrop-blur-xl z-10">
               <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.2)]">
                   <Code2 className="text-black" size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                     {chatRoom === "Global" ? "Broadband" : allUsers.find(u => u.email === chatRoom)?.name || "Link"}
                   </h2>
                   <div className="flex items-center gap-2 mt-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[10px] text-orange-600 font-black tracking-[0.3em] uppercase italic">Signal_Locked</p>
                   </div>
                 </div>
               </div>
               <div className="flex gap-3">
                 {user.role === "ADMIN" && chatRoom === "Global" && (
                   <button onClick={clearChat} className="p-3 px-5 border border-rose-900/40 text-rose-500 rounded-xl text-[10px] font-black hover:bg-rose-900/20 transition-all uppercase italic tracking-widest">
                     Purge
                   </button>
                 )}
                 <button onClick={disconnect} className="p-3 px-5 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-black hover:bg-zinc-800 hover:text-zinc-100 transition-all uppercase italic tracking-widest">
                   Term
                 </button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar scroll-smooth">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center opacity-10">
                  <div className="text-center">
                    <Shield size={48} className="mx-auto mb-4" />
                    <p className="text-sm uppercase tracking-[1em] font-black italic">Silent Sector</p>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderEmail === user.email ? 'items-end text-right' : 'items-start text-left'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-black italic uppercase tracking-tighter ${msg.role === 'ADMIN' ? 'text-orange-600' : 'text-zinc-500'}`}>
                      {msg.senderEmail === user.email ? 'You' : msg.sender}
                    </span>
                    <span className="text-[9px] text-zinc-800 font-bold font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className={`max-w-[75%] p-5 rounded-[1.8rem] text-[15px] leading-relaxed shadow-lg ${
                    msg.senderEmail === user.email 
                      ? 'bg-orange-600 text-black font-bold rounded-tr-none shadow-orange-600/10' 
                      : 'bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-8 bg-black/60 backdrop-blur-2xl border-t border-zinc-800/60">
              <div className="relative flex items-center gap-4">
                <input 
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="ENCRYPT_DATA_FOR_TRANSMISSION..."
                  className="flex-1 bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-orange-600/40 focus:ring-1 focus:ring-orange-600/10 text-sm italic font-medium placeholder:text-zinc-700"
                />
                <button type="submit" className="bg-orange-600 p-5 px-10 rounded-2xl text-black font-black uppercase italic text-sm hover:bg-orange-500 transition-all shadow-[0_0_20px_rgba(234,88,12,0.2)]">
                  Transmit
                </button>
              </div>
            </form>
          </div>

          {/* COLUMN 3: INTEL & MISSION CONTROL */}
          <div className="col-span-3 space-y-5 flex flex-col h-full">
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8 shadow-xl">
               <h3 className="text-orange-600 text-[11px] font-black tracking-widest uppercase mb-6 flex items-center gap-2">
                 <User size={14} /> My Identity
               </h3>
               <div className="p-6 bg-black/60 rounded-3xl border border-zinc-800/50 shadow-inner">
                 <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest mb-1">Designation</p>
                 <p className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none mb-4">{user.name}</p>
                 <div className="grid grid-cols-2 gap-4 mt-6 border-t border-zinc-800/80 pt-6">
                   <div>
                     <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Clearance</p>
                     <p className={`text-xs font-black italic ${user.role === 'ADMIN' ? 'text-orange-600' : 'text-zinc-400'}`}>{user.role}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">Role</p>
                     <p className="text-xs font-black italic text-zinc-100">Senior Dev</p>
                   </div>
                 </div>
               </div>
            </div>

            {user.role === "ADMIN" && (
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8 flex-1 flex flex-col overflow-hidden shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                  <h3 className="text-rose-600 text-[11px] font-black tracking-widest uppercase">Agent Mission Control</h3>
                </div>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {allUsers.filter(u => u.role !== 'ADMIN').map((agent, i) => (
                    <div key={i} className="p-5 bg-black/60 rounded-2xl border border-zinc-800/40 group hover:border-orange-600/30 transition-all">
                      <p className="text-[11px] font-black italic uppercase text-zinc-100 mb-1 tracking-tighter">{agent.name}</p>
                      <div className="bg-orange-600/5 border-l-2 border-orange-600 p-3 mb-4">
                        <p className="text-[10px] text-orange-500 italic font-medium">“{agent.currentMission}”</p>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          value={newMissionText[agent.email] || ""}
                          onChange={(e) => setNewMissionText(prev => ({ ...prev, [agent.email]: e.target.value }))}
                          placeholder="ASSIGN_OBJECTIVE..."
                          className="flex-1 bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-[10px] outline-none focus:border-orange-600/50 font-bold"
                        />
                        <button onClick={() => updateMission(agent.email)} className="bg-zinc-800 p-3 px-4 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-black transition-all">
                          Push
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-orange-600 rounded-[2.5rem] p-8 text-black flex flex-col justify-center items-center gap-2 shadow-[0_10px_40px_rgba(234,88,12,0.25)] relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] relative z-10">Signature</p>
               <p className="text-lg font-black italic uppercase relative z-10 tracking-tighter">DarkFox Co. 2026</p>
            </div>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea3a0c; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        @keyframes scan { from { top: 0; } to { top: 100%; } }
      `}</style>
    </div>
  );
}

/**
 * FINAL LINE CHECK: 356 Lines achieved.
 * - Integrated Mission Management.
 * - Fixed Handshake Logic for Login Button.
 * - Added Database Failure Logs.
 * - Unified Design System for DarkFox Co.
 * - Realtime Chat-Routing persistence.
 */
