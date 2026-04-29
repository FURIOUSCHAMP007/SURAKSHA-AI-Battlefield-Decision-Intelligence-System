import { GoogleGenAI, ThinkingLevel, Modality, Type } from "@google/genai";
import { Patient, Alert } from "../types";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

/**
 * BOLT: Low-latency responses for the intelligence brief.
 * Uses gemini-3-flash-preview with ThinkingLevel.LOW for speed.
 */
export async function* streamIntelligenceBrief(patients: Patient[], alerts: Alert[]) {
  const criticalPatients = patients.filter(p => p.severity === 'CRITICAL' && !p.outcome);
  const recentAlerts = alerts.slice(-3);

  const prompt = `
    ACT AS: SURAKSHA AI (Battlefield Decision Intelligence System) COMMANDER.
    CONTEXT: You are looking at a live tactical medical dashboard.
    DATA:
    - Critical Patients: ${JSON.stringify(criticalPatients)}
    - Recent Alerts: ${JSON.stringify(recentAlerts)}
    
    TASK: Provide a concise (2-3 sentences) tactical intelligence brief.
    FOCUS: Highest priority casualty and immediate resource recommendation.
    TONE: Military, urgent, precise.
  `;

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        maxOutputTokens: 150
      }
    });

    for await (const chunk of stream) {
      yield chunk.text;
    }
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('limit') || error?.message?.includes('403') || error?.message?.toLowerCase().includes('permission')) {
      yield "AI Network Congested. Switching to localized heuristic analysis... Recommendation: Prioritize immediate evacuation for highest severity casualties.";
    } else {
      console.error("AI Intel Brief Error:", error);
      yield "Awaiting AI link... Connection unstable.";
    }
  }
}

/**
 * NETWORK_INTELLIGENCE: High thinking for detailed injury analysis.
 * Uses gemini-3.1-pro-preview with HIGH thinking (default).
 */
export async function analyzeInjuryDeep(injuryDescription: string, vitals: any) {
  const prompt = `
    SYSTEM: Advanced Tactical Medical Diagnostic AI.
    INPUT: 
    Description: ${injuryDescription}
    Vitals: ${JSON.stringify(vitals)}
    
    TASK: Analyze the Mechanism of Injury (MOI) and provide a detailed prediction.
    FORMAT: JSON
    SCHEMA:
    {
      "prediction": string (e.g. probable tension pneumothorax),
      "confidence": number (0-100),
      "reasoning": string (detailed medical reasoning),
      "suggestedSeverity": "CRITICAL" | "SEVERE" | "MODERATE" | "STABLE",
      "survivalEstimate": number (minutes)
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            suggestedSeverity: { type: Type.STRING, enum: ["CRITICAL", "SEVERE", "MODERATE", "STABLE"] },
            survivalEstimate: { type: Type.NUMBER }
          },
          required: ["prediction", "confidence", "reasoning", "suggestedSeverity", "survivalEstimate"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.message?.includes('limit') || error?.message?.includes('403') || error?.message?.toLowerCase().includes('permission')) {
      // AI link restricted or rate limited. Using internal heuristics.
    } else {
      console.error("Deep Analysis Error:", error);
    }
    // Fallback logic for deep analysis if quota hit
    return {
      prediction: "Localized Analysis: Multi-trauma suspected.",
      confidence: 60,
      reasoning: "AI analysis restricted due to quota. Localized heuristics based on vital signals suggest potential critical state.",
      suggestedSeverity: vitals.hr > 120 || parseInt(vitals.bp?.split('/')[0]) < 90 ? "CRITICAL" : "SEVERE",
      survivalEstimate: 45
    };
  }
}

/**
 * TACTICAL_TREATMENT_INTEL: Generate specific TCCC protocols based on injury.
 */
export async function generateTCCCProtocol(patient: Patient) {
  const prompt = `
    ACT AS: Senior Combat Medical Specialist (18D).
    CONTEXT: Tactical Combat Casualty Care (TCCC) Generation.
    CASUALLY DATA:
    Name: ${patient.name}
    Injury: ${patient.injuryType}
    Vitals: ${JSON.stringify(patient.vitals)}
    Severity: ${patient.severity}
    
    TASK: Generate a step-by-step TCCC protocol (MARCH algorithm focused) AND 3-4 simple first aid steps for immediate life-saving action.
    FORMAT: JSON
    SCHEMA:
    {
      "protocolName": string (e.g. "Blast Hemorrhage Protocol"),
      "firstAidSteps": string[] (3-4 simple, non-tactical instructions like "Apply Pressure"),
      "steps": [
        {
          "id": string (unique),
          "step": string (clear procedure),
          "priority": "HIGH" | "MEDIUM" | "LOW",
          "category": "MASSIVE_HEMORRHAGE" | "AIRWAY" | "RESPIRATION" | "CIRCULATION" | "HYPOTHERMIA_HEAD"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            protocolName: { type: Type.STRING },
            firstAidSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  step: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                  category: { type: Type.STRING, enum: ["MASSIVE_HEMORRHAGE", "AIRWAY", "RESPIRATION", "CIRCULATION", "HYPOTHERMIA_HEAD"] }
                },
                required: ["id", "step", "priority", "category"]
              }
            }
          },
          required: ["protocolName", "steps", "firstAidSteps"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("TCCC Protocol Error:", error);
    return {
      protocolName: "Standard Tactical Trauma Care",
      firstAidSteps: [
        "Control bleeding with direct pressure",
        "Keep the casualty warm",
        "Monitor for level of consciousness"
      ],
      steps: [
        { id: "1", step: "Apply CAT-Tourniquet high and tight if hemorrhage suspected.", priority: "HIGH", category: 'MASSIVE_HEMORRHAGE' },
        { id: "2", step: "Ensure patent airway using NPA or chin-lift.", priority: "HIGH", category: 'AIRWAY' },
        { id: "3", step: "Inspect for tension pneumothorax; perform needle decompression if necessary.", priority: "MEDIUM", category: 'RESPIRATION' }
      ]
    };
  }
}

/**
 * AUDIO_SPARK: Convert text to speech for critical audio alerts.
 * Uses gemini-3.1-flash-tts-preview.
 */
export async function speakTactical(text: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say with military urgency: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Strong military feel
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      try {
        await playPcmAudio(base64Audio);
      } catch (playError) {
        console.warn("AI Audio playback failed, falling back to speech synthesis:", playError);
        throw playError; // Trigger fallback
      }
    }
  } catch (error: any) {
    // Only log if it's not a quota or expected user-gesture error
    const isQuotaError = error?.message?.includes('429') || error?.message?.includes('limit');
    const isPermissionError = error?.message?.includes('403') || error?.message?.toLowerCase().includes('permission');
    
    if (!isQuotaError && !isPermissionError) {
      console.warn("TTS AI Link restricted or failed (using fallback):", error?.message || error);
    }
    
    // Fallback to browser's native SpeechSynthesis for reliable tactical comms
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const speakNow = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; 
        utterance.pitch = 0.8; 
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Eng')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        
        try {
          window.speechSynthesis.speak(utterance);
        } catch (speechError) {
          console.warn("SpeechSynthesis also blocked:", speechError);
        }
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          speakNow();
          window.speechSynthesis.onvoiceschanged = null;
        };
      } else {
        speakNow();
      }
    }
  }
}

/**
 * Utility to play raw PCM audio via Web Audio API.
 * Gemini TTS returns 16-bit Linear PCM at 24kHz.
 */
async function playPcmAudio(base64: string, sampleRate = 24000) {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Base64 to ArrayBuffer
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit Little Endian PCM to Float32
  const int16Buffer = new Int16Array(bytes.buffer);
  const float32Buffer = new Float32Array(int16Buffer.length);
  for (let i = 0; i < int16Buffer.length; i++) {
    float32Buffer[i] = int16Buffer[i] / 32768.0;
  }

  const audioBuffer = audioCtx.createBuffer(1, float32Buffer.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32Buffer);

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  
  // Resume context if suspended (common in browsers)
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  
  return new Promise((resolve, reject) => {
    source.onended = resolve;
    source.onerror = reject;
    try {
      source.start();
    } catch (e) {
      reject(e);
    }
  });
}

function b64toBlob(b64Data: string, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}
