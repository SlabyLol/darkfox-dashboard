"use client";
import { useState, useEffect } from "react";

export default function DarkFoxTerminalV2() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // States for missions
  const [currentMission, setCurrentMission] = useState("No active mission");
  const [status, setStatus] = useState("IDLE");
  const [newMissionText, setNewMissionText] = useState("");

  const sideQuests = [
    "Clean up the Git Repository",
    "Optimize Database Queries",
    "Update API Documentation",
    "Check Server Latency",
    "Refactor Legacy Code"
  ];

  const refreshData = async () => {
    if (isLogged) {
      const res = await fetch("/api/users");
      const data = await res.json();
      setAllUsers(data.users);
      const me = data.users.find((u: any) => u.email === user.email);
      if (me) {
        setCurrentMission(me.currentMission);
        setStatus(me.status);
      }
    }
  };

  useEffect(() => {
    if (isLogged) {
      const interval = setInterval(refreshData, 3000);
      return () => clearInterval(interval);
    }
  }, [isLogged]);

  const handleLogin = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setIsLogged(true);
      refreshData();
    } else { alert("Access Denied"); }
  };

  const updateMyStatus = async (newStat: string, mission: string) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, status: newStat, mission }),
    });
    setStatus(newStat);
    setCurrentMission(mission);
  };

  const assignMission = async (targetEmail: string) => {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail, status: "WORKING", mission: newMissionText }),
    });
    setNewMissionText("");
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-mono">
        <div className="w-full max-w-sm border border-orange-600/30 p-10 rounded-[3rem] bg-[#050505] shadow-[0_0_50px_rgba(234,88,12,0.1)]">
          <h1 className="text-4xl font-black italic text-orange-600 mb-8 text-center uppercase tracking-tighter">DarkFox Co.</h1>
          <input type="email" placeholder="Terminal ID" className="w-full p-4 mb-4 bg-zinc-900 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600 text-orange-500" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Access Key" className="w-full p-4 mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600 text-orange-500" onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-orange-600 p-4 rounded-2xl font-black uppercase italic shadow-lg hover:bg-orange-500 transition-all">Connect</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 font-mono">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10 border-b border-zinc-900 pb-6">
          <div>
            <h2 className="text-2xl font-black text-orange-600 italic tracking-tighter uppercase">SYSTEM // {user.name}</h2>
            <p className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase">{user.job}</p>
          </div>
          <button onClick={() => setIsLogged(false)} className="bg-zinc-900 border border-zinc-800 px-6 py-2 rounded-xl text-xs font-bold hover:text-red-500 transition-colors">DISCONNECT</button>
        </div>

        {/* STAFF PANEL */}
        {user.role !== "ADMIN" && (
          <div className="grid gap-6">
            <div className="bg-[#080808] border border-orange-600/30 rounded-[2.5rem] p-8 shadow-[0_0_30px_rgba(234,88,12,0.05)]">
              <p className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-2">Active Mission</p>
              <h3 className={`text-3xl font-black italic mb-8 ${status === "WAITING" ? "animate-pulse text-yellow-500" : "text-white"}`}>
                {status === "WAITING" ? ">> AWAITING ORDERS <<" : currentMission}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => updateMyStatus("DONE", "Mission Completed. Waiting...")} className="bg-green-600/20 border border-green-500/50 p-4 rounded-2xl font-black uppercase text-green-500 hover:bg-green-600/40 transition-all">Mission Accomplished</button>
                <button onClick={() => updateMyStatus("WAITING", "Waiting for Sigma Dad...")} className="bg-orange-600/20 border border-orange-500/50 p-4 rounded-2xl font-black uppercase text-orange-500 hover:bg-orange-600/40 transition-all">Request New Mission</button>
                <button onClick={() => updateMyStatus("WORKING", sideQuests[Math.floor(Math.random()*sideQuests.length)])} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl font-black uppercase text-zinc-400 hover:bg-zinc-800 transition-all col-span-full">Generate Side-Quest</button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN PANEL */}
        {user.role === "ADMIN" && (
          <div className="space-y-6">
            <h3 className="text-orange-600 font-black italic tracking-widest uppercase mb-4 text-sm">Crew Control Center</h3>
            {allUsers.filter(u => u.role !== "ADMIN").map((member) => (
              <div key={member.email} className="bg-[#080808] border border-zinc-800 p-6 rounded-[2.5rem] flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${member.status === "WAITING" ? "bg-yellow-500 animate-ping" : member.status === "WORKING" ? "bg-blue-500" : "bg-green-500"}`}></div>
                    <div>
                      <p className="font-black italic text-xl uppercase tracking-tighter">{member.name}</p>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase">{member.status} // {member.job}</p>
                    </div>
                  </div>
                  <div className="text-orange-500 font-black text-2xl italic">{member.balance} €</div>
                </div>

                <div className="text-zinc-400 text-sm italic bg-black/50 p-3 rounded-xl border border-zinc-900">
                  Current: {member.currentMission}
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type new mission..." 
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm outline-none focus:border-orange-600"
                    onChange={(e) => setNewMissionText(e.target.value)}
                  />
                  <button 
                    onClick={() => assignMission(member.email)}
                    className="bg-orange-600 px-6 py-2 rounded-xl font-black italic uppercase text-xs hover:bg-orange-500 active:scale-95 transition-all"
                  >
                    Deploy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
