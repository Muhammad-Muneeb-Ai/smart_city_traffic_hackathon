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
type NavItem = "overview" | "nodes" | "logs" | "analytics" | "health";

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
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "nodes", label: "Traffic Nodes", icon: Camera },
    { id: "logs", label: "Vehicle Logs", icon: Car },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "health", label: "System Health", icon: Zap },
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
        
        <button className="w-full bg-accent hover:bg-accent-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg glow-accent">
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
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Total Vehicle Volume" value="1.24M" trend="+8.4%" icon={Car} />
            <StatCard label="Avg Wait Time" value="4m 12s" trend="-2.1%" icon={Clock} />
            <StatCard label="Critical Alerts" value="03" trend="0" icon={ShieldCheck} />
            <StatCard label="System Uptime" value="99.8%" icon={Zap} />
          </section>

          {/* New Crossing counters section */}
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
              
              {/* Detailed LPR Analysis View */}
              <div className="stitch-card p-8 technical-grid">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-slate-800">Active LPR Analysis: KRT-9201</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status: Processing OCR Layer</p>
                  </div>
                  <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">
                    High Confidence Match: 98.5%
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest italic">License Plate Region (Cropped)</p>
                    <div className="aspect-[3/1] bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-4 overflow-hidden relative group">
                      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="text-4xl font-black font-mono tracking-[0.2em] text-slate-800 drop-shadow-sm">KRT 9201</div>
                      <div className="absolute inset-0 border-[1px] border-emerald-500/20 m-2 rounded-lg pointer-events-none" />
                    </div>
                    <div className="flex gap-2">
                       {['OCR_OK', 'STATE_CA', 'BATCH_49'].map(t => (
                         <span key={t} className="px-2 py-0.5 bg-white rounded text-[8px] font-mono text-slate-400 border border-slate-200 shadow-sm">{t}</span>
                       ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Make", val: "Tesla" },
                      { label: "Model", val: "Model 3" },
                      { label: "Color", val: "White" },
                      { label: "State", val: "California" }
                    ].map(field => (
                      <div key={field.label} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{field.label}</p>
                        <p className="text-sm font-semibold text-slate-700">{field.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-8">
              {/* Camera Preview Mock */}
              <div className="stitch-card p-6 relative group">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-slate-800">
                    <Camera size={16} />
                    Live Preview: Node-402
                  </h3>
                  <MoreVertical size={16} className="text-slate-400" />
                </div>
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200">
                  <img 
                    src="https://picsum.photos/seed/traffic/640/360" 
                    alt="traffic-preview" 
                    className="w-full h-full object-cover opacity-60 contrast-125"
                    referrerPolicy="no-referrer" 
                  />
                  <div className="absolute inset-0 border-[2px] border-accent/40 m-6 rounded-lg">
                    <div className="absolute top-0 left-0 bg-accent text-white text-[8px] font-bold px-1 py-0.5 -mt-2 -ml-2">
                      VEHICLE_98.5%
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 text-[8px] font-mono text-white/50 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                    42.1009° N, 71.0112° W
                  </div>
                </div>
              </div>

              {/* Network Graph Placeholder */}
              <div className="stitch-card p-6">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-slate-800">
                  <Navigation size={16} />
                  Operational Topology
                </h3>
                <div className="h-48 bg-slate-50 flex items-center justify-center rounded-xl border border-dashed border-slate-200 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-10 technical-grid" />
                   <div className="relative">
                      <div className="w-12 h-12 bg-accent/20 rounded-full animate-ping absolute inset-0" />
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center relative shadow-lg glow-accent">
                        <Database size={20} className="text-white" />
                      </div>
                   </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-4 text-center leading-relaxed font-medium">
                  Deep Packet Inspection (DPI) active across all grid nodes in the North Sector.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
