import React, { useState, useMemo, useCallback } from 'react';
import { useSystem } from '../context/SystemContext';
import { Cross, Truck, Building2, MapPin, Activity, CheckCircle2, Navigation, X, ShieldAlert, Heart, Zap, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Resource, Patient } from '../types';

interface ResourceCardProps {
  resource: Resource;
  onAssignTap: () => void;
}
const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onAssignTap }) => {
  const isAvailable = resource.status === 'AVAILABLE';
  const isOccupied = resource.status === 'OCCUPIED';
  const isStandby = resource.status === 'STANDBY';

  return (
    <div className="bg-suraksha-card border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center">
          {resource.type === 'AMBULANCE' && <Truck className="w-6 h-6 text-blue-400" />}
          {resource.type === 'MEDIC_TEAM' && <Activity className="w-6 h-6 text-purple-400" />}
          {resource.type === 'HOSPITAL' && <Building2 className="w-6 h-6 text-green-400" />}
        </div>
        <div className={cn(
          "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border",
          isAvailable ? "bg-green-500/10 border-green-500/30 text-green-500" :
          isOccupied ? "bg-red-500/10 border-red-500/30 text-red-500" :
          "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
        )}>
          {resource.status}
        </div>
      </div>

      <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">{resource.name}</h3>
      <div className="flex items-center gap-1 text-slate-500 mb-4">
         <MapPin className="w-3 h-3" />
         <span className="text-[10px] font-mono tracking-tighter">Loc: {resource.location[0].toFixed(3)}, {resource.location[1].toFixed(3)}</span>
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-800/50">
         {isOccupied ? (
           <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold">
             <Navigation className="w-3 h-3 animate-pulse" /> TARGET: Sector 7 (Delta-902)
           </div>
         ) : (
           <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
             <CheckCircle2 className="w-3 h-3" /> Ready for dispatch
           </div>
         )}
         <button 
           onClick={onAssignTap}
           className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all mt-2"
         >
            {isOccupied ? 'Reassign Unit' : 'Dispatch Unit'}
         </button>
      </div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export const ResourceManagement = () => {
  const { resources, patients, updatePatient, updateResource, addAlert } = useSystem();
  const [assigningResourceId, setAssigningResourceId] = useState<string | null>(null);

  const selectedResource = useMemo(() => 
    resources.find(r => r.id === assigningResourceId),
    [resources, assigningResourceId]
  );

  const availablePatients = useMemo(() => 
    patients.filter(p => !p.outcome && p.status !== 'TREATED' && p.status !== 'EN_ROUTE'),
    [patients]
  );

  const recommendedPatients = useMemo(() => {
    if (!selectedResource) return [];
    
    return [...availablePatients].sort((a, b) => {
      // Prioritize severity
      const sevMap: Record<string, number> = { CRITICAL: 4, SEVERE: 3, MODERATE: 2, STABLE: 1 };
      const sevDiff = sevMap[b.severity] - sevMap[a.severity];
      if (sevDiff !== 0) return sevDiff;

      // Then proximity
      const distA = Math.sqrt(
        Math.pow(a.location[0] - selectedResource.location[0], 2) + 
        Math.pow(a.location[1] - selectedResource.location[1], 2)
      );
      const distB = Math.sqrt(
        Math.pow(b.location[0] - selectedResource.location[0], 2) + 
        Math.pow(b.location[1] - selectedResource.location[1], 2)
      );
      return distA - distB;
    });
  }, [availablePatients, selectedResource]);

  const handleAssign = useCallback((patientId: string) => {
    if (!assigningResourceId) return;
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    updateResource(assigningResourceId, { status: 'OCCUPIED' });
    updatePatient(patientId, { status: 'EN_ROUTE' });
    
    addAlert({
      type: 'INFO',
      message: `${selectedResource?.name} dispatched to ${patient.name} (${patient.id})`,
      patientId: patientId
    });

    setAssigningResourceId(null);
  }, [assigningResourceId, patients, updateResource, updatePatient, addAlert, selectedResource]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 relative">
      <header className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter"> Fleet & Asset Management </h1>
           <p className="text-slate-400 text-sm"> Real-time resource tracking and AI-assisted dispatch optimization. </p>
        </div>
        <div className="bg-blue-600/10 border border-blue-500/30 p-4 rounded-xl flex items-center gap-4 max-w-sm">
           <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
           <p className="text-[10px] text-blue-100 leading-tight">
             <span className="font-black">Command Suggestion:</span> Assign <span className="font-black underline">Ambulance 02</span> to <span className="font-black text-red-500">CRITICAL Patient 902</span> immediately for maximum survival probability.
           </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((r) => (
          <ResourceCard 
            key={r.id} 
            resource={r} 
            onAssignTap={() => setAssigningResourceId(r.id)}
          />
        ))}
      </div>

      <AnimatePresence>
        {assigningResourceId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssigningResourceId(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Dispatch Optimization</h2>
                  <p className="text-xs text-slate-500">Selecting target for <span className="text-blue-400 font-bold">{selectedResource?.name}</span></p>
                </div>
                <button onClick={() => setAssigningResourceId(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {recommendedPatients.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No pending casualties detected</p>
                  </div>
                ) : (
                  recommendedPatients.map((p, idx) => (
                    <motion.div 
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleAssign(p.id)}
                      className="group flex items-center gap-4 p-4 bg-slate-800/40 border border-slate-800 rounded-xl hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center border",
                        p.severity === 'CRITICAL' ? "bg-red-500/10 border-red-500/30 text-red-500" :
                        p.severity === 'SEVERE' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                        "bg-blue-500/10 border-blue-500/30 text-blue-500"
                      )}>
                        <User className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-bold text-white uppercase tracking-tight">{p.name || `SOLDIER ${p.id}`}</span>
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest border",
                            p.severity === 'CRITICAL' ? "bg-red-500 text-white border-transparent pulse" :
                            p.severity === 'SEVERE' ? "bg-amber-500/20 border-amber-500/50 text-amber-500" :
                            "bg-blue-500/20 border-blue-500/50 text-blue-500"
                          )}>
                            {p.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-mono">
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> {p.predictedSurvivalMinutes.toFixed(1)}m LIMIT</span>
                          <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {
                            (Math.sqrt(
                              Math.pow(p.location[0] - (selectedResource?.location[0] || 0), 2) + 
                              Math.pow(p.location[1] - (selectedResource?.location[1] || 0), 2)
                            ) * 100).toFixed(1)
                          }km</span>
                        </div>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-all">
                        <div className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-900/50">
                          Dispatch
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="bg-suraksha-sidebar border border-slate-800 rounded-2xl p-8 text-center border-dashed">
         <PlusIcon className="w-12 h-12 text-slate-700 mx-auto mb-4" />
         <h4 className="text-sm font-black uppercase text-slate-500 tracking-widest">Register New Tactical Asset</h4>
         <p className="text-xs text-slate-600 mt-1">Add medical teams, evacuation air-frames, or mobile clinics.</p>
      </div>
    </div>
  );
};

const PlusIcon = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);
