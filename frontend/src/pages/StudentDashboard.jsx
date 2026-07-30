import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import { 
  Bus, Clock, Gauge, Navigation, ExternalLink, 
  Phone, UserCheck, MapPin, Search, CheckCircle2, User, Route, BellRing, X, AlertTriangle
} from 'lucide-react';
import Footer from '../components/Footer';
import 'leaflet/dist/leaflet.css';

// Import student database from src/students.json
import studentList from '../students.json';

const socket = io('http://localhost:5000', {
  autoConnect: true,
  reconnectionAttempts: 3,
  timeout: 5000
});

// Custom Pins
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

const collegeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/8074/8074788.png',
  iconSize: [42, 42],
  iconAnchor: [21, 42]
});

const startPinIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

// Play notification sound using Web Audio API
function playDepartureAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  } catch (err) {
    console.warn('Audio playback not supported or blocked:', err);
  }
}

// Auto-recenter & Auto-fit route bounds on map
function MapController({ coords, routePath }) {
  const map = useMap();
  useEffect(() => {
    if (routePath && routePath.length > 0) {
      const bounds = L.latLngBounds(routePath);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (coords && coords.lat && coords.lng) {
      map.flyTo([coords.lat, coords.lng], 13, { animate: true });
    }
  }, [coords, routePath, map]);
  return null;
}

// Routes Database with Destination Bus Stand Info
const ROUTES_DATABASE = [
  {
    id: 'BUS-01',
    routeName: 'Sankeshwar Town Express',
    targetBusStand: 'Sankeshwar Central Bus Stand',
    startCoords: { lat: 16.2618, lng: 74.4789 },
    destinationCoords: { lat: 16.4385, lng: 74.6085 }, // KLECET Main Campus
    driverName: 'Ramesh Patil',
    driverPhone: '+91 98451 22104',
    busRegNo: 'KA-23-F-1024',
    scheduledDeparture: '05:15 PM',
    highway: 'SH-160 / 548B'
  },
  {
    id: 'BUS-02',
    routeName: 'Nipani Highway Express',
    targetBusStand: 'Nipani Central Bus Depot',
    startCoords: { lat: 16.3980, lng: 74.3820 },
    destinationCoords: { lat: 16.4385, lng: 74.6085 },
    driverName: 'Suresh Kumar',
    driverPhone: '+91 94482 11092',
    busRegNo: 'KA-23-F-1088',
    scheduledDeparture: '05:30 PM',
    highway: 'NH-48 / SH-18'
  },
  {
    id: 'BUS-03',
    routeName: 'Hukkeri Local Route',
    targetBusStand: 'Hukkeri Town Bus Stand',
    startCoords: { lat: 16.2361, lng: 74.6022 },
    destinationCoords: { lat: 16.4385, lng: 74.6085 },
    driverName: 'Prakash Hegde',
    driverPhone: '+91 98800 77621',
    busRegNo: 'KA-23-F-4090',
    scheduledDeparture: '05:15 PM',
    highway: 'SH-78'
  }
];

export default function StudentDashboard() {
  const { logout } = useContext(AuthContext);

  const [usnInput, setUsnInput] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [activeStudent, setActiveStudent] = useState(null);
  
  const [activeBus, setActiveBus] = useState(null);
  const [coords, setCoords] = useState(null);
  const [speed, setSpeed] = useState(0);
  
  // Real OSRM Road Route States
  const [routePolyline, setRoutePolyline] = useState([]);
  const [routeDistance, setRouteDistance] = useState('');
  const [routeDuration, setRouteDuration] = useState('');
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // 🚨 5-Minute Pre-Departure Alert States
  const [isPreDepartureAlert, setIsPreDepartureAlert] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Fetch true road geometry from OSRM Routing API
  const fetchRoadRoute = async (start, end) => {
    setIsLoadingRoute(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leafletCoords = route.geometry.coordinates.map((c) => [c[1], c[0]]);
        setRoutePolyline(leafletCoords);

        const distKm = (route.distance / 1000).toFixed(1);
        const durationMins = Math.round(route.duration / 60);
        
        setRouteDistance(`${distKm} km`);
        setRouteDuration(`${durationMins} min`);
      }
    } catch (err) {
      console.error('OSRM Route fetch error:', err);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Handle Search & Route Load
  const handleSearchBus = (e) => {
    e.preventDefault();
    const cleanUsn = usnInput.trim().toUpperCase();

    if (!cleanUsn) {
      alert('Please enter your VTU USN!');
      return;
    }

    const foundStudent = studentList.find(
      (s) => s.usn && s.usn.trim().toUpperCase() === cleanUsn
    );

    if (!foundStudent) {
      alert(`USN "${cleanUsn}" not found in student database. Please check your USN!`);
      return;
    }

    if (!selectedRouteId) {
      alert('Please select your bus route!');
      return;
    }

    const bus = ROUTES_DATABASE.find((b) => b.id === selectedRouteId);
    
    if (bus) {
      setActiveStudent(foundStudent);
      setActiveBus(bus);
      
      // Initial position at KLECET Gate (Campus Bay)
      const campusGate = { lat: 16.4385, lng: 74.6085 };
      setCoords(campusGate);
      setIsPreDepartureAlert(false);
      setShowNotification(false);

      fetchRoadRoute(bus.startCoords, bus.destinationCoords);
    }
  };

  // Socket Telemetry Updates
  useEffect(() => {
    if (!activeBus) return;

    socket.emit('join_bus_room', activeBus.id);
    
    const handleLocationChange = (data) => {
      setCoords({ lat: data.lat, lng: data.lng });
      setSpeed(Math.round(data.speed));
    };

    socket.on('location_changed', handleLocationChange);

    return () => socket.off('location_changed', handleLocationChange);
  }, [activeBus]);

  // ⏱️ SIMULATION / AUTOMATED 5-MINUTE PRE-DEPARTURE ALERT
  useEffect(() => {
    if (!activeBus) return;

    // Trigger 5-minute pre-departure warning after 3 seconds of selecting bus
    const alertTimer = setTimeout(() => {
      setIsPreDepartureAlert(true);
      setShowNotification(true);
      playDepartureAlertSound();
    }, 3000);

    return () => clearTimeout(alertTimer);
  }, [activeBus]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-sky-500 selection:text-white relative">
      
      {/* 🚨 FLOATING POPUP 5-MINUTE PRE-DEPARTURE NOTIFICATION BANNER */}
      {showNotification && activeBus && (
        <div className="fixed top-20 right-4 left-4 md:left-auto md:w-96 z-[2000] bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white p-4 rounded-2xl shadow-2xl border border-amber-300/40 animate-bounce flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-xl mt-0.5">
            <BellRing className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs tracking-wider uppercase bg-black/30 px-2 py-0.5 rounded-md">
                5 MINS DEPARTURE WARNING
              </span>
              <span className="text-[10px] font-bold text-amber-200">{activeBus.scheduledDeparture}</span>
            </div>
            <h4 className="font-extrabold text-sm text-white">
              {activeBus.id} will start in 5 minutes!
            </h4>
            <p className="text-xs text-amber-100 font-medium">
              Heading to: <strong className="text-white underline">{activeBus.targetBusStand}</strong>. Please proceed to KLECET Bus Bay immediately!
            </p>
          </div>
          <button 
            onClick={() => setShowNotification(false)}
            className="p-1 hover:bg-black/20 rounded-lg text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
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

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Lookup Card */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-sky-400" /> Student Navigation Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your USN and select a route to see which bus is going to your local bus stand and receive departure warnings.
            </p>
          </div>

          <form onSubmit={handleSearchBus} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                VTU USN Number
              </label>
              <input
                type="text"
                value={usnInput}
                onChange={(e) => setUsnInput(e.target.value.toUpperCase())}
                placeholder="Enter USN"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono tracking-wider uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Select Your Destination Bus Route
              </label>
              <select
                value={selectedRouteId}
                onChange={(e) => setSelectedRouteId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                required
              >
                <option value="">-- Choose Bus Stand Route --</option>
                {ROUTES_DATABASE.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.id} - {route.routeName} (➔ {route.targetBusStand})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoadingRoute}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-sky-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <Route className="w-4 h-4" /> {isLoadingRoute ? 'Calculating Route...' : 'Track Bus Stand Route'}
              </button>
            </div>
          </form>
        </div>

        {/* Dashboard Grid */}
        {activeBus && activeStudent ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Telemetry Column */}
            <div className="space-y-6">
              
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeStudent.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{activeStudent.usn}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              </div>

              {/* 🎯 DESTINATION BUS STAND DESTINATION CARD */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm space-y-2 shadow-xl">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                  BOUND FOR BUS STAND
                </span>
                <h3 className="text-lg font-black text-white pt-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500 animate-bounce" />
                  {activeBus.targetBusStand}
                </h3>
                <p className="text-xs text-slate-400">
                  Via highway route: <strong className="text-slate-200">{activeBus.highway}</strong>
                </p>
              </div>

              {/* ⏱️ 5-MINUTE PRE-DEPARTURE STATUS BADGE CARD */}
              <div className={`p-5 rounded-2xl border shadow-xl transition-all ${
                isPreDepartureAlert 
                  ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-rose-500/10 border-amber-500/50' 
                  : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BellRing className={`w-4 h-4 ${isPreDepartureAlert ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} /> 
                    Campus Departure Alert
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                    isPreDepartureAlert 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {isPreDepartureAlert ? 'Starts in 5 Mins!' : 'At Campus Bay'}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="text-xl font-black text-white">
                    {isPreDepartureAlert ? 'BOARDING NOW — Departs in 5 Mins' : `Scheduled: ${activeBus.scheduledDeparture}`}
                  </div>
                  <p className="text-xs text-slate-400">
                    {isPreDepartureAlert 
                      ? `Bus ${activeBus.id} engine is running at KLECET Campus Bay. Departs for ${activeBus.targetBusStand} shortly!`
                      : `Bus is parked at KLECET main bay. Please board before ${activeBus.scheduledDeparture}.`}
                  </p>
                </div>
              </div>

              {/* Speed & Travel Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm shadow-xl">
                  <div className="flex items-center justify-between">
                    <Clock className="w-5 h-5 text-sky-400" />
                    <span className="text-[10px] font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">Route Time</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block mt-3">ESTIMATED TRAVEL</span>
                  <span className="text-2xl font-black text-white mt-1 block tracking-tight">
                    {routeDuration || '~ 46 min'}
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm shadow-xl">
                  <div className="flex items-center justify-between">
                    <Gauge className="w-5 h-5 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Speed</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase block mt-3">CURRENT SPEED</span>
                  <span className="text-2xl font-black text-emerald-400 mt-1 block tracking-tight">
                    {speed} <span className="text-xs text-slate-400 font-normal">km/h</span>
                  </span>
                </div>
              </div>

              {/* Driver & Bus Info */}
              <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-400" /> Driver Profile
                  </h3>
                  <span className="text-xs font-bold text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md border border-sky-400/20">
                    {activeBus.id}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <div>
                    <h4 className="font-bold text-sm text-white">{activeBus.driverName}</h4>
                    <p className="text-xs text-slate-400">{activeBus.busRegNo}</p>
                  </div>
                  <a href={`tel:${activeBus.driverPhone}`} className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all">
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>

            </div>

            {/* Right Map Column (Google Satellite + Live Bus Movement) */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-3xl p-2.5 min-h-[580px] flex flex-col relative overflow-hidden shadow-2xl">
              
              {/* Floating Route Distance Badge */}
              {routeDistance && routeDuration && (
                <div className="absolute top-5 left-5 z-[1000] bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-500/40 text-white shadow-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl text-white">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-400 font-sans flex items-center gap-1">
                      {routeDuration} <span className="text-slate-400 font-normal">({routeDistance})</span>
                    </div>
                    <div className="text-[10px] text-slate-300 font-medium">to {activeBus.targetBusStand}</div>
                  </div>
                </div>
              )}

              <MapContainer 
                center={[activeBus.destinationCoords.lat, activeBus.destinationCoords.lng]} 
                zoom={14} 
                scrollWheelZoom={true} 
                className="w-full h-full rounded-2xl z-0"
              >
                <MapController coords={coords} routePath={routePolyline} />
                
                {/* Google Hybrid Satellite Tile Layer */}
                <TileLayer
                  attribution='&copy; Google Maps'
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                />

                {/* Road Navigation Polyline */}
                {routePolyline.length > 0 && (
                  <>
                    <Polyline 
                      positions={routePolyline} 
                      pathOptions={{ color: '#1e3a8a', weight: 10, opacity: 0.6 }} 
                    />
                    <Polyline 
                      positions={routePolyline} 
                      pathOptions={{ color: '#2563eb', weight: 6, opacity: 0.95 }} 
                    />
                  </>
                )}

                {/* KLECET Campus Gate Marker */}
                <Marker position={[activeBus.destinationCoords.lat, activeBus.destinationCoords.lng]} icon={collegeIcon}>
                  <Popup>
                    <div className="text-slate-900 font-bold text-sm">
                      🏛️ KLECET Main Campus Gate<br />
                      <span className="text-xs text-slate-600 font-normal">Starting Point • Boarding Bay</span>
                    </div>
                  </Popup>
                </Marker>

                {/* Destination Bus Stand Marker */}
                <Marker position={[activeBus.startCoords.lat, activeBus.startCoords.lng]} icon={startPinIcon}>
                  <Popup>
                    <div className="text-slate-900 font-bold text-xs">
                      📍 Destination: {activeBus.targetBusStand}
                    </div>
                  </Popup>
                </Marker>

                {/* Live Bus Marker */}
                {coords && (
                  <Marker position={[coords.lat, coords.lng]} icon={busIcon}>
                    <Popup>
                      <div className="text-slate-900 font-bold text-sm">
                        🚌 {activeBus.id} ({activeBus.busRegNo})<br />
                        <span className="text-xs text-slate-600 font-normal">
                          Target: {activeBus.targetBusStand} • Speed: {speed} km/h
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center space-y-3">
            <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full w-fit mx-auto">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No Bus Route Selected</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Enter USN and select a route to view which local bus is going to your town's bus stand and receive 5-minute pre-departure alerts.
            </p>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}