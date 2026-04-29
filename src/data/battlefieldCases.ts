export interface ScenarioData {
  age: number;
  injuryType: string;
  category: 'BLAST' | 'GSW' | 'BLUNT' | 'BURN' | 'CHEMICAL' | 'SHOCK' | 'TRAUMA' | 'PHYSIOLOGICAL' | 'NEURO' | 'RESPIRATORY' | 'MUSCULOSKELETAL' | 'ENVIRONMENTAL';
  hr: number;
  bp: string;
  spo2: number;
  gcs: number;
  rr: number;
  severity: 'CRITICAL' | 'SEVERE' | 'MODERATE' | 'STABLE';
  survival: number;
}

export const BATTLEFIELD_SCENARIOS: ScenarioData[] = [
  // --- BLAST / EXPLOSION ---
  {
    age: 30,
    injuryType: "IED Blast – Shrapnel + Heavy Bleeding",
    category: "BLAST",
    hr: 142,
    bp: "78/50",
    spo2: 80,
    gcs: 7,
    rr: 32,
    severity: "CRITICAL",
    survival: 30
  },
  {
    age: 26,
    injuryType: "Landmine – Leg Amputation",
    category: "BLAST",
    hr: 150,
    bp: "70/40",
    spo2: 85,
    gcs: 13,
    rr: 30,
    severity: "CRITICAL",
    survival: 25
  },
  {
    age: 32,
    injuryType: "Grenade Explosion – Chest Trauma",
    category: "BLAST",
    hr: 128,
    bp: "90/60",
    spo2: 78,
    gcs: 14,
    rr: 35,
    severity: "SEVERE",
    survival: 50
  },
  {
    age: 29,
    injuryType: "Blast Wave – Internal Bleeding (Hidden)",
    category: "BLAST",
    hr: 120,
    bp: "88/60",
    spo2: 92,
    gcs: 15,
    rr: 22,
    severity: "SEVERE",
    survival: 60
  },
  {
    age: 35,
    injuryType: "Close Explosion – Burns + Unconscious",
    category: "BLAST",
    hr: 138,
    bp: "85/55",
    spo2: 75,
    gcs: 6,
    rr: 34,
    severity: "CRITICAL",
    survival: 40
  },
  {
    age: 40,
    injuryType: "Vehicle Explosion – Fractures + Shock",
    category: "BLAST",
    hr: 125,
    bp: "95/65",
    spo2: 88,
    gcs: 14,
    rr: 26,
    severity: "SEVERE",
    survival: 65
  },
  {
    age: 27,
    injuryType: "Secondary Blast – Head Injury",
    category: "BLAST",
    hr: 110,
    bp: "100/70",
    spo2: 90,
    gcs: 9,
    rr: 24,
    severity: "SEVERE",
    survival: 70
  },
  {
    age: 31,
    injuryType: "Shrapnel Abdomen – Internal Hemorrhage",
    category: "BLAST",
    hr: 140,
    bp: "82/55",
    spo2: 89,
    gcs: 15,
    rr: 28,
    severity: "CRITICAL",
    survival: 45
  },
  {
    age: 24,
    injuryType: "Ear Rupture – Blast Overpressure",
    category: "BLAST",
    hr: 95,
    bp: "110/75",
    spo2: 96,
    gcs: 15,
    rr: 18,
    severity: "STABLE",
    survival: 95
  },
  {
    age: 38,
    injuryType: "Blast Debris – Spinal Injury",
    category: "BLAST",
    hr: 105,
    bp: "100/70",
    spo2: 91,
    gcs: 15,
    rr: 20,
    severity: "MODERATE",
    survival: 75
  },

  // --- GUNSHOT WOUNDS ---
  {
    age: 29,
    injuryType: "Gunshot to Chest → Hypoxia + Breathing Distress",
    category: "TRAUMA",
    hr: 132,
    bp: "88/50",
    spo2: 76,
    gcs: 15,
    rr: 34,
    severity: "CRITICAL",
    survival: 42
  },
  {
    age: 34,
    injuryType: "Gunshot to Abdomen → Internal Bleeding",
    category: "TRAUMA",
    hr: 125,
    bp: "90/60",
    spo2: 91,
    gcs: 15,
    rr: 26,
    severity: "SEVERE",
    survival: 58
  },
  {
    age: 25,
    injuryType: "Gunshot to Leg → Arterial Bleeding",
    category: "TRAUMA",
    hr: 145,
    bp: "75/40",
    spo2: 93,
    gcs: 15,
    rr: 28,
    severity: "CRITICAL",
    survival: 35
  },
  {
    age: 31,
    injuryType: "Gunshot to Shoulder → Limited Mobility",
    category: "TRAUMA",
    hr: 102,
    bp: "115/75",
    spo2: 97,
    gcs: 15,
    rr: 20,
    severity: "MODERATE",
    survival: 85
  },
  {
    age: 36,
    injuryType: "Multiple Gunshots → Multi-Trauma",
    category: "TRAUMA",
    hr: 150,
    bp: "70/40",
    spo2: 78,
    gcs: 7,
    rr: 36,
    severity: "CRITICAL",
    survival: 20
  },
  {
    age: 28,
    injuryType: "Sniper Shot → Instant Unconsciousness (Head)",
    category: "TRAUMA",
    hr: 60,
    bp: "85/50",
    spo2: 70,
    gcs: 3,
    rr: 10,
    severity: "CRITICAL",
    survival: 10
  },
  {
    age: 33,
    injuryType: "Gunshot to Neck → Airway Compromise",
    category: "TRAUMA",
    hr: 135,
    bp: "82/55",
    spo2: 72,
    gcs: 14,
    rr: 38,
    severity: "CRITICAL",
    survival: 30
  },
  {
    age: 27,
    injuryType: "Through-and-Through → Moderate Damage",
    category: "TRAUMA",
    hr: 110,
    bp: "105/70",
    spo2: 95,
    gcs: 15,
    rr: 22,
    severity: "MODERATE",
    survival: 80
  },
  {
    age: 30,
    injuryType: "Ricochet Bullet → Unpredictable Trauma (Abdomen)",
    category: "TRAUMA",
    hr: 118,
    bp: "98/65",
    spo2: 90,
    gcs: 15,
    rr: 25,
    severity: "SEVERE",
    survival: 65
  },
  {
    age: 35,
    injuryType: "Gunshot + Delayed Treatment → Deterioration",
    category: "TRAUMA",
    hr: 140,
    bp: "80/50",
    spo2: 85,
    gcs: 8,
    rr: 30,
    severity: "CRITICAL",
    survival: 25
  },

  // --- PHYSIOLOGICAL SHOCK ---
  {
    age: 29,
    injuryType: "Hemorrhagic Shock → Severe Blood Loss",
    category: "PHYSIOLOGICAL",
    hr: 148,
    bp: "72/50",
    spo2: 88,
    gcs: 7,
    rr: 30,
    severity: "CRITICAL",
    survival: 28
  },
  {
    age: 35,
    injuryType: "Hypovolemic Shock → Low BP + Dizziness",
    category: "PHYSIOLOGICAL",
    hr: 122,
    bp: "85/55",
    spo2: 92,
    gcs: 15,
    rr: 24,
    severity: "SEVERE",
    survival: 60
  },
  {
    age: 40,
    injuryType: "Neurogenic Shock → Spinal Injury + Low HR",
    category: "PHYSIOLOGICAL",
    hr: 52,
    bp: "78/40",
    spo2: 94,
    gcs: 15,
    rr: 18,
    severity: "SEVERE",
    survival: 65
  },
  {
    age: 38,
    injuryType: "Septic Shock → Infection Spread (Delayed Care)",
    category: "PHYSIOLOGICAL",
    hr: 135,
    bp: "80/50",
    spo2: 90,
    gcs: 8,
    rr: 28,
    severity: "CRITICAL",
    survival: 35
  },
  {
    age: 27,
    injuryType: "Anaphylactic Shock → Allergic Reaction",
    category: "PHYSIOLOGICAL",
    hr: 130,
    bp: "75/45",
    spo2: 82,
    gcs: 15,
    rr: 35,
    severity: "CRITICAL",
    survival: 40
  },

  // --- HEAD & NEURO INJURIES ---
  {
    age: 30,
    injuryType: "Traumatic Brain Injury → Unconscious",
    category: "NEURO",
    hr: 58,
    bp: "160/90",
    spo2: 88,
    gcs: 6,
    rr: 10,
    severity: "CRITICAL",
    survival: 35
  },
  {
    age: 25,
    injuryType: "Concussion → Dizziness & Confusion",
    category: "NEURO",
    hr: 95,
    bp: "120/80",
    spo2: 97,
    gcs: 14,
    rr: 18,
    severity: "MODERATE",
    survival: 90
  },
  {
    age: 33,
    injuryType: "Skull Fracture → External Head Bleeding",
    category: "NEURO",
    hr: 110,
    bp: "105/70",
    spo2: 92,
    gcs: 10,
    rr: 22,
    severity: "SEVERE",
    survival: 65
  },
  {
    age: 28,
    injuryType: "Blast-Induced Brain Injury → Memory Loss",
    category: "NEURO",
    hr: 100,
    bp: "110/75",
    spo2: 94,
    gcs: 12,
    rr: 20,
    severity: "MODERATE",
    survival: 80
  },
  {
    age: 35,
    injuryType: "Penetrating Head Injury → Critical Condition",
    category: "NEURO",
    hr: 65,
    bp: "150/95",
    spo2: 85,
    gcs: 4,
    rr: 12,
    severity: "CRITICAL",
    survival: 20
  },

  // --- FRACTURES & MUSCULOSKELETAL ---
  {
    age: 28,
    injuryType: "Open Fracture → Bone Visible + Bleeding",
    category: "MUSCULOSKELETAL",
    hr: 120,
    bp: "95/60",
    spo2: 96,
    gcs: 15,
    rr: 22,
    severity: "SEVERE",
    survival: 75
  },
  {
    age: 32,
    injuryType: "Closed Fracture → Swelling + Pain",
    category: "MUSCULOSKELETAL",
    hr: 98,
    bp: "120/80",
    spo2: 98,
    gcs: 15,
    rr: 18,
    severity: "MODERATE",
    survival: 90
  },
  {
    age: 40,
    injuryType: "Spinal Injury → Paralysis",
    category: "MUSCULOSKELETAL",
    hr: 60,
    bp: "85/55",
    spo2: 95,
    gcs: 15,
    rr: 16,
    severity: "SEVERE",
    survival: 65
  },
  {
    age: 35,
    injuryType: "Crushed Limb → Compartment Syndrome Risk",
    category: "MUSCULOSKELETAL",
    hr: 130,
    bp: "90/60",
    spo2: 94,
    gcs: 15,
    rr: 24,
    severity: "CRITICAL",
    survival: 55
  },
  {
    age: 27,
    injuryType: "Dislocated Joint → Mobility Loss",
    category: "MUSCULOSKELETAL",
    hr: 90,
    bp: "118/78",
    spo2: 98,
    gcs: 15,
    rr: 18,
    severity: "MODERATE",
    survival: 92
  },

  // --- RESPIRATORY EMERGENCIES ---
  {
    age: 31,
    injuryType: "Pneumothorax → Collapsed Lung",
    category: "RESPIRATORY",
    hr: 128,
    bp: "92/60",
    spo2: 78,
    gcs: 15,
    rr: 34,
    severity: "CRITICAL",
    survival: 45
  },
  {
    age: 26,
    injuryType: "Airway Obstruction → Choking",
    category: "RESPIRATORY",
    hr: 135,
    bp: "100/70",
    spo2: 65,
    gcs: 15,
    rr: 38,
    severity: "CRITICAL",
    survival: 30
  },
  {
    age: 34,
    injuryType: "Hypoxia → Low Oxygen + Confusion",
    category: "RESPIRATORY",
    hr: 110,
    bp: "105/70",
    spo2: 82,
    gcs: 13,
    rr: 26,
    severity: "SEVERE",
    survival: 65
  },
  {
    age: 37,
    injuryType: "Lung Contusion → Painful Breathing",
    category: "RESPIRATORY",
    hr: 118,
    bp: "110/70",
    spo2: 88,
    gcs: 15,
    rr: 28,
    severity: "SEVERE",
    survival: 70
  },
  {
    age: 29,
    injuryType: "Chemical Gas Exposure → Respiratory Distress",
    category: "RESPIRATORY",
    hr: 125,
    bp: "95/60",
    spo2: 80,
    gcs: 15,
    rr: 32,
    severity: "CRITICAL",
    survival: 50
  },

  // --- ENVIRONMENTAL CONDITIONS ---
  {
    age: 33,
    injuryType: "Heatstroke → High Temp + Unconscious",
    category: "ENVIRONMENTAL",
    hr: 145,
    bp: "85/50",
    spo2: 95,
    gcs: 8,
    rr: 30,
    severity: "CRITICAL",
    survival: 35
  },
  {
    age: 40,
    injuryType: "Hypothermia → Low Temp + Slow Pulse",
    category: "ENVIRONMENTAL",
    hr: 48,
    bp: "90/60",
    spo2: 92,
    gcs: 15,
    rr: 12,
    severity: "SEVERE",
    survival: 65
  },
  {
    age: 28,
    injuryType: "Dehydration → Weakness + Dizziness",
    category: "ENVIRONMENTAL",
    hr: 110,
    bp: "95/65",
    spo2: 97,
    gcs: 15,
    rr: 20,
    severity: "MODERATE",
    survival: 85
  },
  {
    age: 35,
    injuryType: "High-Altitude Sickness → Low Oxygen",
    category: "ENVIRONMENTAL",
    hr: 120,
    bp: "100/70",
    spo2: 75,
    gcs: 12,
    rr: 28,
    severity: "SEVERE",
    survival: 60
  },
  {
    age: 30,
    injuryType: "Fatigue Collapse → Exhaustion + Low Vitals",
    category: "ENVIRONMENTAL",
    hr: 85,
    bp: "88/55",
    spo2: 94,
    gcs: 15,
    rr: 16,
    severity: "MODERATE",
    survival: 80
  },
  
  // Mixed Multi-Trauma
  {
    age: 28,
    injuryType: "Post-explosion + gunshot multi-trauma case",
    category: "TRAUMA",
    hr: 155,
    bp: "65/30",
    spo2: 72,
    gcs: 5,
    rr: 40,
    severity: "CRITICAL",
    survival: 12
  }
];
