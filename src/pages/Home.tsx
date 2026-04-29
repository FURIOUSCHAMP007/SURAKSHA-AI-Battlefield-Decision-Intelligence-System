import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Activity, 
  Users, 
  Zap, 
  Terminal, 
  Globe, 
  HeartPulse, 
  ChevronRight,
  Cpu,
  Database,
  Layers,
  Map as MapIcon,
  BarChart3,
  Flame
} from 'lucide-react';
import { motion } from 'motion/react';

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-suraksha-sidebar border border-slate-800 p-6 rounded-2xl relative overflow-hidden group"
  >
    <div className="absolute top-0 left-0 w-1 h-full bg-red-600 transition-all duration-300 transform -translate-x-full group-hover:translate-x-0" />
    <Icon className="w-10 h-10 text-red-500 mb-6" />
    <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export const Home = () => {
  return (
    <div className="min-h-screen bg-suraksha-bg relative overflow-x-hidden">
      {/* Background Grids */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[#0c0c0e] opacity-40 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(#222 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-[.2em] mb-8"
        >
          <Zap className="w-3 h-3 animate-pulse" /> Battlefield Intelligence Systems v2.4.0
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase mb-6 leading-[0.9]"
        >
          SURAKSHA <span className="text-red-600">AI</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Predict. Prioritize. Save—when every second decides survival.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-6"
        >
          <Link to="/dashboard" className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-full transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] flex items-center gap-2 group">
            Launch Dashboard <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/simulation" className="px-8 py-4 bg-transparent hover:bg-white/5 border border-slate-700 text-white font-black uppercase tracking-widest rounded-full transition-all">
            Run Simulation
          </Link>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-800 bg-suraksha-sidebar/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Survival Rate Increase', val: '+42%' },
              { label: 'Avg Triage Time', val: '< 15s' },
              { label: 'Units Deployed', val: '1.2k' },
              { label: 'AI Accuracy', val: '99.4%' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-4xl font-black text-white italic mb-1">{s.val}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{s.label}</p>
              </div>
            ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Tactical Intelligence Capabilities</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Advanced medical logistics powered by explainable neural networks and real-time telemetry.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Activity} 
            title="Adaptive Triage" 
            desc="Self-learning algorithm that adjusts severity scoring based on ambient field conditions and resource load." 
          />
          <FeatureCard 
            icon={Shield} 
            title="Panic Mode" 
            desc="One-tap switch to high-contrast, binary YES/NO decision flows for medics under extreme cognitive load." 
          />
          <FeatureCard 
            icon={Terminal} 
            title="Explainable AI" 
            desc="Transparent logic trace for every triage decision, showing exactly which vital markers drove the prediction." 
          />
          <FeatureCard 
            icon={Globe} 
            title="Offline Ops" 
            desc="Full decentralized capability. Local server sync allows command and control without cloud dependencies." 
          />
          <FeatureCard 
            icon={HeartPulse} 
            title="Survival Engine" 
            desc="Proprietary time-to-death modeling provides dynamic rescue windows for rapid casualty prioritization." 
          />
          <FeatureCard 
            icon={Users} 
            title="Fleet Sync" 
            desc="Automatic ambulance and med-evac re-tasking based on emerging critical casualty clusters." 
          />
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-32 border-t border-slate-800 bg-black/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-4">Hardened Tech Stack</h2>
              <p className="text-slate-400">The SURAKSHA AI platform is built on modern, high-concurrency frameworks designed for zero-latency medical decision support.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-500">
               <span className="w-12 h-px bg-slate-800"></span>
               Core Infrastructure
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'React 18', icon: Layers, color: 'text-blue-400', desc: 'Reactive UI Component Architecture' },
              { name: 'Gemini 1.5', icon: Cpu, color: 'text-red-500', desc: 'Predictive Triage Intelligence' },
              { name: 'Tailwind V4', icon: Flame, color: 'text-orange-400', desc: 'Hardware-Accelerated Styling' },
              { name: 'Leaflet Engine', icon: MapIcon, color: 'text-green-500', desc: 'Tactical Geospatial Tracking' },
              { name: 'Recharts Pro', icon: BarChart3, color: 'text-purple-400', desc: 'Vitals Analytics Pipeline' },
              { name: 'Motion', icon: Zap, color: 'text-yellow-400', desc: 'Fluid HUD Interaction' },
            ].map((tech, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-suraksha-sidebar/50 border border-slate-800 p-6 rounded-xl hover:bg-slate-800/50 transition-all group"
              >
                <tech.icon className={`w-8 h-8 ${tech.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h4 className="text-sm font-black text-white uppercase mb-2">{tech.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase leading-tight">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer-like CTA */}
      <footer className="py-20 border-t border-slate-800 text-center">
         <p className="text-[10px] text-slate-600 font-black uppercase tracking-[.4em] mb-4">Command Center Terminal</p>
         <div className="text-slate-400 text-xs">
           © 2026 SURAKSHA AI. ALL RIGHTS RESERVED. SECURED PROTOCOL V2.4
         </div>
      </footer>
    </div>
  );
};
