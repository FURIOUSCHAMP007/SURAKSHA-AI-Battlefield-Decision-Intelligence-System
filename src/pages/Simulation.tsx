import React, { useState, useCallback, useMemo } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  Play, 
  Plus, 
  AlertTriangle, 
  Timer, 
  Zap, 
  Radio, 
  Database, 
  Trash2, 
  BarChart3,
  Waves,
  Rss
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { BATTLEFIELD_SCENARIOS, ScenarioData } from '../data/battlefieldCases';
import { Patient, TacticalContext } from '../types';
import { speakTactical } from '../services/geminiService';

export const Simulation = () => {
  const { addPatient, bulkAddPatients, clearAllPatients, addAlert, patients, setTacticalContext, tacticalContext } = useSystem();
  const [activeScenario, setActiveScenario] = useState('Standard Operations');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const mapScenarioToPatient = useCallback((s: ScenarioData, index: number, totalExisting: number): Patient => {
    const timestamp = new Date().toISOString();
    return {
      id: `SIM-${(totalExisting + index + 1).toString().padStart(3, '0')}`,
      name: `Unknown Soldier ${totalExisting + index + 1}`,
      rank: ['PVT', 'CPL', 'SGT', 'LT'][Math.floor(Math.random() * 4)],
      history: { 
        age: s.age, 
        fitnessLevel: 'STANDARD', 
        allergies: [], 
        bloodType: 'UNKN' 
      },
      injuryType: s.injuryType,
      injuryCategory: s.category,
      location: [
        34.5684 + (Math.random() * 0.1 - 0.05), 
        -116.3214 + (Math.random() * 0.1 - 0.05)
      ],
      vitals: { 
        hr: s.hr, 
        bp: s.bp, 
        spo2: s.spo2, 
        gcs: s.gcs, 
        rr: s.rr 
      },
      vitalsHistory: [
        { hr: s.hr, bp: s.bp, spo2: s.spo2, gcs: s.gcs, rr: s.rr, timestamp }
      ],
      severity: s.severity,
      predictedSurvivalMinutes: s.survival,
      createdAt: timestamp,
      lastUpdated: timestamp,
      status: 'PENDING'
    };
  }, []);

  const scenarios = useMemo(() => [
    { name: 'Smoke Inhalation Injury', context: 'BATTLEFIELD' as TacticalContext, desc: 'Smoke inhalation → breathing difficulty.' },
    { name: 'IED Blast Event', context: 'BATTLEFIELD' as TacticalContext, desc: 'Multiple casualties, traumatic amputations, high critical count.' },
    { name: 'Hemorrhagic Shock', context: 'BATTLEFIELD' as TacticalContext, desc: 'Hemorrhagic shock → severe blood loss.' },
    { name: 'Mass Casualty (MASCAL)', context: 'DISASTER' as TacticalContext, desc: 'System overload, resource depletion, long delays.' }
  ], []);

  const handleSimAction = useCallback(async (action: string) => {
    setIsProcessing(true);
    setLastAction(action);
    
    // Simulate some logic delay for "Tactical Calculation"
    await new Promise(resolve => setTimeout(resolve, 800));

    switch(action) {
      case 'LOAD_ALL_50':
        const newPatients: Patient[] = [];
        // Hardcoded simulation batch to ensure stability
        for (let i = 0; i < 50; i++) {
          const scenario = BATTLEFIELD_SCENARIOS[i % BATTLEFIELD_SCENARIOS.length];
          newPatients.push(mapScenarioToPatient(scenario, i, patients.length));
        }
        bulkAddPatients(newPatients);
        addAlert({ type: 'INFO', message: `SIM_LOAD_SUCCESS: 50 Tactical scenarios deployed to grid.` });
        
        // Safeguard speakTactical to prevent UI error toasts if Gemini link fails
        try {
          speakTactical("Fifty battlefield scenarios initialized. Command uplink established.");
        } catch (e) {
          console.warn("Sim audio suppressed: ", e);
        }
        break;
      case 'ADD_CRITICAL':
        addPatient({ 
          severity: 'CRITICAL', 
          injuryType: 'Active Arterial Hemorrhage', 
          vitals: { hr: 160, bp: '65/30', spo2: 78, gcs: 5, rr: 42 },
          predictedSurvivalMinutes: 8
        });
        addAlert({ type: 'CRITICAL', message: `SIM_INJECTION: Sudden critical subject detected at Sector 4.` });
        try {
          speakTactical("Alert. Sudden critical subject detected. Immediate intervention required.");
        } catch (e) {
          console.warn("Sim audio suppressed: ", e);
        }
        break;
      case 'MASCAL_INJECTION':
        const mascalBatch = Array.from({ length: 8 }).map((_, i) => {
          return mapScenarioToPatient(
            BATTLEFIELD_SCENARIOS[Math.floor(Math.random() * BATTLEFIELD_SCENARIOS.length)],
            i,
            patients.length
          );
        });
        bulkAddPatients(mascalBatch);
        addAlert({ type: 'CRITICAL', message: `SIM_MASCAL: Massive influx of 8 casualties at Grid Alpha.` });
        try {
          speakTactical("Mass casualty event injection complete. Priority triage protocol engaged.");
        } catch (e) {
          console.warn("Sim audio suppressed: ", e);
        }
        break;
      case 'CLEAR':
        clearAllPatients();
        addAlert({ type: 'INFO', message: `SYSTEM_RESET: Tactical map cleared.` });
        speakTactical("Simulation cleared. Battlefield reset.");
        break;
      case 'RADIO_SILENCE':
        addAlert({ type: 'WARNING', message: `ENV_TRIGGER: Partial radio silence in Effect (Latency Simulation).` });
        speakTactical("Partial radio silence initiated. Data uplink restricted.");
        break;
      default:
        break;
    }

    setIsProcessing(false);
    setTimeout(() => setLastAction(null), 2000);
  }, [patients.length, addPatient, bulkAddPatients, clearAllPatients, addAlert, mapScenarioToPatient]);

  const changeScenario = useCallback((s: typeof scenarios[0]) => {
    setActiveScenario(s.name);
    setTacticalContext(s.context);
    addAlert({ type: 'INFO', message: `SCENARIO_SHIFT: System context updated to ${s.context}` });
    
    // Hardcoded voice output for scenarios
    if (s.name === 'Smoke Inhalation Injury') {
      try {
        speakTactical("Severe condition. Move patient to fresh air immediately. Provide oxygen. Monitor breathing closely.");
      } catch (e) {
        console.warn("Sim audio suppressed");
      }
    } else if (s.name === 'Hemorrhagic Shock') {
      try {
        speakTactical("Severe bleeding. Apply tourniquet immediately. Control bleeding. Lay patient flat. Time is limited.");
      } catch (e) {
        console.warn("Sim audio suppressed");
      }
    }

    // Auto-inject a small batch for the selected scenario to make it "hardcoded" and interactive
    const batchSize = s.name === 'Mass Casualty (MASCAL)' ? 8 : 4;
    const scenarioBatch: Patient[] = [];
    
    // Hardcoded high-fidelity scenario data for IED Blast
    if (s.name === 'IED Blast Event') {
      const fixedIED: ScenarioData = {
        age: 30,
        injuryType: "IED Blast - Abdominal Shrapnel",
        category: "BLAST",
        hr: 142,
        bp: "78/50",
        spo2: 80,
        gcs: 8,
        rr: 32,
        severity: "CRITICAL",
        survival: 30
      };
      // Inject the specific case first, then some random supported ones
      scenarioBatch.push(mapScenarioToPatient(fixedIED, 0, patients.length));
      for (let i = 1; i < batchSize; i++) {
        const scenario = BATTLEFIELD_SCENARIOS[Math.floor(Math.random() * BATTLEFIELD_SCENARIOS.length)];
        scenarioBatch.push(mapScenarioToPatient(scenario, i, patients.length));
      }
    } else if (s.name === 'Smoke Inhalation Injury') {
      const fixedSmoke: ScenarioData = {
        age: 28,
        injuryType: "Smoke Inhalation Injury",
        category: "RESPIRATORY",
        hr: 110,
        bp: "115/75",
        spo2: 88,
        gcs: 14,
        rr: 28,
        severity: "SEVERE",
        survival: 70
      };
      scenarioBatch.push(mapScenarioToPatient(fixedSmoke, 0, patients.length));
      for (let i = 1; i < batchSize; i++) {
        const scenario = BATTLEFIELD_SCENARIOS[Math.floor(Math.random() * BATTLEFIELD_SCENARIOS.length)];
        scenarioBatch.push(mapScenarioToPatient(scenario, i, patients.length));
      }
    } else if (s.name === 'Hemorrhagic Shock') {
      const fixedShock: ScenarioData = {
        age: 32,
        injuryType: "Hemorrhagic Shock - Major Trauma",
        category: "SHOCK",
        hr: 135,
        bp: "85/50",
        spo2: 92,
        gcs: 11,
        rr: 24,
        severity: "SEVERE",
        survival: 60
      };
      scenarioBatch.push(mapScenarioToPatient(fixedShock, 0, patients.length));
      for (let i = 1; i < batchSize; i++) {
        const scenario = BATTLEFIELD_SCENARIOS[Math.floor(Math.random() * BATTLEFIELD_SCENARIOS.length)];
        scenarioBatch.push(mapScenarioToPatient(scenario, i, patients.length));
      }
    } else {
      for (let i = 0; i < batchSize; i++) {
          const scenario = BATTLEFIELD_SCENARIOS[Math.floor(Math.random() * BATTLEFIELD_SCENARIOS.length)];
          scenarioBatch.push(mapScenarioToPatient(scenario, i, patients.length));
      }
    }
    
    bulkAddPatients(scenarioBatch);
    try {
      speakTactical(`Scenario ${s.name} initialized. Injecting ${batchSize} casualties.`);
    } catch (e) {
      console.warn("Sim audio suppressed");
    }
  }, [setTacticalContext, addAlert, bulkAddPatients, patients.length, scenarios, mapScenarioToPatient]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-md text-blue-500 text-[10px] font-black uppercase tracking-[.2em] mb-4 w-fit">
            <Radio className="w-3 h-3 animate-pulse" /> Simulation Node Active
          </div>
          <h1 className="text-4xl font-black uppercase text-white tracking-tighter italic leading-none">
            Tactical <span className="text-blue-500">Simulation</span> Engine
          </h1>
          <p className="text-slate-500 text-sm mt-3 font-medium max-w-xl">
            Stress-test command AI by injecting synthetic trauma variables, environmental hazards, and MASCAL events.
          </p>
        </motion.div>
        
        <div className="flex flex-wrap gap-3">
           <button 
            onClick={() => handleSimAction('LOAD_ALL_50')}
            disabled={isProcessing}
            className="group px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-xl shadow-blue-900/20 flex items-center gap-2"
           >
             <Database className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
             {isProcessing && lastAction === 'LOAD_ALL_50' ? 'INITIALIZING...' : 'INJECT 50 CASES'}
           </button>
           
           <button 
            onClick={() => handleSimAction('CLEAR')}
            disabled={isProcessing}
            className="px-6 py-3 bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:text-red-500 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center gap-2 group"
           >
             <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
             RESET AO
           </button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 pb-20">
        {/* Sidebar Controls */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-suraksha-sidebar border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-black/40 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">Scenario Library</h3>
              <Waves className="w-4 h-4 text-blue-500" />
            </div>
            <div className="p-4 space-y-2">
              {scenarios.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => changeScenario(s)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group",
                    activeScenario === s.name 
                      ? "bg-blue-600/10 border-blue-500/50 text-white" 
                      : "bg-slate-900/50 border-white/5 text-slate-500 hover:border-slate-700 hover:bg-slate-800/30"
                  )}
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className={cn("text-xs font-black uppercase tracking-tight", activeScenario === s.name ? "text-blue-400" : "text-slate-400")}>
                        {s.name}
                      </p>
                      <p className="text-[10px] opacity-70 mt-1 leading-tight font-medium">{s.desc}</p>
                    </div>
                    <div className={cn(
                      "text-[8px] px-1.5 py-0.5 rounded font-black border",
                      s.context === 'BATTLEFIELD' ? "text-amber-500 border-amber-500/30" : "text-red-500 border-red-500/30"
                    )}>
                      {s.context}
                    </div>
                  </div>
                  {activeScenario === s.name && (
                    <motion.div 
                      layoutId="scenario-active"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-red-600/5 border border-red-900/30 rounded-2xl p-6 shadow-2xl">
             <h3 className="text-xs font-black uppercase tracking-widest text-red-500 mb-6 flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 shadow-[0_0_8px_#ef4444]" /> Hazard Injection
             </h3>
             <div className="space-y-4">
                <button 
                  onClick={() => handleSimAction('ADD_CRITICAL')}
                  disabled={isProcessing}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Inject Sudden Critical
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleSimAction('MASCAL_INJECTION')}
                    disabled={isProcessing}
                    className="py-3 bg-red-950/40 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-black uppercase text-[8px] tracking-widest rounded-xl transition-all"
                  >
                     MASCAL Event
                  </button>
                  <button 
                    onClick={() => handleSimAction('RADIO_SILENCE')}
                    disabled={isProcessing}
                    className="py-3 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-400 font-black uppercase text-[8px] tracking-widest rounded-xl transition-all"
                  >
                     Radio Silence
                  </button>
                </div>
             </div>
          </section>
        </div>

        {/* Dynamic Visualizer */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="flex-1 bg-suraksha-card border border-slate-800 rounded-2xl p-6 md:p-12 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
              
              {/* Tactical Scanning Grid */}
              <div className="absolute inset-0 bg-map-grid opacity-10 pointer-events-none" />

              <AnimatePresence mode="wait">
                {activeScenario === 'IED Blast Event' && !isProcessing ? (
                  <motion.div 
                    key="ied-overlay"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="relative z-20 w-full max-w-2xl bg-black/60 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)]"
                  >
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[.3em] font-mono">// SIM_DATA_STREAM_0X1A</span>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Tactical Diagnosis</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-pulse">Critical Priority alpha</span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">Latency: 12ms</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div className="space-y-4">
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Survival Probability</div>
                             <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-red-500 italic leading-none">15%</span>
                                <span className="text-xs font-bold text-red-900 border border-red-900/50 px-1.5 rounded mb-1 animate-pulse">LOW</span>
                             </div>
                             <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '15%' }}
                                  className="h-full bg-red-500"
                                />
                             </div>
                          </div>
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time to Expiration</div>
                             <div className="text-2xl font-black text-white italic leading-none tracking-tighter uppercase">3-6 Minutes</div>
                             <div className="text-[9px] font-mono text-amber-500 mt-2 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded w-fit">Critical Threshold</div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Priority Score</div>
                             <div className="text-4xl font-black text-blue-500 italic leading-none">0.98</div>
                             <div className="text-[9px] font-mono text-blue-400 mt-2 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded w-fit">Immediate Evac Req</div>
                          </div>
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">System Status</div>
                             <div className="text-xl font-black text-red-400 italic leading-none tracking-tighter uppercase animate-pulse">Rapid Deterioration</div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-6">
                       <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Recommended Tactical Intervention
                       </h4>
                       <div className="space-y-3">
                          {[
                            "Seal chest wound immediately",
                            "Control bleeding via junctional tourniquet",
                            "Establish definitive airway"
                          ].map((action, idx) => (
                            <div key={idx} className="flex items-center gap-3 group">
                               <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400">
                                  {idx + 1}
                               </div>
                               <span className="text-xs font-bold text-white uppercase italic tracking-tight group-hover:text-blue-200 transition-colors">{action}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                ) : activeScenario === 'Hemorrhagic Shock' && !isProcessing ? (
                  <motion.div 
                    key="shock-overlay"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="relative z-20 w-full max-w-2xl bg-red-950/80 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.15)]"
                  >
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-red-500/20">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[.3em] font-mono">// SIG_ANALYSIS: HEMORRHAGIC_V4</span>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Trauma Diagnosis</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Priority Score: 0.82</span>
                        <div className="flex gap-1 mt-1">
                           <div className="w-1 h-3 bg-red-500" />
                           <div className="w-1 h-3 bg-red-500" />
                           <div className="w-1 h-3 bg-red-500 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div className="space-y-4">
                          <div className="bg-red-900/10 border border-red-500/10 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Survival Probability</div>
                             <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-red-400 italic leading-none">60%</span>
                                <span className="text-[10px] font-bold text-red-900 border border-red-900/50 px-1.5 rounded mb-1">DETERIORATING</span>
                             </div>
                             <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '60%' }}
                                  className="h-full bg-red-600"
                                />
                             </div>
                          </div>
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time to Expiration</div>
                             <div className="text-2xl font-black text-white italic leading-none tracking-tighter uppercase">10-20 Minutes</div>
                             <div className="text-[9px] font-mono text-red-500 mt-2 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded w-fit">Urgent Evac Window</div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Critical Alerts
                             </div>
                             <div className="space-y-2">
                                <div className="text-[10px] font-bold text-red-400 uppercase tracking-tight italic">⚠ Severe bleeding detected</div>
                                <div className="text-[10px] font-bold text-red-400 uppercase tracking-tight italic">⚠ Risk of rapid shock progression</div>
                             </div>
                          </div>
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Hemodynamic Stress Factor</div>
                             <div className="space-y-1.5 mt-2">
                                {[
                                  { label: 'Blood Loss', val: 40 },
                                  { label: 'Hypotension', val: 30 },
                                  { label: 'Tachycardia', val: 20 }
                                ].map((p, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                     <span className="text-[9px] font-mono text-slate-500 w-16">{p.label}</span>
                                     <div className="flex-1 bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: `${p.val}%` }} />
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-red-600/5 border border-red-500/20 rounded-xl p-6">
                       <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Zap className="w-3 h-3 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Stabilization Protocol Alpha
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {[
                            "Apply firm pressure to wound",
                            "Use tourniquet above injury",
                            "Lay patient flat / elevate legs",
                            "Prevent heat loss",
                            "Prepare urgent evacuation"
                          ].map((action, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                               <span className="text-[11px] font-bold text-white uppercase italic tracking-tight">{action}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                ) : activeScenario === 'Smoke Inhalation Injury' && !isProcessing ? (
                  <motion.div 
                    key="smoke-overlay"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="relative z-20 w-full max-w-2xl bg-slate-950/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.1)]"
                  >
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[.3em] font-mono">// SIG_ANALYSIS: SMOKE_RESP_V1</span>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Respiratory Analysis</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Priority Score: 0.78</span>
                        <div className="flex gap-1 mt-1">
                           <div className="w-1 h-3 bg-red-500" />
                           <div className="w-1 h-3 bg-red-500" />
                           <div className="w-1 h-3 bg-slate-700" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                       <div className="space-y-4">
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Survival Probability</div>
                             <div className="flex items-end gap-2">
                                <span className="text-4xl font-black text-amber-400 italic leading-none">70%</span>
                                <span className="text-[10px] font-bold text-amber-900 border border-amber-900/50 px-1.5 rounded mb-1">STABLE_DECLINE</span>
                             </div>
                             <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '70%' }}
                                  className="h-full bg-amber-500"
                                />
                             </div>
                          </div>
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time to Criticality</div>
                             <div className="text-2xl font-black text-white italic leading-none tracking-tighter uppercase">15-25 Minutes</div>
                             <div className="text-[9px] font-mono text-slate-500 mt-2 uppercase tracking-widest">System Estimated Evac Window</div>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> System Alerts
                             </div>
                             <div className="space-y-2">
                                <div className="text-[10px] font-bold text-red-400 uppercase tracking-tight italic">⚠ Breathing difficulty detected</div>
                                <div className="text-[10px] font-bold text-red-400 uppercase tracking-tight italic">⚠ Risk of airway swelling</div>
                             </div>
                          </div>
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Physiological Breakdown</div>
                             <div className="space-y-1.5 mt-2">
                                {[
                                  { label: 'Hypoxia', val: 45 },
                                  { label: 'Distress', val: 30 },
                                  { label: 'Exposure', val: 25 }
                                ].map((p, i) => (
                                  <div key={i} className="flex items-center gap-2">
                                     <span className="text-[9px] font-mono text-slate-500 w-16">{p.label}</span>
                                     <div className="flex-1 bg-slate-800 h-1 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${p.val}%` }} />
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-amber-600/5 border border-amber-500/20 rounded-xl p-6">
                       <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Life-Saving Protocol
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {[
                            "Move patient to fresh air",
                            "Administer high-flow oxygen",
                            "Loosen tight clothing",
                            "Monitor breathing closely",
                            "Prepare evacuation"
                          ].map((action, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                               <span className="text-[11px] font-bold text-white uppercase italic tracking-tight">{action}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="standard-ui"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 text-center space-y-8"
                  >
                    <div className="relative inline-block">
                        <div className={cn(
                          "w-32 h-32 border-4 border-blue-600 rounded-full flex items-center justify-center bg-blue-600/5 transition-all duration-700",
                          isProcessing ? "scale-90 opacity-40 blur-sm" : "scale-100 opacity-100 blur-0"
                        )}>
                          {patients.length > 0 && !isProcessing ? (
                            <div className="relative">
                                <Zap className="w-12 h-12 text-amber-500 fill-amber-500/20 drop-shadow-[0_0_15px_#f59e0b]" />
                                <motion.div 
                                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                  className="absolute inset-0 bg-amber-500 rounded-full blur-xl -z-10"
                                />
                            </div>
                          ) : (
                            <Play className="w-12 h-12 text-blue-500 ml-1.5 drop-shadow-[0_0_15px_#3b82f6]" />
                          )}
                        </div>
                        {isProcessing && (
                          <div className="absolute inset-x-0 -bottom-10 flex flex-col items-center">
                            <div className="flex gap-1 mb-2">
                              {[1,2,3].map(i => (
                                <motion.div 
                                  key={i}
                                  animate={{ height: [4, 16, 4] }}
                                  transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                  className="w-1 bg-blue-500 rounded-full"
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-mono text-blue-400 animate-pulse tracking-[.3em] font-black uppercase">Syncing...</span>
                          </div>
                        )}
                    </div>

                    <div className={cn("transition-all duration-700", isProcessing ? "opacity-30 translate-y-4" : "opacity-100 translate-y-0")}>
                      <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">
                        {activeScenario}
                      </h2>
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <Rss className="w-3 h-3 text-green-500" />
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Uplink Active</span>
                        </div>
                        <div className="h-4 w-[1px] bg-slate-800" />
                        <div className="flex items-center gap-2">
                            <Database className="w-3 h-3 text-blue-400" />
                            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{patients.length} Live Nodes</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Corners */}
              <div className="absolute top-6 left-6 font-mono text-[9px] text-slate-500 space-y-1">
                 <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> TRACE_ROUTE: STABLE</div>
                 <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> CORE_LOAD: 2.14%</div>
              </div>

              <div className="absolute bottom-6 right-6 flex gap-3">
                 <div className="px-3 py-1.5 bg-green-500/10 text-green-500 text-[10px] font-black border border-green-500/20 rounded-lg uppercase tracking-widest">Sim_Ready</div>
                 <div className="px-3 py-1.5 bg-slate-900 text-slate-500 text-[10px] font-black border border-slate-800 rounded-lg uppercase tracking-widest font-mono">0x4F2A-99</div>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Resource Load', val: '64%', color: 'bg-blue-600' },
                { label: 'Sync Accuracy', val: '99.4%', color: 'bg-green-600' },
                { label: 'Threat Index', val: tacticalContext === 'BATTLEFIELD' ? 'HIGH' : 'EXTREME', color: 'bg-amber-600' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-3 text-[10px] uppercase font-black tracking-widest text-slate-500">
                    <span>{stat.label}</span>
                    <span className="text-white font-mono">{stat.val}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: stat.val.includes('%') ? stat.val : '100%' }}
                        className={cn("h-full", stat.color)} 
                     />
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};
