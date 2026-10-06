/**
 * IndianStandardsRadar.jsx - Powerlifting India / IPF National Standards & Equipment Hub
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Trophy, 
  CheckCircle2, 
  Target, 
  Layers, 
  ShieldCheck, 
  MapPin, 
  Info,
  Calendar,
  Zap
} from 'lucide-react';

export const IndianStandardsRadar = ({ athleteTotal = 500, athleteWeight = 74, athleteAge = 22 }) => {
  const [gender, setGender] = useState('men');
  const [selectedClass, setSelectedClass] = useState('74kg');
  const [currentTotal, setCurrentTotal] = useState(athleteTotal);
  const [age, setAge] = useState(athleteAge);
  const [standardsData, setStandardsData] = useState(null);
  const [nationalRecords, setNationalRecords] = useState(null);
  const [meets, setMeets] = useState([]);

  // Fetch standards, meets & national records from backend
  useEffect(() => {
    const loadStandards = async () => {
      try {
        const apiUrl = import.meta.env.PROD 
          ? 'https://powerlift-ai-backend.onrender.com' 
          : 'http://localhost:5001';

        const [stdRes, meetsRes, recRes] = await Promise.all([
          fetch(`${apiUrl}/api/india/standards`),
          fetch(`${apiUrl}/api/india/meets`),
          fetch(`${apiUrl}/api/india/national-records`).catch(() => null)
        ]);

        const stdJson = await stdRes.json();
        const meetsJson = await meetsRes.json();
        if (recRes) {
          const recJson = await recRes.json();
          if (recJson.success) setNationalRecords(recJson.records);
        }

        if (stdJson.success) setStandardsData(stdJson);
        if (meetsJson.success) setMeets(meetsJson.meets);
      } catch (e) {
        console.error("Failed to load Indian standards", e);
      }
    };

    loadStandards();
  }, []);

  const weightClasses = standardsData?.weight_classes?.[gender] || [];
  const currentClassData = weightClasses.find(c => c.class === selectedClass) || weightClasses[2] || {
    class: '74kg',
    sub_junior: 460,
    junior: 535,
    senior_national: 605
  };

  // National Record benchmark for currently selected weight class
  const classRecord = nationalRecords?.[gender]?.[selectedClass] || {
    total: gender === 'men' ? 730 : 470,
    holder: gender === 'men' ? 'Pradeep Patel' : 'Pooja Patel',
    squat: gender === 'men' ? 260 : 170,
    bench: gender === 'men' ? 172.5 : 105,
    deadlift: gender === 'men' ? 302.5 : 200
  };

  const recordDiff = classRecord.total - currentTotal;
  const isNearRecord = recordDiff <= 110 || currentTotal >= classRecord.total * 0.85;
  const isSurpassed = currentTotal >= classRecord.total;

  const seniorGap = Math.max(0, currentClassData.senior_national - currentTotal);
  const seniorProgress = Math.min(100, Math.round((currentTotal / currentClassData.senior_national) * 100));

  return (
    <div className="bg-zinc-950 rounded-2xl border border-white/10 p-6 shadow-2xl font-sans text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-blue-400 uppercase font-bold">POWERLIFTING INDIA / IPF</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <Award className="w-7 h-7 text-blue-500" />
            National Qualifying Standards Radar
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Benchmark your 3-lift total against official Indian Sub-Junior, Junior & Senior National qualifying totals
          </p>
        </div>

        {/* Gender Selector */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1.5 rounded-xl border border-white/5 font-mono text-xs">
          {['men', 'women'].map((g) => (
            <button
              key={g}
              onClick={() => {
                setGender(g);
                setSelectedClass(g === 'men' ? '74kg' : '57kg');
              }}
              className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${
                gender === g
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Weight Class Selector Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {weightClasses.map((wc) => (
          <button
            key={wc.class}
            onClick={() => setSelectedClass(wc.class)}
            className={`px-4 py-2 rounded-lg font-mono text-xs font-bold whitespace-nowrap border transition-all ${
              selectedClass === wc.class
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg'
                : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            {wc.class} Class
          </button>
        ))}
      </div>

      {/* ALL-TIME NATIONAL RECORD PROXIMITY BANNER (User Request) */}
      {isNearRecord && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl border font-mono ${
            isSurpassed
              ? 'bg-gradient-to-r from-amber-950/80 via-yellow-900/40 to-amber-950/80 border-amber-500/60 text-amber-200 shadow-xl shadow-amber-950/40'
              : 'bg-gradient-to-r from-orange-950/60 via-amber-950/40 to-zinc-950 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {isSurpassed ? 'RECORD HOLDER POTENTIAL' : 'NATIONAL RECORD PROXIMITY'}
                  </span>
                  <span className="text-xs text-amber-400/80">Powerlifting India / IPF Raw</span>
                </div>
                <h4 className="text-sm sm:text-base font-black italic tracking-wide text-white mt-0.5">
                  {isSurpassed ? (
                    <span>🔥 You SURPASS the All-Time National Record by <strong className="text-amber-300">+{(currentTotal - classRecord.total).toFixed(1)} KG</strong>!</span>
                  ) : (
                    <span>⚡ You are only <strong className="text-amber-300">{recordDiff.toFixed(1)} KG</strong> away from the All-Time National Record!</span>
                  )}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-zinc-950/80 px-3.5 py-2 rounded-lg border border-white/10 shrink-0 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 block uppercase">Record Holder</span>
                <span className="font-bold text-white">{classRecord.holder}</span>
              </div>
              <div className="border-l border-zinc-800 pl-3">
                <span className="text-[10px] text-zinc-400 block uppercase">All-Time Total</span>
                <span className="font-black text-amber-400 text-sm">{classRecord.total} KG</span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between text-[11px] text-amber-200/80 gap-2">
            <span>Official Splits: Squat <strong>{classRecord.squat}kg</strong> • Bench <strong>{classRecord.bench}kg</strong> • Deadlift <strong>{classRecord.deadlift}kg</strong></span>
            <span className="text-amber-400 font-bold">Target: Sanctioned State or Senior National Championship</span>
          </div>
        </motion.div>
      )}

      {/* Interactive Total Input & National Standings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Athlete Stats Input */}
        <div className="bg-zinc-900/60 p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-400 font-bold">Your Competition Total</h3>
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-zinc-400">Total (Squat + Bench + Deadlift)</span>
              <span className="text-blue-400 font-bold">{currentTotal} KG</span>
            </div>
            <input 
              type="range"
              min="200"
              max="950"
              step="2.5"
              value={currentTotal}
              onChange={(e) => setCurrentTotal(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 text-xs font-mono space-y-1 text-zinc-400">
            <div className="flex justify-between">
              <span>Selected Class:</span>
              <span className="text-white font-bold">{currentClassData.class}</span>
            </div>
            <div className="flex justify-between">
              <span>Senior Benchmark:</span>
              <span className="text-blue-400 font-bold">{currentClassData.senior_national}kg</span>
            </div>
          </div>
        </div>

        {/* Senior National Qualification Progress */}
        <div className="md:col-span-2 bg-zinc-900/60 p-6 rounded-xl border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">
                Senior National Benchmark Progress ({currentClassData.class})
              </span>
              <span className="text-xs font-mono text-blue-400 font-bold">{seniorProgress}%</span>
            </div>

            <div className="w-full bg-zinc-800 rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${seniorProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center font-mono text-xs mt-6">
              <div className={`p-3 rounded-lg border ${currentTotal >= currentClassData.sub_junior ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' : 'bg-zinc-950 border-white/5 text-zinc-500'}`}>
                <div className="text-[10px] uppercase">Sub-Junior (U18)</div>
                <div className="text-base font-bold mt-0.5">{currentClassData.sub_junior}kg</div>
                <div className="text-[9px] mt-1">{currentTotal >= currentClassData.sub_junior ? '✓ Cleared' : `-${currentClassData.sub_junior - currentTotal}kg`}</div>
              </div>

              <div className={`p-3 rounded-lg border ${currentTotal >= currentClassData.junior ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400' : 'bg-zinc-950 border-white/5 text-zinc-500'}`}>
                <div className="text-[10px] uppercase">Junior (U23)</div>
                <div className="text-base font-bold mt-0.5">{currentClassData.junior}kg</div>
                <div className="text-[9px] mt-1">{currentTotal >= currentClassData.junior ? '✓ Cleared' : `-${currentClassData.junior - currentTotal}kg`}</div>
              </div>

              <div className={`p-3 rounded-lg border ${currentTotal >= currentClassData.senior_national ? 'bg-blue-950/40 border-blue-500/50 text-blue-400 shadow-lg' : 'bg-zinc-950 border-white/5 text-zinc-400'}`}>
                <div className="text-[10px] uppercase">Senior National</div>
                <div className="text-base font-bold mt-0.5">{currentClassData.senior_national}kg</div>
                <div className="text-[9px] mt-1">{seniorGap === 0 ? '🏆 Qualified!' : `+${seniorGap}kg needed`}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-zinc-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>
              {seniorGap === 0 
                ? "Eligible for Senior National selection through State Championship qualification!"
                : `Target Next Block: Add +${seniorGap}kg across your squat, bench, and deadlift to qualify.`}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Indian Championships Calendar */}
      <div className="bg-zinc-900/60 rounded-xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black italic uppercase text-white">Upcoming Indian Competitions</h3>
            <p className="text-xs font-mono text-zinc-400">Powerlifting India & affiliate sanctioned meets</p>
          </div>
          <Calendar className="w-5 h-5 text-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {meets.map((m) => (
            <div key={m.id} className="p-4 bg-zinc-950 rounded-xl border border-white/5 hover:border-zinc-700 transition-colors space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-white text-sm">{m.name}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40">
                  {m.month}
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>{m.venue}, {m.city} ({m.state})</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-900">
                <span>Fed: {m.federation}</span>
                <span className={m.qualifying_required ? 'text-amber-400 font-bold' : 'text-green-400'}>
                  {m.qualifying_required ? 'State Qualifying Required' : 'Open Registration'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndianStandardsRadar;
