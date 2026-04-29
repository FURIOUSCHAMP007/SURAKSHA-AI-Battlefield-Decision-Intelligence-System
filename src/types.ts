export type Severity = 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'STABLE';
export type TacticalContext = 'BATTLEFIELD' | 'DISASTER' | 'HOSPITAL';

export interface Vitals {
  hr: number;
  bp: string;
  spo2: number;
  gcs: number; // Glascow Coma Scale
  rr: number; // Respiratory Rate
}

export interface VitalSnapshot extends Vitals {
  timestamp: string;
}

export interface PatientHistory {
  age: number;
  fitnessLevel: 'ELITE' | 'STANDARD' | 'LOW';
  allergies: string[];
  bloodType: string;
}

export interface PredictionOverride {
  originalSeverity: Severity;
  overriddenSeverity: Severity;
  medicId: string;
  reason: string;
  timestamp: string;
}

export interface TCCCTask {
  id: string;
  step: string;
  completed: boolean;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'MASSIVE_HEMORRHAGE' | 'AIRWAY' | 'RESPIRATION' | 'CIRCULATION' | 'HYPOTHERMIA_HEAD';
}

export interface TCCCTreatment {
  protocolName: string;
  steps: TCCCTask[];
  firstAidSteps: string[];
  generatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  rank?: string;
  history: PatientHistory;
  injuryType: string;
  injuryCategory?: 'BLAST' | 'GSW' | 'BLUNT' | 'BURN' | 'CHEMICAL' | 'SHOCK' | 'TRAUMA' | 'PHYSIOLOGICAL' | 'NEURO' | 'RESPIRATORY' | 'MUSCULOSKELETAL' | 'ENVIRONMENTAL';
  location: [number, number]; // Lat, Lng
  vitals: Vitals;
  vitalsHistory?: VitalSnapshot[];
  severity: Severity;
  predictedSurvivalMinutes: number;
  createdAt: string;
  lastUpdated: string;
  status: 'PENDING' | 'TRIAGED' | 'EN_ROUTE' | 'TREATED';
  override?: PredictionOverride;
  outcome?: 'SURVIVED' | 'DECEASED' | 'TRANSFERRED';
  tcccProtocol?: TCCCTreatment;
}

export interface Alert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  message: string;
  timestamp: string;
  patientId?: string;
}

export interface Resource {
  id: string;
  type: 'AMBULANCE' | 'MEDIC_TEAM' | 'HOSPITAL' | 'BASE' | 'HELO' | 'MRAP' | 'APC' | 'DRONE';
  name: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'STANDBY';
  location: [number, number];
}

export interface Adversary {
  id: string;
  type: 'INFANTRY' | 'ARMOR' | 'SNIPER' | 'UNKNOWN';
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  location: [number, number];
  lastSpotted: string;
}
