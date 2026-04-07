"use client";
import { useState } from "react";

export default function DarkFoxTerminal() {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-6 font-sans">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <div className="inline-block px-3 py-1 border border-orange-500/30 rounded-full text-[10px] text-orange-500 font-black tracking-[0.3em] uppercase mb-4">
              Authorized Personnel Only
            </div>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">
              DarkFox <span className="text-orange-600">Co.</span>
            </h1>
          </div>
          
          <div className="space-y-3">
            <input 
              type="email" placeholder="E-Mail Terminal" 
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all placeholder:text-zinc-700 text-sm"
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              type="password" placeholder="Passwort" 
              className="w-full p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl focus:border-orange-600 focus:ring-1 focus:ring-orange-600 outline-none transition-all placeholder:text-zinc-700 text-sm"
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

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-600/40">
      <div className="p-6 max-w-md mx-auto">
        {/* Header mit Name */}
        <div className="flex justify-between items-start mb-12 pt-4">
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Status: Aktiv</p>
            <h3 className="font-black text-2xl text-white tracking-tight">Willkommen, {user.name}</h3>
          </div>
          <button 
            onClick={() => setIsLogged(false)} 
            className="text-[9px] bg-zinc-900 px-3 py-2 rounded-xl border border-zinc-800 font-black tracking-widest hover:bg-red-950/30 hover:text-red-500 hover:border-red-500/30 transition-all"
          >
            DISCONNECT
          </button>
        </div>

        {/* Guthaben Card */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl mb-8">
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

        {/* Admin Bereich: Exklusiv für dich (Tobias) */}
        {user.role === "ADMIN" && (
          <div className="p-6 bg-zinc-950 border border-orange-600/20 rounded-[2rem] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-600/50 to-transparent"></div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-[0.2em]">Management Console</h3>
            </div>
            <p className="text-[12px] text-zinc-400 leading-relaxed font-medium">
              Boss-Modus aktiv. Du kannst Guthaben-Werte und Rollen für die gesamte Crew direkt über die Railway Cloud Variablen steuern.
            </p>
            
            <div className="mt-6 space-y-2">
                <div className="flex justify-between text-[9px] text-zinc-600 font-bold uppercase tracking-widest border-b border-zinc-900 pb-2">
                    <span>System-ID</span>
                    <span className="text-zinc-400">DF-PROD-2026</span>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-600 font-bold uppercase tracking-widest border-b border-zinc-900 pb-2">
                    <span>Encryption</span>
                    <span className="text-zinc-400">Active (AES-256)</span>
                </div>
            </div>
          </div>
        )}
      </div>

      <footer className="fixed bottom-8 w-full text-center px-6">
        <div className="h-[1px] w-12 bg-zinc-800 mx-auto mb-4"></div>
        <p className="text-[9px] text-zinc-700 font-bold tracking-[0.5em] uppercase">
          © 2026 DarkFox Co. Infrastructure
        </p>
      </footer>
    </div>
  );
}
