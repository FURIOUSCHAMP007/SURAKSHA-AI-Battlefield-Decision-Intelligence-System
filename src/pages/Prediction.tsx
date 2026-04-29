import React, { useState, useCallback, useMemo } from 'react';
import { useSystem } from '../context/SystemContext';
import { Activity, Brain, ShieldAlert, Heart, TrendingDown, CheckCircle2, AlertTriangle, Zap, Info, User, Shield, Briefcase, AlertCircle, ShieldPlus as ShieldIcon, Crosshair, Moon, Layers, MapPin, Sparkles, Loader2, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Severity, PatientHistory, Vitals } from '../types';
import { cn } from '../lib/utils';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { analyzeInjuryDeep, generateTCCCProtocol } from '../services/geminiService';
import { TCCCTreatment } from '../types';

// Fix for default marker icons in Leaflet + Vite
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const CasualtyMarkerIcon = L.divIcon({
  className: 'custom-casualty-marker',
  html: `
    <div style="position: relative; width: 14px; height: 14px; transform: rotate(45deg); background: #3b82f6; border: 2px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);">
    </div>
  `,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export const Prediction = () => {
  const { addPatient, tacticalContext, setTacticalContext } = useSystem();
  
  // Cognitive Load Reduction - Simplified Form
  const [minimalMode, setMinimalMode] = useState(false);

  const [form, setForm] = useState({
    hr: 142,
    bp: '82/40',
    spo2: 84,
    gcs: 8,
    rr: 32,
    injuryDescription: 'Blast Injury / Thoracic Trauma - Multiple shrapnel wounds to chest and abdomen.',
    location: [34.5684, -116.3214] as [number, number],
    findings: {
      activeBleeding: true,
      airwayCompromise: true,
      penetratingTrauma: true,
      unconscious: true,
      visibleFracture: false,
      burns: false,
    }
  });

  const [history, setHistory] = useState<PatientHistory>({
    age: 28,
    fitnessLevel: 'ELITE',
    allergies: ['Penicillin'],
    bloodType: 'O+'
  });

  const [prediction, setPrediction] = useState<any>({
    severity: 'CRITICAL',
    survival: 14,
    priority: 9,
    breakdown: [
      { factor: 'Oxygenation', weight: 24, group: 'VITALS', description: 'Critical oxygen desaturation.' },
      { factor: 'Neurological', weight: 30, group: 'VITALS', description: 'Deep unconsciousness (Coma).' },
      { factor: 'Airway', weight: 35, group: 'FINDINGS', description: 'Acute blockage risk.' }
    ],
    protocol: [
      'Apply Tourniquet (High & Tight)',
      'Insert OPA/NPA airway',
      'Needle Decompression (5th ICS)'
    ],
    reasons: ['Immediate airway management required', 'Life-threatening hypoxic state']
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingProtocol, setIsGeneratingProtocol] = useState(false);
  const [tcccProtocol, setTcccProtocol] = useState<TCCCTreatment | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [arHudActive, setArHudActive] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setForm(prev => ({
          ...prev,
          injuryDescription: prev.injuryDescription + (prev.injuryDescription ? '. ' : '') + transcript
        }));
      }
    };

    recognition.start();
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      hr: 80,
      bp: '120/80',
      spo2: 98,
      gcs: 15,
      rr: 18,
      injuryDescription: '',
      location: [34.5684, -116.3214],
      findings: {
        activeBleeding: false,
        airwayCompromise: false,
        penetratingTrauma: false,
        unconscious: false,
        visibleFracture: false,
        burns: false,
      }
    });
  }, []);

  // Preset Library for Rapid-Tap Input - Balanced for Ranks 1-9
  const applyPreset = useCallback((type: string) => {
    switch(type) {
      case 'AIRWAY_BLOCK': // Rank 9
        setForm(prev => ({
          ...prev, spo2: 62, rr: 45, findings: { ...prev.findings, airwayCompromise: true, unconscious: true }
        }));
        break;
      case 'UNCONSCIOUS': // Rank 9
        setForm(prev => ({
          ...prev, gcs: 3, hr: 165, bp: '60/30', findings: { ...prev.findings, unconscious: true, airwayCompromise: true }
        }));
        break;
      case 'HEAVY_BLEEDING': // Rank 8
        setForm(prev => ({
          ...prev, hr: 148, bp: '70/40', findings: { ...prev.findings, activeBleeding: true, penetratingTrauma: true }
        }));
        break;
      case 'SEVERE_BURNS': // Rank 7
        setForm(prev => ({
          ...prev, spo2: 80, hr: 132, findings: { ...prev.findings, burns: true, airwayCompromise: true }
        }));
        break;
      case 'BLAST_SHRAPNEL': // Rank 6
        setForm(prev => ({
          ...prev, hr: 126, bp: '95/55', findings: { ...prev.findings, penetratingTrauma: true, visibleFracture: true }
        }));
        break;
      case 'HEAD_TRAUMA': // Rank 5
        setForm(prev => ({
          ...prev, gcs: 9, hr: 54, bp: '155/95', findings: { ...prev.findings, unconscious: true }
        }));
        break;
      case 'CHEMICAL': // Rank 4
        setForm(prev => ({
          ...prev, spo2: 88, rr: 32, findings: { ...prev.findings, airwayCompromise: true }
        }));
        break;
      case 'INTERNAL_BLEED': // Rank 3
        setForm(prev => ({
          ...prev, hr: 118, bp: '100/65', findings: { ...prev.findings, penetratingTrauma: true }
        }));
        break;
      case 'HEATSTROKE': // Rank 2
        setForm(prev => ({
          ...prev, hr: 125, rr: 26, findings: { ...prev.findings, unconscious: false }
        }));
        break;
      case 'FRACTURE': // Rank 1
        setForm(prev => ({
          ...prev, hr: 110, findings: { ...prev.findings, visibleFracture: true }
        }));
        break;
      case 'SPINAL_SHOCK': // Rank 1
        setForm(prev => ({
          ...prev, hr: 48, bp: '82/45', gcs: 15
        }));
        break;
    }
  }, []);

  const handleAIAnalysis = useCallback(async () => {
    if (!form.injuryDescription) return;
    setIsAnalyzing(true);
    setAiReasoning(null);
    try {
      // High Thinking Analysis
      const result = await analyzeInjuryDeep(form.injuryDescription, {
        hr: form.hr,
        bp: form.bp,
        spo2: form.spo2,
        gcs: form.gcs,
        rr: form.rr
      });

      if (result) {
        setAiReasoning(result.reasoning);
        const severity = result.suggestedSeverity || 'MODERATE';
        
        // Map AI result to prediction state
        const pred = {
          severity,
          survival: result.survivalEstimate || 90,
          priority: severity === 'CRITICAL' ? 9 : severity === 'SEVERE' ? 7 : 4,
          breakdown: [
            { factor: 'AI Analysis', weight: result.confidence || 85, group: 'COGNITIVE', description: result.reasoning }
          ],
          protocol: [
            result.prediction,
            'Monitor vitals',
            'Prepare for evac'
          ],
          reasons: [result.prediction]
        };
        setPrediction(pred);

        // Generate detailed TCCC protocol
        setIsGeneratingProtocol(true);
        const protocol = await generateTCCCProtocol({
           ...form,
           id: 'temp',
           name: 'Casualty',
           history,
           severity,
           predictedSurvivalMinutes: result.survivalEstimate || 90,
           createdAt: new Date().toISOString(),
           lastUpdated: new Date().toISOString(),
           status: 'PENDING'
        } as any);
        setTcccProtocol(protocol);
        setIsGeneratingProtocol(false);
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
      setIsGeneratingProtocol(false);
    }
  }, [form, history]);

  const calculateSeverity = useCallback(() => {
    let score = 0;
    const contributions: { factor: string; weight: number; description: string; group: string }[] = [];

    // 1. Vital markers (More granular)
    if (form.hr > 140 || form.hr < 40) { score += 6; contributions.push({ factor: 'Hemodynamics', weight: 18, group: 'VITALS', description: 'Critical heart rate deviation.' }); }
    else if (form.hr > 115 || form.hr < 55) { score += 2; contributions.push({ factor: 'Hemodynamics', weight: 8, group: 'VITALS', description: 'Moderate tachycardia/bradycardia.' }); }

    if (form.spo2 < 80) { score += 8; contributions.push({ factor: 'Oxygenation', weight: 24, group: 'VITALS', description: 'Critical oxygen desaturation.' }); }
    else if (form.spo2 < 90) { score += 4; contributions.push({ factor: 'Oxygenation', weight: 14, group: 'VITALS', description: 'Significant hypoxia.' }); }

    if (form.gcs <= 5) { score += 10; contributions.push({ factor: 'Neurological', weight: 30, group: 'VITALS', description: 'Deep unconsciousness (Coma).' }); }
    else if (form.gcs <= 10) { score += 5; contributions.push({ factor: 'Neurological', weight: 15, group: 'VITALS', description: 'Altered level of consciousness.' }); }
    
    // 2. Physical Findings (Hierarchical Weights)
    if (form.findings.airwayCompromise) { score += 12; contributions.push({ factor: 'Airway', weight: 35, group: 'FINDINGS', description: 'Acute blockage risk.' }); }
    if (form.findings.activeBleeding) { score += 6; contributions.push({ factor: 'Hemorrhage', weight: 20, group: 'FINDINGS', description: 'Uncontrolled external bleeding.' }); }
    if (form.findings.penetratingTrauma) { score += 4; contributions.push({ factor: 'Trauma', weight: 12, group: 'FINDINGS', description: 'High-energy cavitating injury.' }); }
    if (form.findings.burns) { score += 3; contributions.push({ factor: 'Thermal', weight: 10, group: 'FINDINGS', description: 'Severe thermal skin damage.' }); }

    // Adaptive Context
    if (tacticalContext === 'BATTLEFIELD') score += 2;

    let severity: Severity = 'STABLE';
    if (score >= 20) severity = 'CRITICAL';
    else if (score >= 12) severity = 'SEVERE';
    else if (score >= 6) severity = 'MODERATE';

    const survival = Math.max(1, 100 - (score * 3.5));

    const getProtocol = () => {
      const steps = [];
      if (form.findings.activeBleeding) steps.push('Apply Tourniquet (High & Tight)');
      if (form.findings.airwayCompromise) steps.push('Insert OPA/NPA airway');
      if (form.spo2 < 90) steps.push('Administer Supplemental O2');
      if (form.findings.penetratingTrauma && form.rr > 30) steps.push('Needle Decompression (5th ICS)');
      if (form.gcs < 10) steps.push('Maintain Spinal Stabilization');
      if (steps.length === 0) steps.push('Standard wound care and monitoring');
      return steps;
    };

    setPrediction({
      severity,
      survival,
      priority: Math.min(9, Math.floor(score / 2.8) + 1),
      breakdown: contributions.sort((a,b) => b.weight - a.weight),
      protocol: getProtocol(),
      reasons: [
        form.findings.airwayCompromise ? 'Immediate airway management required' : null,
        form.spo2 < 85 ? 'Life-threatening hypoxic state' : null,
        form.gcs < 8 ? 'Cerebral perfusion risk' : null,
      ].filter(Boolean)
    });
  }, [form, tacticalContext]);

  const QuickSelector = React.memo(({ label, icon: Icon, active, onClick }: any) => (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-lg border transition-all text-[10px] font-black uppercase tracking-widest",
        active ? "bg-red-600 border-red-500 text-white" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
      )}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  ));

  const MapHandler = () => {
    useMapEvents({
      click(e) {
        setForm(prev => ({ ...prev, location: [e.latlng.lat, e.latlng.lng] }));
      },
    });
    return null;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-suraksha-bg relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 blur-[120px] rounded-full -ml-48 -mb-48" />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex items-start gap-4">
               <div className={cn(
                 "p-4 rounded-2xl shadow-2xl transition-colors",
                 minimalMode ? "bg-red-600 shadow-red-900/40" : "bg-blue-600 shadow-blue-900/40"
               )}>
                 <Brain className="w-8 h-8 text-white" />
               </div>
               <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">SURAKSHA AI Prediction Core</h1>
                    <span className={cn(
                       "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border",
                       minimalMode ? "bg-red-600/20 border-red-500 text-red-500" : "bg-blue-600/20 border-blue-500 text-blue-500"
                    )}>
                      {minimalMode ? "Minimal Ops Active" : "Full Clinical Analysis"}
                    </span>
                  </div>
                  <p className="text-slate-400 font-medium text-lg mt-1">Context-aware survival probability and prioritization engine.</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <button 
                onClick={() => setArHudActive(!arHudActive)}
                className={cn(
                  "px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all border",
                  arHudActive 
                    ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20" 
                    : "bg-slate-900 border-slate-800 text-slate-500"
                )}
               >
                 <Layers className="w-4 h-4 inline-block mr-2" /> AR HUD {arHudActive ? 'ON' : 'OFF'}
               </button>
               <button 
                onClick={() => {
                  setMinimalMode(!minimalMode);
                  resetForm();
                  setPrediction(null);
                }}
                className={cn(
                  "px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-xl",
                  minimalMode 
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/30" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 shadow-black/40 border border-slate-700"
                )}
               >
                 {minimalMode ? 'EXIT MINIMAL OPS' : 'COGNITIVE LOAD REDUCTION'}
               </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="lg:col-span-5 space-y-6">
               <AnimatePresence mode="wait">
                {!minimalMode ? (
                  <motion.div 
                    key="full-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Tactical Context Switcher */}
                    <div className="bg-suraksha-sidebar border border-slate-800 rounded-xl p-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Adaptive Context
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        <QuickSelector label="Field" icon={Activity} active={tacticalContext === 'BATTLEFIELD'} onClick={() => setTacticalContext('BATTLEFIELD')} />
                        <QuickSelector label="Disaster" icon={AlertTriangle} active={tacticalContext === 'DISASTER'} onClick={() => setTacticalContext('DISASTER')} />
                        <QuickSelector label="Clinic" icon={Briefcase} active={tacticalContext === 'HOSPITAL'} onClick={() => setTacticalContext('HOSPITAL')} />
                      </div>
                    </div>

                    {/* Soldier Profile */}
                    <div className="bg-suraksha-sidebar border border-slate-800 rounded-xl p-6">
                       <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <User className="w-3 h-3" /> Soldier Profile
                       </h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Age</label>
                            <input type="number" value={history.age} onChange={e => setHistory({...history, age: parseInt(e.target.value)})} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs" />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Fitness</label>
                            <select value={history.fitnessLevel} onChange={e => setHistory({...history, fitnessLevel: e.target.value as any})} className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs">
                              <option value="ELITE">Elite</option>
                              <option value="STANDARD">Standard</option>
                              <option value="LOW">Low</option>
                            </select>
                          </div>
                       </div>
                    </div>

                    {/* Physical Findings / Symptoms */}
                    <div className="bg-suraksha-sidebar border border-slate-800 rounded-xl p-6">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                         <AlertCircle className="w-3 h-3" /> Tactical Field Findings
                       </h3>
                       <div className="grid grid-cols-2 gap-3">
                          {[
                            { key: 'activeBleeding', label: 'Active Hemorrhage', icon: ShieldIcon },
                            { key: 'airwayCompromise', label: 'Airway Insecure', icon: Activity },
                            { key: 'penetratingTrauma', label: 'Penetrating Wound', icon: Crosshair },
                            { key: 'unconscious', label: 'Unresponsive', icon: Moon },
                            { key: 'visibleFracture', label: 'Deformation', icon: Layers },
                            { key: 'burns', label: 'Thermal Injury', icon: Zap },
                          ].map((item: any) => (
                            <button
                              key={item.key}
                              onClick={() => setForm({
                                ...form,
                                findings: { ...form.findings, [item.key]: !form.findings[item.key as keyof typeof form.findings] }
                              } as any)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border text-[10px] uppercase font-black transition-all text-left",
                                form.findings[item.key as keyof typeof form.findings]
                                  ? "bg-blue-600/10 border-blue-500 text-white"
                                  : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* AI Injury Mechanism Analysis */}
                    <div className="bg-suraksha-sidebar border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                         <Sparkles className="w-12 h-12" />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-blue-400" /> AI Mechanism Analysis
                        </div>
                        <button 
                          onClick={startListening}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded transition-all border",
                            isListening ? "bg-red-500/20 border-red-500 text-red-500" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white"
                          )}
                        >
                          {isListening ? <MicOff className="w-2.5 h-2.5" /> : <Mic className="w-2.5 h-2.5" />}
                          <span className="text-[8px] font-black">{isListening ? 'LISTENING...' : 'VOICE ENTRY'}</span>
                        </button>
                      </h3>
                      <div className="space-y-4">
                        <textarea 
                          value={form.injuryDescription}
                          onChange={e => setForm({...form, injuryDescription: e.target.value})}
                          placeholder="Describe the MOI (e.g., 'Soldier stepped on IED, blast within 2 meters, heat flash observed'...)"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs min-h-[100px] text-white focus:border-blue-500/50 outline-none transition-colors"
                        />
                        <button 
                          onClick={handleAIAnalysis}
                          disabled={isAnalyzing || !form.injuryDescription}
                          className={cn(
                            "w-full py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                            isAnalyzing ? "bg-slate-800 text-slate-500" : "bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600/30"
                          )}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" /> Analyzing Physics...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" /> Predict Likely Injuries
                            </>
                          )}
                        </button>
                      </div>
                      
                      {aiReasoning && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg"
                        >
                          <span className="text-[9px] font-black uppercase text-blue-400 block mb-1">AI Reasoning Engine</span>
                          <p className="text-[10px] text-blue-400/80 leading-relaxed italic">{aiReasoning}</p>
                        </motion.div>
                      )}
                    </div>

                    {/* Location Picker */}
                    <div className="bg-suraksha-sidebar border border-slate-800 rounded-xl p-6">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Tactical Insertion Point
                      </h3>
                      <div className="h-48 rounded-lg overflow-hidden border border-slate-800 relative z-0 tactical-map-container">
                         <div className="tactical-map-overlay" />
                         <MapContainer 
                           center={form.location} 
                           zoom={14} 
                           style={{ height: '100%', width: '100%' }}
                           zoomControl={false}
                         >
                           <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                           <Marker position={form.location} icon={CasualtyMarkerIcon} />
                           <MapHandler />
                         </MapContainer>
                         <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[8px] font-mono text-slate-400 z-[1000] border border-white/5">
                            GRID: {form.location[0].toFixed(4)}, {form.location[1].toFixed(4)}
                         </div>
                      </div>
                      <p className="text-[9px] text-slate-500 italic mt-2">Click map to designate casualty extraction coordinate.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="minimal-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-slate-900/50 border-2 border-slate-800 rounded-3xl p-8 backdrop-blur-xl"
                  >
                     <div className="text-center mb-10">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Stress-Resistant HUD</h2>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Select key life-threats only</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'AIRWAY_BLOCK', l: 'Airway Blocked', icon: Activity, r: '09' },
                          { id: 'UNCONSCIOUS', l: 'Unconscious', icon: Moon, r: '09' },
                          { id: 'HEAVY_BLEEDING', l: 'Heavy Bleeding', icon: ShieldIcon, r: '08' },
                          { id: 'SEVERE_BURNS', l: 'Severe Burns', icon: Zap, r: '07' },
                          { id: 'BLAST_SHRAPNEL', l: 'Blast / Shrapnel', icon: Crosshair, r: '06' },
                          { id: 'HEAD_TRAUMA', l: 'Head Trauma / TBI', icon: Brain, r: '05' },
                          { id: 'CHEMICAL', l: 'Chemical Gas', icon: ShieldIcon, r: '04' },
                          { id: 'INTERNAL_BLEED', l: 'Internal Bleeding', icon: ShieldAlert, r: '03' },
                          { id: 'HEATSTROKE', l: 'Heatstroke', icon: AlertTriangle, r: '02' },
                          { id: 'FRACTURE', l: 'Visible Fracture', icon: Layers, r: '01' },
                          { id: 'SPINAL_SHOCK', l: 'Spinal / Neuro Shock', icon: Heart, r: '01' },
                        ].map((btn, i) => (
                          <button 
                            key={i}
                            onClick={() => {
                              applyPreset(btn.id);
                              calculateSeverity();
                            }}
                            className="group flex items-center justify-between p-4 bg-slate-800/50 border-2 border-slate-700/50 rounded-2xl hover:border-red-600 hover:bg-red-600/5 transition-all text-left relative overflow-hidden"
                          >
                            <div className="flex items-center gap-4 relative z-10">
                               <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-700 group-hover:bg-red-600/20 group-hover:border-red-500/50 transition-colors">
                                  <btn.icon className="w-5 h-5 text-slate-400 group-hover:text-red-400" />
                               </div>
                               <div>
                                  <span className="text-sm font-black text-white uppercase tracking-tighter block">{btn.l}</span>
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mt-0.5">Est. Rank: #{btn.r}</span>
                               </div>
                            </div>
                            <Zap className="w-4 h-4 text-slate-600 group-hover:text-red-500 transition-all text-right shrink-0" />
                            {/* Visual Weight Bar */}
                            <div className="absolute bottom-0 left-0 h-[2px] bg-red-600/30 transition-all group-hover:bg-red-600" style={{ width: `${(parseInt(btn.r) / 9) * 100}%` }} />
                          </button>
                        ))}
                     </div>
                  </motion.div>
                )}
               </AnimatePresence>

               {!minimalMode && (
                 <button 
                  onClick={calculateSeverity}
                  className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-xl shadow-red-900/20 flex items-center justify-center gap-3"
                >
                  <Zap className="w-5 h-5" /> Run Tactical Prediction
                </button>
               )}
            </div>

            {/* Output Column */}
            <div className="lg:col-span-7 relative">
               {arHudActive && prediction && (
                 <div className="absolute inset-0 z-50 pointer-events-none rounded-2xl overflow-hidden">
                   <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
                   <div className="absolute top-0 left-0 w-full h-full border-[1px] border-blue-500/20 pointer-events-none" />
                   <motion.div 
                     animate={{ top: ['0%', '100%', '0%'] }}
                     transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                     className="absolute left-0 w-full h-[1px] bg-blue-500/40 blur-[2px]"
                   />
                   <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <div className="text-[6px] font-mono text-blue-400 uppercase tracking-widest">HUD_ACTIVE_LINK_STABLE</div>
                      <div className="text-[6px] font-mono text-blue-400 uppercase tracking-widest animate-pulse">TELEMETRY_STREAMING...</div>
                   </div>
                   <div className="absolute bottom-2 right-2 flex flex-col items-end gap-1">
                      <div className="text-[6px] font-mono text-blue-400 uppercase tracking-widest text-right">COORD: {form.location[0].toFixed(2)}N / {form.location[1].toFixed(2)}W</div>
                      <div className="text-[6px] font-mono text-blue-400 uppercase tracking-widest text-right">SIG_STRENGTH: 98%</div>
                   </div>
                 </div>
               )}

               {!prediction ? (
                 <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-20 text-center opacity-40">
                   <Zap className="w-20 h-20 mb-4" />
                   <p className="text-xs font-black uppercase tracking-[.4em]">Standby for Telemetry</p>
                 </div>
               ) : (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.98 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-suraksha-card border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
                 >
                    <div className={cn(
                      "p-10 text-center relative",
                      prediction.severity === 'CRITICAL' ? "bg-red-600/15" : "bg-yellow-500/10"
                    )}>
                      {prediction.severity === 'CRITICAL' && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-pulse" />
                      )}
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 block">AI Triage Conclusion</span>
                      <h2 className={cn(
                        "text-6xl font-black italic tracking-tighter uppercase mb-6",
                        prediction.severity === 'CRITICAL' ? "text-red-500" : "text-yellow-500"
                      )}>
                        {prediction.severity}
                      </h2>
                      
                      <div className="flex justify-center items-center gap-10">
                         <div>
                           <span className="text-[10px] text-slate-500 uppercase font-black block">Survival Prop.</span>
                           <span className="text-3xl font-mono font-black text-white">{prediction.survival}%</span>
                         </div>
                         <div className="w-px h-10 bg-slate-800" />
                         <div>
                           <span className="text-[10px] text-slate-500 uppercase font-black block">Urgency Rank</span>
                           <span className="text-3xl font-mono font-black text-white">#0{prediction.priority}</span>
                         </div>
                      </div>
                    </div>

                    <div className="p-8 space-y-8">
                       {/* Explainable AI Dashboard */}
                       <div className="bg-black/20 p-6 rounded-xl border border-slate-800/50">
                          <h4 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                            <Brain className="w-4 h-4 text-blue-500" /> Explainable AI (XAI) Dashboard
                          </h4>
                          <div className="space-y-6">
                            {prediction.breakdown.map((item: any, i: number) => (
                               <div key={i} className="group">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-black text-white uppercase">{item.factor}</span>
                                          <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold">{item.group}</span>
                                       </div>
                                       <p className="text-[10px] text-slate-500 mt-1 leading-tight">{item.description}</p>
                                    </div>
                                    <span className="text-xs font-mono font-black text-blue-400">+{item.weight}%</span>
                                  </div>
                                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                     <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.weight * 2}%` }}
                                        className={cn(
                                           "h-full transition-colors",
                                           item.weight > 30 ? "bg-red-500" : item.weight > 10 ? "bg-blue-500" : "bg-slate-500"
                                        )}
                                     />
                                  </div>
                               </div>
                            ))}
                          </div>

                          <div className="mt-8 pt-6 border-t border-slate-800/50">
                             <div className="flex items-start gap-3 bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
                                <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                                <p className="text-[10px] text-blue-400/80 leading-relaxed italic">
                                  "The AI verdict is synthesized from physiological telemetry and tactical context. High-weight factors indicate the primary drivers for survival window estimation."
                                </p>
                             </div>
                          </div>
                       </div>

                       {/* Tactical First-Aid Protocol */}
                       <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tactical Stabilization Protocol</h4>
                             <span className="text-[8px] font-mono text-blue-400 font-bold uppercase tracking-widest animate-pulse">Live Decision Support</span>
                          </div>
                          
                          {isGeneratingProtocol ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                               <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                               <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Generating TCCC Intelligence...</span>
                            </div>
                          ) : tcccProtocol ? (
                            <div className="space-y-4">
                               <div className="flex items-center gap-2 mb-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                                  <Sparkles className="w-3 h-3 text-blue-400" />
                                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">{tcccProtocol.protocolName}</span>
                               </div>

                               {/* Simple First Aid Steps */}
                               <div className="mb-6 p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                                  <div className="flex items-center gap-2 mb-3">
                                     <Activity className="w-3 h-3 text-green-500" />
                                     <h5 className="text-[10px] font-black uppercase text-green-500 tracking-widest">Immediate First Aid</h5>
                                  </div>
                                  <ul className="space-y-2">
                                     {tcccProtocol.firstAidSteps.map((step, idx) => (
                                       <li key={idx} className="flex items-center gap-3">
                                          <div className="w-1 h-1 bg-green-500 rounded-full" />
                                          <span className="text-[11px] font-bold text-white uppercase tracking-tight italic">{step}</span>
                                       </li>
                                     ))}
                                  </ul>
                               </div>

                               <div className="space-y-2">
                                  {tcccProtocol.steps.map((step, i) => (
                                    <motion.div 
                                      key={step.id}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.05 }}
                                      className="group relative"
                                    >
                                       <div className={cn(
                                         "flex flex-col gap-1 p-3 rounded border transition-all",
                                         step.priority === 'HIGH' ? "bg-red-950/20 border-red-900/50" : "bg-black/40 border-slate-800"
                                       )}>
                                          <div className="flex items-center justify-between">
                                             <span className="text-[8px] font-black tracking-widest uppercase text-slate-500">{step.category.replace('_', ' ')}</span>
                                             {step.priority === 'HIGH' && <span className="text-[8px] font-black text-red-500 uppercase animate-pulse">Immediate</span>}
                                          </div>
                                          <p className="text-xs font-bold text-white uppercase tracking-tight italic leading-snug">{step.step}</p>
                                       </div>
                                    </motion.div>
                                  ))}
                               </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {prediction.protocol.map((step: string, i: number) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3 bg-black/40 p-3 rounded border border-slate-800 group hover:border-blue-500/30 transition-colors"
                                >
                                    <div className="w-5 h-5 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-[10px] font-black text-blue-400">
                                      {i + 1}
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase tracking-tight italic">{step}</span>
                                  </motion.div>
                              ))}
                            </div>
                          )}
                       </div>

                       <button 
                        onClick={() => {
                           addPatient({
                             vitals: {
                                hr: form.hr,
                                bp: form.bp,
                                spo2: form.spo2,
                                gcs: form.gcs,
                                rr: form.rr
                             },
                             location: form.location,
                             history: history,
                             severity: prediction.severity,
                             predictedSurvivalMinutes: Math.floor(prediction.survival / 4),
                             injuryType: form.injuryDescription || 'Traumatic Injury',
                             injuryCategory: 'BLUNT'
                           });
                           setPrediction(null);
                        }}
                        className="w-full py-4 bg-slate-800 hover:bg-white text-white hover:text-black font-black uppercase text-xs tracking-widest rounded-xl transition-all"
                      >
                        Commit Casualty to Active Grid
                      </button>
                    </div>
                 </motion.div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
