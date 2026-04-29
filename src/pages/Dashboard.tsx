import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSystem } from '../context/SystemContext';
import { streamIntelligenceBrief } from '../services/geminiService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { 
  Users,
  Activity, 
  Clock, 
  ShieldAlert, 
  Heart, 
  TrendingUp,
  Brain,
  Zap,
  X,
  ShieldCheck,
  RotateCcw,
  User,
  AlertTriangle,
  ChevronRight,
  Plane,
  Truck,
  Send,
  Shield,
  Crosshair,
  Hospital,
  Skull,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Patient, Severity } from '../types';

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

const getResourceColor = (status: string) => {
  if (status === 'AVAILABLE') return '#10b981'; // green-500
  if (status === 'OCCUPIED') return '#6366f1'; // indigo-500
  return '#94a3b8'; // slate-400
};

const getSeverityColor = (severity: string) => {
  if (severity === 'CRITICAL') return '#ef4444';
  if (severity === 'SEVERE') return '#f59e0b';
  if (severity === 'MODERATE') return '#3b82f6';
  return '#10b981';
};

const PatientMarkerIcon = (severity: string, isCritical: boolean) => {
  const color = getSeverityColor(severity);
  return L.divIcon({
    className: 'custom-patient-marker',
    html: `
      <div style="position: relative; width: 14px; height: 14px; transform: rotate(45deg); background: ${color}; border: 2px solid white; box-shadow: 0 0 10px ${color}80;">
        ${isCritical ? '<div style="position: absolute; inset: -4px; border: 1px solid white; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
      </div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const ResourceMarkerIcon = (type: string, status: string) => {
  const color = getResourceColor(status);
  let iconHtml = '';
  
  if (type === 'HELO') iconHtml = 'H';
  else if (type === 'HOSPITAL') iconHtml = '+';
  else if (type === 'BASE') iconHtml = 'B';
  else if (type === 'DRONE') iconHtml = 'D';
  else if (type === 'MRAP') iconHtml = 'R';
  else if (type === 'APC') iconHtml = 'C';
  else if (type === 'AMBULANCE') iconHtml = 'A';
  else iconHtml = 'M';

  return L.divIcon({
    className: 'custom-resource-marker',
    html: `<div style="background-color: ${color}; width: 18px; height: 18px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-family: monospace; font-weight: 900; font-size: 10px; border-radius: 2px;">${iconHtml}</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

const AdversaryMarkerIcon = (threatLevel: string, type: string) => {
  const color = threatLevel === 'EXTREME' ? '#ff0055' : threatLevel === 'HIGH' ? '#fb7185' : '#fda4af';
  let iconChar = type === 'SNIPER' ? 'S' : type === 'ARMOR' ? 'A' : 'I';
  
  return L.divIcon({
    className: 'custom-adversary-marker',
    html: `
      <div style="background-color: ${color}; width: 20px; height: 20px; clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); border: 2px solid #000; box-shadow: 0 0 12px rgba(255,0,0,0.7); display: flex; align-items: center; justify-content: center; color: black; font-family: monospace; font-weight: 900; font-size: 11px;">
        ${iconChar}
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

import 'leaflet/dist/leaflet.css';

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
}

const VitalsDisplay: React.FC<{ vitals: Patient['vitals'], condensed?: boolean }> = ({ vitals, condensed }) => {
  const isHRAlert = vitals.hr > 120 || vitals.hr < 50;
  const isSpO2Alert = vitals.spo2 < 92;
  const isRRAlert = vitals.rr > 25 || vitals.rr < 12;
  const isGCSAlert = vitals.gcs < 10;

  if (condensed) {
    return (
      <div className="flex gap-2">
        <div className={cn("flex flex-col items-center bg-black/30 px-2 py-1 rounded min-w-[36px]", isHRAlert && "ring-1 ring-red-500 animate-pulse bg-red-500/10")}>
          <span className="text-[7px] text-slate-500 uppercase">HR</span>
          <span className={cn("text-[10px] font-mono font-bold", isHRAlert ? "text-red-400" : "text-white")}>{vitals.hr}</span>
        </div>
        <div className={cn("flex flex-col items-center bg-black/30 px-2 py-1 rounded min-w-[36px]", isSpO2Alert && "ring-1 ring-red-500 animate-pulse bg-red-500/10")}>
          <span className="text-[7px] text-slate-500 uppercase">SpO2</span>
          <span className={cn("text-[10px] font-mono font-bold", isSpO2Alert ? "text-red-400" : "text-white")}>{vitals.spo2}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {[
        { label: 'HR', val: vitals.hr, alert: isHRAlert, unit: 'bpm', icon: Heart },
        { label: 'SpO2', val: vitals.spo2, alert: isSpO2Alert, unit: '%', icon: Activity },
        { label: 'RR', val: vitals.rr, alert: isRRAlert, unit: '/m', icon: TrendingUp },
        { label: 'BP', val: vitals.bp, alert: false, unit: '', icon: Activity },
        { label: 'GCS', val: vitals.gcs, alert: isGCSAlert, unit: '', icon: Brain },
      ].map((v, i) => (
        <div key={i} className={cn(
          "bg-black/40 border border-slate-800 p-2 rounded-lg text-center transition-all",
          v.alert && "border-red-500/50 bg-red-500/10 scale-[1.02]"
        )}>
          <div className="flex items-center justify-center gap-1 mb-1">
             <v.icon className={cn("w-2.5 h-2.5", v.alert ? "text-red-400" : "text-slate-500")} />
             <span className="text-[8px] text-slate-500 uppercase font-black">{v.label}</span>
          </div>
          <div className="flex items-baseline justify-center gap-0.5">
             <span className={cn("text-xs font-mono font-black", v.alert ? "text-red-400" : "text-white")}>{v.val}</span>
             {v.unit && <span className="text-[7px] text-slate-600 uppercase italic font-bold">{v.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

const formatSurvivalTime = (minutes: number) => {
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

const PatientPriorityCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  const isCritical = patient.severity === 'CRITICAL';
  const isSevere = patient.severity === 'SEVERE';
  const isModerate = patient.severity === 'MODERATE';
  
  const getUrgencyLabel = () => {
    if (isCritical) return "IMMEDIATE";
    if (isSevere) return "5-10 MIN";
    if (isModerate) return "DELAYED";
    return "MONITORING";
  };

  const isLowSurvival = patient.predictedSurvivalMinutes < 10;

  return (
    <motion.div 
      layout
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "border rounded-lg p-3 transition-all relative overflow-hidden cursor-pointer group",
        isCritical ? "bg-red-500/10 border-red-500/40 ring-1 ring-red-500/20" : 
        isSevere ? "bg-yellow-500/5 border-yellow-900/30 opacity-95 hover:bg-yellow-500/10" : 
        "bg-slate-900/50 border-slate-800 opacity-80 hover:opacity-100 hover:bg-slate-800/50"
      )}
    >
      {isCritical && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
          <div className="absolute top-0 right-0 w-full h-1 bg-red-600 animate-pulse" />
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[9px] px-1.5 py-0.5 rounded font-black tracking-tighter",
            isCritical ? "bg-red-600 text-white" : 
            isSevere ? "bg-yellow-500 text-black" : 
            isModerate ? "bg-blue-600 text-white" : "bg-green-600 text-white"
          )}>
            {getUrgencyLabel()}
          </span>
          <span className="text-[10px] font-bold font-mono text-slate-400">{patient.id}</span>
        </div>
        <div className="text-right">
          <span className="text-[8px] text-slate-500 block uppercase font-black tracking-widest">Surv. Window</span>
          <span className={cn(
            "text-xs font-mono font-black",
            isLowSurvival ? "text-red-500 animate-pulse drop-shadow-[0_0_4px_#ef4444]" : isSevere ? "text-yellow-500" : "text-slate-300"
          )}>
            {formatSurvivalTime(patient.predictedSurvivalMinutes)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white truncate max-w-[120px]">{patient.name}</span>
          <span className="text-[10px] text-slate-500 italic mt-0.5">{patient.injuryType}</span>
        </div>
        <VitalsDisplay vitals={patient.vitals} condensed />
      </div>

      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 pt-1 group-hover:text-white transition-colors">
        <span>Tactical Intel</span>
        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
};

export const Dashboard = () => {
  const { 
    patients, 
    resources, 
    adversaries,
    tacticalContext, 
    accuracy, 
    updatePatient, 
    logOutcome,
    alerts,
    voiceCommsEnabled,
    setVoiceCommsEnabled,
    audioUnlocked,
    unlockAudio
  } = useSystem();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [intelBrief, setIntelBrief] = useState<string>('Initializing AI Tactical Link...');
  const [isBriefing, setIsBriefing] = useState(false);
  const briefRef = useRef<HTMLParagraphElement>(null);

  // BOLT: Low-latency streaming intel brief
  useEffect(() => {
    let active = true;
    const runBrief = async () => {
      setIsBriefing(true);
      setIntelBrief('');
      const stream = streamIntelligenceBrief(patients, alerts);
      for await (const chunk of stream) {
        if (!active) break;
        setIntelBrief(prev => prev + chunk);
      }
      setIsBriefing(false);
    };

    runBrief();
    
    // Refresh every 2 minutes
    const interval = setInterval(runBrief, 120000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [patients, alerts]);

  const selectedPatient = useMemo(() => patients.find(p => p.id === selectedPatientId), [patients, selectedPatientId]);

  const sortedPatients = useMemo(() => [...patients]
    .filter(p => !p.outcome)
    .sort((a, b) => {
      const sevMap: Record<string, number> = { CRITICAL: 4, SEVERE: 3, MODERATE: 2, STABLE: 1 };
      return sevMap[b.severity] - sevMap[a.severity] || a.predictedSurvivalMinutes - b.predictedSurvivalMinutes;
    }), [patients]);

  const handleOverride = useCallback((newSeverity: Severity) => {
    if (!selectedPatient) return;
    updatePatient(selectedPatient.id, {
      severity: newSeverity,
      override: {
        originalSeverity: selectedPatient.severity,
        overriddenSeverity: newSeverity,
        medicId: 'MED-01',
        reason: 'Clinical override: Vitals show instability despite machine prediction.',
        timestamp: new Date().toISOString()
      }
    });
  }, [selectedPatient, updatePatient]);

  return (
    <div className="p-6 h-full flex flex-col gap-6 relative">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tactical Load', value: patients.filter(p => !p.outcome).length, icon: Users, color: 'text-blue-400' },
          { label: 'Critical Alert', value: patients.filter(p => p.severity === 'CRITICAL' && !p.outcome).length, icon: ShieldAlert, color: 'text-red-500' },
          { label: 'System Accuracy', value: `${accuracy.toFixed(1)}%`, icon: Brain, color: 'text-green-400' },
          { 
            label: 'Context', 
            custom: true,
            render: () => (
              <div className="bg-suraksha-card border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">Context</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black tracking-tight text-purple-400">{tacticalContext}</span>
                    <button 
                      onClick={() => {
                        const nextVal = !voiceCommsEnabled;
                        setVoiceCommsEnabled(nextVal);
                        if (nextVal) unlockAudio();
                      }}
                      className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter transition-all flex items-center gap-1.5",
                        voiceCommsEnabled 
                          ? (audioUnlocked ? "bg-amber-500 text-black shadow-[0_0_10px_#f59e0b44]" : "bg-red-500 text-white animate-pulse")
                          : "bg-slate-800 text-slate-500"
                      )}
                    >
                      {voiceCommsEnabled && audioUnlocked && <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />}
                      {voiceCommsEnabled ? (audioUnlocked ? 'ACTIVE' : 'READY') : 'OFF'}
                    </button>
                  </div>
                </div>
                <Activity className="w-8 h-8 opacity-20 text-purple-400" />
              </div>
            )
          },
        ].map((m, i) => (
          m.custom ? <React.Fragment key={i}>{m.render?.()}</React.Fragment> : (
            <div 
              key={i} 
              className="bg-suraksha-card border border-slate-800 rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">{m.label}</span>
                <span className={cn("text-2xl font-black tracking-tight", m.color)}>{m.value}</span>
              </div>
              <m.icon className={cn("w-8 h-8 opacity-20", m.color)} />
            </div>
          )
        ))}
      </div>

      <AnimatePresence>
        {voiceCommsEnabled && !audioUnlocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-10 h-10 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Tactical Link Offline</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Browser protocol requires manual authorization for AI Audio Uplink. Synchronize the MESH network to activate real-time voice intelligence.
              </p>
              <button 
                onClick={unlockAudio}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_#dc262644] transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <Zap className="w-5 h-5" /> Synchronize Audio Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 overflow-hidden">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          <div className="h-[480px] bg-suraksha-card border border-slate-800 rounded-xl overflow-hidden relative z-0 tactical-map-container shrink-0">
             <div className="tactical-map-overlay" />
             <MapContainer 
              center={[34.5684, -116.3214]} 
              zoom={14} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              />
              {patients.map(p => (
                <Marker 
                  key={p.id} 
                  position={p.location} 
                  icon={PatientMarkerIcon(p.severity, p.severity === 'CRITICAL')}
                >
                  <Popup className="tactical-popup">
                    <div className="text-white italic font-bold text-xs font-mono uppercase">{p.id} - {p.severity}</div>
                    <div className="text-[10px] text-slate-300 uppercase font-black">{p.injuryType}</div>
                  </Popup>
                </Marker>
              ))}
              {resources.map(r => (
                <Marker 
                  key={r.id} 
                  position={r.location} 
                  icon={ResourceMarkerIcon(r.type, r.status)}
                >
                  <Popup className="tactical-popup">
                    <div className="text-white italic font-bold text-xs font-mono uppercase">{r.name}</div>
                    <div className="text-[10px] text-slate-300 uppercase font-black">{r.type} // {r.status}</div>
                  </Popup>
                </Marker>
              ))}
              {adversaries.map(adv => (
                <Marker 
                  key={adv.id} 
                  position={adv.location} 
                  icon={AdversaryMarkerIcon(adv.threatLevel, adv.type)}
                >
                  <Popup className="tactical-popup">
                    <div className="text-red-400 italic font-bold text-xs font-mono uppercase">HOSTILE CONTACT: {adv.type}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">THREAT: {adv.threatLevel} // ID: {adv.id}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded border border-white/10 z-[1000] text-[10px] space-y-4 w-44 shadow-2xl">
              <div>
                <span className="text-slate-500 font-black uppercase tracking-widest block mb-1 border-b border-white/5 pb-1">Casualties (Diamond)</span>
                <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rotate-45 bg-red-500 border border-white/30" />
                    <span className="text-slate-300 uppercase text-[8px]">Critical</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rotate-45 bg-amber-500 border border-white/30" />
                    <span className="text-slate-300 uppercase text-[8px]">Severe</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rotate-45 bg-blue-500 border border-white/30" />
                    <span className="text-slate-300 uppercase text-[8px]">Mod</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rotate-45 bg-green-500 border border-white/30" />
                    <span className="text-slate-300 uppercase text-[8px]">Stable</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-black uppercase tracking-widest block mb-1 border-b border-white/5 pb-1">Asset Status</span>
                <div className="flex justify-between items-center px-1 mb-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-green-500 border border-white/30" />
                    <span className="text-slate-400 uppercase text-[7px]">Avail</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-indigo-500 border border-white/30" />
                    <span className="text-slate-400 uppercase text-[7px]">Tasked</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-slate-400 border border-white/30" />
                    <span className="text-slate-400 uppercase text-[7px]">Stdby</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pl-1 border-l-2 border-white/5">
                  <span className="text-slate-300">H: Helo</span>
                  <span className="text-slate-300">+: Hosp</span>
                  <span className="text-slate-300">B: Base</span>
                  <span className="text-slate-300">D: Drone</span>
                  <span className="text-slate-300">R: MRAP</span>
                  <span className="text-slate-300">C: APC</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-black uppercase tracking-widest block mb-1 border-b border-white/5 pb-1">Hostiles (Oct)</span>
                <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-600 border border-black flex items-center justify-center text-[7px] font-black rounded-sm" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>I</div>
                    <span className="text-slate-300 uppercase text-[8px]">Infantry</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-600 border border-black flex items-center justify-center text-[7px] font-black rounded-sm" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>A</div>
                    <span className="text-slate-300 uppercase text-[8px]">Armor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-red-600 border border-black flex items-center justify-center text-[7px] font-black rounded-sm" style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}>S</div>
                    <span className="text-slate-300 uppercase text-[8px]">Sniper</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 space-y-2 z-[1000]">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_5px_#dc2626]"></span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Critical</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Severe</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Stable</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
             {/* AI Intelligence Brief */}
             <div className="col-span-12 md:col-span-4 bg-suraksha-card border border-slate-800 rounded-xl p-4 flex flex-col min-h-0 relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                   {isBriefing && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />}
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3 h-3" /> AI Intel Brief
                </span>
                <div className="flex-1 overflow-y-auto scrollbar-none">
                  <p ref={briefRef} className="text-[10px] text-slate-300 leading-relaxed font-mono">
                    {intelBrief}
                    {isBriefing && <span className="inline-block w-1 h-3 bg-blue-500 ml-0.5 animate-pulse" />}
                  </p>
                </div>
             </div>

             {/* Tactical Assets Integrated */}
             <div className="col-span-12 md:col-span-8 bg-suraksha-card border border-slate-800 rounded-xl p-4 flex flex-col min-h-0">
               <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-2">Asset Status Monitor</span>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 overflow-y-auto scrollbar-none pb-2">
                 {resources.map(r => (
                   <div key={r.id} className="flex justify-between items-center text-[9px] bg-black/20 p-1.5 rounded border border-white/5">
                     <div className="flex items-center gap-1.5 truncate pr-2">
                        {r.type === 'HELO' && <Plane className="w-2.5 h-2.5 text-blue-400" />}
                        {r.type === 'MRAP' && <Shield className="w-2.5 h-2.5 text-amber-400" />}
                        {r.type === 'APC' && <Truck className="w-2.5 h-2.5 text-slate-400" />}
                        {r.type === 'DRONE' && <Send className="w-2.5 h-2.5 text-purple-400" />}
                        {r.type === 'AMBULANCE' && <Truck className="w-2.5 h-2.5 text-green-400" />}
                        {r.type === 'MEDIC_TEAM' && <Users className="w-2.5 h-2.5 text-red-400" />}
                        {r.type === 'HOSPITAL' && <Hospital className="w-2.5 h-2.5 text-white" />}
                        {r.type === 'BASE' && <Crosshair className="w-2.5 h-2.5 text-white" />}
                        <span className="text-slate-400 uppercase truncate font-bold">{r.name}</span>
                     </div>
                     <span className={cn(
                       "font-black text-[8px]",
                       r.status === 'AVAILABLE' ? "text-green-500" : 
                       r.status === 'OCCUPIED' ? "text-indigo-400" : "text-slate-400"
                     )}>{r.id.split('-').pop()}</span>
                   </div>
                 ))}
               </div>
             </div>

             {/* Critical Summary Strip */}
             <div className="col-span-12 bg-suraksha-card border border-slate-800 rounded-xl p-4 flex flex-col min-h-0 mb-4 shadow-2xl">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800/50">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Skull className="w-3 h-3 text-red-500" /> Active Critical Casuallties
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] text-slate-500 font-bold uppercase">Sorted Priority</span>
                    <div className="h-4 w-[1px] bg-slate-800" />
                    <span className="text-[8px] text-red-500 font-black uppercase animate-pulse">Live Feed</span>
                  </div>
                </div>
                <div className="space-y-1.5 overflow-y-auto max-h-[120px] scrollbar-thin scrollbar-thumb-slate-800 pr-2">
                  {patients
                    .filter(p => p.severity === 'CRITICAL' && !p.outcome)
                    .sort((a, b) => a.predictedSurvivalMinutes - b.predictedSurvivalMinutes)
                    .map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => setSelectedPatientId(p.id)}
                        className="grid grid-cols-12 items-center bg-black/20 hover:bg-red-500/10 border border-slate-800/50 p-2.5 rounded-lg transition-all cursor-pointer group"
                      >
                        <div className="col-span-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
                          <span className="text-white font-mono font-bold text-[10px]">{p.id}</span>
                        </div>
                        <div className="col-span-6 text-slate-400 group-hover:text-slate-200 truncate pr-4 text-[10px] uppercase font-bold italic tracking-tight">
                          {p.injuryType}
                        </div>
                        <div className="col-span-4 flex items-center gap-3 justify-end">
                          <div className="flex flex-col items-end">
                            <span className={cn(
                              "font-mono font-black text-xs",
                              p.predictedSurvivalMinutes < 10 ? "text-red-500 drop-shadow-[0_0_4px_#ef4444] animate-pulse" : "text-amber-500"
                            )}>
                              {formatSurvivalTime(p.predictedSurvivalMinutes)}
                            </span>
                          </div>
                          <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    ))}
                </div>
             </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-hidden h-full">
          {/* Triage Queue - Main Sidebar Focus */}
          <div className="flex-[2] bg-suraksha-sidebar border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Priority Triage Queue</h3>
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-500 border border-slate-800 rounded px-2 py-0.5">
                <div className="w-1 h-1 bg-red-500 rounded-full" /> LIVE_SYNC
              </div>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {sortedPatients.map(p => (
                  <PatientPriorityCard 
                    key={p.id} 
                    patient={p} 
                    onClick={() => setSelectedPatientId(p.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
            <div className="p-3 border-t border-slate-800 bg-black/40">
               <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                 <span>Load: {sortedPatients.length} Ops</span>
                 <span className="text-xs text-white font-black">{accuracy.toFixed(0)}% OPTIMAL</span>
               </div>
            </div>
          </div>

          <div className="flex-1 bg-suraksha-sidebar border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-black/20">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-500 shadow-[0_0_8px_#eab308]" /> Swarm Intel Feed
              </h3>
              <div className="px-2 py-0.5 bg-slate-800 rounded text-[8px] font-bold text-slate-400">4 Active</div>
            </div>
            <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-none">
               {[
                 { user: 'Medic 04', action: 'applied tourniquet', target: 'P-902', time: '2m ago' },
                 { user: 'Team Bravo', action: 'evac requested', target: 'LZ-Echo', time: '5m ago' },
                 { user: 'AI Core', action: 'priority update', target: 'ALL_GRID', time: '8m ago' },
                 { user: 'Medic 12', action: 'verified triage', target: 'P-105', time: '12m ago' },
               ].map((log, i) => (
                 <div key={i} className="flex gap-3 text-[10px] border-b border-white/5 pb-2 last:border-0 hover:bg-white/5 p-1 rounded transition-colors group">
                    <div className="w-7 h-7 rounded border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0 group-hover:border-blue-500/50">
                       <Users className="w-3 h-3 text-slate-600 group-hover:text-blue-400" />
                    </div>
                    <div>
                       <p className="text-slate-400"><span className="font-black text-white">{log.user}</span> {log.action}</p>
                       <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-slate-600 font-bold uppercase text-[8px]">{log.target}</span>
                          <span className="text-[8px] opacity-40 font-mono italic">{log.time}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatientId(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-suraksha-sidebar border-l border-slate-800 z-[2001] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase text-white tracking-tighter italic">Patient Intel Digest</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">ID: {selectedPatient.id} // SECURE_CHANNEL_V4</p>
                </div>
                <button onClick={() => setSelectedPatientId(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Identity & Origin */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                    <User className="w-8 h-8 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white leading-none">{selectedPatient.name}</h3>
                    <p className="text-xs text-blue-400 font-bold uppercase mt-1">{selectedPatient.rank} // {selectedPatient.history.bloodType || 'U'} POS</p>
                    <div className="flex gap-2 mt-2">
                       <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase tracking-widest">FITNESS: {selectedPatient.history.fitnessLevel}</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Telemetry Stream */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono italic">// Live_Telemetry_Uplink</h4>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Active Data Stream</span>
                    </div>
                  </div>
                  <VitalsDisplay vitals={selectedPatient.vitals} />
                </div>

                {/* AI Verdict & Override */}
                <div className="bg-black/20 border border-slate-800 rounded-xl p-5">
                   <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">AI Triage Conclusion</span>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-black uppercase italic",
                        selectedPatient.severity === 'CRITICAL' ? "bg-red-500 text-white" : "bg-yellow-500 text-black"
                      )}>
                        {selectedPatient.severity}
                      </span>
                   </div>
                   
                   <div className="space-y-3">
                      <p className="text-xs text-slate-400 leading-relaxed italic">
                        "Machine learning models detect physiological instability markers. Trauma mechanism suggestive of severe internal bleeding."
                      </p>
                      
                      <div className="pt-4 border-t border-slate-800/50">
                        <span className="text-[9px] text-slate-500 uppercase font-black block mb-3">Professional Override</span>
                        <div className="grid grid-cols-2 gap-2">
                           <button 
                            onClick={() => handleOverride('CRITICAL')}
                            className={cn("py-2 text-[10px] font-black uppercase rounded border transition-all", selectedPatient.severity === 'CRITICAL' ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/40" : "bg-slate-900 border-slate-800 text-slate-500")}
                           >
                             Force Critical
                           </button>
                           <button 
                            onClick={() => handleOverride('SEVERE')}
                            className={cn("py-2 text-[10px] font-black uppercase rounded border transition-all", selectedPatient.severity === 'SEVERE' ? "bg-yellow-600 border-yellow-500 text-white shadow-lg shadow-yellow-900/40" : "bg-slate-900 border-slate-800 text-slate-500")}
                           >
                             Downgrade
                           </button>
                        </div>
                      </div>

                      {selectedPatient.override && (
                        <div className="mt-4 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                           <div className="flex items-center gap-2 mb-1">
                              <ShieldCheck className="w-3 h-3 text-purple-400" />
                              <span className="text-[10px] font-black text-purple-400 uppercase">Medic Override Active</span>
                           </div>
                           <p className="text-[10px] text-slate-400 leading-tight">{selectedPatient.override.reason}</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* TCCC Treatment Protocol Intelligence */}
                {selectedPatient.tcccProtocol && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono italic">// TCCC_Treatment_Intel</h4>
                      <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                    </div>
                    <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl overflow-hidden">
                       <div className="bg-blue-600/10 p-3 border-b border-blue-500/20">
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{selectedPatient.tcccProtocol.protocolName}</span>
                       </div>

                       {/* Simple First Aid Summary in Dashboard */}
                       <div className="p-4 border-b border-blue-500/10 bg-green-500/5">
                          <div className="flex items-center gap-2 mb-2">
                             <Activity className="w-2.5 h-2.5 text-green-500" />
                             <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Foundational First Aid</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                             {selectedPatient.tcccProtocol.firstAidSteps.map((step, i) => (
                               <div key={i} className="px-2 py-1 bg-black/40 border border-green-500/20 rounded text-[9px] font-bold text-white uppercase italic tracking-tight">
                                  {step}
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="p-4 space-y-3">
                          {selectedPatient.tcccProtocol.steps.map((step, idx) => (
                            <div 
                              key={step.id} 
                              className={cn(
                                "flex items-start gap-3 p-3 rounded border transition-all cursor-pointer group hover:border-blue-500/50",
                                step.completed ? "bg-green-500/10 border-green-500/30 opacity-60" : "bg-black/40 border-slate-800",
                                !step.completed && step.priority === 'HIGH' && "border-red-500/30 ring-1 ring-red-500/10"
                              )}
                              onClick={() => {
                                if (!selectedPatient.tcccProtocol) return;
                                const newSteps = [...selectedPatient.tcccProtocol.steps];
                                newSteps[idx] = { ...newSteps[idx], completed: !newSteps[idx].completed };
                                updatePatient(selectedPatient.id, {
                                  tcccProtocol: {
                                    ...selectedPatient.tcccProtocol,
                                    steps: newSteps
                                  }
                                });
                              }}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                                step.completed ? "bg-green-500 border-green-500 text-black" : "bg-slate-900 border-slate-700 text-slate-500 group-hover:border-blue-500/50"
                              )}>
                                {step.completed ? <ShieldCheck className="w-3 h-3" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-0.5">
                                   <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{step.category.replace('_', ' ')}</span>
                                   {!step.completed && step.priority === 'HIGH' && <span className="text-[7px] font-black text-red-500 uppercase animate-pulse">Priority Alpha</span>}
                                </div>
                                <p className={cn(
                                  "text-[11px] font-bold uppercase tracking-tight italic",
                                  step.completed ? "text-slate-500 line-through" : "text-white group-hover:text-blue-200"
                                )}>
                                  {step.step}
                                </p>
                              </div>
                            </div>
                          ))}
                       </div>
                       <div className="p-3 bg-black/40 border-t border-blue-500/10 flex justify-between items-center">
                          <span className="text-[8px] text-slate-500 font-mono uppercase">AI_STABILIZATION_LINK: ENCRYPTED</span>
                          <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest">
                            {selectedPatient.tcccProtocol.steps.filter(s => s.completed).length} / {selectedPatient.tcccProtocol.steps.length} STEPS_LOGGED
                          </span>
                       </div>
                    </div>
                  </div>
                )}

                {/* Tactical Actions */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono italic">// Field_Execution_Protocols</h4>
                  <div className="grid grid-cols-1 gap-2">
                     <button 
                        onClick={() => { logOutcome(selectedPatient.id, 'SURVIVED'); setSelectedPatientId(null); }}
                        className="py-4 bg-green-600/10 border border-green-500/30 text-green-500 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                     >
                       <ShieldCheck className="w-4 h-4" /> Final Outcome: SURVIVED
                     </button>
                     <button 
                        onClick={() => { logOutcome(selectedPatient.id, 'DECEASED'); setSelectedPatientId(null); }}
                        className="py-4 bg-red-600/10 border border-red-500/30 text-red-500 font-black uppercase text-xs tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                     >
                        <AlertTriangle className="w-4 h-4" /> Final Outcome: FATALITY
                     </button>
                     <button className="py-4 bg-slate-900 border border-slate-800 text-slate-500 font-black uppercase text-xs tracking-widest rounded-xl hover:border-slate-500 hover:text-white transition-all flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                        <RotateCcw className="w-4 h-4" /> Reset Triage Cycle
                     </button>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-800 bg-black/20">
                 <button 
                  onClick={() => setSelectedPatientId(null)}
                  className="w-full py-4 border border-slate-700 text-xs font-black uppercase text-slate-500 hover:text-white hover:border-slate-500 transition-all rounded-xl"
                 >
                   EXIT_DIGEST_MODE
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
