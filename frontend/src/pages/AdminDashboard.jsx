import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Bus, DollarSign, Wrench, Users, ShieldCheck, ExternalLink, 
  Phone, Radio, Search, Filter, AlertTriangle, CheckCircle2,
  Plus, Edit3, X, Save, Trash2
} from 'lucide-react';
import Footer from '../components/Footer';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBusId, setEditingBusId] = useState(null);

  // Initial KLECET Fleet Data State
  const [fleetData, setFleetData] = useState([
    {
      id: 'BUS-01',
      regNo: 'KA-23-F-1024',
      driver: 'Ramesh Patil',
      phone: '+91 98451 22104',
      route: 'Chikodi Stand ➔ Nipani Highway',
      currentLocation: 'Nipani Road Junction',
      speed: 38,
      status: 'ON_ROUTE',
      fuel: '78%',
      studentsCount: 42
    },
    {
      id: 'BUS-02',
      regNo: 'KA-23-F-1088',
      driver: 'Suresh Kumar',
      phone: '+91 94482 11092',
      route: 'Sankeshwar Town Express',
      currentLocation: 'KLECET Main Campus Gate',
      speed: 0,
      status: 'AT_STOP',
      fuel: '65%',
      studentsCount: 38
    },
    {
      id: 'BUS-03',
      regNo: 'KA-23-F-2105',
      driver: 'Mahesh Kulkarni',
      phone: '+91 97310 88412',
      route: 'Banhatti Local Loop',
      currentLocation: 'Banhatti Circle',
      speed: 42,
      status: 'ON_ROUTE',
      fuel: '82%',
      studentsCount: 45
    },
    {
      id: 'BUS-04',
      regNo: 'KA-23-F-3011',
      driver: 'Ganesh Naik',
      phone: '+91 99012 33411',
      route: 'Raybag Route Express',
      currentLocation: 'Garage Depot (Scheduled)',
      speed: 0,
      status: 'MAINTENANCE',
      fuel: '20%',
      studentsCount: 0
    }
  ]);

  // Form state for creating a new bus
  const [newBus, setNewBus] = useState({
    id: '',
    regNo: '',
    driver: '',
    phone: '',
    route: '',
    currentLocation: 'KLECET Main Arch',
    speed: 0,
    status: 'AT_STOP',
    fuel: '100%',
    studentsCount: 0
  });

  // Handle Adding New Bus
  const handleAddBus = (e) => {
    e.preventDefault();
    if (!newBus.id || !newBus.driver || !newBus.route) {
      alert('Please fill in Bus ID, Driver Name, and Route!');
      return;
    }
    setFleetData([newBus, ...fleetData]);
    setIsAddModalOpen(false);
    setNewBus({
      id: '',
      regNo: '',
      driver: '',
      phone: '',
      route: '',
      currentLocation: 'KLECET Main Arch',
      speed: 0,
      status: 'AT_STOP',
      fuel: '100%',
      studentsCount: 0
    });
  };

  // Handle Direct Field Updates
  const handleUpdateBusField = (busId, field, value) => {
    setFleetData(
      fleetData.map((bus) =>
        bus.id === busId ? { ...bus, [field]: value } : bus
      )
    );
  };

  // Delete Bus
  const handleDeleteBus = (busId) => {
    if (window.confirm(`Are you sure you want to remove ${busId} from the active fleet?`)) {
      setFleetData(fleetData.filter((b) => b.id !== busId));
    }
  };

  // Search and Filter Logic
  const filteredBuses = fleetData.filter((bus) => {
    const matchesSearch = 
      bus.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.regNo.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'ALL') return matchesSearch;
    return matchesSearch && bus.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 🏫 Header */}
      <header className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-1 ring-white/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base md:text-lg text-white tracking-wide">
                KLE College of Engineering & Technology
              </h1>
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Principal Desk
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Chikodi • Fleet Management & Route Administration Console
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://klecet.edu.in/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-400 transition-all bg-slate-800/60 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/60"
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
        
        {/* Banner */}
        <div className="relative w-full h-60 md:h-64 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
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
            alt="KLECET Main Building" 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/30"></div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-full uppercase tracking-wider backdrop-blur-md">
                Institutional Fleet Oversight
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight pt-1">
                KLECET Fleet Control Desk
              </h2>
              <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                Add new buses, update route assignments, and modify driver parameters in real-time.
              </p>
            </div>

            {/* ➕ Add Bus Trigger Button */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-xl shadow-amber-500/20 cursor-pointer flex items-center gap-2 self-start md:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Add New Route Bus
            </button>
          </div>
        </div>

        {/* Fleet Metric Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm space-y-1 shadow-xl">
            <div className="flex items-center justify-between">
              <Bus className="w-5 h-5 text-sky-400" />
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">Total Fleet</span>
            </div>
            <span className="text-xs text-slate-400 font-medium block pt-2">Registered Vehicles</span>
            <span className="text-3xl font-black text-white">{fleetData.length} <span className="text-xs text-slate-500 font-semibold">Buses</span></span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm space-y-1 shadow-xl">
            <div className="flex items-center justify-between">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active Trips</span>
            </div>
            <span className="text-xs text-slate-400 font-medium block pt-2">Currently Running</span>
            <span className="text-3xl font-black text-emerald-400">
              {fleetData.filter((b) => b.status === 'ON_ROUTE').length} <span className="text-xs text-slate-500 font-semibold">Buses</span>
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm space-y-1 shadow-xl">
            <div className="flex items-center justify-between">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">Fuel Budget</span>
            </div>
            <span className="text-xs text-slate-400 font-medium block pt-2">Monthly Expenditure</span>
            <span className="text-3xl font-black text-white">₹ 1.42 L</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-sm space-y-1 shadow-xl">
            <div className="flex items-center justify-between">
              <Wrench className="w-5 h-5 text-rose-400" />
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">Service</span>
            </div>
            <span className="text-xs text-slate-400 font-medium block pt-2">Maintenance Depot</span>
            <span className="text-3xl font-black text-rose-400">
              {fleetData.filter((b) => b.status === 'MAINTENANCE').length} <span className="text-xs text-slate-500 font-semibold">Buses</span>
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Bus ID, Driver, or Route..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="ALL">All Fleet Statuses</option>
              <option value="ON_ROUTE">En Route Only</option>
              <option value="AT_STOP">At Campus / Stop</option>
              <option value="MAINTENANCE">Under Maintenance</option>
            </select>
          </div>
        </div>

        {/* 🚍 Detailed Fleet Directory with Update Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400 animate-pulse" /> Fleet Master Directory
              </h3>
              <p className="text-xs text-slate-400">Click on any editable field or status tag to modify details.</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filteredBuses.length} of {fleetData.length} Vehicles
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Bus & Reg Tag</th>
                  <th className="p-4">Driver Name & Contact</th>
                  <th className="p-4">Assigned Route</th>
                  <th className="p-4">Current Stop</th>
                  <th className="p-4">Operational Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBuses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Bus ID & Reg */}
                    <td className="p-4">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <Bus className="w-4 h-4 text-sky-400" />
                        {bus.id}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{bus.regNo}</span>
                    </td>

                    {/* Driver Name & Phone */}
                    <td className="p-4">
                      {editingBusId === bus.id ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={bus.driver}
                            onChange={(e) => handleUpdateBusField(bus.id, 'driver', e.target.value)}
                            className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-xs text-white"
                          />
                          <input
                            type="text"
                            value={bus.phone}
                            onChange={(e) => handleUpdateBusField(bus.id, 'phone', e.target.value)}
                            className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-xs text-emerald-400 block"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="font-semibold text-slate-200">{bus.driver}</div>
                          <a href={`tel:${bus.phone}`} className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {bus.phone}
                          </a>
                        </>
                      )}
                    </td>

                    {/* Route */}
                    <td className="p-4">
                      {editingBusId === bus.id ? (
                        <input
                          type="text"
                          value={bus.route}
                          onChange={(e) => handleUpdateBusField(bus.id, 'route', e.target.value)}
                          className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-xs text-white w-full"
                        />
                      ) : (
                        <span className="font-medium text-slate-200">{bus.route}</span>
                      )}
                    </td>

                    {/* Current Location Stop */}
                    <td className="p-4 font-medium text-sky-400">
                      {editingBusId === bus.id ? (
                        <input
                          type="text"
                          value={bus.currentLocation}
                          onChange={(e) => handleUpdateBusField(bus.id, 'currentLocation', e.target.value)}
                          className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-xs text-sky-400"
                        />
                      ) : (
                        bus.currentLocation
                      )}
                    </td>

                    {/* Status Dropdown / Badge */}
                    <td className="p-4">
                      <select
                        value={bus.status}
                        onChange={(e) => handleUpdateBusField(bus.id, 'status', e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer font-semibold"
                      >
                        <option value="ON_ROUTE">🟢 En Route</option>
                        <option value="AT_STOP">🔵 At Stop</option>
                        <option value="MAINTENANCE">🔴 Maintenance</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingBusId(editingBusId === bus.id ? null : bus.id)}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            editingBusId === bus.id
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          }`}
                          title={editingBusId === bus.id ? "Done Editing" : "Edit Bus Details"}
                        >
                          {editingBusId === bus.id ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteBus(bus.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition-all cursor-pointer"
                          title="Remove Bus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ➕ ADD NEW BUS MODAL POPUP */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <Bus className="w-5 h-5 text-amber-400" /> Add New Campus Bus
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold uppercase mb-1">Bus ID / Label</label>
                <input
                  type="text"
                  placeholder="e.g. BUS-06"
                  value={newBus.id}
                  onChange={(e) => setNewBus({ ...newBus, id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold uppercase mb-1">Registration Tag</label>
                <input
                  type="text"
                  placeholder="e.g. KA-23-F-5012"
                  value={newBus.regNo}
                  onChange={(e) => setNewBus({ ...newBus, regNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold uppercase mb-1">Driver Name</label>
                <input
                  type="text"
                  placeholder="e.g. Anand Joshi"
                  value={newBus.driver}
                  onChange={(e) => setNewBus({ ...newBus, driver: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold uppercase mb-1">Driver Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 98000 11223"
                  value={newBus.phone}
                  onChange={(e) => setNewBus({ ...newBus, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold uppercase mb-1">Assigned Route</label>
                <input
                  type="text"
                  placeholder="e.g. Nipani Central Route Express"
                  value={newBus.route}
                  onChange={(e) => setNewBus({ ...newBus, route: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Save & Add Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}