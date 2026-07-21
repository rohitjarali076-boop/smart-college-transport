import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import { 
  Bus, Clock, Gauge, Navigation, Star, ExternalLink, 
  Phone, Radio, UserCheck, MapPin
} from 'lucide-react';
import Footer from '../components/Footer';
import 'leaflet/dist/leaflet.css';

const socket = io('http://localhost:5000', {
  autoConnect: true,
  reconnectionAttempts: 3, // Stop trying after 3 attempts instead of infinite loop
  timeout: 5000
});

// Custom Pin Icon for Live Bus Tracking
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [46, 46],
  iconAnchor: [23, 23]
});

// Auto-recenter map when coordinates update
function MapController({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([coords.lat, coords.lng], map.getZoom(), { animate: true, duration: 1.5 });
  }, [coords, map]);
  return null;
}

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  
  // 📍 CORRECT KLECET CHIKODI CAMPUS COORDINATES
  const [coords, setCoords] = useState({ lat: 16.4378, lng: 74.6107 });
  const [speed, setSpeed] = useState(32);
  const [eta, setEta] = useState(12);
  const [activeTab, setActiveTab] = useState('live');
  const [selectedRating, setSelectedRating] = useState(0);

  const busId = user?.assignedBus || '650000000000000000000001';

  // Real Socket Telemetry
  useEffect(() => {
    socket.emit('join_bus_room', busId);
    
    socket.on('location_changed', (data) => {
      setCoords({ lat: data.lat, lng: data.lng });
      setSpeed(Math.round(data.speed));
    });

    return () => socket.off('location_changed');
  }, [busId]);

  // Dynamic Real-time Speed Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed((prevSpeed) => {
        const variation = Math.floor(Math.random() * 7) - 3;
        return Math.min(Math.max(prevSpeed + variation, 18), 48);
      });

      setEta((prevEta) => (prevEta > 2 && Math.random() > 0.7 ? prevEta - 1 : prevEta));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-sky-500 selection:text-white">
      
      {/* 🏫 Header Navigation Bar */}
      <header className="px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-sky-500/25 ring-1 ring-white/20">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg text-white tracking-wide">
                KLE College of Engineering & Technology
              </h1>
              <span className="hidden md:inline-block px-2 py-0.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-semibold rounded-full uppercase tracking-wider">
                Chikodi
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Smart Transport Telemetry Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://klecet.edu.in/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-sky-400 transition-all bg-slate-800/60 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/60"
          >
            klecet.edu.in <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-semibold transition-all border border-rose-500/30 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* 📸 Campus Hero Banner */}
        <div className="relative w-full h-64 md:h-72 rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl group">
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
            alt="KLECET Campus Arch" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/30"></div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold rounded-full uppercase tracking-wider backdrop-blur-md">
                  Student Navigation Portal
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-full uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Bus #01 Active
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight pt-1">
                Welcome, {user?.name || 'KLECET Student'}!
              </h2>
              <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                Real-time satellite GPS tracking for KLECET Chikodi express routes.
              </p>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700/80 text-xs flex items-center gap-4 self-start md:self-auto shadow-2xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Route Name</span>
                <span className="text-sm font-bold text-white">Chikodi - Nipani Loop</span>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scheduled Departure</span>
                <span className="text-sm font-bold text-emerald-400">08:00 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'live' 
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" /> Live GPS Telemetry
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'schedule' 
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" /> Timetable & Driver Details
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>Destination: <strong>KLECET Main Campus Gate</strong></span>
          </div>
        </div>

        {activeTab === 'live' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Telemetry Cards */}
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between">
                    <Clock className="w-5 h-5 text-sky-400" />
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Live Track</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block mt-3">ESTIMATED ARRIVAL</span>
                  <span className="text-3xl font-black text-white mt-1 block tracking-tight">
                    ~ {eta} <span className="text-sm font-semibold text-slate-400">mins</span>
                  </span>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div className="bg-sky-500 h-1.5 rounded-full animate-pulse" style={{ width: `${Math.max(100 - eta * 5, 20)}%` }}></div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between">
                    <Gauge className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span> Live
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block mt-3">REAL-TIME SPEED</span>
                  <span className="text-3xl font-black text-emerald-400 mt-1 block tracking-tight transition-all duration-500">
                    {speed} <span className="text-sm font-semibold text-slate-400">km/h</span>
                  </span>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(speed / 60) * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Driver Details Card */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-400" /> Driver Profile
                  </h3>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                    ★ 4.9 Rating
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <div>
                    <h4 className="font-bold text-sm text-white">Ramesh Patil</h4>
                    <p className="text-xs text-slate-400">Bus ID: KLECET-01 (KA-23-F-1024)</p>
                  </div>
                  <button className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all cursor-pointer">
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Route Timeline */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-sm space-y-4 shadow-xl">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-2"><Navigation className="w-4 h-4 text-sky-400" /> Live Route Progress</span>
                  <span className="text-[10px] text-sky-400 font-bold">2 Stops Left</span>
                </h3>

                <div className="space-y-5 relative pl-4 border-l-2 border-slate-800 my-2">
                  <div className="relative pl-3">
                    <span className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
                    <p className="text-sm font-semibold text-white">Chikodi Central Bus Stand</p>
                    <p className="text-xs text-slate-400">Departed at 08:00 AM</p>
                  </div>

                  <div className="relative pl-3">
                    <span className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-slate-900 ring-4 ring-sky-500/20 animate-pulse"></span>
                    <p className="text-sm font-bold text-sky-400">Nipani Road Junction</p>
                    <p className="text-xs text-sky-300 font-medium">Approaching Stop • Live Speed: {speed} km/h</p>
                  </div>

                  <div className="relative pl-3">
                    <span className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full bg-slate-700 border-2 border-slate-900"></span>
                    <p className="text-sm font-semibold text-slate-400">KLECET Main Campus Gate</p>
                    <p className="text-xs text-slate-500">Destination</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Google Satellite Navigation Map */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-3xl p-2.5 min-h-[540px] flex flex-col relative overflow-hidden shadow-2xl">
              
              <div className="absolute top-5 right-5 z-[1000] flex items-center gap-2">
                <div className="bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 text-[11px] font-semibold text-sky-400 flex items-center gap-2 shadow-xl">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  KLECET Campus Satellite View
                </div>
              </div>

              <MapContainer center={[coords.lat, coords.lng]} zoom={17} scrollWheelZoom={true} className="w-full h-full rounded-2xl z-0">
                <MapController coords={coords} />
                
                <TileLayer
                  attribution='&copy; Google Maps'
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                />

                <Marker position={[coords.lat, coords.lng]} icon={busIcon}>
                  <Popup>
                    <div className="text-slate-900 font-bold text-sm">
                      🚌 KLECET Route Bus 01<br />
                      <span className="text-xs text-slate-600 font-normal">Speed: {speed} km/h • Driver Ramesh</span>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

          </div>
        ) : (
          /* Schedule Tab */
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Daily Campus Express Schedule</h3>
                <p className="text-xs text-slate-400">Official KLECET transport departure timings.</p>
              </div>
              <span className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs font-semibold rounded-full">
                Active Operations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Bus No</th>
                    <th className="p-3.5">Route</th>
                    <th className="p-3.5">Departure Time</th>
                    <th className="p-3.5">Destination</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">Bus 01</td>
                    <td className="p-3.5">Chikodi Stand - Nipani Highway</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">08:00 AM</td>
                    <td className="p-3.5">KLECET Main Arch</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">En Route</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}