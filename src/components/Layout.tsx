import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  PlayCircle, 
  BarChart3, 
  ShieldAlert, 
  Settings, 
  Cross, 
  Mic, 
  Menu,
  Terminal,
  Zap,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSystem } from '../context/SystemContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SidebarLink = ({ to, icon: Icon, label, alertCount }: { to: string, icon: any, label: string, alertCount?: number }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center gap-3 px-3 py-2 transition-all rounded-md group",
      isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
    )}
  >
    <Icon className="w-4 h-4" />
    <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    {alertCount !== undefined && alertCount > 0 && (
      <span className="ml-auto bg-red-600 text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold">
        {alertCount}
      </span>
    )}
  </NavLink>
);

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    patients, 
    panicMode, 
    setPanicMode, 
    alerts, 
    accuracy, 
    stressIndex,
    voiceCommsEnabled,
    setVoiceCommsEnabled,
    audioUnlocked,
    unlockAudio
  } = useSystem();
  
  const criticalCount = patients.filter(p => p.severity === 'CRITICAL' && !p.outcome).length;
  
  return (
    <div className="flex h-screen w-full bg-suraksha-bg text-slate-200 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-60 bg-suraksha-sidebar border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded flex items-center justify-center font-bold text-white shadow-lg transition-all",
            panicMode ? "bg-red-600 shadow-red-900/40 scale-110" : "bg-red-600 shadow-red-900/20"
          )}>
            <Zap className={cn("w-5 h-5", panicMode && "animate-pulse")} />
          </div>
          <h1 className="text-sm font-black tracking-widest text-white uppercase">SURAKSHA AI</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-2">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/patients" icon={Users} label="Patients" />
          <SidebarLink to="/prediction" icon={Activity} label="Prediction" />
          <SidebarLink to="/simulation" icon={PlayCircle} label="Simulation" />
          <SidebarLink to="/analytics" icon={BarChart3} label="Analytics" />
          <SidebarLink to="/resources" icon={Cross} label="Resources" />
          <SidebarLink to="/alerts" icon={ShieldAlert} label="Alerts" alertCount={alerts.length} />
          <SidebarLink to="/settings" icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto p-4 space-y-4">
          {/* Network & Swarm Status */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 space-y-2">
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <Globe className="w-3 h-3 text-blue-400" />
                 <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Mesh Network</span>
               </div>
               <span className="text-[8px] font-mono text-green-500 font-bold">STABLE</span>
             </div>
             <div className="flex justify-between items-center">
               <div className="flex items-center gap-2">
                 <Zap className="w-3 h-3 text-yellow-500" />
                 <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Swarm Sync</span>
               </div>
               <div className="flex gap-0.5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-1.5 h-3 bg-blue-500/50 rounded-[1px]" />
                  ))}
               </div>
             </div>
          </div>

          {/* Emotional AI / Stress Layer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
             <div className="flex justify-between items-center mb-2">
               <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">Stress Index</span>
               <span className={cn("text-[10px] font-mono font-bold", stressIndex > 50 ? "text-red-500" : "text-blue-500")}>
                 {stressIndex}%
               </span>
             </div>
             <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stressIndex}%` }}
                  className={cn("h-full", stressIndex > 50 ? "bg-red-500" : "bg-blue-500")}
                />
             </div>
             {panicMode && (
               <p className="text-[8px] text-red-500 font-black uppercase mt-2 animate-pulse">Critical Cognitive Load</p>
             )}
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("w-2 h-2 rounded-full", panicMode ? "bg-red-500 animate-ping" : "bg-green-500")}></div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {panicMode ? 'MANUAL_OVERRIDE' : 'System Healthy'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">ACCURACY: {accuracy.toFixed(1)}%</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-suraksha-sidebar flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-8">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Active Tactical Zone</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white uppercase italic">Sector 7 - Echo Ridge</span>
                <button 
                  onClick={() => {
                    const nextVal = !voiceCommsEnabled;
                    setVoiceCommsEnabled(nextVal);
                    if (nextVal) unlockAudio();
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all h-5",
                    voiceCommsEnabled 
                      ? (audioUnlocked ? "bg-amber-500/20 border-amber-500/50 text-amber-500" : "bg-red-500 text-white animate-pulse border-transparent")
                      : "bg-slate-800 border-slate-700 text-slate-500"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    voiceCommsEnabled && (audioUnlocked ? "bg-amber-500 animate-pulse" : "bg-white animate-pulse"),
                    !voiceCommsEnabled && "bg-slate-600"
                  )} />
                  <span className="text-[9px] font-black uppercase tracking-tighter">
                    VOICE: {voiceCommsEnabled ? (audioUnlocked ? 'ACTIVE' : 'READY') : 'OFF'}
                  </span>
                </button>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
            <div className="hidden sm:flex gap-6">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Critical Cases</span>
                <span className="text-sm font-bold text-red-500 uppercase">{criticalCount.toString().padStart(2, '0')} Cases</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Avg Response</span>
                <span className="text-sm font-bold text-blue-400 uppercase">04:12 Min</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPanicMode(!panicMode)}
              className={cn(
                "px-4 py-2 text-[11px] font-black uppercase tracking-tighter rounded-md flex items-center gap-2 transition-all",
                panicMode 
                  ? "bg-red-600 text-white animate-pulse" 
                  : "bg-slate-800/50 text-slate-400 hover:bg-red-600/20 hover:text-red-400 border border-slate-700 hover:border-red-500/50"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", panicMode ? "bg-white animate-pulse" : "bg-red-500")}></span>
              Panic Mode
            </button>
            <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
              <Mic className="w-4 h-4 text-slate-400" />
            </div>
            <div className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
              <Users className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>
      </main>
    </div>
  );
};
