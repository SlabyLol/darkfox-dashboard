"use client";
import { useState, useEffect } from "react";

export default function DarkFoxTerminal() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]); // Hier kommen die echten Daten rein
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Login Funktion
  const handleLogin = async () => {
    setLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      // Wenn Admin, lade alle Mitglieder für die Liste
      if (data.user.role === "ADMIN") {
        const listRes = await fetch("/api/users"); // Wir brauchen diesen neuen Endpunkt!
        const listData = await listRes.json();
        setAllUsers(listData.users);
      }
      setIsLogged(true);
    } else {
      alert("Zugriff verweigert!");
    }
    setLoading(false);
  };

  if (!isLogged) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-5xl font-black text-orange-600 italic mb-10">DARKFOX CO.</h1>
          <div className="space-y-4">
            <input type="email" placeholder="E-Mail" className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Passwort" className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl" onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin} className="w-full bg-orange-600 p-4 rounded-2xl font-bold uppercase tracking-widest italic">Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-6">
          <h2 className="text-xl font-black italic text-orange-500">TERMINAL_V1</h2>
          <button onClick={() => setIsLogged(false)} className="text-[10px] bg-zinc-900 px-3 py-1 rounded">LOGOUT</button>
        </header>

        {/* Eigene Stats */}
        <div className="bg-zinc-900 rounded-[2rem] p-8 border border-zinc-800 mb-8 shadow-2xl">
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-2">Willkommen, {user.name}</p>
          <div className="flex items-baseline gap-2 mb-4">
            <h1 className="text-6xl font-black italic">{user.balance}</h1>
            <span className="text-2xl font-bold text-orange-600">€</span>
          </div>
          <p className="text-orange-500 text-xs font-black uppercase tracking-widest">{user.job}</p>
        </div>

        {/* ADMIN BEREICH - Echte Mitgliederliste */}
        {user.role === "ADMIN" && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-[2rem] p-6">
            <h3 className="text-sm font-black text-zinc-400 mb-6 uppercase tracking-tighter border-b border-zinc-900 pb-3">Crew Management</h3>
            <div className="space-y-4">
              {allUsers.map((member) => (
                <div key={member.email} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    {/* Da wir keine DB für "online" haben, zeigen wir "Registriert" an */}
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <div>
                      <p className="text-sm font-black">{member.name}</p>
                      <p className="text-[10px] text-zinc-600 uppercase font-bold">{member.job}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-orange-500">{member.balance} €</p>
                    <p className="text-[10px] text-zinc-700">{member.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
