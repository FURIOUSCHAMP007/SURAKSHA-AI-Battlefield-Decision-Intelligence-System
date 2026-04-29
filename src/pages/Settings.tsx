import React from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Settings as SettingsIcon, 
  Database, 
  Cpu, 
  Globe, 
  Shield, 
  Bell, 
  Monitor,
  CheckCircle2,
  AlertCircle,
  Package,
  Zap,
  Radio
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ModuleCardProps {
  name: string;
  desc: string;
  status: 'ACTIVE' | 'STANDBY' | 'ERROR';
  version: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ name, desc, status, version }) => (
  <div className="bg-suraksha-card border border-slate-800 rounded-xl p-4 flex items-start gap-4 hover:bg-slate-800/30 transition-all group">
    <div className={cn(
      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
      status === 'ACTIVE' ? "bg-green-600/10 text-green-500" :
      status === 'STANDBY' ? "bg-blue-600/10 text-blue-400" : "bg-red-600/10 text-red-500"
    )}>
       <Package className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
       <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-black text-white uppercase truncate">{name}</h4>
          <span className="text-[10px] font-mono text-slate-600">{version}</span>
       </div>
       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight line-clamp-1 mb-2">{desc}</p>
       <div className="flex items-center gap-2">
          <div className={cn("w-1.5 h-1.5 rounded-full", status === 'ACTIVE' ? "bg-green-500 animate-pulse" : status === 'STANDBY' ? "bg-blue-500" : "bg-red-500")} />
          <span className="text-[9px] font-black uppercase text-slate-400">{status}</span>
       </div>
    </div>
  </div>
);

export const Settings = () => {
  const { tacticalContext, setTacticalContext, panicMode } = useSystem();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3 italic">
          <SettingsIcon className="w-8 h-8 text-blue-500" /> System Protocols
        </h1>
        <p className="text-slate-400 text-sm font-medium">SURAKSHA AI // Hardware Layer & Modular Integration Control.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Core Config */}
        <div className="lg:col-span-4 space-y-8">
           <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[.3em] text-slate-600 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Security Environment
              </h3>
              <div className="space-y-2">
                 {[
                   { l: 'Battlefield', v: 'BATTLEFIELD', desc: 'Max prioritization, zero latency, local compute.' },
                   { l: 'Disaster', v: 'DISASTER', desc: 'Swarm coordination active, mesh network priority.' },
                   { l: 'Clinical', v: 'HOSPITAL', desc: 'Standard protocols, backend hospital sync active.' },
                 ].map((opt) => (
                   <button 
                      key={opt.v}
                      onClick={() => setTacticalContext(opt.v as any)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border transition-all",
                        tacticalContext === opt.v 
                          ? "bg-blue-600/10 border-blue-500/50 text-white" 
                          : "bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700"
                      )}
                   >
                      <h4 className="text-xs font-black uppercase mb-1">{opt.l} Mode</h4>
                      <p className="text-[10px] opacity-70 leading-tight">{opt.desc}</p>
                   </button>
                 ))}
              </div>
           </section>

           <section className="space-y-4">
             <h3 className="text-xs font-black uppercase tracking-[.3em] text-slate-600 flex items-center gap-2">
                <Radio className="w-4 h-4" /> Cognitive Hardware
              </h3>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                 <div>
                    <span className="text-[10px] font-black uppercase text-white block mb-1">Auto-Panic Sensors</span>
                    <p className="text-[9px] text-slate-500">Detect user stress levels automatically.</p>
                 </div>
                 <div className="w-10 h-5 bg-blue-600 rounded-full flex items-center px-1">
                    <div className="w-3 h-3 bg-white rounded-full ml-auto shadow-sm"></div>
                 </div>
              </div>
           </section>
        </div>

        {/* Modules Grid */}
        <div className="lg:col-span-8 space-y-8">
           <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-xs font-black uppercase tracking-[.3em] text-slate-600 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Modular Plug-and-Play System
                </h3>
                <span className="text-[10px] font-black bg-blue-600/10 text-blue-400 px-2 py-1 rounded">V4.2.0-STABLE</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <ModuleCard 
                    name="Swarm-Link Drone" 
                    desc="Real-time aerial reconnaissance and casualty tracking." 
                    status="ACTIVE" 
                    version="v1.2.4"
                 />
                 <ModuleCard 
                    name="Bio-Vest Sync" 
                    desc="Direct telemetry infusion from soldier wearables." 
                    status="STANDBY" 
                    version="v0.9.8"
                 />
                 <ModuleCard 
                    name="Hospital Bridge" 
                    desc="Secure HL7/FHIR tunnel to Tier 1 medical centers." 
                    status="ACTIVE" 
                    version="v2.1.0"
                 />
                 <ModuleCard 
                    name="Mesh LoRa Unit" 
                    desc="Long-range offline communication and positioning." 
                    status="ERROR" 
                    version="v1.0.2"
                 />
                 <ModuleCard 
                    name="Eye-Track HUD" 
                    desc="Visual triage automation via AR/VR optics." 
                    status="STANDBY" 
                    version="v0.5.4"
                 />
                  <div className="border border-dashed border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center opacity-40 hover:opacity-100 transition-opacity cursor-pointer group">
                    <Zap className="w-5 h-5 text-slate-600 mb-2 group-hover:text-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Connect New Module</span>
                  </div>
              </div>
           </section>

           <section className="bg-suraksha-card border border-slate-800 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
              <div className="relative z-10 space-y-6">
                 <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">Zero-Trust Audit Trail</h3>
                    <p className="text-xs text-slate-500 italic max-w-lg">Every decision, override, and triage transition is cryptographically signed and logged for the After Action Review (AAR) cycle.</p>
                 </div>
                 <div className="flex gap-4">
                    <button className="px-6 py-2 bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-slate-700">Export Deployment Log</button>
                    <button className="px-6 py-2 border border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:text-white hover:border-slate-500">View Data Integrity Status</button>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};
