import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Share2, 
  Sparkles, 
  ChevronRight, 
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * 9-For-9 Platform Attempt Strategist & Total Forecaster
 * Calibrated for IPF / Powerlifting India Rules & 60-Second Table Submissions
 */
const AttemptStrategistBoard = ({ athleteBodyweight = 74, gender = 'male', defaultOpenerSQ = 180, defaultOpenerBP = 120, defaultOpenerDL = 220 }) => {
  const [copied, setCopied] = useState(false);
  const [activeLift, setActiveLift] = useState('squat'); // 'squat' | 'bench' | 'deadlift'
  
  // 9 Attempts State
  const [attempts, setAttempts] = useState({
    squat: [
      { id: 1, target: defaultOpenerSQ, status: 'pending', rpe: '7.5', failureReason: '', notes: 'Safe opener' },
      { id: 2, target: Math.round(defaultOpenerSQ * 1.06 / 2.5) * 2.5, status: 'pending', rpe: '8.5', failureReason: '', notes: 'PR platform total' },
      { id: 3, target: Math.round(defaultOpenerSQ * 1.11 / 2.5) * 2.5, status: 'pending', rpe: '9.5', failureReason: '', notes: 'All-out PR attempt' }
    ],
    bench: [
      { id: 1, target: defaultOpenerBP, status: 'pending', rpe: '7.5', failureReason: '', notes: 'Clean pause opener' },
      { id: 2, target: Math.round(defaultOpenerBP * 1.05 / 2.5) * 2.5, status: 'pending', rpe: '8.5', failureReason: '', notes: 'Solid second attempt' },
      { id: 3, target: Math.round(defaultOpenerBP * 1.09 / 2.5) * 2.5, status: 'pending', rpe: '10', failureReason: '', notes: 'Meet peak single' }
    ],
    deadlift: [
      { id: 1, target: defaultOpenerDL, status: 'pending', rpe: '7.5', failureReason: '', notes: 'Fast triple weight' },
      { id: 2, target: Math.round(defaultOpenerDL * 1.06 / 2.5) * 2.5, status: 'pending', rpe: '8.5', failureReason: '', notes: 'Build big total' },
      { id: 3, target: Math.round(defaultOpenerDL * 1.11 / 2.5) * 2.5, status: 'pending', rpe: '10', failureReason: '', notes: 'Fight for placing' }
    ]
  });

  // Calculate Confirmed and Projected Totals
  const bestLifts = useMemo(() => {
    const getBest = (liftKey) => {
      const goodLifts = attempts[liftKey]
        .filter(a => a.status === 'good')
        .map(a => Number(a.target) || 0);
      return goodLifts.length > 0 ? Math.max(...goodLifts) : 0;
    };

    const getProjected = (liftKey) => {
      const allTargets = attempts[liftKey].map(a => Number(a.target) || 0);
      return Math.max(...allTargets);
    };

    return {
      squat: getBest('squat'),
      bench: getBest('bench'),
      deadlift: getBest('deadlift'),
      projectedSQ: getProjected('squat'),
      projectedBP: getProjected('bench'),
      projectedDL: getProjected('deadlift'),
    };
  }, [attempts]);

  const confirmedTotal = bestLifts.squat + bestLifts.bench + bestLifts.deadlift;
  const projectedTotal = bestLifts.projectedSQ + bestLifts.projectedBP + bestLifts.projectedDL;

  // DOTS Formula calculation
  const calculateDots = (total, bw, isMale) => {
    if (!total || !bw) return 0;
    const coeffMale = [-307.27205, 24.372449, -0.2250154, 0.00097794, -0.000001643];
    const coeffFemale = [-57.96288, 13.6175032, -0.11266554, 0.0005158568, -0.0000010706];
    const c = isMale ? coeffMale : coeffFemale;
    const denom = c[0] + (c[1] * bw) + (c[2] * Math.pow(bw, 2)) + (c[3] * Math.pow(bw, 3)) + (c[4] * Math.pow(bw, 4));
    if (denom <= 0) return 0;
    return Math.round((500 / denom) * total * 100) / 100;
  };

  const confirmedDots = calculateDots(confirmedTotal, athleteBodyweight, gender === 'male');
  const projectedDots = calculateDots(projectedTotal, athleteBodyweight, gender === 'male');

  // Attempt status updater
  const updateAttemptStatus = (liftKey, attemptIndex, status) => {
    setAttempts(prev => {
      const updated = { ...prev };
      const currentList = [...updated[liftKey]];
      currentList[attemptIndex] = {
        ...currentList[attemptIndex],
        status: status
      };
      updated[liftKey] = currentList;
      return updated;
    });
  };

  // Target weight updater
  const updateAttemptWeight = (liftKey, attemptIndex, weight) => {
    const val = parseFloat(weight) || 0;
    setAttempts(prev => {
      const updated = { ...prev };
      const currentList = [...updated[liftKey]];
      currentList[attemptIndex] = {
        ...currentList[attemptIndex],
        target: val
      };
      updated[liftKey] = currentList;
      return updated;
    });
  };

  // Dynamic Tactical Recommendation based on IPF Rules
  const getTacticalAdvice = (liftKey) => {
    const liftAttempts = attempts[liftKey];
    const a1 = liftAttempts[0];
    const a2 = liftAttempts[1];
    const a3 = liftAttempts[2];

    if (a1.status === 'pending') {
      return {
        step: "Opener Strategy",
        text: `Hit your ${a1.target}kg opener cleanly. Do NOT rush commands. Wait for the referee's visual signal before starting and racking.`,
        action: "Focus on speed and 3 white lights.",
        type: "neutral"
      };
    }

    if (a1.status === 'good' && a2.status === 'pending') {
      return {
        step: "2nd Attempt Decision (60-sec window)",
        text: `Opener succeeded! If speed was high (RPE <= 7.5), lock in ${a2.target}kg (+${(a2.target - a1.target).toFixed(1)}kg jump). If it felt heavy (RPE >= 8.5), consider taking ${Math.round((a1.target + 5) / 2.5) * 2.5}kg instead.`,
        action: "Submit attempt card to table within 60 seconds.",
        type: "success"
      };
    }

    if (a1.status === 'failed' && a2.status === 'pending') {
      return {
        step: "Opener Re-take Protocol",
        text: `Opener missed! Per IPF rules, you CANNOT go down in weight. Repeat ${a1.target}kg for Attempt 2. Correct technical fault (depth/pause/lockout) and stay in the meet.`,
        action: "Re-submit same weight to stay in the meet.",
        type: "danger"
      };
    }

    if (a2.status === 'good' && a3.status === 'pending') {
      const jump = (a3.target - a2.target).toFixed(1);
      return {
        step: "Final 3rd Attempt Strategy",
        text: `2nd attempt secured! Target is ${a3.target}kg (+${jump}kg). On Deadlifts, check the score sheet: you may adjust 3rd deadlift twice to win podium or achieve qualification standard!`,
        action: "All-in attempt: Leave nothing on the platform.",
        type: "success"
      };
    }

    if (a2.status === 'failed' && a3.status === 'pending') {
      return {
        step: "3rd Attempt Survival / Redemption",
        text: `2nd attempt missed. Retake ${a2.target}kg on Attempt 3 if miss was technical. If miss was strength failure, lock in total with minimum allowable jump or repeat.`,
        action: "Focus on execution and clean lockout.",
        type: "warning"
      };
    }

    return {
      step: "Discipline Concluded",
      text: `All 3 attempts finished for ${liftKey.toUpperCase()}. Best lift: ${bestLifts[liftKey]}kg. Transition to warmups for next event.`,
      action: "Hydrate and start next event warm-up ladder.",
      type: "neutral"
    };
  };

  const currentAdvice = getTacticalAdvice(activeLift);

  // Generate WhatsApp Share Message
  const generateShareText = () => {
    const statusEmoji = (status) => status === 'good' ? '⚪⚪⚪' : status === 'failed' ? '🔴🔴🔴' : '⏳';
    
    return `🏋️ *TITAN-AI PLATFORM ATTEMPT CARD* 🏋️
👤 *Athlete:* ${gender === 'male' ? 'Men' : 'Women'} | ${athleteBodyweight}kg Class

🔵 *SQUAT:*
  • Att 1: ${attempts.squat[0].target}kg ${statusEmoji(attempts.squat[0].status)}
  • Att 2: ${attempts.squat[1].target}kg ${statusEmoji(attempts.squat[1].status)}
  • Att 3: ${attempts.squat[2].target}kg ${statusEmoji(attempts.squat[2].status)}
  👉 Best SQ: *${bestLifts.squat}kg*

🔵 *BENCH PRESS:*
  • Att 1: ${attempts.bench[0].target}kg ${statusEmoji(attempts.bench[0].status)}
  • Att 2: ${attempts.bench[1].target}kg ${statusEmoji(attempts.bench[1].status)}
  • Att 3: ${attempts.bench[2].target}kg ${statusEmoji(attempts.bench[2].status)}
  👉 Best BP: *${bestLifts.bench}kg*

🔵 *DEADLIFT:*
  • Att 1: ${attempts.deadlift[0].target}kg ${statusEmoji(attempts.deadlift[0].status)}
  • Att 2: ${attempts.deadlift[1].target}kg ${statusEmoji(attempts.deadlift[1].status)}
  • Att 3: ${attempts.deadlift[2].target}kg ${statusEmoji(attempts.deadlift[2].status)}
  👉 Best DL: *${bestLifts.deadlift}kg*

🏆 *CURRENT TOTAL:* *${confirmedTotal}kg* (Projected: ${projectedTotal}kg)
📊 *DOTS SCORE:* *${confirmedDots}* (Projected: ${projectedDots})
⚡ Generated with TITAN-AI Platform War Room`;
  };

  const copyToClipboard = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Attempt Card copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-orange-500/30 rounded-xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono text-[10px] uppercase font-bold tracking-widest">
                IPF / POWERLIFTING INDIA RULES
              </span>
              <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] uppercase">
                {athleteBodyweight}KG CLASS • {gender.toUpperCase()}
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-black italic uppercase text-white tracking-tight flex items-center gap-3">
              <Trophy className="w-8 h-8 text-orange-500" />
              9-for-9 Platform Strategist
            </h2>
            <p className="text-zinc-400 text-xs font-mono mt-1">
              Real-time attempt selection, 60-second card submission advisor, and platform total forecaster.
            </p>
          </div>

          {/* Real-time Total & DOTS Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Confirmed Total</div>
              <div className="text-2xl font-black italic text-green-400">{confirmedTotal} <span className="text-xs font-mono font-normal text-zinc-400">kg</span></div>
              <div className="text-[9px] font-mono text-zinc-500 mt-0.5">{confirmedDots} DOTS</div>
            </div>

            <div className="bg-zinc-950/80 border border-orange-500/30 rounded-lg p-3 text-center">
              <div className="text-[10px] font-mono text-orange-400 uppercase">Projected Total</div>
              <div className="text-2xl font-black italic text-orange-400">{projectedTotal} <span className="text-xs font-mono font-normal text-zinc-400">kg</span></div>
              <div className="text-[9px] font-mono text-zinc-500 mt-0.5">{projectedDots} DOTS</div>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Best SQ / BP / DL</div>
              <div className="text-sm font-black font-mono text-white mt-1">
                {bestLifts.squat}/{bestLifts.bench}/{bestLifts.deadlift}
              </div>
              <div className="text-[9px] font-mono text-zinc-500 mt-0.5">Verified kg</div>
            </div>

            <div className="flex flex-col gap-1.5 justify-center">
              <button
                onClick={shareToWhatsApp}
                className="bg-green-600 hover:bg-green-500 text-white font-mono text-xs uppercase font-bold py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-green-950"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp Coach
              </button>
              <button
                onClick={copyToClipboard}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs uppercase py-1.5 px-3 rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Card'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lift Selector Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {[
          { id: 'squat', label: '1. Squat Attempts', best: bestLifts.squat, projected: bestLifts.projectedSQ },
          { id: 'bench', label: '2. Bench Press Attempts', best: bestLifts.bench, projected: bestLifts.projectedBP },
          { id: 'deadlift', label: '3. Deadlift Attempts', best: bestLifts.deadlift, projected: bestLifts.projectedDL }
        ].map((lift) => (
          <button
            key={lift.id}
            onClick={() => setActiveLift(lift.id)}
            className={`flex-1 py-3 px-4 rounded-lg font-mono text-xs uppercase tracking-wider transition-all flex flex-col sm:flex-row items-center justify-between gap-1 ${
              activeLift === lift.id
                ? 'bg-orange-600 text-white font-bold shadow-lg shadow-orange-950'
                : 'bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
            }`}
          >
            <span>{lift.label}</span>
            <span className="text-[10px] opacity-80">Best: {lift.best || 0}kg / Max: {lift.projected}kg</span>
          </button>
        ))}
      </div>

      {/* Attempts Grid for Selected Lift */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {attempts[activeLift].map((attempt, index) => {
          const attemptTitles = ['1st Attempt (Opener)', '2nd Attempt (Build Total)', '3rd Attempt (Max / PR)'];
          const isGood = attempt.status === 'good';
          const isFailed = attempt.status === 'failed';
          const isPending = attempt.status === 'pending';

          return (
            <motion.div
              key={attempt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl p-5 border transition-all ${
                isGood 
                  ? 'bg-green-950/20 border-green-500/50 shadow-lg shadow-green-950/30' 
                  : isFailed 
                  ? 'bg-red-950/20 border-red-500/50 shadow-lg shadow-red-950/30' 
                  : 'bg-zinc-900/60 border-zinc-800 shadow-md'
              }`}
            >
              {/* Attempt Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {attemptTitles[index]}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1 ${
                  isGood ? 'bg-green-600 text-white' :
                  isFailed ? 'bg-red-600 text-white' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {isGood && '⚪⚪⚪ GOOD LIFT'}
                  {isFailed && '🔴🔴🔴 NO LIFT'}
                  {isPending && '⏳ PENDING'}
                </span>
              </div>

              {/* Weight Input Box */}
              <div className="mb-4">
                <label className="text-[10px] font-mono text-zinc-500 uppercase block mb-1">
                  Submitted Bar Weight (KG)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="2.5"
                    value={attempt.target}
                    onChange={(e) => updateAttemptWeight(activeLift, index, e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-2xl font-black font-mono text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <div className="text-sm font-mono text-zinc-400 font-bold">KG</div>
                </div>
                {index > 0 && (
                  <div className="text-[10px] font-mono text-zinc-400 mt-1">
                    Jump: +{(attempt.target - attempts[activeLift][index - 1].target).toFixed(1)} kg 
                    ({(((attempt.target / attempts[activeLift][0].target) - 1) * 100).toFixed(1)}% over opener)
                  </div>
                )}
              </div>

              {/* Status Decision Buttons */}
              <div className="space-y-2 mb-4">
                <div className="text-[10px] font-mono text-zinc-400 uppercase">Platform Result:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateAttemptStatus(activeLift, index, 'good')}
                    className={`py-2 px-2 rounded font-mono text-xs uppercase font-bold flex flex-col items-center justify-center transition-all ${
                      isGood 
                        ? 'bg-green-600 text-white shadow-md' 
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 mb-0.5 text-green-400" />
                    <span>Good ⚪</span>
                  </button>

                  <button
                    onClick={() => updateAttemptStatus(activeLift, index, 'failed')}
                    className={`py-2 px-2 rounded font-mono text-xs uppercase font-bold flex flex-col items-center justify-center transition-all ${
                      isFailed 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <XCircle className="w-4 h-4 mb-0.5 text-red-400" />
                    <span>Fail 🔴</span>
                  </button>

                  <button
                    onClick={() => updateAttemptStatus(activeLift, index, 'pending')}
                    className={`py-2 px-2 rounded font-mono text-xs uppercase font-bold flex flex-col items-center justify-center transition-all ${
                      isPending 
                        ? 'bg-zinc-700 text-white' 
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border border-zinc-800'
                    }`}
                  >
                    <Clock className="w-4 h-4 mb-0.5 text-yellow-400" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Failure Diagnostics if red lighted */}
              {isFailed && (
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs font-mono text-red-300 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" /> IPF Red Light Reason:
                  </div>
                  <select
                    className="w-full bg-zinc-950 border border-red-800/50 rounded px-2 py-1 text-xs text-zinc-200 mt-1"
                    value={attempt.failureReason}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAttempts(prev => {
                        const updated = { ...prev };
                        const list = [...updated[activeLift]];
                        list[index] = { ...list[index], failureReason: val };
                        updated[activeLift] = list;
                        return updated;
                      });
                    }}
                  >
                    <option value="">Select Technical Fault...</option>
                    {activeLift === 'squat' && (
                      <>
                        <option value="depth">🔴 Depth: Hip crease not below top of knee</option>
                        <option value="command">🔴 Jumped "Squat" or "Rack" Command</option>
                        <option value="downward">🔴 Downward bar movement during ascent</option>
                        <option value="feet">🔴 Foot movement after start command</option>
                      </>
                    )}
                    {activeLift === 'bench' && (
                      <>
                        <option value="pause">🔴 Motionless chest pause too short / jumped Press</option>
                        <option value="butt">🔴 Buttocks raised off bench</option>
                        <option value="uneven">🔴 Uneven lockout / arms not fully locked</option>
                        <option value="downward">🔴 Downward bar movement on ascent</option>
                        <option value="head">🔴 Head movement / feet lifting</option>
                      </>
                    )}
                    {activeLift === 'deadlift' && (
                      <>
                        <option value="hitch">🔴 Hitching / Supporting bar on thighs</option>
                        <option value="lockout">🔴 Soft knees / Shoulders not erect at lockout</option>
                        <option value="downward">🔴 Downward bar motion before lockout</option>
                        <option value="drop">🔴 Dropped bar / Released hands before Down command</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* Coaching Note */}
              <div className="text-[11px] font-mono text-zinc-500 mt-2 italic">
                Strategic note: {attempt.notes}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Real-time 60-Second Window Advisor Card */}
      <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        currentAdvice.type === 'danger' 
          ? 'bg-red-950/30 border-red-500/40 text-red-200'
          : currentAdvice.type === 'success'
          ? 'bg-green-950/30 border-green-500/40 text-green-200'
          : currentAdvice.type === 'warning'
          ? 'bg-yellow-950/30 border-yellow-500/40 text-yellow-200'
          : 'bg-zinc-900/60 border-zinc-800 text-zinc-300'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="font-mono text-xs uppercase font-bold text-orange-400">
              {currentAdvice.step}
            </span>
          </div>
          <p className="text-sm font-sans font-medium text-white">
            {currentAdvice.text}
          </p>
          <div className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 mt-1">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            <span>Action Required: <strong className="text-white">{currentAdvice.action}</strong></span>
          </div>
        </div>

        <button
          onClick={copyToClipboard}
          className="shrink-0 bg-white hover:bg-zinc-200 text-black font-mono text-xs uppercase font-black px-4 py-2.5 rounded transition-all shadow-md flex items-center gap-2"
        >
          <Share2 className="w-4 h-4 text-black" />
          Update Coach on WhatsApp
        </button>
      </div>
    </div>
  );
};

export default AttemptStrategistBoard;
