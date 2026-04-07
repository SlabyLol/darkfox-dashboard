"use client";
import { useState, useEffect } from "react";

// Einfache Simulation für Online-Status (normalerweise via DB/Sockets)
const initialCrewStatus = [
  { name: "Simon", email: "darkfox.simon@outlook.com", role: "Vize-Chef + Coder", online: true },
  { name: "Denis", email: "darkfox.denis@outlook.com", role: "Coder", online: true },
  { name: "Liam", email: "darkfox.liam@outlook.com", role: "Helfer", online: false },
];

export default function DarkFoxTerminal() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Admin-spezifische States
  const [selectedWorker, setSelectedWorker] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setIsLogged(true);
      } else {
        alert("Zugriff verweigert! Login-Daten prüfen.");
      }
    } catch (e) {
      alert("Verbindungsfehler zum Server.");
    }
    setLoading(false);
  };

  if (!isLogged) {
    // LOGIN SCREEN (Sollte jetzt Schwarz/Orange sein)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-6 font-sans selection:bg-orange-600/30">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <div className="inline-block px-3 py-1 border border-orange-500/30 rounded-full text-[10px] text-orange-500 font-black tracking-[0.3em] uppercase mb-4 shadow-[0_0_15px_rgba(234,88,12,0.1)]">
              Authorized Personnel Only
            </div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">
              DarkFox <span className="text-orange-600">Co.</span>
            </h1>
            <p className="text-zinc-600 text-[10px] font-bold tracking-[0.3em] uppercase mt-3">Security Terminal v1.1</p>
          </div>
          
          <div className="space-y-3">
            <input 
              type="email" placeholder="E-Mail Terminal" 
              className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all placeholder:text-zinc-700 text-sm"
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              type="password" placeholder="Passwort" 
              className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all placeholder:text-zinc-700 text-sm"
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button 
              onClick={handleLogin}
              className="w-full bg-orange-600 hover:bg-orange-500 active:scale-[0.98] p-4 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-orange-900/20 mt-4 text-sm"
            >
              {loading ? "Authentifizierung..." : "System Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-600/40 pb-20">
      <div className="p-6 max-w-xl mx-auto">
        {/* Header mit Name */}
        <div className="flex justify-between items-start mb-10 pt-4 border-b border-zinc-900 pb-6">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">DarkFox Network Status: <span className="text-green-500">Aktiv</span></p>
            <h3 className="font-black text-2xl text-white tracking-tight">Willkommen, {user.name}</h3>
          </div>
          <button 
            onClick={() => setIsLogged(false)} 
            className="text-[9px] bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 font-black tracking-widest hover:bg-red-950/30 hover:text-red-500 hover:border-red-500/30 transition-all"
          >
            DISCONNECT
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Guthaben Card */}
            <div className="md:col-span-2 relative group overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-600/5 blur-[60px] rounded-full -mr-16 -mt-16"></div>
              
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.25em] mb-3 relative z-10">Wallet Balance</p>
              <div className="flex items-baseline gap-2 relative z-10 mb-6">
                <h2 className="text-6xl font-black tracking-tighter italic">{user.balance}</h2>
                <span className="text-2xl font-black text-orange-600">€</span>
              </div>
              
              <div className="inline-flex items-center gap-2 bg-white/5 text-zinc-300 px-4 py-2 rounded-2xl text-[10px] font-black uppercase border border-white/10 relative z-10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-orange-600 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.8)] animate-pulse"></span>
                Role: {user.job}
              </div>
            </div>

            {/* Online Status Liste */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-6 shadow-xl">
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-5 border-b border-zinc-900 pb-3">Crew Status</h4>
                <div className="space-y-4">
                    {initialCrewStatus.map(worker => (
                        <div key={worker.email} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-zinc-900/50 transition">
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${worker.online ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-700'}`}></div>
                                <div>
                                    <p className="text-sm font-bold text-white leading-tight">{worker.name}</p>
                                    <p className="text-[10px] text-zinc-600 uppercase font-medium">{worker.role}</p>
                                </div>
                            </div>
                            {worker.name === "Simon" && <span className="text-[8px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-bold border border-orange-500/20">Vize</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Admin Bereich: Exklusiv für dich (Tobias) */}
        {user.role === "ADMIN" && (
          <div className="p-8 bg-zinc-950 border border-orange-600/20 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/50 to-transparent"></div>
            
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
              <h3 className="text-xl font-black text-white tracking-tight">Management Console</h3>
              <div className="inline-flex items-center gap-2 bg-orange-600/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-orange-500/20">
                 Boss Mode
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Guthaben Quick-Actions */}
                <div className="p-6 bg-black rounded-2xl border border-zinc-800">
                    <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Guthaben Quick-Editor</h5>
                    <div className="space-y-3">
                        <select 
                            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:border-orange-600"
                            onChange={(e) => setSelectedWorker(e.target.value)}
                        >
                            <option value="">Mitarbeiter wählen...</option>
                            <option value="darkfox.simon@outlook.com">Simon (Vize)</option>
                            <option value="darkfox.denis@outlook.com">Denis</option>
                            <option value="darkfox.liam@outlook.com">Liam</option>
                        </select>
                        <div className="flex gap-2">
                            <input 
                                type="number" placeholder="Betrag (€)" 
                                className="flex-grow p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white focus:border-orange-600"
                                onChange={(e) => setBalanceAmount(e.target.value)}
                            />
                            <button className="bg-orange-600 hover:bg-orange-500 px-4 rounded-lg font-bold text-sm">+</button>
                            <button className="bg-zinc-800 hover:bg-zinc-700 px-4 rounded-lg font-bold text-sm">-</button>
                        </div>
                        <p className="text-[10px] text-zinc-700 mt-2 font-medium italic">Hinweis: Diese Buttons sind Platzhalter. Die echte Änderung erfolgt (noch) via Railway Variables.</p>
                    </div>
                </div>

                {/* System Logs */}
                <div className="p-6 bg-black rounded-2xl border border-zinc-800">
                     <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Core System Logs (Simuliert)</h5>
                     <div className="space-y-1.5 font-mono text-[10px] text-zinc-600">
                        <p><span className="text-orange-700">[SYS]</span> Auth-Service gestartet.</p>
                        <p><span className="text-orange-700">[SYS]</span> Variable <span className="text-zinc-400">USER_DATA</span> geladen.</p>
                        <p><span className="text-green-700">[OK]</span> Login erfolgreich: darkfox.tobias@outlook.com</p>
                        <p><span className="text-orange-700">[SYS]</span> PWA Manifest generiert.</p>
                     </div>
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-900 flex justify-between items-center text-[9px] text-zinc-700 font-bold uppercase tracking-widest">
                <span>System-ID: DF-PROD-2026-X</span>
                <span>Uptime: 2d 14h</span>
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 w-full text-center px-6 py-4 border-t border-zinc-900 bg-black backdrop-blur-sm bg-opacity-80">
        <p className="text-[9px] text-zinc-700 font-bold tracking-[0.5em] uppercase">
          © 2026 DarkFox Co. Infrastructure Terminal
        </p>
      </footer>
    </div>
  );
}
