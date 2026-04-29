# AI Triage Prediction Core (BIPS-X1)

## Tactical Medical Decision Support System

The AI Triage Prediction Core is a high-performance tactical medical platform designed for rapid casualty assessment and survival probability estimation in high-stress environments. It utilizes context-aware algorithms to prioritize medical interventions based on physiological telemetry, trauma mechanism, and environmental factors.

---

### 🛠 Exhaustive Feature List

#### 1. AI Triage & Prediction
- **Dynamic Scoring Algorithm:** Multi-weighted processing of vitals and physical findings to estimate survival windows.
- **Urgency Ranking (1-9):** Automatically ranks patients from routine (1) to immediate life-threat (9).
- **Stress-Resistant HUD:** Rapid-entry presets (e.g., Heavy Bleeding, Airway Blocked) for <2 second data input.
- **AI Injury Mechanism Analysis:** Users can input a text description of the incident (e.g., "IED blast within 3 meters"), and the integrated Gemini model predicts likely injuries (e.g., Blast Lung, Traumatic Amputation) and sets initial vital parameters.
- **Explainable AI (XAI):** Visual breakdown of how specific factors (e.g., +30% Airway, +18% Hemorrhage) contributed to the final score.
- **Tactical Context Toggle:** Adjusts prediction sensitivity based on the environment (General vs. Battlefield).

#### 2. Real-Time Physiological Monitoring
- **Live Telemetry Stream:** Vitals (HR, SpO2, RR, GCS) fluctuate in real-time to simulate active patient degradation or stabilization.
- **Critical Threshold Alerts:** Visual "pulse" animations and high-contrast warnings when vitals cross safety boundaries (e.g., HR > 120, SpO2 < 92%).
- **History Snapshotting:** Automatically records vital sign snapshots every 30 seconds for long-term trend analysis.

#### 3. Command & Control Dashboard
- **Casualty Priority Cards:** Staggered, high-visibility cards for immediate situational awareness of all active cases.
- **Manual AI Overrides:** Clinicians can manually adjust triage rankings if the tactical situation dictates.
- **Quick Status Updates:** One-tap transitions for "Pending," "Treating," and "Treated" states.

#### 4. Advanced Analytics & Telemetry Trend
- **Individual Patient Trends:** Interactive line charts visualize historical Heart Rate telemetry using `Recharts`.
- **Subject-Specific Analysis:** Dropdown selection for deep-diving into any rostered patient's physiological history.
- **System-Wide Statistics:** Visual distribution of severity levels across the entire tactical operation.

#### 5. Patient Management & EHR
- **Tactical Roster:** A comprehensive database of all casualties with detailed physiological profiles.
- **Manual Vitals Editor:** Real-time modification of HR, BP, SpO2, GCS, and RR for any selected patient with instant re-calculation of priority.
- **Deep Filter System:** Filter by Fitness Level (Elite, Standard, Low), Age Range, and Blood Type (A+/O-/etc).
- **Global Search:** Instant lookup by Patient Name or Tactical ID.

#### 6. Battlefield Simulation Suite
- **Exhaustive Scenario Dataset:** Over 50+ pre-configured high-fidelity scenarios across categories: Blast/IED, GSW (Gunshot Wounds), Physiological Shock, Neuro/Head Trauma, Respiratory Emergencies, and Environmental Conditions.
- **Instant Pre-loads:** Load complex multi-trauma cases with one tap for prediction testing and team training.
- **Dynamic Simulation Engine:** Process casualties through the "Prediction Core" to see survival estimators in action.

#### 7. Tactical Mapping (Geospatial)
- **High-Res Satellite View:** Integrated Leaflet map utilizing Esri World Imagery for tactical situational awareness.
- **Professional Tactical Symbols:** MIL-SPEC inspired markers for Patients (Diamonds), Resources (Squares), and Adversaries (Octagons).
- **Dynamic Animations:** Real-time pulse and ping effects for critical patients and high-threat targets.
- **Extraction Plotting:** Designate casualty pickup points directly on the topographical map.
- **Hostile Contact Tracking:** Real-time visualization of adversarial units (Infantry, Armor, Snipers) with dynamic threat-level markers (Low to Extreme).
- **Precision Grid Coordinates:** Real-time Latitude/Longitude readout for MedEvac coordination.

#### 8. Voice Comms & Audio Feedback
- **Tactical TTS:** Integrated Text-to-Speech for critical alerts and casualty status updates.
- **Voice Comms Toggle:** Master switch for audible tactical communication.
- **Audio Unlock Protocol:** Safe initialization of browser audio contexts for mission-critical feedback.

#### 9. Resource & Unit Orchestration
- **Tactical Vehicle Roster:** Real-time monitoring of combat-ready medical assets including MedEvac Helicopters (Dustoff), MRAPs, Armored Personnel Carriers (APC), and Medical Supply Drones.
- **Dispatch Optimization Engine:** Smart UI for assigning specific medical units to casualties based on proximity (km) and survival probability.
- **Unit Status Tracking:** Status tracking for MedEvac Units and Mobile Surgical Teams (Available, Occupied, Standby).
- **Geographic Asset Mapping:** Visualizes asset location on the tactical satellite map for optimized deployment.

#### 10. System Resilience
- **AI Fallback Logic:** Robust localized heuristic analysis that automatically triggers if external AI (Gemini) links are restricted or rate-limited, ensuring zero-downtime triage.
- **Permission Guard:** Automatic detection and handling of API permission states.

---

### 💻 Technical Stack

- **Framework:** React 18 + TypeScript (Vite)
- **Animation:** Motion (framer-motion) for smooth, low-latency UI transitions.
- **Styling:** Tailwind CSS with a "High-Contrast / Dark-Mode" tactical aesthetic.
- **Charting:** Recharts for physiological telemetry visualization.
- **Mapping:** React-Leaflet for coordinate-based extraction plotting.
- **Context:** React Context API for global state management (Patients, Resources, Alerts).
- **Icons:** Lucide-React for unified tactical iconography.

---

### 🚀 Operational Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Development Mode**
   ```bash
   npm run dev
   ```

3. **Production Build**
   ```bash
   npm run build
   ```

### 📋 Technical Architecture

- `src/context/SystemContext.tsx`: The "Nervous System" of the app. Handles real-time vitals simulation, alert generation, and patient state transitions.
- `src/pages/Prediction.tsx`: The input gateway where raw trauma data is processed through the triage algorithm.
- `src/pages/Dashboard.tsx`: The primary Command & Control center for active casualty tracking.
- `src/pages/Analytics.tsx`: Data-driven insights and historical trending.

---

**STATUS:** `MINIMAL OPS ACTIVE`  
**ENCRYPTION:** `AES-256 SECURED`  
**UPLINK:** `STABLE`
