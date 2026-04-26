import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Car, 
  Database, 
  Eye, 
  FileText, 
  History, 
  LayoutDashboard, 
  Settings, 
  ShieldCheck, 
  Truck, 
  AlertTriangle,
  Play,
  Pause,
  Upload,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const MOCK_STATS = [
  { time: '08:00', vehicles: 45 },
  { time: '09:00', vehicles: 82 },
  { time: '10:00', vehicles: 120 },
  { time: '11:00', vehicles: 95 },
  { time: '12:00', vehicles: 110 },
  { time: '13:00', vehicles: 135 },
  { time: '14:00', vehicles: 105 },
];

const MOCK_LOGS = [
  { id: 1, type: 'Car', plate: 'BC-1234', time: '14:23:45', confidence: '0.98' },
  { id: 2, type: 'Truck', plate: 'TX-9876', time: '14:21:12', confidence: '0.94' },
  { id: 3, type: 'Car', plate: 'K-67891', time: '14:18:33', confidence: '0.99' },
  { id: 4, type: 'Van', plate: 'NY-4422', time: '14:15:01', confidence: '0.88' },
];

const App = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState(MOCK_LOGS);

  // Simulate incoming logs
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        type: Math.random() > 0.3 ? 'Car' : 'Truck',
        plate: `${['A','K','TX','NY'][Math.floor(Math.random()*4)]}-${Math.floor(Math.random()*9000)+1000}`,
        time: new Date().toLocaleTimeString(),
        confidence: (Math.random() * 0.2 + 0.8).toFixed(2),
      };
      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#141414] text-white flex flex-col p-6 gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ff4b4b] rounded-lg flex items-center justify-center">
            <Activity className="text-white" size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">TRAFFICFLOW AI</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<BarChart3 size={18} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <NavItem icon={<History size={18} />} label="Logs History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <NavItem icon={<ShieldCheck size={18} />} label="System Health" active={activeTab === 'health'} onClick={() => setActiveTab('health')} />
          <NavItem icon={<Settings size={18} />} label="Config" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
        </nav>

        <div className="bg-white/10 p-4 rounded-xl">
          <p className="text-xs opacity-50 uppercase font-bold mb-2">Node Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#F0EFEC] overflow-y-auto">
        {/* Header */}
        <header className="h-20 border-b border-black/5 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-sm text-black/50">
            <LayoutDashboard size={14} />
            <span>/ Dashboard / Live Monitor</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/80 transition-colors">
              <Upload size={16} />
              New Feed
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 flex flex-col gap-8 max-w-[1600px] w-full mx-auto">
          {/* KPI Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Eye className="text-blue-500" />} label="Live Count" value="1,284" subValue="+12% from avg" />
            <StatCard icon={<Car className="text-green-500" />} label="Avg Speed" value="48 km/h" subValue="Flow: Stable" />
            <StatCard icon={<Database className="text-purple-500" />} label="Plates Detected" value="954" subValue="99.2% Accuracy" />
            <StatCard icon={<AlertTriangle className="text-orange-500" />} label="Active Alerts" value="2" subValue="Low Intensity" />
          </section>

          {/* Video & Controls Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group">
                <img 
                  src="https://picsum.photos/seed/traffic/1200/800" 
                  className="w-full h-full object-cover opacity-70 grayscale-[0.3]" 
                  alt="Traffic Feed"
                />
                
                {/* YOLO Bounding Box Overlays (Decorative) */}
                <div className="absolute top-[30%] left-[40%] w-32 h-24 border-2 border-green-500/80 rounded flex flex-col items-start p-1">
                  <span className="bg-green-500 text-white text-[10px] px-1 font-bold">CAR 0.98</span>
                </div>
                <div className="absolute top-[60%] left-[10%] w-48 h-32 border-2 border-yellow-500/80 rounded flex flex-col items-start p-1">
                  <span className="bg-yellow-500 text-white text-[10px] px-1 font-bold">TRUCK 0.94</span>
                </div>
                
                {/* Tracking Line */}
                <div className="absolute top-[75%] left-0 w-full h-[2px] bg-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  <div className="absolute -top-2 left-4 px-2 bg-red-500 text-white text-[10px] font-bold rounded">VIRTUAL DETECTION LINE</div>
                </div>

                {/* Video Controls Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-2 px-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="text-white hover:text-[#ff4b4b]" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                  </button>
                  <div className="h-4 w-[1px] bg-white/20" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white font-mono uppercase tracking-widest">LIVE RELAY // 1080P // 30FPS</span>
                  </div>
                </div>
              </div>
              
              <div className="glass-card p-6 flex items-center justify-between">
                <div className="flex gap-8">
                  <div className="flex flex-col">
                    <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Confidence Threshold</span>
                    <span className="text-lg font-mono">0.45</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-black/40 font-bold uppercase tracking-wider">Detection Rate</span>
                    <span className="text-lg font-mono">842ms</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-[#ff4b4b] font-bold text-sm tracking-tight hover:underline">
                  <RefreshCw size={14} />
                  RECALIBRATE SENSORS
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-card p-6 flex-grow flex flex-col">
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-black/40 mb-6 flex items-center gap-2">
                  <Activity size={16} />
                  Vehicle Flow History
                </h3>
                <div className="flex-grow h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_STATS}>
                      <defs>
                        <linearGradient id="colorVeh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff4b4b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#ff4b4b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141408" />
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="vehicles" stroke="#ff4b4b" strokeWidth={2} fillOpacity={1} fill="url(#colorVeh)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="glass-card p-6 h-full overflow-hidden flex flex-col">
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-black/40 mb-6 flex items-center justify-between">
                  <span className="flex items-center gap-2"><FileText size={16} /> Live Data Stream</span>
                  <span className="text-green-500 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500" /> SYNC</span>
                </h3>
                <div className="flex flex-col gap-3 overflow-y-auto pr-2">
                  <AnimatePresence>
                    {logs.map((log) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={log.id} 
                        className="flex items-center justify-between p-3 rounded-lg border border-black/5 hover:bg-black/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${log.type === 'Car' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                            {log.type === 'Car' ? <Car size={16} /> : <Truck size={16} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold leading-none mb-1 uppercase tracking-tight">{log.plate}</p>
                            <p className="text-[10px] text-black/40 font-medium">DETECTED @ {log.time}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-black/5 rounded">{log.confidence}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active ? 'bg-[#ff4b4b] text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-white/30 group-hover:text-white'}`}>{icon}</div>
    <span className="font-bold tracking-tight text-sm uppercase">{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, subValue }: any) => (
  <div className="glass-card p-6 group hover:translate-y-[-4px] transition-transform duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-black/[0.03] flex items-center justify-center">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-black/30 bg-black/[0.03] px-2 py-1 rounded-full uppercase tracking-widest leading-none">REAL-TIME</span>
    </div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <h4 className="text-2xl font-bold tracking-tighter">{value}</h4>
      <span className="text-[10px] font-semibold text-black/60">{subValue}</span>
    </div>
  </div>
);

export default App;
