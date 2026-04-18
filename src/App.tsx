/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { 
  Activity, 
  BarChart3, 
  Camera, 
  Car, 
  Clock, 
  Database, 
  LayoutDashboard, 
  LogOut, 
  Map as MapIcon, 
  Menu, 
  MoreVertical, 
  Navigation, 
  Settings, 
  ShieldCheck, 
  TrafficCone,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// --- Types ---
type NavItem = "overview" | "analytics" | "health" | "config" | "map";

interface VehicleLog {
  id: string;
  plate: string;
  type: "Car" | "Bike" | "Bus" | "Truck";
  timestamp: string;
  station: string;
  confidence: number;
}

// --- Components ---

const Sidebar = ({ active, setActive }: { active: NavItem, setActive: (v: NavItem) => void }) => {
  const items = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "analytics", label: "Advanced Analytics", icon: BarChart3 },
    { id: "health", label: "System Health", icon: Zap },
    { id: "config", label: "Node Configuration", icon: Settings },
    { id: "map", label: "Traffic Map View", icon: MapIcon },
  ] as const;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-full sticky top-0 overflow-y-auto">
      <div className="p-8">
        <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
            <TrafficCone size={18} />
          </div>
          TrafficFlow AI
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Admin Console</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
              active === item.id 
                ? "bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(0,88,188,0.2)]" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <item.icon size={18} className={active === item.id ? "text-accent" : "text-slate-400 group-hover:text-slate-600"} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest">Connectivity</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">FastAPI Instance</span>
              <span className="text-emerald-600 font-bold">READY</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-500">SQLite DB</span>
              <span className="text-emerald-600 font-bold">CONNECTED</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => {
            alert("Generating System Report... The CSV export will download from the Streamlit backend shortly.");
          }}
          className="w-full bg-accent hover:bg-accent-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg glow-accent active:scale-95"
        >
          Export Reports
        </button>
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
          <button className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-red-500 transition-colors w-full text-left text-sm">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

const StatCard = ({ label, value, trend, icon: Icon }: { label: string, value: string, trend?: string, icon: any }) => (
  <div className="stitch-card p-6 relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={48} />
    </div>
    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
    <div className="flex items-end gap-3">
      <span className="text-3xl font-bold font-mono tracking-tight text-slate-800">{value}</span>
      {trend && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      )}
    </div>
  </div>
);

const VehicleDetectionTable = () => {
  const [logs] = useState<VehicleLog[]>([
    { id: "1", id_full: "LV-9021", plate: "KRT-9201", type: "Car", timestamp: "12:44:59", station: "Node-402", confidence: 98.5 },
    { id: "2", id_full: "LV-9022", plate: "BZT-1102", type: "Truck", timestamp: "12:45:12", station: "Node-402", confidence: 94.2 },
    { id: "3", id_full: "LV-9023", plate: "MTR-4451", type: "Bike", timestamp: "12:45:30", station: "Node-399", confidence: 88.7 },
    { id: "4", id_full: "LV-9024", plate: "BUS-0012", type: "Bus", timestamp: "12:46:05", station: "Node-401", confidence: 96.1 },
  ] as any[]);

  return (
    <div className="stitch-card overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2 text-slate-800">
          <Car size={18} className="text-accent" />
          Live Detection Stream
        </h3>
        <span className="text-[10px] font-bold text-accent animate-pulse flex items-center gap-1.5 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
          Realtime Feed
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest italic">
              <th className="px-6 py-4">Vehicle ID</th>
              <th className="px-6 py-4">Plate No</th>
              <th className="px-6 py-4">Classification</th>
              <th className="px-6 py-4">Detection Time</th>
              <th className="px-6 py-4">Station</th>
              <th className="px-6 py-4 text-right">Conf %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                <td className="px-6 py-4 font-mono text-slate-500 group-hover:text-accent font-medium">#{log.id_full}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold tracking-widest text-slate-700 shadow-sm">
                    {log.plate}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-accent/20" />
                    {log.type}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400 text-xs">{log.timestamp}</td>
                <td className="px-6 py-4 text-slate-500 font-medium italic font-serif ">{log.station}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-mono font-bold ${log.confidence > 95 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {log.confidence.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<NavItem>("overview");
  const [fps, setFps] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFps(Math.floor(28 + Math.random() * 4));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen technical-grid">
      <Sidebar active={activeTab} setActive={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-lg font-bold text-slate-800">System Dashboard</h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Activity size={12} className="text-emerald-500" />
                Active Processing
              </span>
              <span className="opacity-20 text-slate-200">|</span>
              <span className="text-accent">{fps} FPS Avg</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/32/32`} alt="user" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard label="Total Vehicle Volume" value="1.24M" trend="+8.4%" icon={Car} />
                  <StatCard label="Avg Wait Time" value="4m 12s" trend="-2.1%" icon={Clock} />
                  <StatCard label="Critical Alerts" value="03" trend="0" icon={ShieldCheck} />
                  <StatCard label="System Uptime" value="99.8%" icon={Zap} />
                </section>

                <div className="stitch-card p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-sm tracking-tight flex items-center gap-2 text-slate-800">
                      <BarChart3 size={16} className="text-accent" />
                      Virtual Line Crossing Counters (Current Session)
                    </h3>
                    <div className="text-[10px] bg-slate-50 px-2 py-1 rounded text-slate-400 font-mono border border-slate-100">Line Y=480</div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Cars", val: 842, color: "text-blue-600" },
                      { label: "Bikes", val: 124, color: "text-amber-600" },
                      { label: "Buses", val: 42, color: "text-emerald-600" },
                      { label: "Trucks", val: 89, color: "text-purple-600" }
                    ].map(stat => (
                      <div key={stat.label} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-tight">{stat.label}</p>
                        <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-8">
                    <VehicleDetectionTable />
                    <div className="stitch-card p-8 technical-grid">
                      <h3 className="text-xl font-bold tracking-tight text-slate-800 mb-4">Realtime Stream: Node-402</h3>
                      <div className="aspect-video bg-black rounded-2xl flex items-center justify-center text-slate-500 font-mono text-xs">
                         [ ACTIVE_OPENCV_SURFACE ]
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-4 space-y-8">
                    <div className="stitch-card p-6">
                      <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-800">
                        <Navigation size={16} /> Operational Topology
                      </h3>
                      <div className="h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="stitch-card p-12 text-center space-y-4">
                   <BarChart3 className="mx-auto text-accent" size={48} />
                   <h2 className="text-2xl font-bold">Advanced Analytics Visual Spec</h2>
                   <p className="text-slate-500 max-w-md mx-auto">This view represents the 1_Advanced_Analytics.py Streamlit page. It features peak-hour heatmaps and long-term trend analysis.</p>
                   <div className="aspect-[21/9] bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-center italic text-slate-400">
                      [ Interactive Plotly Layer Mock ]
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "health" && (
              <motion.div key="health" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="font-bold text-lg">System Infrastructure Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="stitch-card p-6">
                      <p className="text-[10px] uppercase font-bold text-slate-400">YOLO Cluster</p>
                      <p className="text-xl font-bold text-emerald-600 mt-2">Active (45ms)</p>
                   </div>
                   <div className="stitch-card p-6">
                      <p className="text-[10px] uppercase font-bold text-slate-400">OCR Hub</p>
                      <p className="text-xl font-bold text-emerald-600 mt-2">Healthy</p>
                   </div>
                   <div className="stitch-card p-6">
                      <p className="text-[10px] uppercase font-bold text-slate-400">SQLite Node</p>
                      <p className="text-xl font-bold text-amber-600 mt-2">I/O Pressure: Low</p>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "config" && (
              <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="stitch-card p-12 text-center">
                   <Settings className="mx-auto text-slate-400 mb-4" size={48} />
                   <h3 className="text-xl font-bold">Node Settings Configuration</h3>
                   <div className="mt-8 space-y-4 max-w-sm mx-auto text-left">
                      <div className="h-4 w-full bg-slate-100 rounded" />
                      <div className="h-4 w-3/4 bg-slate-100 rounded" />
                      <div className="h-4 w-full bg-slate-100 rounded" />
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "map" && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center stitch-card border-accent/20">
                 <MapIcon className="mx-auto text-accent mb-4" size={48} />
                 <h2 className="text-xl font-bold italic font-serif">City Node GIS Overlay</h2>
                 <p className="text-slate-400 text-sm mt-2">Real-time geographic distribution of active camera nodes.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
