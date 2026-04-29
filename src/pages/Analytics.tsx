import React, { useState } from 'react';
import { useSystem } from '../context/SystemContext';
import { 
  PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { BarChart3, TrendingUp, Heart, Clock, User } from 'lucide-react';
import { cn } from '../lib/utils';

const COLORS = {
  CRITICAL: '#ef4444',
  SEVERE: '#f59e0b',
  MODERATE: '#3b82f6',
  STABLE: '#22c55e'
};

const PIE_DATA = [
  { name: 'Critical', value: 4, color: COLORS.CRITICAL },
  { name: 'Severe', value: 8, color: COLORS.SEVERE },
  { name: 'Moderate', value: 12, color: COLORS.MODERATE },
  { name: 'Stable', value: 20, color: COLORS.STABLE },
];

const TREND_DATA = [
  { time: '08:00', survival: 88 },
  { time: '10:00', survival: 91 },
  { time: '12:00', survival: 89 },
  { time: '14:00', survival: 94 },
  { time: '16:00', survival: 92 },
];

const StatCard = ({ label, val, sub, icon: Icon }: any) => (
  <div className="bg-suraksha-card border border-slate-800 p-6 rounded-2xl">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <span className="text-[10px] text-green-500 font-black uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded">Optimized</span>
    </div>
    <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest block mb-1">{label}</span>
    <p className="text-3xl font-black text-white italic">{val}</p>
    <p className="text-[10px] text-slate-500 mt-2">{sub}</p>
  </div>
);

export const Analytics = () => {
  const { patients } = useSystem();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const hrHistoryData = (selectedPatient?.vitalsHistory || []).map(entry => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hr: entry.hr
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">Medical Outcome Analytics</h1>
           <p className="text-slate-400 text-sm">Long-term survival trends and tactical resource efficiency modeling.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase rounded text-slate-300">Export CSV</button>
           <button className="px-4 py-2 bg-red-600 text-[10px] font-bold uppercase rounded text-white">Gen Intelligence Report</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Overall Survival" val="94.2%" sub="0.8% increase vs last 24h" icon={Heart} />
        <StatCard label="Avg Triage Action" val="12.4s" sub="Within target threshold" icon={Clock} />
        <StatCard label="MASCAL Readiness" val="Alpha" sub="Status: Optimal Capacity" icon={TrendingUp} />
        <StatCard label="Data Integrity" val="99.9%" sub="Verified via Blockchain" icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[500px]">
        {/* Severity Pie */}
        <div className="lg:col-span-4 bg-suraksha-sidebar border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8 border-b border-slate-800 pb-2">Severity Distribution</h3>
          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <ReTooltip 
                    contentStyle={{ backgroundColor: '#111218', border: '1px solid #1E293B', borderRadius: '8px' }} 
                    itemStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                  />
                </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
             {PIE_DATA.map((d, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                 <span className="text-[9px] uppercase font-bold text-slate-400">{d.name} ({d.value})</span>
               </div>
             ))}
          </div>
        </div>

        {/* Survival Trend */}
        <div className="lg:col-span-4 bg-suraksha-sidebar border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8 border-b border-slate-800 pb-2">24h System Survival (%)</h3>
          <div className="flex-1 min-h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} domain={[80, 100]} tickLine={false} axisLine={false} />
                  <ReTooltip 
                    contentStyle={{ backgroundColor: '#111218', border: '1px solid #1E293B', borderRadius: '8px' }}
                    labelStyle={{ fontSize: '10px', fontWeight: 'black', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="survival" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444' }} activeDot={{ r: 8 }} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Patient HR Trend */}
        <div className="lg:col-span-4 bg-suraksha-sidebar border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Patient HR Trend (BPM)</h3>
            <select 
              value={selectedPatientId} 
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[9px] font-bold text-white focus:outline-none uppercase"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.id}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-h-[250px]">
            {hrHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hrHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <ReTooltip 
                    contentStyle={{ backgroundColor: '#111218', border: '1px solid #1E293B', borderRadius: '8px' }}
                    labelStyle={{ fontSize: '10px', fontWeight: 'black', marginBottom: '4px' }}
                  />
                  <Line type="step" dataKey="hr" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-600 font-black uppercase text-[10px]">No Data Available</div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Patient Vitals Summary Area */}
      {selectedPatient && (
        <div className="bg-suraksha-sidebar border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-900 border border-slate-800 flex items-center justify-center rounded-xl">
              <User className="text-slate-400 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white italic uppercase tracking-tighter">{selectedPatient.name} // {selectedPatient.id}</h2>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{selectedPatient.rank} • {selectedPatient.injuryType}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Heart Rate</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white italic">{selectedPatient.vitals.hr}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">BPM</span>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Blood Pressure</span>
              <span className="text-2xl font-black text-white italic">{selectedPatient.vitals.bp}</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">SpO2 Level</span>
              <span className="text-2xl font-black text-green-500 italic">{selectedPatient.vitals.spo2}%</span>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">GCS Score</span>
              <span className="text-2xl font-black text-amber-500 italic">{selectedPatient.vitals.gcs}/15</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
