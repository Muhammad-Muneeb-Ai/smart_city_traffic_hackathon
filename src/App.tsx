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
    <aside className="w-64 border-r border-white/5 bg-surface-900 flex flex-col h-full sticky top-0 overflow-y-auto">
      <div className="p-8">
        <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
            <TrafficCone size={18} />
          </div>
          TrafficFlow AI
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mt-1">Admin Console</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
              active === item.id 
                ? "bg-accent/10 text-accent shadow-[inset_0_0_0_1px_rgba(0,112,235,0.2)]" 
                : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
            }`}
          >
            <item.icon size={18} className={active === item.id ? "text-accent" : "text-zinc-500 group-hover:text-zinc-300"} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg glow-primary">
          Export Reports
        </button>
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
          <button className="flex items-center gap-3 px-4 py-2 text-zinc-500 hover:text-red-400 transition-colors w-full text-left text-sm">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

const StatCard = ({ label, value, trend, icon: Icon }: { label: string, value: string, trend?: string, icon: any }) => (
  <div className="bg-surface-800 border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={48} />
    </div>
    <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
    <div className="flex items-end gap-3">
      <span className="text-3xl font-bold font-mono tracking-tight">{value}</span>
      {trend && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
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
    <div className="bg-surface-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
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
            <tr className="bg-white/[0.02] text-zinc-500 uppercase text-[10px] font-bold tracking-widest italic">
              <th className="px-6 py-4">Vehicle ID</th>
              <th className="px-6 py-4">Plate No</th>
              <th className="px-6 py-4">Classification</th>
              <th className="px-6 py-4">Detection Time</th>
              <th className="px-6 py-4">Station</th>
              <th className="px-6 py-4 text-right">Conf %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.04] cursor-pointer transition-colors group">
                <td className="px-6 py-4 font-mono text-zinc-400 group-hover:text-accent font-medium">#{log.id_full}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-surface-700 border border-white/10 rounded-md font-mono text-xs font-bold tracking-widest">
                    {log.plate}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent/40" />
                    {log.type}
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-500 text-xs">{log.timestamp}</td>
                <td className="px-6 py-4 text-zinc-400 font-medium italic font-serif opacity-70">{log.station}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`font-mono font-bold ${log.confidence > 95 ? 'text-emerald-400' : 'text-zinc-300'}`}>
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
        <header className="h-20 border-b border-white/5 bg-surface-950/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h2 className="text-lg font-bold">System Dashboard</h2>
            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <Activity size={12} className="text-emerald-500" />
                Active Processing
              </span>
              <span className="opacity-20">|</span>
              <span className="text-accent">{fps} FPS Avg</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-950 bg-surface-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://picsum.photos/seed/user${i}/32/32`} alt="user" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <VehicleDetectionTable />
            </div>
            
            <div className="lg:col-span-4 space-y-8">
              {/* Camera Preview Mock */}
              <div className="bg-surface-900 border border-white/5 p-6 rounded-2xl relative group">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <Camera size={16} />
                    Live Preview: Node-402
                  </h3>
                  <MoreVertical size={16} className="text-zinc-500" />
                </div>
                <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden relative border border-white/5">
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
              <div className="bg-surface-900 border border-white/5 p-6 rounded-2xl">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                  <Navigation size={16} />
                  Operational Topology
                </h3>
                <div className="h-48 bg-surface-950/50 flex items-center justify-center rounded-xl border border-dashed border-white/10">
                   <div className="relative">
                      <div className="w-12 h-12 bg-accent/20 rounded-full animate-ping absolute inset-0" />
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center relative shadow-lg glow-primary">
                        <Database size={20} className="text-white" />
                      </div>
                   </div>
                </div>
                <p className="text-[10px] text-zinc-500 mt-4 text-center leading-relaxed">
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
