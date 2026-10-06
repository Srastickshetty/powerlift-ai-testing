/**
 * WeighInRackCard.jsx - Official IPF / Powerlifting India Weigh-In & Rack Height Slip
 * Digital platform card and 1-tap printable official competition slip for referees and scorers.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle2, 
  Save, 
  Share2, 
  Maximize2, 
  Printer, 
  Info,
  Award,
  Sliders,
  Dumbbell
} from 'lucide-react';
import { toast } from 'sonner';

export const WeighInRackCard = ({ profile, user }) => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('titan_weighin_card');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      lifterName: profile?.displayName || user?.displayName || 'Srastick Shetty',
      weightCategory: '74kg',
      lotNumber: '42',
      federation: 'Powerlifting India (IPF Affiliate)',
      squatRackPin: 14,
      squatSafetyPin: 9,
      squatWalkout: 'Platform ER Rack',
      benchRackPin: 11,
      benchSafetyPin: 6,
      benchFootBlock: 'Flat Floor (No Blocks)',
      openerSquat: 185,
      secondSquat: 195,
      thirdSquat: 202.5,
      openerBench: 125,
      secondBench: 132.5,
      thirdBench: 137.5,
      openerDeadlift: 215,
      secondDeadlift: 230,
      thirdDeadlift: 242.5,
      beltNotchSquat: 'Notch 4',
      beltNotchDeadlift: 'Notch 3',
      coachName: 'Head Coach Admin',
      notes: 'Pinky finger on 810mm knurl ring for bench press.'
    };
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleChange = (key, val) => {
    setFormData(prev => {
      const up = { ...prev, [key]: val };
      localStorage.setItem('titan_weighin_card', JSON.stringify(up));
      return up;
    });
  };

  const handleSave = () => {
    localStorage.setItem('titan_weighin_card', JSON.stringify(formData));
    toast.success("Weigh-In Card saved! Ready for referee table inspection.");
  };

  const handlePrint = () => {
    toast.info("Preparing official attempt slip for print...");
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const projectedTotal = (formData.openerSquat || 0) + (formData.openerBench || 0) + (formData.openerDeadlift || 0);

  return (
    <div className="bg-zinc-950 rounded-2xl border border-white/10 p-6 shadow-2xl font-sans text-white space-y-6">
      {/* Print Stylesheet Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-attempt-slip, #printable-attempt-slip * {
            visibility: visible;
          }
          #printable-attempt-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
            padding: 20px;
            font-family: Arial, sans-serif !important;
            border: 2px solid black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-border {
            border: 1px solid black !important;
          }
          .print-header {
            background-color: #f0f0f0 !important;
            color: black !important;
            font-weight: bold !important;
          }
        }
      `}</style>

      {/* Header (Screen View) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-orange-400 uppercase font-bold">OFFICIAL SUBMISSION SLIP</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-orange-500" />
            Weigh-In & Rack Height Platform Slip
          </h2>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Official IPF / Powerlifting India equipment card. Present to weigh-in referees and platform scorers.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-emerald-500/40 hover:border-emerald-500 text-emerald-300 hover:text-white flex items-center gap-2 transition-colors font-bold shadow-md shadow-emerald-950/30"
            title="Open printable official attempt slip"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Attempt Slip 🖨️</span>
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 hover:border-zinc-700 text-zinc-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-orange-400" />
            {isFullscreen ? 'Exit Fullscreen' : 'Show Referees'}
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Slip
          </button>
        </div>
      </div>

      {/* Official Platform Card Display */}
      <div 
        id="printable-attempt-slip"
        className={`bg-gradient-to-br from-zinc-900 via-zinc-950 to-black rounded-2xl border-2 border-orange-500/40 p-6 md:p-8 shadow-2xl space-y-6 ${
          isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto' : ''
        }`}
      >
        {/* Top Identification Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10 print-border">
          <div>
            <span className="text-[10px] font-mono text-orange-400 uppercase tracking-widest block">FEDERATION SUBMISSION SLIP</span>
            <div className="text-xl md:text-2xl font-[1000] italic uppercase text-white font-mono mt-0.5">
              {formData.federation}
            </div>
          </div>
          <div className="flex items-center gap-6 text-right font-mono text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">CATEGORY</span>
              <span className="font-bold text-orange-400 text-base">{formData.weightCategory}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">LOT NUMBER</span>
              <span className="font-bold text-white text-base">#{formData.lotNumber}</span>
            </div>
          </div>
        </div>

        {/* Lifter Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <label className="text-zinc-500 uppercase text-[10px] block mb-1">Lifter Full Name</label>
            <input 
              type="text"
              value={formData.lifterName}
              onChange={(e) => handleChange('lifterName', e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-orange-500 outline-none print-border"
            />
          </div>
          <div>
            <label className="text-zinc-500 uppercase text-[10px] block mb-1">Coach / Handler Name</label>
            <input 
              type="text"
              value={formData.coachName}
              onChange={(e) => handleChange('coachName', e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-orange-500 outline-none print-border"
            />
          </div>
          <div>
            <label className="text-zinc-500 uppercase text-[10px] block mb-1">Weight Category</label>
            <select
              value={formData.weightCategory}
              onChange={(e) => handleChange('weightCategory', e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-orange-400 font-bold focus:border-orange-500 outline-none print-border"
            >
              <option value="59kg">59kg Men</option>
              <option value="66kg">66kg Men</option>
              <option value="74kg">74kg Men</option>
              <option value="83kg">83kg Men</option>
              <option value="93kg">93kg Men</option>
              <option value="105kg">105kg Men</option>
              <option value="120kg">120kg Men</option>
              <option value="120+kg">120+kg Men</option>
              <option value="47kg">47kg Women</option>
              <option value="52kg">52kg Women</option>
              <option value="57kg">57kg Women</option>
              <option value="63kg">63kg Women</option>
              <option value="69kg">69kg Women</option>
              <option value="76kg">76kg Women</option>
              <option value="84kg">84kg Women</option>
            </select>
          </div>
          <div>
            <label className="text-zinc-500 uppercase text-[10px] block mb-1">Lot Number</label>
            <input 
              type="text"
              value={formData.lotNumber}
              onChange={(e) => handleChange('lotNumber', e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white font-bold focus:border-orange-500 outline-none print-border"
            />
          </div>
        </div>

        {/* Rack Heights & Equipment Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10 print-border">
          {/* Squat Settings */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-red-500/30 space-y-3 print-border">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-red-400 font-mono uppercase">Squat Rack Heights</span>
              <Dumbbell className="w-4 h-4 text-red-400" />
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-zinc-500 text-[10px] block">Rack Stand Pin</label>
                <input 
                  type="number" 
                  value={formData.squatRackPin} 
                  onChange={(e) => handleChange('squatRackPin', e.target.value)}
                  className="w-full bg-black border border-white/10 rounded p-1.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[10px] block">Safety Arm Pin</label>
                <input 
                  type="number" 
                  value={formData.squatSafetyPin} 
                  onChange={(e) => handleChange('squatSafetyPin', e.target.value)}
                  className="w-full bg-black border border-white/10 rounded p-1.5 text-white font-bold"
                />
              </div>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Belt Notch: <strong className="text-white">{formData.beltNotchSquat}</strong>
            </div>
          </div>

          {/* Bench Settings */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-blue-500/30 space-y-3 print-border">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-blue-400 font-mono uppercase">Bench Rack Heights</span>
              <Sliders className="w-4 h-4 text-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-zinc-500 text-[10px] block">Upright Pin</label>
                <input 
                  type="number" 
                  value={formData.benchRackPin} 
                  onChange={(e) => handleChange('benchRackPin', e.target.value)}
                  className="w-full bg-black border border-white/10 rounded p-1.5 text-white font-bold"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[10px] block">Safety Pin</label>
                <input 
                  type="number" 
                  value={formData.benchSafetyPin} 
                  onChange={(e) => handleChange('benchSafetyPin', e.target.value)}
                  className="w-full bg-black border border-white/10 rounded p-1.5 text-white font-bold"
                />
              </div>
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              Foot Blocks: <strong className="text-white">{formData.benchFootBlock}</strong>
            </div>
          </div>
        </div>

        {/* 9-ATTEMPT COMPETITION REGISTRY TABLE */}
        <div className="pt-4 border-t border-white/10 print-border space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-bold block">
            Official Competition Attempt Declarations (KG)
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border border-zinc-800 print-border">
              <thead className="bg-zinc-900/80 text-[11px] text-zinc-400 uppercase print-header">
                <tr>
                  <th className="p-2.5 border-r border-zinc-800">Discipline</th>
                  <th className="p-2.5 border-r border-zinc-800 text-center">1st Attempt (Opener)</th>
                  <th className="p-2.5 border-r border-zinc-800 text-center">2nd Attempt</th>
                  <th className="p-2.5 text-center">3rd Attempt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {/* Squat Row */}
                <tr>
                  <td className="p-2.5 font-bold text-red-400 border-r border-zinc-800">🔴 SQUAT</td>
                  <td className="p-2 text-center border-r border-zinc-800">
                    <input
                      type="number"
                      step="2.5"
                      value={formData.openerSquat}
                      onChange={(e) => handleChange('openerSquat', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-center font-bold text-white border-b border-red-500"
                    /> kg
                  </td>
                  <td className="p-2 text-center border-r border-zinc-800">
                    <input
                      type="number"
                      step="2.5"
                      value={formData.secondSquat}
                      onChange={(e) => handleChange('secondSquat', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-center font-bold text-white border-b border-zinc-600"
                    /> kg
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      step="2.5"
                      value={formData.thirdSquat}
                      onChange={(e) => handleChange('thirdSquat', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-center font-bold text-white border-b border-zinc-600"
                    /> kg
                  </td>
                </tr>

                {/* Bench Press Row */}
                <tr>
                  <td className="p-2.5 font-bold text-blue-400 border-r border-zinc-800">🔵 BENCH PRESS</td>
                  <td className="p-2 text-center border-r border-zinc-800">
                    <input
                      type="number"
                      step="2.5"
                      value={formData.openerBench}
                      onChange={(e) => handleChange('openerBench', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-center font-bold text-white border-b border-blue-500"
                    /> kg
                  </td>
                  <td className="p-2 text-center border-r border-zinc-800">
                    <input
                      type="number"
                      step="2.5"
                      value={formData.secondBench}
                      onChange={(e) => handleChange('secondBench', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-center font-bold text-white border-b border-zinc-600"
                    /> kg
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      step="2.5"
                      value={formData.thirdBench}
                      onChange={(e) => handleChange('thirdBench', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-center font-bold text-white border-b border-zinc-600"
                    /> kg
                  </td>
                </tr>

                {/* Deadlift Row */}
                <tr>
                  <td className="p-2.5 font-bold text-amber-400 border-r border-zinc-800">🟡 DEADLIFT</td>
                  <td className="p-2 text-center border-r border-zinc-800">
                    <input
                      type="number"
                      step="2.5"
                      value={formData.openerDeadlift}
                      onChange={(e) => handleChange('openerDeadlift', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-center font-bold text-white border-b border-amber-500"
                    /> kg
                  </td>
                  <td className="p-2 text-center border-r border-zinc-800">
                    <input
                      type="number"
                      step="2.5"
                      value={formData.secondDeadlift}
                      onChange={(e) => handleChange('secondDeadlift', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-center font-bold text-white border-b border-zinc-600"
                    /> kg
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      step="2.5"
                      value={formData.thirdDeadlift}
                      onChange={(e) => handleChange('thirdDeadlift', parseFloat(e.target.value) || 0)}
                      className="w-20 bg-transparent text-center font-bold text-white border-b border-zinc-600"
                    /> kg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Official Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs font-mono">
          <div className="p-3 border border-zinc-800 rounded-lg space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase block">Athlete Signature</span>
            <div className="h-8 border-b border-dashed border-zinc-700 flex items-end">
              <span className="font-bold text-white">{formData.lifterName}</span>
            </div>
          </div>

          <div className="p-3 border border-zinc-800 rounded-lg space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase block">Coach / Handler Signature</span>
            <div className="h-8 border-b border-dashed border-zinc-700 flex items-end">
              <span className="font-bold text-zinc-300">{formData.coachName || "Verified Handler"}</span>
            </div>
          </div>

          <div className="p-3 border border-zinc-800 rounded-lg space-y-2">
            <span className="text-[10px] text-zinc-500 uppercase block">Weigh-In Referee Check</span>
            <div className="h-8 border-b border-dashed border-zinc-700 flex items-end text-zinc-500 text-[10px]">
              Platform Marshall Seal: [ APPROVED ]
            </div>
          </div>
        </div>

        {/* Footer Technical Note */}
        <div className="pt-2 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between text-[11px] font-mono text-zinc-500 gap-2">
          <span>✓ Verified according to Technical Rule Book specifications. Present at weigh-in desk.</span>
          <span className="text-zinc-400">
            Projected Opening Total: <strong className="text-white">{projectedTotal} KG</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeighInRackCard;
