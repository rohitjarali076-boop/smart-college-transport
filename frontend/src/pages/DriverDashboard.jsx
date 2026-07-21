import React, { useState, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';
import { Bus, AlertTriangle, ShieldAlert, LogOut, Radio, Power } from 'lucide-react';
import Footer from '../components/Footer';

const socket = io('http://localhost:5000', {
  autoConnect: true,
  reconnectionAttempts: 3, // Stop trying after 3 attempts instead of infinite loop
  timeout: 5000
});

export default function DriverDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [isTripActive, setIsTripActive] = useState(false);
  const [speed, setSpeed] = useState(0);
  const watchIdRef = useRef(null);

  const busId = user?.assignedBus || '650000000000000000000001';

  const startTrip = () => {
    setIsTripActive(true);
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const currentSpeed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 30;
          setSpeed(currentSpeed);
          socket.emit('update_location', {
            busId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speed: currentSpeed
          });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const endTrip = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setIsTripActive(false);
    setSpeed(0);
  };

  const sendAlert = (type) => {
    socket.emit('trigger_sos', { busId, type, message: `${type} reported by driver ${user?.name}` });
    alert(`${type} notification transmitted to KLECET Transport Admin.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white">KLECET Driver Console</h1>
            <p className="text-xs text-slate-400">Driver: {user?.name || 'Ramesh'}</p>
          </div>
        </div>

        <button onClick={logout} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 p-6 max-w-md w-full mx-auto flex flex-col justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-800 rounded-full text-xs font-semibold text-slate-300">
            <Radio className={`w-4 h-4 ${isTripActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            {isTripActive ? 'Live Telemetry Active' : 'System Standby'}
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">TELEMETRY SPEED</span>
            <div className="text-6xl font-black text-white tracking-tight mt-2">
              {speed} <span className="text-base text-slate-500 font-bold">KM/H</span>
            </div>
          </div>

          {!isTripActive ? (
            <button
              onClick={startTrip}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Power className="w-6 h-6" /> Start Trip
            </button>
          ) : (
            <button
              onClick={endTrip}
              className="w-full py-4 bg-slate-800 border border-slate-700 text-rose-400 font-bold text-lg rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Power className="w-6 h-6" /> End Trip
            </button>
          )}

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
            <button
              onClick={() => sendAlert('BREAKDOWN')}
              className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl font-semibold text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" /> Breakdown
            </button>
            <button
              onClick={() => sendAlert('SOS')}
              className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1 animate-pulse cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" /> SOS Alert
            </button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}