import React, { useState, useMemo, useCallback } from 'react';
import { useSystem } from '../context/SystemContext';
import { Search, Filter, MoreVertical, MessageSquare, User, Activity, Droplets, CheckSquare, Square, Check, Users, Trash2, Save, X, HeartPulse, Brain } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Vitals } from '../types';

export const PatientManagement = () => {
  const { patients, updatePatient } = useSystem();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [editVitals, setEditVitals] = useState<Vitals | null>(null);
  const [filters, setFilters] = useState({
    fitness: 'ALL',
    ageRange: 'ALL',
    bloodType: 'ALL'
  });

  const bloodTypes = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const fitnessLevels = ['ALL', 'ELITE', 'STANDARD', 'LOW'];
  const ageRanges = [
    { label: 'ALL', value: 'ALL' },
    { label: '18-25', min: 18, max: 25 },
    { label: '26-35', min: 26, max: 35 },
    { label: '36-45', min: 36, max: 45 },
    { label: '46+', min: 46, max: 120 }
  ];

  const filteredPatients = useMemo(() => patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFitness = filters.fitness === 'ALL' || p.history.fitnessLevel === filters.fitness;
    
    const matchesBlood = filters.bloodType === 'ALL' || p.history.bloodType === filters.bloodType;
    
    let matchesAge = true;
    if (filters.ageRange !== 'ALL') {
      const range = ageRanges.find(r => r.label === filters.ageRange);
      if (range && range.min !== undefined) {
        matchesAge = p.history.age >= range.min && p.history.age <= (range.max || 120);
      }
    }

    return matchesSearch && matchesFitness && matchesBlood && matchesAge;
  }), [patients, searchTerm, filters]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredPatients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredPatients.map(p => p.id));
    }
  }, [filteredPatients, selectedIds.length]);

  const handleBulkStatusUpdate = useCallback((status: 'TREATED' | 'EN_ROUTE') => {
    selectedIds.forEach(id => {
      updatePatient(id, { status });
    });
    setSelectedIds([]);
  }, [selectedIds, updatePatient]);

  const startEditing = useCallback((p: any) => {
    setEditingPatientId(p.id);
    setEditVitals({ ...p.vitals });
  }, []);

  const handleVitalChange = useCallback((field: keyof Vitals, value: string | number) => {
    setEditVitals(prev => prev ? ({
      ...prev,
      [field]: field === 'bp' ? value : Number(value)
    }) : null);
  }, []);

  const saveVitals = useCallback(() => {
    if (editingPatientId && editVitals) {
      updatePatient(editingPatientId, { 
        vitals: editVitals,
        lastUpdated: new Date().toISOString()
      });
      setEditingPatientId(null);
      setEditVitals(null);
    }
  }, [editingPatientId, editVitals, updatePatient]);

  const editingPatient = useMemo(() => patients.find(p => p.id === editingPatientId), [patients, editingPatientId]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">Casualty Roster & EHR</h1>
           <p className="text-slate-400 text-sm">Full tactical medical records and active tracking logs.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:flex-initial">
             <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="Search Identity..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-slate-900 border border-slate-800 rounded-md py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-red-500 w-full md:w-64"
             />
           </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Fitness Level
          </label>
          <select 
            value={filters.fitness}
            onChange={(e) => setFilters(prev => ({ ...prev, fitness: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all uppercase"
          >
            {fitnessLevels.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <User className="w-3 h-3" /> Age Range
          </label>
          <select 
            value={filters.ageRange}
            onChange={(e) => setFilters(prev => ({ ...prev, ageRange: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all uppercase"
          >
            {ageRanges.map(a => <option key={a.label} value={a.label}>{a.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Droplets className="w-3 h-3" /> Blood Type
          </label>
          <select 
            value={filters.bloodType}
            onChange={(e) => setFilters(prev => ({ ...prev, bloodType: e.target.value }))}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all uppercase"
          >
            {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </div>

        <div className="flex items-end">
          <button 
            onClick={() => {
              setFilters({ fitness: 'ALL', ageRange: 'ALL', bloodType: 'ALL' });
              setSearchTerm('');
            }}
            className="w-full h-[34px] flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all"
          >
            <Filter className="w-3 h-3" /> Reset Filters
          </button>
        </div>
      </div>

      <div className="bg-suraksha-sidebar border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 border-b border-slate-800">
                <th className="px-6 py-4 w-10">
                  <button 
                    onClick={toggleSelectAll}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    {selectedIds.length === filteredPatients.length && filteredPatients.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-red-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Physiological Profile</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Injury & Outcome</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Survival</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs text-white">
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <tr 
                    key={p.id} 
                    className={cn(
                      "hover:bg-white/5 transition-colors group",
                      selectedIds.includes(p.id) && "bg-red-500/5"
                    )}
                  >
                    <td className="px-6 py-4">
                       <button 
                         onClick={() => toggleSelect(p.id)}
                         className="text-slate-600 hover:text-white transition-colors"
                       >
                         {selectedIds.includes(p.id) ? (
                           <CheckSquare className="w-4 h-4 text-red-500" />
                         ) : (
                           <Square className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                         )}
                       </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold tracking-tight">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-500 font-mono italic uppercase">{p.id}</span>
                          {p.override && <span className="text-[8px] bg-purple-600/20 text-purple-400 px-1 rounded uppercase font-black">Overridden</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-black">{p.history.bloodType}</span>
                        <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-black">{p.history.age}Y</span>
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-black",
                          p.history.fitnessLevel === 'ELITE' ? "text-green-500 bg-green-500/10" :
                          p.history.fitnessLevel === 'STANDARD' ? "text-blue-500 bg-blue-500/10" : "text-amber-500 bg-amber-500/10"
                        )}>{p.history.fitnessLevel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-medium">{p.injuryType}</span>
                        {p.outcome && (
                          <span className={cn(
                            "text-[9px] font-black uppercase mt-1",
                            p.outcome === 'SURVIVED' ? "text-green-500" :
                            p.outcome === 'DECEASED' ? "text-red-500" : "text-blue-500"
                          )}>
                            Outcome: {p.outcome}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-bold text-white text-base italic">{Math.floor(p.predictedSurvivalMinutes)}</span>
                        <span className="text-slate-600 font-black text-[10px] uppercase">min</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <div className={cn(
                           "w-1.5 h-1.5 rounded-full",
                            p.status === 'TREATED' ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : 
                            p.status === 'PENDING' ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" :
                            "bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]"
                         )} />
                         <span className="text-slate-300 font-black uppercase tracking-tight text-[10px]">{p.status.replace('_', ' ')}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => startEditing(p)}
                          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white" 
                          title="Edit Vital Signs"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white" title="Patient View">
                          <User className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-black uppercase tracking-widest">
                    No casualties match active filter criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AnimatePresence>
        {editingPatientId && editVitals && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPatientId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-800 z-[2600] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <HeartPulse className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase italic text-white tracking-tight">Vital Signs Editor</h2>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mt-0.5">
                      {editingPatient?.name} / {editingPatient?.id}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingPatientId(null)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Heart Rate (BPM)
                    </label>
                    <input 
                      type="number"
                      value={editVitals.hr}
                      onChange={(e) => handleVitalChange('hr', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Droplets className="w-3 h-3" /> Blood Pressure
                    </label>
                    <input 
                      type="text"
                      value={editVitals.bp}
                      onChange={(e) => handleVitalChange('bp', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-red-500 transition-all"
                      placeholder="120/80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> SpO2 (%)
                    </label>
                    <input 
                      type="number"
                      value={editVitals.spo2}
                      onChange={(e) => handleVitalChange('spo2', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Resp. Rate
                    </label>
                    <input 
                      type="number"
                      value={editVitals.rr}
                      onChange={(e) => handleVitalChange('rr', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Brain className="w-3 h-3" /> Glasgow Coma Scale (GCS)
                    </label>
                    <span className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                      editVitals.gcs <= 8 ? "bg-red-500/10 text-red-500" :
                      editVitals.gcs <= 12 ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
                    )}>
                      {editVitals.gcs <= 8 ? 'SEVERE' : editVitals.gcs <= 12 ? 'MODERATE' : 'MILD'}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="3"
                    max="15"
                    value={editVitals.gcs}
                    onChange={(e) => handleVitalChange('gcs', e.target.value)}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono">
                    <span>3 (Min)</span>
                    <span className="text-white font-bold">{editVitals.gcs}</span>
                    <span>15 (Max)</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-600/5 border border-blue-500/20 rounded-xl space-y-2 mt-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> AI Protocol Note
                  </h4>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed">
                    Manually overriding vitals will trigger a re-calculation of the predictive survival model. Ensure accuracy before synchronization.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-800 bg-black/20">
                <button 
                  onClick={saveVitals}
                  className="w-full h-12 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest text-[11px] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" /> Synchronize Vitals
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000]"
          >
            <div className="bg-black/90 backdrop-blur-xl border border-red-500/30 rounded-2xl p-3 px-6 shadow-2xl flex items-center gap-6 min-w-[500px]">
              <div className="flex items-center gap-2 border-r border-slate-800 pr-6">
                <span className="text-2xl font-black italic text-red-500">{selectedIds.length}</span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Subjects<br/>Selected</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleBulkStatusUpdate('TREATED')}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Check className="w-3.5 h-3.5" /> Mark as Treated
                </button>
                <button 
                  onClick={() => handleBulkStatusUpdate('EN_ROUTE')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  <Users className="w-3.5 h-3.5" /> Assign Medic Team
                </button>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <button 
                  onClick={() => setSelectedIds([])}
                  className="text-[10px] text-slate-500 hover:text-white font-black uppercase tracking-widest"
                >
                  Clear
                </button>
                <button className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
