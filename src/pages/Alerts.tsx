import React from 'react';
import { useSystem } from '../context/SystemContext';
import { ShieldAlert, Info, AlertTriangle, Clock, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Alerts = () => {
  const { alerts } = useSystem();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">Command Alert Center</h1>
           <p className="text-slate-400 text-sm">System notifications, critical escalations, and tactical warnings.</p>
        </div>
        <button className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2">
          <Trash2 className="w-3 h-3" /> Clear All
        </button>
      </header>

      <div className="space-y-4">
        {alerts.map((a, i) => (
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            key={a.id} 
            className={cn(
              "p-5 rounded-xl border flex gap-4 items-start relative overflow-hidden group",
              a.type === 'CRITICAL' ? "bg-red-600/5 border-red-900/30" :
              a.type === 'WARNING' ? "bg-yellow-600/5 border-yellow-900/30" : "bg-blue-600/5 border-blue-900/30"
            )}
          >
             <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-40" />
             <div className={cn(
               "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
               a.type === 'CRITICAL' ? "bg-red-500/20 text-red-500" :
               a.type === 'WARNING' ? "bg-yellow-500/20 text-yellow-500" : "bg-blue-500/20 text-blue-500"
             )}>
               {a.type === 'CRITICAL' ? <ShieldAlert className="w-5 h-5" /> : 
                a.type === 'WARNING' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
             </div>
             
             <div className="flex-1">
                <div className="flex justify-between mb-1">
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{a.type} Priority Notification</span>
                   <div className="flex items-center gap-1 text-[10px] text-slate-600 font-mono">
                      <Clock className="w-3 h-3" /> {new Date(a.timestamp).toLocaleTimeString()}
                   </div>
                </div>
                <p className="text-sm font-bold text-white tracking-tight">{a.message}</p>
                {a.patientId && (
                  <div className="mt-3 flex items-center gap-2">
                     <span className="text-[9px] font-black uppercase tracking-widest bg-slate-900 px-2 py-1 rounded border border-slate-800 text-slate-400">Target ID: {a.patientId}</span>
                     <button className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:underline">View Intel Folder</button>
                  </div>
                )}
             </div>

             <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/5 rounded text-slate-500">
               <CheckCircle className="w-4 h-4" />
             </button>
          </motion.div>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-20 bg-suraksha-sidebar border border-slate-800 rounded-2xl border-dashed">
           <CheckCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
           <p className="text-xs font-black uppercase tracking-widest text-slate-600">No Pending Alerts</p>
        </div>
      )}
    </div>
  );
};
