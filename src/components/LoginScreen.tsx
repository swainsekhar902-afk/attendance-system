import React, { useState } from "react";
import { GraduationCap, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isThemeDark, setIsThemeDark] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please fill out all credential inputs.");
      return;
    }
    // Simple, foolproof credential verify
    if (username.trim().toLowerCase() === "admin" && password === "admin") {
      onLoginSuccess(username);
    } else {
      setError("Invalid username or password. Default credentials are admin / admin");
    }
  };

  const toggleTheme = () => {
    const next = !isThemeDark;
    setIsThemeDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${isThemeDark ? "bg-[#0F172A]" : "bg-slate-50"}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border transition-all duration-300 ${isThemeDark ? "bg-[#1E293B] border-slate-700 shadow-2xl text-slate-100" : "bg-white border-slate-100 shadow-xl text-slate-800"}`}>
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-[#4F46E5] rounded-2xl flex items-center justify-center ring-4 ring-indigo-100 shadow-lg text-white mb-3">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className={`text-2xl font-black tracking-tight ${isThemeDark ? "text-white" : "text-slate-900"}`}>
            EduFlow AI
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[260px]">
            AI-Powered Attendance Management portal with n8n & Google Sheets integration
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 text-rose-800 border-l-4 border-rose-500 rounded-xl text-xs font-bold transition-all">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Username ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isThemeDark ? "bg-slate-800 border-slate-700 text-white" : "border-slate-200"}`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin"
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${isThemeDark ? "bg-slate-800 border-slate-700 text-white" : "border-slate-200"}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-2xl font-bold text-xs shadow-md transition-all duration-150 flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-[0px] cursor-pointer"
          >
            <span>Access Administrator Portal</span>
          </button>
        </form>

        {/* Demo hints bar */}
        <div className={`mt-6 pt-6 border-t flex justify-between items-center ${isThemeDark ? "border-slate-700" : "border-slate-100"}`}>
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Default Access Key</p>
            <p className="text-[11px] font-medium text-slate-500">username: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[#4F46E5]">admin</code></p>
            <p className="text-[11px] font-medium text-slate-500">password: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[#4F46E5]">admin</code></p>
          </div>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${isThemeDark ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"}`}
          >
            {isThemeDark ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
        </div>

      </div>
    </div>
  );
}
