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
  Layers,
  Zap,
  Wallet,
  Crosshair
} from "lucide-react";

/**
 * @project DarkFox Terminal V3
 * @version 4.0.1
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

  const addSystemLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
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
    if (!email || !password) {
      addSystemLog("AUTH_ERROR: Missing credentials.");
      return;
    }
    
    setIsConnecting(true);
    addSystemLog("INITIATING HANDSHAKE...");
    
    setTimeout(async () => {
      const users = getRailwayUsers();
      
      // FIX: Vergleich mit 'pw' statt 'password' und String-Casting
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
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 flex items-center justify-center font-mono p-4 overflow-hidden">
      {!isLogged ? (
        <div className="border-2 border-orange-600/30 p-12 rounded-[3.5rem] bg-black w-full max-w-md shadow-[0_0_80px_rgba(234,88,12,0.15)] relative group">
          <div className="mb-12 text-center">
            <h1 className="text-7xl font-black italic text-orange-600 tracking-tighter uppercase animate-pulse">DarkFox</h1>
            <p className="text-[10px] text-zinc-600 mt-3 tracking-[0.4em] font-bold uppercase">Core Terminal V3</p>
          </div>
          <div className="space-y-5">
            <input 
              type="email" placeholder="USER_ID" 
              className="w-full p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600 text-sm font-bold uppercase"
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              type="password" placeholder="SECURITY_KEY" 
              className="w-full p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600 text-sm"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
            />
            <button 
              onClick={handleLogin} disabled={isConnecting}
              className="w-full bg-orange-600 p-5 rounded-2xl font-black italic uppercase text-black hover:bg-orange-500 transition-all shadow-lg mt-4"
            >
              {isConnecting ? "HANDSHAKE..." : "CONNECT TO CORE"}
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl h-[92vh] grid grid-cols-12 gap-5">
          {/* LEFT: CREW */}
          <div className="col-span-3 flex flex-col gap-5 overflow-hidden">
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-6 flex-1 flex flex-col overflow-hidden backdrop-blur-sm">
              <h3 className="text-orange-600 text-[11px] font-black tracking-widest uppercase mb-6 flex items-center gap-2">
                <Shield size={14} /> Crew_Nodes
              </h3>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                <button 
                  onClick={() => setChatRoom("Global")}
                  className={`w-full p-5 rounded-2xl text-left border transition-all ${chatRoom === "Global" ? 'bg-orange-600 text-black border-orange-600' : 'bg-zinc-900/20 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <p className="font-black text-xs italic uppercase">Global_Net</p>
                </button>
                {allUsers.filter(u => u.email !== user.email).map((u, i) => (
                  <button key={i} onClick={() => setChatRoom(u.email)} className={`w-full p-5 rounded-2xl text-left border transition-all ${chatRoom === u.email ? 'bg-zinc-100 text-black border-white' : 'bg-zinc-900/20 border-zinc-800'}`}>
                    <div className="flex justify-between items-center font-black text-xs uppercase italic">
                      {u.name} <div className={`w-2 h-2 rounded-full ${u.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-black border border-zinc-800 rounded-[2.5rem] p-6 h-48 overflow-hidden text-[10px]">
              <div className="text-zinc-600 font-bold uppercase mb-2 flex items-center gap-2"><Activity size={12}/> Kernel_Logs</div>
              <div className="space-y-1 overflow-y-auto h-32 scrollbar-hide text-zinc-500">
                {systemLogs.map((log, i) => <div key={i}>» {log}</div>)}
              </div>
            </div>
          </div>

          {/* CENTER: CHAT */}
          <div className="col-span-6 bg-zinc-900/10 border border-zinc-800/60 rounded-[3.5rem] flex flex-col overflow-hidden relative backdrop-blur-sm">
            <header className="p-8 border-b border-zinc-800/60 flex justify-between items-center bg-black/40">
              <h2 className="text-2xl font-black italic uppercase text-white">{chatRoom === "Global" ? "Broadband" : "Direct_Link"}</h2>
              <button onClick={disconnect} className="p-3 px-6 border border-zinc-800 text-zinc-500 rounded-xl text-[10px] font-black hover:bg-zinc-800 uppercase italic">Term</button>
            </header>
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.senderEmail === user.email ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] font-black uppercase text-zinc-600 mb-2">{msg.sender}</span>
                  <div className={`p-5 rounded-[1.8rem] text-sm ${msg.senderEmail === user.email ? 'bg-orange-600 text-black font-bold rounded-tr-none' : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-8 bg-black/60 border-t border-zinc-800/60 flex gap-4">
              <input 
                value={inputMsg} onChange={(e) => setInputMsg(e.target.value)}
                placeholder="ENCRYPT_DATA..." 
                className="flex-1 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-orange-600/40 text-sm"
              />
              <button type="submit" className="bg-orange-600 p-5 px-10 rounded-2xl text-black font-black uppercase italic">Transmit</button>
            </form>
          </div>

          {/* RIGHT: INTEL */}
          <div className="col-span-3 space-y-5 flex flex-col">
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8">
              <p className="text-[10px] text-zinc-600 uppercase font-black mb-1">Entity</p>
              <p className="text-3xl font-black italic text-white uppercase tracking-tighter">{user.name}</p>
              <div className="mt-6 pt-6 border-t border-zinc-800/80 flex justify-between">
                <div><p className="text-[9px] text-zinc-600 uppercase">Role</p><p className="text-xs font-black text-orange-600">{user.job}</p></div>
                <div className="text-right"><p className="text-[9px] text-zinc-600 uppercase">Credits</p><p className="text-xs font-black text-zinc-100">{user.balance?.toLocaleString()}</p></div>
              </div>
            </div>

            {user.role === "ADMIN" && (
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-[2.5rem] p-8 flex-1 flex flex-col overflow-hidden">
                <h3 className="text-rose-600 text-[11px] font-black uppercase mb-6 flex items-center gap-2">
                  <Crosshair size={14}/> Mission_Control
                </h3>
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {allUsers.filter(u => u.role !== 'ADMIN').map((agent, i) => (
                    <div key={i} className="p-5 bg-black/60 rounded-2xl border border-zinc-800/40">
                      <p className="text-[11px] font-black italic uppercase text-zinc-100 mb-2">{agent.name}</p>
                      <p className="text-[10px] text-orange-500 italic mb-4">“{agent.currentMission}”</p>
                      <div className="flex gap-2">
                        <input 
                          value={newMissionText[agent.email] || ""}
                          onChange={(e) => setNewMissionText(prev => ({ ...prev, [agent.email]: e.target.value }))}
                          placeholder="NEW_TASK..." className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-[10px] outline-none"
                        />
                        <button onClick={() => updateMission(agent.email)} className="bg-zinc-800 p-2 px-4 rounded-xl text-[10px] font-black hover:bg-orange-600 hover:text-black">Push</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-orange-600 rounded-[2.5rem] p-8 text-black text-center font-black italic">
               <p className="text-[10px] uppercase tracking-widest">DarkFox Co. 2026</p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea3a0c; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
