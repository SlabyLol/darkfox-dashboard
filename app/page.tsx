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
      alert("Zugriff verweigert!");
    }
    setLoading(false);
  };

  if (!isLogged) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-black text-orange-500 mb-2 uppercase tracking-tighter italic">DarkFox Co.</h1>
          <p className="text-zinc-500 mb-8 text-xs font-bold tracking-widest uppercase">Internal Access Only</p>
          <input 
            type="email" placeholder="E-Mail" 
            className="w-full p-4 mb-3 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-orange-500 outline-none"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Passwort" 
            className="w-full p-4 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-orange-500 outline-none"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-orange-600 hover:bg-orange-500 p-4 rounded-xl font-black uppercase tracking-widest transition"
          >
            {loading ? "Authentifizierung..." : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-10">
          <span className="font-black text-orange-500 italic">DF-CO TERMINAL</span>
          <button onClick={() => setIsLogged(false)} className="text-[10px] bg-zinc-900 px-2 py-1 rounded border border-zinc-800">EXIT</button>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl mb-6">
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Guthaben Stand</p>
          <h2 className="text-5xl font-black tracking-tighter mb-4">{user.balance} €</h2>
          <div className="inline-block bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-orange-500/20">
            JOB: {user.job}
          </div>
        </div>

        {user.role === "ADMIN" && (
          <div className="p-4 border border-dashed border-zinc-800 rounded-2xl">
            <h3 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-widest underline decoration-orange-500 underline-offset-4">Admin Dashboard</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Logge dich bei Railway ein, um die Variable <code className="text-orange-400">USER_DATA</code> zu bearbeiten. Ändere dort die Zahlen bei <code className="text-orange-400">balance</code> oder den Text bei <code className="text-orange-400">job</code>.
            </p>
          </div>
        )}
      </div>
      <footer className="fixed bottom-6 w-full text-center text-[10px] text-zinc-700 font-bold tracking-widest">
        © 2026 DARKFOX CO.
      </footer>
    </div>
  );
}
