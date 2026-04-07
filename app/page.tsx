"use client";
import { useState, useEffect } from "react";

export default function DarkFoxTerminal() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [bossMsg, setBossMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [taskDone, setTaskDone] = useState(false);
  const [crewStatus, setCrewStatus] = useState<Record<string, boolean>>({});

  const refreshCrewStatus = async () => {
    if (user?.role === "ADMIN") {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setCrewStatus(data.statuses || {});
    }
  };

  useEffect(() => {
    if (isLogged && user?.role === "ADMIN") {
      const interval = setInterval(refreshCrewStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [isLogged, user]);

  const handleLogin = async () => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setBossMsg(data.bossMessage);
      if (data.user.role === "ADMIN") {
        const listRes = await fetch("/api/users");
        const listData = await listRes.json();
        setAllUsers(listData.users);
      }
      setIsLogged(true);
    } else {
      alert("Zugriff verweigert");
    }
  };

  const toggleTask = async () => {
    const newState = !taskDone;
    setTaskDone(newState);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, done: newState }),
    });
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm border border-orange-600/30 p-10 rounded-[3rem] bg-[#050505]">
          <h1 className="text-4xl font-black italic text-orange-600 mb-8 text-center uppercase tracking-tighter">DarkFox Co.</h1>
          <div className="space-y-4">
            <input type="email" placeholder="E-Mail" className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Passwort" className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl outline-none focus:border-orange-600" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin} className="w-full bg-orange-600 p-4 rounded-2xl font-black uppercase italic shadow-lg shadow-orange-900/20 active:scale-95 transition-all">Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-zinc-900 pb-6">
          <h2 className="text-xl font-black text-orange-600 italic tracking-tighter uppercase">DF-CO // {user.name}</h2>
          <button onClick={() => setIsLogged(false)} className="text-[10px] bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-800 font-bold uppercase tracking-widest text-zinc-500">Exit</button>
        </header>

        <div className="bg-orange-600/10 border border-orange-600/40 rounded-[2.5rem] p-8 mb-8 relative overflow-hidden shadow-inner">
          <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 text-center">Nachricht vom Chef</p>
          <p className="text-2xl font-black italic text-center leading-tight mb-8">"{bossMsg}"</p>
          {user.role !== "ADMIN" && (
            <button onClick={toggleTask} className={`w-full p-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all border-2 ${taskDone ? "bg-green-600 border-green-400 text-white" : "bg-transparent border-zinc-800 text-zinc-500"}`}>
              {taskDone ? "✓ Erledigt gemeldet" : "Als Erledigt markieren"}
            </button>
          )}
        </div>

        <div className="bg-[#080808] border border-zinc-900 rounded-[3rem] p-10 mb-10 shadow-2xl">
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-2 italic">Finanzstatus</p>
          <div className="flex items-baseline gap-2 mb-6 text-white">
            <h1 className="text-7xl font-black italic tracking-tighter">{user.balance}</h1>
            <span className="text-3xl font-black text-orange-600 italic">€</span>
          </div>
          <div className="inline-block bg-orange-600/10 text-orange-500 px-4 py-1 rounded-full text-[10px] font-black border border-orange-600/20 uppercase">
             {user.job}
          </div>
        </div>

        {user.role === "ADMIN" && (
          <div className="space-y-4 border-t border-zinc-900 pt-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 uppercase">Live Crew Monitoring</h3>
            {allUsers.map((member) => (
              <div key={member.email} className="bg-[#0a0a0a] border border-zinc-800 p-5 rounded-[2rem] flex justify-between items-center transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${crewStatus[member.email] ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-zinc-800'}`}></div>
                  <div>
                    <p className={`text-lg font-black italic leading-none ${crewStatus[member.email] ? 'text-green-500' : 'text-white'}`}>{member.name}</p>
                    <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">{member.job}</p>
                  </div>
                </div>
                {crewStatus[member.email] ? (
                  <div className="bg-green-600/20 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-green-500/30 uppercase italic text-center">Erledigt</div>
                ) : (
                  <div className="text-zinc-600 font-black italic text-xl tracking-tighter">{member.balance} €</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
