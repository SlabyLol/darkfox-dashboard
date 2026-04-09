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
  Lock, 
  Terminal, 
  Zap,
  Wallet,
  Crosshair,
  User,
  Power
} from "lucide-react";

/**
 * @project DarkFox Terminal V3
 * @version 4.0.2
 * @copyright 2026 DarkFox Co.
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
      if (!rawData) {
        addSystemLog("WARN: ENV_DATA_MISSING");
        return [];
      }
      return JSON.parse(rawData);
    } catch (e) {
      addSystemLog("ERR: ENV_PARSE_FAILED");
      return [];
    }
  };

  // --- REALTIME SYNC ---
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

  // --- CORE ACTIONS ---
  const handleLogin = async () => {
    if (isConnecting) return;
    
    if (!email || !password) {
      addSystemLog("AUTH_ERROR: CREDENTIALS_EMPTY");
      return;
    }
    
    setIsConnecting(true);
    addSystemLog("INITIATING CORE_HANDSHAKE...");
    
    setTimeout(async () => {
      const users = getRailwayUsers();
      
      // Fix: Vergleich mit 'pw' und explizite String-Konvertierung
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
          addSystemLog(`AUTH_SUCCESS: ${foundUser.name} LINKED.`);
        } catch (dbError) {
          addSystemLog("FIREBASE_DENIED: CHECK_RULES");
          alert("DATABASE REJECTED CONNECTION");
        }
      } else {
        addSystemLog("AUTH_FAILURE: KEY_MISMATCH");
        alert("UNAUTHORIZED: Check User_ID and Security_Key.");
      }
      setIsConnecting(false);
    }, 1000);
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

  const updateMission = async (targetUserEmail: string) => {
    const missionText = newMissionText[targetUserEmail];
    if (!missionText?.trim()) return;

    const userKey = targetUserEmail.replace(/\./g, ',');
    await update(ref(db, `users/${userKey}`), { currentMission: missionText });
    setNewMissionText(prev => ({ ...prev, [targetUserEmail]: "" }));
    addSystemLog(`OBJ_UPDATED: ${targetUserEmail.split('@')[0]}`);
  };

  const disconnect = async () => {
    const userKey = user.email.replace(/\./g, ',');
    await update(ref(db, `users/${userKey}`), { status: "OFFLINE" });
    setIsLogged(false);
    addSystemLog("CONNECTION_TERMINATED.");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex items-center justify-center font-mono p-4 selection:bg-orange-600/30">
      {!isLogged ? (
        /* --- LOGIN SECTION --- */
        <div className="border-2 border-orange-600/20 p-12 rounded-[3.5rem] bg-black w-full max-w-md shadow-[0_0_100px_rgba(234,88,12,0.1)] relative">
          <div className="text-center mb-10">
            <h1 className="text-7xl font-black italic text-orange-600 tracking-tighter uppercase animate-pulse">DarkFox</h1>
            <p className="text-[10px] text-zinc-600 mt-2 tracking-[0.5em] font-bold uppercase">System Terminal V3</p>
          </div>
          <div className="space-y-4">
            <input 
              type="email" placeholder="ID: CREW_EMAIL" 
              className="w-full p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600/50 text-sm font-bold uppercase transition-all"
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              type="password" placeholder="KEY: SECURITY_PW" 
              className="w-full p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600/50 text-sm transition-all"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
            />
            <button 
              onClick={(e) => { e.preventDefault(); handleLogin(); }}
              disabled={isConnecting}
              className="w-full bg-orange-600 p-5 rounded-2xl font-black italic uppercase text-black hover:bg-orange-500 transition-all active:scale-95 shadow-lg disabled:opacity-50"
            >
              {isConnecting ? "AUTHORIZING..." : "CONNECT TO CORE"}
            </button>
          </div>
          <div className="mt-8 h-20 overflow-hidden text-[8px] text-zinc-700 uppercase leading-relaxed font-bold">
            {systemLogs.map((log, i) => <div key={i}><span className="text-orange-900">»</span> {log}</div>)}
          </div>
        </div>
      ) : (
        /* --- MAIN UI SECTION --- */
        <div className="w-full max-w-7xl h-[92vh] grid grid-cols-12 gap-6 p-2">
          {/* NAVIGATION */}
          <div className="col-span-3 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-[2.5rem] p-6 flex-1 flex flex-col overflow-hidden backdrop-blur-md">
              <h3 className="text-orange-600 text-[11px] font-black tracking-widest uppercase mb-6 flex items-center gap-2">
                <Shield size={14} /> Crew_Directory
              </h3>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                <button 
                  onClick={() => setChatRoom("Global")}
                  className={`w-full p-5 rounded-2xl text-left border transition-all ${chatRoom === "Global" ? 'bg-orange-600 text-black border-orange-600 shadow-lg' : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <p className="font-black text-xs italic uppercase tracking-tighter">Global_Net</p>
                  <p className={`text-[8px] font-bold ${chatRoom === "Global" ? "text-black/60" : "text-zinc-600"}`}>Primary Signal</p>
                </button>
                {allUsers.filter(u => u.email !== user.email).map((u, i) => (
                  <button key={i} onClick={() => setChatRoom(u.email)} className={`w-full p-5 rounded-2xl text-left border transition-all ${chatRoom === u.email ? 'bg-zinc-100 text-black border-white shadow-xl' : 'bg-zinc-900/10 border-zinc-800/40'}`}>
                    <div className="flex justify-between items-center font-black text-xs uppercase italic">
                      {u.name} <div className={`w-2 h-2 rounded-full ${u.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-black border border-zinc-800/80 rounded-[2.5rem] p-6 h-40 overflow-hidden text-[9px] shadow-inner">
               <div className="text-zinc-600 font-bold uppercase mb-2 flex items-center gap-2"><Activity size={12}/> Kernel_Activity</div>
               <div className="space-y-1 overflow-y-auto h-24 scrollbar-hide text-zinc-500 font-mono">
                 {systemLogs.map((log, i) => <div key={i} className="truncate">» {log}</div>)}
               </div>
            </div>
          </div>

          {/* COMMUNICATION */}
          <div className="col-span-6 bg-zinc-900/10 border border-zinc-800/60 rounded-[3.5rem] flex flex-col overflow-hidden relative backdrop-blur-sm shadow-2xl">
            <header className="p-8 border-b border-zinc-800/60 flex justify-between items-center bg-black/40 backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-black italic uppercase text-white tracking-tighter">
                  {chatRoom === "Global" ? "Main_Link" : "Private_Sharding"}
                </h2>
                <p className="text-[9px] text-orange-600 font-black uppercase tracking-[0.3em] italic mt-1">Signal_Locked_Encrypted</p>
              </div>
              <button onClick={disconnect} className="p-3 px-6 bg-zinc-900/50 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-black hover:bg-rose-900/20 hover:text-rose-500 hover:border-rose-900/40 transition-all uppercase italic">
                <Power size={14} className="inline mr-2" /> Term
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar scroll-smooth">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderEmail === user.email ? 'items-end text-right' : 'items-start text-left'}`}>
                  <span className={`text-[10px] font-black uppercase mb-2 ${msg.role === 'ADMIN' ? 'text-orange-600' : 'text-zinc-600'}`}>
                    {msg.sender} <span className="text-[8px] opacity-40 ml-2">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </span>
                  <div className={`p-5 rounded-[1.8rem] text-sm leading-relaxed shadow-lg max-w-[80%] ${
                    msg.senderEmail === user.email 
                    ? 'bg-orange-600 text-black font-bold rounded-tr-none' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-8 bg-black/60 border-t border-zinc-800/60 flex gap-4 backdrop-blur-2xl">
              <input 
                value={inputMsg} onChange={(e) => setInputMsg(e.target.value)}
                placeholder="TRANSMIT_ENCRYPTED_DATA..." 
                className="flex-1 bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-orange-600/40 text-sm italic font-medium"
              />
              <button type="submit" className="bg-orange-600 p-5 px-10 rounded-2xl text-black font-black uppercase italic shadow-lg shadow-orange-600/10 hover:bg-orange-500 transition-all active:scale-95">
                Transmit
              </button>
            </form>
          </div>

          {/* IDENTITY & INTEL */}
          <div className="col-span-3 space-y-6 flex flex-col h-full">
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8 shadow-xl">
              <div className="flex items-center gap-2 text-orange-600 mb-6 font-black uppercase tracking-widest text-[10px]">
                <User size={14}/> Profile_Node
              </div>
              <p className="text-[9px] text-zinc-600 uppercase font-black mb-1">Entity_Designation</p>
              <p className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{user.name}</p>
              
              <div className="mt-8 pt-6 border-t border-zinc-800/80 space-y-4">
                <div className="flex justify-between">
                  <p className="text-[9px] text-zinc-600 uppercase font-bold">Role</p>
                  <p className="text-[10px] font-black text-orange-600 uppercase italic">{user.job}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-[9px] text-zinc-600 uppercase font-bold">Balance</p>
                  <p className="text-[10px] font-black text-zinc-100 flex items-center gap-1">
                    <Wallet size={10} className="text-orange-600"/> {user.balance?.toLocaleString()} CR
                  </p>
                </div>
              </div>
            </div>

            {user.role === "ADMIN" && (
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8 flex-1 flex flex-col overflow-hidden shadow-xl">
                <h3 className="text-rose-600 text-[11px] font-black uppercase mb-6 flex items-center gap-2">
                  <Crosshair size={14}/> Operational_Control
                </h3>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {allUsers.filter(u => u.role !== 'ADMIN').map((agent, i) => (
                    <div key={i} className="p-5 bg-black/60 rounded-3xl border border-zinc-800/40 group hover:border-orange-600/30 transition-all">
                      <p className="text-[11px] font-black italic uppercase text-zinc-100 mb-2">{agent.name}</p>
                      <div className="bg-orange-600/5 border-l-2 border-orange-600 p-2 mb-4 rounded-r-md">
                        <p className="text-[10px] text-orange-500 italic font-medium leading-relaxed">“{agent.currentMission}”</p>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          value={newMissionText[agent.email] || ""}
                          onChange={(e) => setNewMissionText(prev => ({ ...prev, [agent.email]: e.target.value }))}
                          placeholder="ASSIGN_OBJ..." className="flex-1 bg-zinc-900 border border-zinc-800 p-2 px-3 rounded-xl text-[10px] outline-none focus:border-orange-600/50"
                        />
                        <button onClick={() => updateMission(agent.email)} className="bg-zinc-800 p-2 px-4 rounded-xl text-[10px] font-black uppercase hover:bg-orange-600 hover:text-black transition-all">Push</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-orange-600 rounded-[2.5rem] p-8 text-black text-center relative overflow-hidden group shadow-2xl">
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
               <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-1">Signature</p>
               <p className="text-xl font-black italic uppercase tracking-tighter">DarkFox Co. 2026</p>
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
      `}</style>
    </div>
  );
}
