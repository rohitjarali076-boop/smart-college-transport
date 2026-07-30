import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Bus, Lock, Mail, Phone, UserCheck, ShieldCheck, Navigation } from 'lucide-react';
import Footer from '../components/Footer';

// Import local student database for USN verification
import studentList from '../students.json';

export default function Login() {
  // Active role tab: 'student', 'driver', or 'admin'
  const [activeTab, setActiveTab] = useState('student');

  // Form input states
  const [usn, setUsn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // --- 1. STUDENT LOGIN (USN) ---
    if (activeTab === 'student') {
      const cleanUsn = usn.trim().toUpperCase();
      const student = studentList.find(
        (s) => s.usn && s.usn.trim().toUpperCase() === cleanUsn
      );

      if (!student) {
        setError(`USN "${cleanUsn}" not found in college student database. Please check your USN.`);
        return;
      }

      // Log in student using verified local JSON data
      login(
        {
          name: student.name,
          usn: student.usn,
          email: student.email,
          role: 'Student'
        },
        'student-token-123'
      );
      navigate('/student');
      return;
    }

    // --- 2. DRIVER & ADMIN LOGIN ---
    try {
      let payload = { role: activeTab, password };

      if (activeTab === 'driver') {
        payload.phone = phone.trim();
      } else {
        payload.email = email.trim(); // Admin Gmail
      }

      const res = await axios.post('http://localhost:5000/api/auth/login', payload);
      login(res.data.user, res.data.token);

      const role = res.data.user.role;
      if (role === 'Driver') navigate('/driver');
      else navigate('/admin');

    } catch (err) {
      // Local fallback for Admin / Driver if backend server is offline
      console.warn('Backend server offline. Logging in via demo mode.');

      let fallbackUser = {
        name: activeTab === 'admin' ? 'Principal / Admin' : 'Driver Ramesh',
        role: activeTab === 'admin' ? 'TransportAdmin' : 'Driver',
        email: activeTab === 'admin' ? (email || 'admin@klecet.edu.in') : 'driver@klecet.edu.in',
        phone: phone || '+91 98451 22104'
      };

      login(fallbackUser, 'demo-token-123');

      if (activeTab === 'driver') navigate('/driver');
      else navigate('/admin');
    }
  };

  const demoNavigate = (path, userObj, tabType) => {
    setActiveTab(tabType);
    login(userObj, 'demo-token-123');
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans relative overflow-x-hidden">
      
      {/* 📸 Fullpage Campus Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/klecet12.jpg" 
          onError={(e) => {
            if (!e.target.dataset.triedPng) {
              e.target.dataset.triedPng = "true";
              e.target.src = "/klecet12.png";
            } else if (!e.target.dataset.triedJpeg) {
              e.target.dataset.triedJpeg = "true";
              e.target.src = "/klecet12.jpeg";
            }
          }}
          alt="KLECET Campus" 
          className="w-full h-full object-cover object-center filter brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/80"></div>
      </div>

      {/* 🏫 Header */}
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
            <p className="text-xs text-slate-300">Select your role to log in</p>
          </div>

          {/* 🔄 Dynamic Role Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('student')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'student' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Student
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('driver')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'driver' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" /> Driver
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'admin' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Admin
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-xs text-center">
              {error}
            </div>
          )}

          {/* Dynamic Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            
            {/* 1. Student Login -> USN Input */}
            {activeTab === 'student' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">VTU USN</label>
                <div className="relative">
                  <UserCheck className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={usn}
                    onChange={(e) => setUsn(e.target.value.toUpperCase())}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm font-mono tracking-wider uppercase transition-all"
                    placeholder="Enter USN"
                  />
                </div>
              </div>
            )}

            {/* 2. Driver Login -> Phone Input */}
            {activeTab === 'driver' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm font-mono tracking-wider transition-all"
                    placeholder="e.g. +91 98451 22104"
                  />
                </div>
              </div>
            )}

            {/* 3. Admin Login -> Email Input */}
            {activeTab === 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Admin Email (Gmail)</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="off"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm transition-all"
                    placeholder="admin@klecet.edu.in"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 text-white font-bold rounded-xl transition-all shadow-lg text-sm cursor-pointer ${
                activeTab === 'student' ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30' :
                activeTab === 'driver' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' :
                'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
              }`}
            >
              Sign In as {activeTab.toUpperCase()}
            </button>
          </form>

          {/* ⚡ Quick Preview Shortcuts */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick Role Preview Shortcuts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => demoNavigate('/student', { name: 'Rohit Jarali', role: 'Student' }, 'student')}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-semibold text-sky-400 flex flex-col items-center gap-1 cursor-pointer transition-all"
              >
                <UserCheck className="w-4 h-4" /> Student
              </button>
              <button
                type="button"
                onClick={() => demoNavigate('/driver', { name: 'Driver Ramesh', role: 'Driver' }, 'driver')}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-semibold text-emerald-400 flex flex-col items-center gap-1 cursor-pointer transition-all"
              >
                <Navigation className="w-4 h-4" /> Driver
              </button>
              <button
                type="button"
                onClick={() => demoNavigate('/admin', { name: 'Principal / Admin Desk', role: 'TransportAdmin' }, 'admin')}
                className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-semibold text-amber-400 flex flex-col items-center gap-1 cursor-pointer transition-all"
              >
                <ShieldCheck className="w-4 h-4" /> Admin
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