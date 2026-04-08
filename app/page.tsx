"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "./lib/firebase";
import { ref, onValue, set, push, remove, serverTimestamp } from "firebase/database";

export default function DarkFoxTerminalV3() {
  // --- STATES ---
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [chatRoom, setChatRoom] = useState("Global"); 
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [newMissionText, setNewMissionText] = useState<Record<string, string>>({});
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sideQuests = [
    "Check Database Latency",
    "Optimize Tailwind Classes",
    "Refactor API Routes",
    "Update DarkFox Docs",
    "Audit Security Logs"
  ];

  // --- HELPER ---
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getRailwayUsers = () => {
    try {
      const rawData = process.env.NEXT_PUBLIC_USER_DATA;
      return rawData ? JSON.parse(rawData) : [];
    } catch (e) {
      console.error("Fehler beim Parsen der USER_DATA aus Railway:", e);
      return [];
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (isLogged && user) {
      // 1. Sync Users & Status
      const usersRef = ref(db, 'users');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data);
          setAllUsers(list);
          const me = list.find((u: any) => u.email === user.email);
          if (me) setUser(me);
        }
      });

      // 2. Sync Chat
      const chatPath = chatRoom === "Global" 
        ? "chats/global" 
        : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
      
      const msgRef = ref(db, chatPath);
      onValue(msgRef, (snapshot) => {
        const data = snapshot.val();
        const msgList = data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : [];
        setMessages(msgList);
        setTimeout(scrollToBottom, 100);
      });
    }
  }, [isLogged, chatRoom]);

  // --- ACTIONS ---
  const handleLogin = async () => {
    const users = getRailwayUsers();
    
    if (users.length === 0) {
      alert("SYSTEM ERROR: User Data not found in environment. Check Railway NEXT_PUBLIC_USER_DATA.");
      return;
    }

    const foundUser = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const userKey = foundUser.email.replace(/\./g, ',');
      const initialData = { 
        ...foundUser, 
        status: "ONLINE", 
        currentMission: foundUser.role === "ADMIN" ? "Overseeing Operations" : "Awaiting Orders" 
      };
      
      try {
        await set(ref(db, `users/${userKey}`), initialData);
        setUser(initialData);
        setIsLogged(true);
      } catch (error) {
        console.error("Firebase Login Sync Error:", error);
        alert("DATABASE OFFLINE: Connection to mainframe failed.");
      }
    } else {
      alert("ACCESS DENIED: Invalid Terminal ID or Security Key.");
    }
  };

  const updateStatus = async (targetEmail: string, status: string, mission: string) => {
    const userKey = targetEmail.replace(/\./g, ',');
    await set(ref(db, `users/${userKey}/status`), status);
    await set(ref(db, `users/${userKey}/currentMission`), mission);
  };

  const sendChat = async () => {
    if (!inputMsg.trim()) return;
    const chatPath = chatRoom === "Global" 
      ? "chats/global" 
      : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
    
    await push(ref(db, chatPath), {
      sender: user.name,
      senderEmail: user.email,
      text: inputMsg,
      timestamp: serverTimestamp()
    });
    setInputMsg("");
  };

  const deleteMessage = async (msgId: string) => {
    const chatPath = chatRoom === "Global" 
      ? "chats/global" 
      : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
    await remove(ref(db, `${chatPath}/${msgId}`));
  };

  const clearHistory = async () => {
    if (confirm("WARNING: Are you sure you want to purge this channel's history?")) {
      const chatPath = chatRoom === "Global" 
        ? "chats/global" 
        : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
      await remove(ref(db, chatPath));
    }
  };

  // --- RENDER LOGIN UI ---
  if (!isLogged) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono p-4">
        <div className="border-2 border-orange-600/50 p-12 rounded-[4rem] bg-[#050505] w-full max-w-md shadow-[0_0_80px_rgba(234,88,12,0.15)] animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black italic text-orange-600 uppercase tracking-tighter mb-2">DarkFox</h1>
            <p className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase font-bold">Terminal Access v3.0</p>
          </div>

          <div className="space-y-4">
            <input 
              type="email" 
              placeholder="TERMINAL ID" 
              className="w-full p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl outline-none text-orange-500 focus:border-orange-600 transition-all placeholder:opacity-30" 
              onChange={(e) => setEmail(e.target.value)} 
            />
            
            <input 
              type="password" 
              placeholder="ACCESS KEY" 
              className="w-full p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl outline-none text-orange-500 focus:border-orange-600 transition-all placeholder:opacity-30" 
              onChange={(e) => setPassword(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />

            <button 
              onClick={handleLogin} 
              className="w-full bg-orange-600 hover:bg-orange-500 active:scale-95 p-5 rounded-2xl font-black italic uppercase text-lg shadow-[0_0_30px_rgba(234,88,12,0.3)] transition-all mt-4 border-b-4 border-orange-800"
            >
              Establish Connection
            </button>
          </div>

          <p className="text-center mt-8 text-[8px] text-zinc-700 uppercase tracking-widest font-bold">
            Authorized Personnel Only // © 2026 DarkFox Co.
          </p>
        </div>
      </div>
    );
  }

  // --- RENDER MAIN TERMINAL UI ---
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-mono flex flex-col md:flex-row gap-6 max-w-[1600px] mx-auto">
      
      {/* LEFT SIDEBAR: NAVIGATION & STATUS */}
      <div className="w-full md:w-[350px] flex flex-col gap-4">
        <div className="bg-[#080808] border border-zinc-900 p-8 rounded-[3rem]">
          <div className="mb-6 border-b border-zinc-900 pb-4">
            <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${user.role === 'ADMIN' ? 'text-red-600' : 'text-white'}`}>
              {user.name}
            </h2>
            <p className="text-[10px] text-zinc-600 font-bold tracking-widest uppercase">{user.job}</p>
          </div>
          
          <button 
            onClick={() => setChatRoom("Global")} 
            className={`w-full p-4 rounded-2xl mb-4 text-xs font-black uppercase tracking-widest border transition-all ${chatRoom === "Global" ? "border-orange-600 bg-orange-600/10 text-orange-600" : "border-zinc-800 text-zinc-600"}`}
          >
            Crew-Net [Global]
          </button>
          
          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            <p className="text-[10px] text-zinc-700 font-black uppercase mb-3 ml-2">Private Channels</p>
            {allUsers.filter(u => u.email !== user.email).map(u => (
              <button 
                key={u.email} 
                onClick={() => setChatRoom(u.email)} 
                className={`w-full p-4 rounded-2xl text-left text-xs font-bold border transition-all flex justify-between items-center ${chatRoom === u.email ? "border-orange-600 text-orange-600 bg-orange-600/5" : "border-zinc-900 text-zinc-500 hover:border-zinc-700"}`}
              >
                <span>{u.name}</span>
                <span className={`w-2 h-2 rounded-full ${u.status === 'ONLINE' ? 'bg-green-500' : u.status === 'WAITING' ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-800'}`}></span>
              </button>
            ))}
          </div>
        </div>

        {/* STAFF ACTIONS (Only for non-admins) */}
        {user.role !== "ADMIN" && (
          <div className="bg-[#080808] border border-orange-600/20 p-8 rounded-[3rem] space-y-4">
             <div className="flex justify-between items-center mb-2">
                <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest">Active Mission</p>
                <span className="text-[8px] bg-orange-600/20 text-orange-500 px-2 py-1 rounded-full uppercase font-bold tracking-tighter">Sync Active</span>
             </div>
             <p className={`text-2xl font-black italic leading-tight ${user.status === 'WAITING' ? 'text-yellow-500 animate-pulse' : 'text-white'}`}>
                {user.currentMission}
             </p>
             <div className="pt-4 space-y-3">
               <button 
                 onClick={() => updateStatus(user.email, "WAITING", ">> AWAITING ORDERS <<")} 
                 className="w-full bg-orange-600 p-4 rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95 transition-all hover:bg-orange-500"
               >
                 Request Mission
               </button>
               <button 
                 onClick={() => updateStatus(user.email, "WORKING", sideQuests[Math.floor(Math.random()*sideQuests.length)])} 
                 className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl font-black uppercase text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-all"
               >
                 Side-Quest
               </button>
             </div>
          </div>
        )}
      </div>

      {/* CENTER: REALTIME CHAT */}
      <div className="flex-1 flex flex-col bg-[#050505] border border-zinc-900 rounded-[3.5rem] overflow-hidden min-h-[650px] shadow-2xl relative">
        <div className="p-8 border-b border-zinc-900 bg-zinc-900/10 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black uppercase text-orange-600 italic tracking-[0.3em]">Encrypted Channel</p>
            <h3 className="text-xl font-black italic uppercase tracking-tighter">
              {chatRoom === "Global" ? "Crew Mainframe" : `Direct: ${allUsers.find(u => u.email === chatRoom)?.name}`}
            </h3>
          </div>
          {user.role === "ADMIN" && (
            <button 
              onClick={clearHistory} 
              className="text-[9px] text-zinc-700 hover:text-red-500 uppercase font-bold transition-colors"
            >
              Purge History
            </button>
          )}
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-6 custom-scrollbar pb-32">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.senderEmail === user.email ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-3 mb-2 px-1">
                <span className={`text-[10px] font-black uppercase tracking-widest ${m.senderEmail === 'darkfox.tobias@outlook.com' ? 'text-red-600' : 'text-white/40'}`}>
                  {m.sender}
                </span>
                {user.role === "ADMIN" && (
                  <button 
                    onClick={() => deleteMessage(m.id)} 
                    className="text-[8px] text-zinc-800 hover:text-red-600 font-black uppercase tracking-tighter opacity-0 hover:opacity-100 transition-opacity"
                  >
                    [X]
                  </button>
                )}
              </div>
              <div className={`p-4 rounded-[2rem] max-w-[85%] text-sm leading-relaxed shadow-lg ${m.senderEmail === user.email ? "bg-orange-600 text-white rounded-tr-none" : "bg-zinc-900 text-zinc-300 rounded-tl-none border border-zinc-800"}`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black to-transparent">
          <div className="flex gap-4">
            <input 
              value={inputMsg} 
              onChange={(e) => setInputMsg(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && sendChat()} 
              placeholder="TYPE MESSAGE // ENTER TO TRANSMIT..." 
              className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl px-6 py-4 text-sm outline-none focus:border-orange-600 transition-all text-orange-500 font-bold backdrop-blur-sm" 
            />
            <button 
              onClick={sendChat} 
              className="bg-orange-600 px-8 py-4 rounded-2xl font-black italic uppercase text-xs hover:bg-orange-500 transition-all shadow-lg active:scale-95 border-b-4 border-orange-800"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: ADMIN CONTROL PANEL */}
      {user.role === "ADMIN" && (
        <div className="w-full md:w-[400px] flex flex-col gap-4 overflow-y-auto max-h-screen pr-2 custom-scrollbar">
          <div className="flex items-center justify-between ml-6 mb-2">
            <p className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">Commander Interface</p>
            <div className="animate-pulse w-2 h-2 bg-red-600 rounded-full"></div>
          </div>
          {allUsers.filter(u => u.role !== "ADMIN").map((u) => (
            <div key={u.email} className="bg-[#080808] border border-zinc-900 p-6 rounded-[2.5rem] hover:border-red-600/30 transition-all group">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className={`text-lg font-black italic uppercase tracking-tighter ${u.status === 'WAITING' ? 'text-yellow-500' : 'text-zinc-400'}`}>
                    {u.name}
                  </span>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase">{u.status} // {u.job}</p>
                </div>
                <div className="text-right">
                   <p className="text-orange-600 font-black italic text-xl tracking-tighter">{u.balance}€</p>
                </div>
              </div>
              
              <div className="text-[10px] text-zinc-500 italic bg-black p-4 rounded-2xl border border-zinc-900 mb-4 group-hover:border-zinc-700 transition-all">
                <span className="text-zinc-700 font-black block mb-1 uppercase tracking-tighter text-[8px]">Active Order:</span>
                {u.currentMission}
              </div>

              <div className="flex gap-2">
                <input 
                  onChange={(e) => setNewMissionText({...newMissionText, [u.email]: e.target.value})} 
                  placeholder="NEW MISSION..." 
                  className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 text-[10px] outline-none focus:border-red-600 text-white font-bold" 
                />
                <button 
                  onClick={() => updateStatus(u.email, "WORKING", newMissionText[u.email] || "No updates")} 
                  className="bg-red-600/10 border border-red-600/40 text-red-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                >
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GLOBAL CSS FOR SCROLLBAR */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ea3a0c44; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ea3a0c; }
      `}</style>
    </div>
  );
}
