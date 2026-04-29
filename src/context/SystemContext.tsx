import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Patient, Resource, Adversary, Alert, Severity, TacticalContext } from '../types';
import { MOCK_PATIENTS, MOCK_RESOURCES, MOCK_ADVERSARIES, MOCK_ALERTS } from '../constants';
import { speakTactical } from '../services/geminiService';

interface SystemContextType {
  patients: Patient[];
  resources: Resource[];
  adversaries: Adversary[];
  alerts: Alert[];
  panicMode: boolean;
  tacticalContext: TacticalContext;
  setTacticalContext: (val: TacticalContext) => void;
  setPanicMode: (val: boolean) => void;
  addPatient: (p: Partial<Patient>) => void;
  bulkAddPatients: (patients: Patient[]) => void;
  clearAllPatients: () => void;
  addAlert: (alert: Partial<Alert>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  logOutcome: (id: string, outcome: Patient['outcome']) => void;
  accuracy: number;
  stressIndex: number;
  voiceCommsEnabled: boolean;
  setVoiceCommsEnabled: (val: boolean) => void;
  audioUnlocked: boolean;
  unlockAudio: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [adversaries, setAdversaries] = useState<Adversary[]>(MOCK_ADVERSARIES);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [panicMode, setPanicMode] = useState(false);
  const [tacticalContext, setTacticalContext] = useState<TacticalContext>('BATTLEFIELD');
  const [accuracy, setAccuracy] = useState(94.2);
  const [stressIndex, setStressIndex] = useState(0);
  const [voiceCommsEnabled, setVoiceCommsEnabled] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [processedTTSAlerts, setProcessedTTSAlerts] = useState<string[]>([]);

  // Watch for new critical alerts and speak them (Audio Spark)
  useEffect(() => {
    const latestAlert = alerts[0]; // Alerts are unshifted (newest first) in some updates
    if (latestAlert && latestAlert.type === 'CRITICAL' && voiceCommsEnabled && !processedTTSAlerts.includes(latestAlert.id)) {
      speakTactical(latestAlert.message).catch(console.error);
      setProcessedTTSAlerts(prev => [...prev, latestAlert.id]);
    }
  }, [alerts, voiceCommsEnabled, processedTTSAlerts]);

  // Compute stress index based on critical patients and pending alerts
  useEffect(() => {
    const criticals = patients.filter(p => p.severity === 'CRITICAL' && !p.outcome).length;
    const severe = patients.filter(p => p.severity === 'SEVERE' && !p.outcome).length;
    const newStress = Math.min(100, (criticals * 25) + (severe * 10));
    setStressIndex(newStress);
    setPanicMode(newStress > 60);
  }, [patients]);

  // Simulation: Update survival windows based on severity decay
  useEffect(() => {
    // Current "Simulation Tick" is defined as 15 seconds for a fast-paced tactical feel
    const TICK_INTERVAL = 15000; 
    
    const timer = setInterval(() => {
      setPatients(prev => prev.map(p => {
        // No decay for stable, already treated, or outcome-logged patients
        if (p.severity === 'STABLE' || p.status === 'TREATED' || p.outcome) return p;

        // Decay rates (minutes lost per simulation tick)
        let decayPerTick = 0.5; // MODERATE base decay
        if (p.severity === 'CRITICAL') decayPerTick = 2.0;
        else if (p.severity === 'SEVERE') decayPerTick = 1.0;
        
        const newSurvival = Math.max(0, p.predictedSurvivalMinutes - decayPerTick);
        
        // Auto-alert escalation for critical threshold
        if (newSurvival < 5 && p.severity === 'CRITICAL' && p.status !== 'EN_ROUTE' && p.status !== 'TREATED') {
          const alertExists = alerts.some(a => a.patientId === p.id && a.message.includes('Survival window critical'));
          if (!alertExists) {
             const newAlert: Alert = {
               id: `ALERT-${Date.now()}`,
               type: 'CRITICAL',
               message: `CRITICAL: Survival window for ${p.id} near zero (${Math.round(newSurvival)}m). Immediate MEDEVAC required.`,
               timestamp: new Date().toISOString(),
               patientId: p.id
             };
             setAlerts(prevA => [newAlert, ...prevA]);
          }
        }

        return {
          ...p,
          predictedSurvivalMinutes: newSurvival
        };
      }));
    }, TICK_INTERVAL);
    return () => clearInterval(timer);
  }, [alerts]);

  // Real-time Vitals Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPatients(prev => prev.map(patient => {
        // Only fluctuate patients who aren't dead or successfully treated
        if (patient.outcome || patient.status === 'TREATED') return patient;
        
        const fluctuate = (val: number, range: number) => {
          const delta = (Math.random() * range - range/2);
          return Math.max(0, val + delta);
        };
        
        const newVitals = {
          ...patient.vitals,
          hr: Math.round(fluctuate(patient.vitals.hr, 4)),
          spo2: Math.min(100, Math.round(fluctuate(patient.vitals.spo2, 1.5))),
          rr: Math.round(fluctuate(patient.vitals.rr, 2)),
          // GCS and BP are more stable but can fluctuate slightly
          gcs: Math.max(3, Math.min(15, Math.round(fluctuate(patient.vitals.gcs, 0.4))))
        };

        // Every 30 seconds, push to history for the charts
        const lastSnapshot = patient.vitalsHistory?.[patient.vitalsHistory.length - 1];
        const shouldStore = !lastSnapshot || (Date.now() - new Date(lastSnapshot.timestamp).getTime() > 30000);

        return {
          ...patient,
          vitals: newVitals,
          vitalsHistory: shouldStore 
            ? [...(patient.vitalsHistory || []), { ...newVitals, timestamp: new Date().toISOString() }]
            : patient.vitalsHistory,
          lastUpdated: new Date().toISOString()
        };
      }));
    }, 4000); 

    return () => clearInterval(interval);
  }, []);

  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;
    const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
    audio.play().then(() => {
      setAudioUnlocked(true);
    }).catch(console.error);
  }, [audioUnlocked]);

  const addAlert = useCallback((a: Partial<Alert>) => {
    const newAlert: Alert = {
      id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'INFO',
      message: 'System Alert',
      timestamp: new Date().toISOString(),
      ...a
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  const updatePatient = useCallback((id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => {
      if (p.id === id) {
        const newVitals = updates.vitals || p.vitals;
        const newHistory = [...(p.vitalsHistory || [])];
        
        // Only add to history if vitals actually changed or if it's the first one
        if (updates.vitals || newHistory.length === 0) {
          newHistory.push({ ...newVitals, timestamp: new Date().toISOString() });
        }

        return { 
          ...p, 
          ...updates, 
          vitalsHistory: newHistory,
          lastUpdated: new Date().toISOString() 
        };
      }
      return p;
    }));
  }, []);

  const updateResource = useCallback((id: string, updates: Partial<Resource>) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const logOutcome = useCallback((id: string, outcome: Patient['outcome']) => {
    updatePatient(id, { outcome, status: 'TREATED' });
    setAccuracy(prev => prev + (Math.random() * 0.2 - 0.05)); // Simulate learning
  }, [updatePatient]);

  const addPatient = useCallback((p: Partial<Patient>) => {
    const newPatient: Patient = {
      id: `P-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: 'Unknown Soldier',
      history: { age: 25, fitnessLevel: 'STANDARD', allergies: [], bloodType: 'UNKN' },
      injuryType: 'Unknown Trauma',
      location: [34.0522 + (Math.random() * 0.01 - 0.005), -118.2437 + (Math.random() * 0.01 - 0.005)],
      vitals: { hr: 80, bp: '120/80', spo2: 95, gcs: 15, rr: 18 },
      vitalsHistory: [{ hr: 80, bp: '120/80', spo2: 95, gcs: 15, rr: 18, timestamp: new Date().toISOString() }],
      severity: 'MODERATE',
      predictedSurvivalMinutes: 120,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: 'PENDING',
      ...p
    } as Patient;
    setPatients(prev => [newPatient, ...prev]);
  }, []);

  const bulkAddPatients = useCallback((newPatients: Patient[]) => {
    setPatients(prev => [...newPatients, ...prev]);
  }, []);

  const clearAllPatients = useCallback(() => {
    setPatients([]);
  }, []);

  const contextValue = useMemo(() => ({ 
    patients, 
    resources, 
    adversaries,
    alerts, 
    panicMode, 
    setPanicMode, 
    tacticalContext, 
    setTacticalContext,
    addPatient, 
    bulkAddPatients,
    clearAllPatients,
    addAlert,
    updatePatient,
    updateResource,
    logOutcome,
    accuracy,
    stressIndex,
    voiceCommsEnabled,
    setVoiceCommsEnabled,
    audioUnlocked,
    unlockAudio
  }), [
    patients, resources, adversaries, alerts, panicMode, tacticalContext, 
    accuracy, stressIndex, voiceCommsEnabled, audioUnlocked,
    addPatient, bulkAddPatients, clearAllPatients, addAlert, updatePatient, updateResource, logOutcome, unlockAudio
  ]);

  return (
    <SystemContext.Provider value={contextValue}>
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within a SystemProvider');
  return context;
};
