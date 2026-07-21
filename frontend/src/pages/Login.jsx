import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bus, Lock, Mail, ShieldCheck, UserCheck, Navigation } from 'lucide-react';
import Footer from '../components/Footer';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(res.data.user, res.data.token);
      
      const role = res.data.user.role;
      if (role === 'Driver') navigate('/driver');
      else if (role === 'Student') navigate('/student');
      else navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Connect your backend server.');
    }
  };

  const demoNavigate = (path, userObj) => {
    login(userObj, 'demo-token-123');
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* 📸 FULLPAGE CLEAR BACKGROUND IMAGE (NO BLUR, SHARP & CRISP) */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/klecet12.jpg" 
          onError={(e) => {
            // Backup check in case extension is .png or .jpeg
            if (!e.target.dataset.triedPng) {
              e.target.dataset.triedPng = "true";
              e.target.src = "/klecet12.png";
            } else if (!e.target.dataset.triedJpeg) {
              e.target.dataset.triedJpeg = "true";
              e.target.src = "/klecet12.jpeg";
            }
          }}
          alt="KLECET Campus Arch" 
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />
        {/* Mild Dark Gradient Overlay (Keeps image sharp while making form text readable) */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/80"></div>
      </div>

      {/* 🏫 Top Header Bar */}
      <header className="py-4 px-6 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-sky-500/20">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide drop-shadow-md">KLE College of Engineering & Technology</h1>
            <p className="text-xs text-sky-400 font-medium">Chikodi • Smart Transport Portal</p>
          </div>
        </div>
      </header>

      {/* 💳 Center Form Box */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 my-8 relative z-10">
        <div className="max-w-md w-full bg-slate-950/85 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-white tracking-tight">Portal Access</h2>
            <p className="text-xs text-slate-300">Sign in to track buses, view route analytics, or update GPS.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition-all"
                  placeholder="user@klecet.edu.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-sky-600/30 text-sm cursor-pointer"
            >
              Sign In
            </button>
          </form>

          {/* ⚡ Role Shortcuts */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick Role Preview Shortcuts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => demoNavigate('/student', { name: 'KLECET Student', role: 'Student' })}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-semibold text-sky-400 flex flex-col items-center gap-1 cursor-pointer transition-all"
              >
                <UserCheck className="w-4 h-4" /> Student
              </button>
              <button
                onClick={() => demoNavigate('/driver', { name: 'Driver Ramesh', role: 'Driver' })}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-semibold text-emerald-400 flex flex-col items-center gap-1 cursor-pointer transition-all"
              >
                <Navigation className="w-4 h-4" /> Driver
              </button>
              <button
                onClick={() => demoNavigate('/admin', { name: 'Principal / Admin Desk', role: 'TransportAdmin' })}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-semibold text-amber-400 flex flex-col items-center gap-1 cursor-pointer transition-all"
              >
                <ShieldCheck className="w-4 h-4" /> Principal
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}