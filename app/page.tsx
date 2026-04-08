"use client";
import { useState, useEffect } from "react";
import { db } from "./lib/firebase";
import { ref, onValue, set, push, remove, serverTimestamp } from "firebase/database";

export default function DarkFoxTerminalV3() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [chatRoom, setChatRoom] = useState("Global"); // Global oder Email des Partners
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newMissionText, setNewMissionText] = useState<Record<string, string>>({});

  const sideQuests = ["Clean Repo", "Check API", "Fix CSS", "Update Docs"];

  useEffect(() => {
    if (isLogged) {
      // Listen for all users & missions
      const usersRef = ref(db, 'users');
      onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) setAllUsers(Object.values(data));
      });

      // Listen for messages
      const chatPath = chatRoom === "Global" ? "chats/global" : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
      const msgRef = ref(db, chatPath);
      onValue(msgRef, (snapshot) => {
        const data = snapshot.val();
        setMessages(data ? Object.entries(data).map(([id, val]: any) => ({ id, ...val })) : []);
      });
    }
  }, [isLogged, chatRoom]);

  const handleLogin = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      const userData = { ...data.user, status: "ONLINE", currentMission: "Idle" };
      await set(ref(db, `users/${data.user.email.replace(/\./g, ',')}`), userData);
      setUser(userData);
      setIsLogged(true);
    } else { alert("Access Denied"); }
  };

  const updateStatus = async (targetEmail: string, status: string, mission: string) => {
    const path = `users/${targetEmail.replace(/\./g, ',')}`;
    await set(ref(db, `${path}/status`), status);
    await set(ref(db, `${path}/currentMission`), mission);
  };

  const sendChat = async () => {
    if (!inputMsg.trim()) return;
    const chatPath = chatRoom === "Global" ? "chats/global" : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
    await push(ref(db, chatPath), {
      sender: user.name,
      senderEmail: user.email,
      text: inputMsg,
      timestamp: serverTimestamp()
    });
    setInputMsg("");
  };

  const deleteMessage = async (msgId: string) => {
    const chatPath = chatRoom === "Global" ? "chats/global" : `chats/private/${[user.email, chatRoom].sort().join('_').replace(/\./g, ',')}`;
    await remove(ref(db, `${chatPath}/${msgId}`));
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">
        <div className="border border-orange-600/30 p-10 rounded-[3rem] bg-[#050505] w-80">
          <h1 className="text-3xl font-black italic text-orange-600 mb-6 text-center">DF-CO</h1>
          <input type="email" placeholder="Email" className="w-full p-3 mb-3 bg-zinc-900 border border-zinc-800 rounded-xl outline-none text-orange-500" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Key" className="w-full p-3 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl outline-none text-orange-500" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-orange-600 p-3 rounded-xl font-black italic uppercase shadow-lg">Connect</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono flex flex-col md:flex-row gap-6">
      {/* SIDEBAR: CREW & CHAT SELECTION */}
      <div className="w-full md:w-1/3 space-y-4">
        <div className="bg-[#080808] border border-zinc-900 p-6 rounded-[2.5rem]">
          <h2 className={`text-xl font-black italic mb-4 ${user.role === "ADMIN" ? "text-red-600" : "text-white"}`}>{user.name}</h2>
          <button onClick={() => setChatRoom("Global")} className={`w-full p-3 rounded-xl mb-2 text-xs font-bold uppercase border ${chatRoom === "Global" ? "border-orange-600 bg-orange-600/10 text-orange-600" : "border-zinc-800 text-zinc-500"}`}>Crew Chat</button>
          <div className="space-y-2 mt-4">
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Direct Messages</p>
            {allUsers.filter(u => u.email !== user.email).map(u => (
              <button key={u.email} onClick={() => setChatRoom(u.email)} className={`w-full p-3 rounded-xl text-left text-xs font-bold border transition-all ${chatRoom === u.email ? "border-orange-600 text-orange-600" : "border-zinc-900 text-zinc-500"}`}>
                {u.name} <span className="float-right text-[8px] opacity-50">{u.status}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MISSION PANEL FOR STAFF */}
        {user.role !== "ADMIN" && (
          <div className="bg-[#080808] border border-orange-600/20 p-6 rounded-[2.5rem] space-y-4">
             <p className="text-orange-500 text-[10px] font-black uppercase">Current Mission</p>
             <p className="text-xl font-black italic leading-tight">{allUsers.find(u => u.email === user.email)?.currentMission || "None"}</p>
             <button onClick={() => updateStatus(user.email, "WAITING", ">> AWAITING ORDERS <<")} className="w-full bg-orange-600/20 border border-orange-600 p-3 rounded-xl font-black uppercase text-[10px] text-orange-600">Request Mission</button>
             <button onClick={() => updateStatus(user.email, "WORKING", sideQuests[Math.floor(Math.random()*sideQuests.length)])} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl font-black uppercase text-[10px] text-zinc-500">Side-Quest</button>
          </div>
        )}
      </div>

      {/* CENTER: CHAT WINDOW */}
      <div className="flex-1 flex flex-col bg-[#050505] border border-zinc-900 rounded-[3rem] overflow-hidden min-h-[600px]">
        <div className="p-6 border-b border-zinc-900 bg-zinc-900/20">
          <p className="text-xs font-black uppercase text-orange-600 italic tracking-[0.2em]">Channel: {chatRoom === "Global" ? "CREW-NETWORK" : `DM / ${allUsers.find(u => u.email === chatRoom)?.name}`}</p>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.senderEmail === user.email ? "items-end" : "items-start"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase ${m.senderEmail === 'darkfox.tobias@outlook.com' ? 'text-red-600' : 'text-white'}`}>{m.sender}</span>
                {user.role === "ADMIN" && (
                  <button onClick={() => deleteMessage(m.id)} className="text-[8px] text-zinc-700 hover:text-red-500 uppercase font-bold">[Delete]</button>
                )}
              </div>
              <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.senderEmail === user.email ? "bg-orange-600 text-white rounded-tr-none" : "bg-zinc-900 text-zinc-300 rounded-tl-none"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-black border-t border-zinc-900 flex gap-3">
          <input value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendChat()} placeholder="Transmit message..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm outline-none focus:border-orange-600" />
          <button onClick={sendChat} className="bg-orange-600 px-6 py-2 rounded-xl font-black italic uppercase text-xs">Send</button>
        </div>
      </div>

      {/* RIGHT: ADMIN CONTROLS */}
      {user.role === "ADMIN" && (
        <div className="w-full md:w-1/3 space-y-4">
          <p className="text-red-600 text-[10px] font-black uppercase tracking-widest ml-4">Commander Interface</p>
          {allUsers.filter(u => u.role !== "ADMIN").map((u) => (
            <div key={u.email} className="bg-[#080808] border border-zinc-900 p-5 rounded-[2rem] space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-xs font-black uppercase ${u.status === 'WAITING' ? 'text-yellow-500 animate-pulse' : 'text-zinc-500'}`}>{u.name} // {u.status}</span>
                <span className="text-orange-600 font-black italic">{u.balance} €</span>
              </div>
              <p className="text-[10px] text-zinc-600 italic bg-black p-2 rounded-lg border border-zinc-900">Current: {u.currentMission}</p>
              <div className="flex gap-2">
                <input 
                  onChange={(e) => setNewMissionText({...newMissionText, [u.email]: e.target.value})} 
                  placeholder="New Order..." 
                  className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 text-[10px] outline-none focus:border-red-600" 
                />
                <button onClick={() => updateStatus(u.email, "WORKING", newMissionText[u.email])} className="bg-red-600/20 border border-red-600 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all tracking-tighter">Deploy</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
